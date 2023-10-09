import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { fetchByID, fetchAll } from 'helpers/apiService';
import { v4 as uuidv4 } from 'uuid';
import { getSettings, add } from 'helpers/apiService';
import moment from 'moment'
import { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Add new attribute
export default async function base(req, res) {

    // Only allowed POST only methods
    if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

    let user = await verifyToken(req);

    // Only ADMIN type of User allowed to insert membership_type
    if (!user) { restrictedAccess(res); return false; }

    // Validate request with rules
    let schema = Joi.object({
        user_id: Joi.number().allow(null),
        membership_id: Joi.number().required(),
        amount: Joi.number().allow(null),
        attributes: Joi.allow(null),
        coupon: Joi.allow(null),
        discount: Joi.allow(null),
        finalAmount: Joi.allow(null),
        pay_via: Joi.allow(null),
        transaction_order_id: Joi.allow(null),
        transaction_id: Joi.allow(null),
    });



    let currency = await getSettings('currency')
    // If everything fine: params object would contain data
    let params = validateRequestParams(req.body, schema, res);

    // If Data Not Valid 
    if (params.status == false) { invalidFormData(res, params.error); return false; }
    else { params = params.value; }

    let transaction_id = null
    let transaction_order_id = null

    if (params.transaction_id) {
        transaction_id = params.transaction_id
        transaction_order_id = params.transaction_order_id

        delete params.transaction_id
        delete params.transaction_order_id
    }


    params.user_id = params.user_id ? params.user_id : user.id

    let membership = await fetchByID('memberships', params.membership_id, { forUpgarde: params.type, forWeb: true, noLog: true }, req.headers['x-auth-token']);

    if (membership.success == true) {
        membership = membership.membership

        params.base_price = membership.amount

        if (membership.tax) {
            params.tax_amount = membership.tax.amount
            params.tax_amount_type = membership.tax.amount_type
        }

        params.status = 'ADDED'
        params.amount = parseInt(membership.finalAmount)

        var attributes = [];

        params.uuid = uuidv4()


        delete params.finalAmount
        delete params.coupon
        delete params.discount

        let userID = params.user_id
        let payVia = params.pay_via
        delete params.pay_via

        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        // Insert attribute into database
        let cart = await knexConnection.transaction(async trx => {
            return trx.insert(params).into('membership_carts');
        }).then(res => {
            return {
                id: res[0],
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

        if (cart.id) {


            let query = {
                cartID: cart.id,
                userID: userID,
                noLog: true
            }


            let params = {}
            let carts = await fetchAll('membership-carts', query, req.headers['x-auth-token'])

            let prefix = await getSettings('orderNumberPrefix')
            if (carts.success == true) {


                params.user_id = userID
                params.amount = carts.amount
                params.final_price = parseInt(carts.finalPrice)
                params.total_tax = carts.totalTax
                params.assigned_by_admin = true
                params.pay_via = payVia
                params.status = 'SUCCESS',
                    params.type = 'MEMBERSHIP',
                    params.uuid = uuidv4()
            }

            // Create db process (get into pool)
            var knexConnection = require('knex')(knexConnectionConfig);

            // Insert attribute into database
            let order = await knexConnection.transaction(async trx => {
                return trx.insert(params).into('orders');
            }).then(res => {
                return {
                    id: res[0],
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


            if (order.id) {

                let OdrNumber = ''
                if (prefix && prefix != '') {
                    OdrNumber = prefix
                }

                let year = moment().format('YY')
                OdrNumber = OdrNumber.concat(year)
                OdrNumber = OdrNumber.concat(order.id)


                // Create db process (get into pool)
                knexConnection = require('knex')(knexConnectionConfig);

                // Update course in database
                let orderUpdate = await knexConnection.transaction(async trx => {
                    return trx('orders').where('id', order.id).update({ order_number: OdrNumber });
                })

                // Destrory process (to clean pool)
                knexConnection.destroy();

                for (let i = 0; i < carts.carts.length; i++) {

                    // Create db process (get into pool)
                    var knexConnection = require('knex')(knexConnectionConfig);

                    // Update course in database
                    let cartUpdate = await knexConnection.transaction(async trx => {
                        return trx('membership_carts').where('id', carts.carts[i].id).update({ order_id: order.id, status: "PURCHESED" });
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

                    // Fetch membership from database
                    let membershipData = await knexConnection.transaction(async trx => {
                        return trx.select('membership_products.*', 'memberships.validity_id').table('membership_products')
                            .join('memberships', 'memberships.id', 'membership_products.membership_id')
                            .where('membership_products.membership_id', carts.carts[i].membership_id);
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
                                user_id: params.user_id,
                                attributes: attributes
                            }, null, req.headers['x-auth-token']);

                        }

                    }



                }

                if (cart.id && transaction_order_id) {

                    let data = {
                        transaction_id: transaction_id,
                        order_id: transaction_order_id,
                        // signature: params.response.razorpay_signature,
                        payment_mode: payVia,
                        user_id: params.user_id,
                        amount: params.amount,
                        // response: JSON.stringify(params.response),
                        currency: currency,
                        status: 'SUCCESS',
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
                        // Create db process (get into pool)
                        var knexConnection = require('knex')(knexConnectionConfig);

                        // Update course in database
                        let orderUpdate = await knexConnection.transaction(async trx => {
                            return trx('orders').where('id', order.id).update({ transaction_id: transaction.id });
                        }).then(res => {
                            return {
                                id: res,
                                error: null
                            };
                        }).catch(err => {
                            return {
                                id: null,
                                error: err
                            };
                        })

                        // Destrory process (to clean pool)
                        knexConnection.destroy();
                    }

                }

            }
        }





        //
        let statusCode = cart.id ? 200 : 422;
        let response = {
            success: cart.id ? true : false,
            order: cart,
            id: cart.id,
            id: cart.id,
            membershipName: membership.name,
        };


        // Send response
        res.status(statusCode).json(response);
    }
    else {
        res.status(422).json({
            success: false,
            error: 'membership Not Found'
        });
    }

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
