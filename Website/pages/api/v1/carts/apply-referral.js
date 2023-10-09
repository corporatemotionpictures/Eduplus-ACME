import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { fetchByID } from 'helpers/apiService';
import Joi from '@hapi/joi';
import moment from 'moment'
import { postOnly, createLog, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed, checkreferral, validateRequestParams, moneyfy } from 'helpers/api';

// Function to Fetch product
export default async function base(req, res) {

    // Only allowed GET only methods
    if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }


    // Validate request with rules
    let schema = Joi.object({
        referral_code: Joi.string().required()
    });

    // If everything fine: params object would contain data
    let params = validateRequestParams(req.body, schema, res);

    // If Data Not Valid 
    if (params.status == false) { invalidFormData(res, params.error); return false; }
    else { params = params.value; }

    // Later parse User from JWT-header token 
    let user = await verifyToken(req);

    // Only ADMIN type of User allowed to insert product
    if (!user) { restrictedAccess(res); return false; }


    let error = null

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Update carts.data[i].product.referral in database
    let referral = await knexConnection.transaction(async trx => {
        return trx('referral_codes').where('code', params.referral_code).whereNot('user_id', user.id).first();
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    if (referral) {

        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        // Update carts.data[i].product.referral in database
        let referralApplied = await knexConnection.transaction(async trx => {
            return trx('carts').where('referral_code', params.referral_code).where('user_id', user.id).first();
        })

        // Destrory process (to clean pool)
        knexConnection.destroy();


        if (referralApplied) {
            referral = null
            error = 'Referral can only be applied once'
        }
    } else {
        referral = null
        error = 'Referral invalid'
    }



    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    let carts = await knexConnection.transaction(async trx => {
        return trx.select('carts.*').table('carts').where('user_id', user.id).orderBy('carts.id', 'ASC').where('carts.status', 'ADDED');

    }).then(res => {
        return {
            data: res,
            error: null
        };
    }).catch(err => {
        return {
            data: null,
            error: err.sqlMessage
        };
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();



    if (carts.data && referral) {
        for (let i = 0; i < carts.data.length; i++) {

            let query = { forWeb: true, quantity: carts.data[i].quantity, noLog: true }

            query.referralCode = referral.code

            if (carts.data[i].coupon_code) {
                query.couponCode = carts.data[i].coupon_code
            }

            query.cart_id = carts.data[i].id

            carts.data[i].product = await fetchByID('products', carts.data[i].product_id, query, req.headers['x-auth-token'])
            carts.data[i].product = carts.data[i].product.product

            let code = {};
            if (carts.data[i].product.referral) {

                if (carts.data[i].product.referral.code == referral.code) {
                    applied++;
                }

                code.referral_id = carts.data[i].product.referral.id
                code.referral_code = referral.code
                code.referral_discount_type = carts.data[i].product.referral.user_discount_type
                code.referral_amount = carts.data[i].product.referral.user_amount
                code.referral_discount_amount_upto = carts.data[i].product.referral.user_amount_upto
                code.amount = carts.data[i].product.finalAmount
                code.base_price = carts.data[i].product.qtyAmount
                code.tax_included_in_base_price = carts.data[i].product.tax_included_in_base_price

                if (carts.data[i].product.shippingCharges) {
                    code.shipping_charge = carts.data[i].product.shippingCharges
                }

                // Create db process (get into pool)
                var knexConnection = require('knex')(knexConnectionConfig);

                // Update carts.data[i].product.referral in database
                let cartUpdate = await knexConnection.transaction(async trx => {
                    return trx('carts').select('carts.*').where('id', carts.data[i].id).update(code);
                })

                // Destrory process (to clean pool)
                knexConnection.destroy();

                if (cartUpdate) {
                    carts.data[i] = {
                        ...carts.data[i],
                        ...code
                    }
                }

            }

        }
    }

    //
    let statusCode = 200;
    let response = {
        success: !error,
        error: error
    };

    res.status(statusCode).json(response);
}


const intersect = (arrayA, arrayB) => {
    return arrayA.filter(elem => arrayB.includes(elem));
};