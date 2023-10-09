import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { fetchByID } from 'helpers/apiService';
import Joi from '@hapi/joi';
import moment from 'moment'
import { postOnly, createLog, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed, checkCoupon, validateRequestParams, moneyfy } from 'helpers/api';

// Function to Fetch product
export default async function base(req, res) {

    // Only allowed GET only methods
    if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

    // Later parse User from JWT-header token 
    let user = await verifyToken(req);

    // Only ADMIN type of User allowed to insert product
    if (!user) { restrictedAccess(res); return false; }


    var currentDate = moment().format();


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

    var applied = 0
    var finalCoupon = null
    var amount = 0
    var totalDiscount = 0
    var finalPrice = 0



    if (carts.data) {
        for (let i = 0; i < carts.data.length; i++) {

            let query = { forWeb: true, quantity: carts.data[i].quantity, noLog: true }
            if (carts.data[i].upgradable_id) {
                query.forUpgarde = 'UPGRADE'
                query.upgradable_id = carts.data[i].upgradable_id
            }
            if (!req.query.deleteType || req.query.deleteType != 'RESET') {
                query.noCoupon = true
            }

            if (carts.data[i].referral_code) {
                query.referralCode = carts.data[i].referral_code
            }
            query.cart_id = carts.data[i].id


            let product = await fetchByID('products', carts.data[i].product_id, query, req.headers['x-auth-token'])
            product = product.product

            // let product = await fetchByID('products', carts.data.product_id, { forWeb: true }, req.headers['x-auth-token']);

            let params = {}

            params.coupon_id = product.coupon ? product.coupon.id : null
            params.coupon_code = product.coupon ? product.coupon.code : null
            params.discount_type = product.coupon ? product.coupon.discount_type : null
            params.discount_amount = product.coupon ? product.coupon.amount : null
            params.coupon_type = product.coupon ? product.coupon.applied_on : null
            params.discount_amount_upto = product.coupon ? product.coupon.amount_upto : null
            params.amount = product.finalAmount
            params.base_price = product.qtyAmount
            params.tax_included_in_base_price = product.tax_included_in_base_price

            if (product.shippingCharges) {
                params.shipping_charge = product.shippingCharges
              }

            if (product.fixedCoupon) {
                params.fixed_discount_type = product.fixedCoupon.discount_type
                params.fixed_discount_amount = product.fixedCoupon.amount
            } else {
                params.fixed_discount_type = null
                params.fixed_discount_amount = null
            }

            // Create db process (get into pool)
            var knexConnection = require('knex')(knexConnectionConfig);

            // Update carts.data[i].product.coupon in database
            let cartUpdate = await knexConnection.transaction(async trx => {
                return trx('carts').where('id', carts.data[i].id).update(params);
            })

            // Destrory process (to clean pool)
            knexConnection.destroy();

        }
    }


    if (user && user.type != 'ADMIN' && !req.query.listOnly && !req.query.noLog) {
        let logged_data = {
            user_id: user.id,
            action: `COUPON_DELETED`,
            payload: JSON.stringify({
                field_name: 'All',
                ...req.query
            })
        }


        let logs = await createLog(logged_data)
    }



    //
    let statusCode = 200;
    let response = {
        success: true,
    };

    res.status(statusCode).json(response);
}


const intersect = (arrayA, arrayB) => {
    return arrayA.filter(elem => arrayB.includes(elem));
};