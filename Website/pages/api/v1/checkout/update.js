import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import moment from 'moment';
import { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, restrictedAccess, verifyToken, invalidFormData } from 'helpers/api';
import { add } from 'helpers/apiService';

// Function to Update course
export default async function base(req, res) {

    // Only allowed POST only methods
    if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

    // Later parse User from JWT-header token 
    let user = await verifyToken(req);

    // Only ADMIN type of User allowed to insert course
    if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }

    // Validate request with rules
    let schema = Joi.object({
        status: Joi.string(),
        response: Joi.allow(null),
        order_id: Joi.allow(null),
    });

    // If everything fine: params object would contain data
    let params = validateRequestParams(req.body, schema, res);

    // If Data Not Valid 
    if (params.status == false) { invalidFormData(res, params.error); return false; }
    else { params = params.value; }


    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Update course in database
    let order = await knexConnection.transaction(async trx => {
        return trx('orders').where('order_number', params.order_id).first();
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    let token = req.headers['x-auth-token']

    params.order_id = order.id
    let orderID = params.order_id


    let data = {
        transaction_id: params.response.id,
        order_id: params.response.order_id,
        // signature: params.response.razorpay_signature,
        payment_mode: params.response.method,
        user_id: user.id,
        amount: order.amount,
        response: JSON.stringify(params.response),
        currency: params.response.currency,
        status: params.status,
    }


    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Update course in database
    let transaction = await knexConnection.transaction(async trx => {
        return trx.insert(data).into('transactions');
    }).then(res => {
        return {
            id: res,
            error: null
        };
    }).catch(err => {
        return {
            id: null,
            error: err.sqlMessage
        };
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    if (transaction.id) {

        // Set attributes
        let id = params.order_id;

        params.transaction_id = transaction.id

        delete params.response
        delete params.order_id


        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        // Update course in database
        order = await knexConnection.transaction(async trx => {
            return trx('orders').where('id', id).update(params);
        }).then(res => {
            return {
                id: res,
                error: null
            };
        }).catch(err => {
            return {
                id: null,
                error: err.sqlMessage
            };
        })

        // Destrory process (to clean pool)
        knexConnection.destroy();

        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        // Update course in database
        order = await knexConnection.transaction(async trx => {
            return trx('orders').where('id', id).first();
        })

        // Destrory process (to clean pool)
        knexConnection.destroy();

        if (order.id) {

            if (order.type == 'MEMBERSHIP') {
                // Create db process (get into pool)
                var knexConnection = require('knex')(knexConnectionConfig);

                // Update course in database
                let cart = await knexConnection.transaction(async trx => {
                    return trx('membership_carts').where('order_id', id).update({ status: "PURCHESED" });
                }).then(res => {
                    return {
                        id: res,
                        error: null
                    };
                }).catch(err => {
                    return {
                        id: null,
                        error: err.sqlMessage
                    };
                })

                // Destrory process (to clean pool)
                knexConnection.destroy();


                var knexConnection = require('knex')(knexConnectionConfig);

                // Update course in database
                let carts = await knexConnection.transaction(async trx => {
                    return trx('membership_carts').where('order_id', id);
                })

                // Destrory process (to clean pool)
                knexConnection.destroy();


                for (let i = 0; i < carts.length; i++) {
                    // Create db process (get into pool)
                    var knexConnection = require('knex')(knexConnectionConfig);

                    // Fetch membership from database
                    let membershipData = await knexConnection.transaction(async trx => {
                        return trx.select('membership_products.*', 'memberships.validity_id').table('membership_products')
                            .join('memberships', 'memberships.id', 'membership_products.membership_id')
                            .where('membership_products.membership_id', carts[i].membership_id);
                    })

                    // Destrory process (to clean pool)
                    knexConnection.destroy();

                    if (membershipData && membershipData.length > 0) {

                        for (let i = 0; i < membershipData.length; i++) {


                            // Create db process (get into pool)
                            var knexConnection = require('knex')(knexConnectionConfig);

                            // Fetch membership from database
                            let attribute = await knexConnection.transaction(async trx => {
                                return trx.select().table('attributes')
                                    .where('attributes.slug', 'validity').first();
                            })

                            // Destrory process (to clean pool)
                            knexConnection.destroy();


                            // Create db process (get into pool)
                            var knexConnection = require('knex')(knexConnectionConfig);

                            // Fetch membership from database
                            let Productattribute = await knexConnection.transaction(async trx => {
                                return trx.select().table('product_attributes')
                                    .where('product_attributes.product_id', membershipData[i].product_id)
                                    .where('product_attributes.attribute_id', attribute.id).first();
                            })

                            // Destrory process (to clean pool)
                            knexConnection.destroy();

                            let validity1 = membershipData[i].validity_id;
                            let validity2 = Productattribute ? Productattribute.value_id : null;


                            // Create db process (get into pool)
                            var knexConnection = require('knex')(knexConnectionConfig);

                            // Fetch membership from database
                            let validities = await knexConnection.transaction(async trx => {
                                return trx.select().table('validities')
                                    .whereIn('validities.id', [validity1, validity2]).orderBy('duration', 'ASC');
                            })

                            // Destrory process (to clean pool)
                            knexConnection.destroy();

                            let validity = null

                            if (validities) {
                                if (validities[0]) {
                                    let leftdays = leftDays(validities[0])

                                    if (validities[1]) {
                                        let leftDays1 = leftDays(validities[1])
                                        validity = leftDays1 < leftdays ? validities[1].id : validities[0].id
                                    }
                                }
                            }



                            let attributes = [{
                                attribute_id: attribute.id,
                                value_id: validity ? validity : null
                            }]

                            let order = await add('orders', {
                                product_id: membershipData[i].product_id,
                                pay_via: "FREE",
                                finalAmount: 0,
                                user_id: user.id,
                                attributes: attributes
                            }, null, req.headers['x-auth-token']);

                        }

                    }


                }





            } else {
                var knexConnection = require('knex')(knexConnectionConfig);

                // Update course in database
                let cart = await knexConnection.transaction(async trx => {
                    return trx('carts').where('order_id', id).update({ status: "PURCHESED" });
                }).then(res => {
                    return {
                        id: res,
                        error: null
                    };
                }).catch(err => {
                    return {
                        id: null,
                        error: err.sqlMessage
                    };
                })

                // Destrory process (to clean pool)
                knexConnection.destroy();


            }

            if (params.status == 'SUCCESS') {

                var knexConnection = require('knex')(knexConnectionConfig);

                // Update course in database
                let carts = await knexConnection.transaction(async trx => {
                    return trx('carts').where('order_id', id);
                })

                // Destrory process (to clean pool)
                knexConnection.destroy();


                let referral_code = null
                let referral_id = null
                carts.map(cart => {
                    if (cart.referral_code) {
                        referral_code = cart.referral_code
                    }
                    if (cart.referral_id) {
                        referral_id = cart.referral_id
                    }
                })


                if (referral_code) {

                    var knexConnection = require('knex')(knexConnectionConfig);

                    // Update course in database
                    let referralCode = await knexConnection.transaction(async trx => {
                        return trx('referral_codes').where('code', referral_code).first();
                    })

                    // Destrory process (to clean pool)
                    knexConnection.destroy();

                    var knexConnection = require('knex')(knexConnectionConfig);

                    // Update course in database
                    let referral = await knexConnection.transaction(async trx => {
                        return trx('referrals').where('id', referral_id).first();
                    })

                    // Destrory process (to clean pool)
                    knexConnection.destroy();

                    if (referralCode && referral) {



                        let params = {
                            user_id: referralCode.user_id,
                            order_id: id,
                            discount: referral.referrar_amount,
                            discount_type: referral.referrar_discount_type,
                            minimum_amount: referral.referrar_minimum_amount,
                            maximum_amount: referral.referrar_maximum_amount,
                            amount_upto: referral.referrar_amount_upto,
                            referrar_order_amount_usage: referral.referrar_order_amount_usage,
                            referral_id: referral.id,
                        }

                        var knexConnection = require('knex')(knexConnectionConfig);

                        // Update course in database
                        let referralUpdate = await knexConnection.transaction(async trx => {
                            return trx('user_referrals').insert(params);
                        })

                        // Destrory process (to clean pool)
                        knexConnection.destroy();

                    }

                }

                var knexConnection = require('knex')(knexConnectionConfig);

                // Update course in database
                let update = await knexConnection.transaction(async trx => {
                    return trx('user_referrals').where('referrar_order_id', id).where('user_id', user.id).update('applied', 1);
                })

                // Destrory process (to clean pool)
                knexConnection.destroy();


            }

        }
    }


    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Update course in database
    let orderDetails = await knexConnection.transaction(async trx => {
        return trx('orders').where('id', orderID).first();
    })

    knexConnection.destroy();



    if (order.id && user && user.type != 'ADMIN' && !req.query.listOnly && !req.query.noLog) {
        let logged_data = {
            user_id: user.id,
            action: `ORDER_CREATED`,
            payload: JSON.stringify({
                field_name: params.status,
                ...req.query
            })
        }


        let logs = await createLog(logged_data)
    }

    //
    let statusCode = order.id ? 200 : 422;
    let response = {
        success: order.id ? true : false,
        order: orderDetails,
    };

    // Send response
    res.status(statusCode).json(response);
}



function leftDays(validityData) {
    let expDate = null
    if (validityData.type == 'DAYS') {
        let validity = validityData.duration
        let type = 'days'
        if (validityData.duration_type == 'MONTH') {
            type = 'months'
        } else if (validityData.duration_type == 'YEAR') {
            type = 'years'
        }

        expDate = moment().add(validity, type)
    } else {
        expDate = moment(validityData.date).format()
    }

    let leftDays = moment(expDate).diff(moment(), 'days')

    return leftDays

}
