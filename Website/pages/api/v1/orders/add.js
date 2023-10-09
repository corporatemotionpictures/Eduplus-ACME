import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { fetchByID, fetchAll } from 'helpers/apiService';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import { getSettings } from 'helpers/apiService';
import { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Add new attribute
export default async function base(req, res) {

    // Only allowed POST only methods
    if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

    let user = await verifyToken(req);

    // Only ADMIN type of User allowed to insert product_type
    if (!user) { restrictedAccess(res); return false; }

    // Validate request with rules
    let schema = Joi.object({
        user_id: Joi.number().allow(null),
        product_id: Joi.number().required(),
        amount: Joi.number().allow(null),
        attributes: Joi.allow(null),
        coupon: Joi.allow(null),
        discount: Joi.allow(null),
        finalAmount: Joi.allow(null),
        pay_via: Joi.allow(null),
        transaction_order_id: Joi.allow(null),
        transaction_id: Joi.allow(null),
    });

    let currency = await getSettings('')

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
    }


    delete params.transaction_id
    delete params.transaction_order_id

    params.user_id = params.user_id ? params.user_id : user.id

    params.quantity = 1

    let product = await fetchByID('products', params.product_id, { forUpgarde: params.type, quantity: params.quantity, forWeb: true, noLog: true }, req.headers['x-auth-token']);

    if (product.success == true) {
        product = product.product

        params.amount_per_quantity = product.per_amount
        params.base_price = product.qtyAmount
        params.tax_included_in_base_price = product.tax_included_in_base_price


        if (product.coupon) {
            params.coupon_id = product.coupon.id
            params.coupon_code = product.coupon.code
            params.discount_type = product.coupon.discount_type
            params.discount_amount = product.coupon.amount
            params.coupon_type = product.coupon.applied_on
            params.discount_amount_upto = product.coupon.amount_upto

        }

        if (product.fixedCoupon) {
            params.fixed_discount_type = product.fixedCoupon.discount_type
            params.fixed_discount_amount = product.fixedCoupon.amount
        }
        if (product.taxIncluded) {
            params.tax_amount = product.tax_amount
            params.tax_amount_type = product.tax_type
        }


        params.status = 'ADDED'
        params.amount = parseInt(params.finalAmount)

        if (params.type) {
            params.is_upgraded = 1
        }

        var attributes = [];

        if (params.attributes) {
            attributes = params.attributes
            delete params.attributes
        }

        if (params.type) {
            delete params.type
        }

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
            return trx.insert(params).into('carts');
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
            let attrIDS = []
            var productAttributes = [];

            attributes.map((attr, i) => {

                if (attr) {
                    var array = []

                    if (attr.attribute_id) {
                        array = {
                            cart_id: cart.id,
                            product_id: product.id,
                            attribute_id: attr.attribute_id,
                            value: '',
                            value_id: attr.value_id,
                        };
                        attrIDS.push(attr.attribute_id)

                    } else {
                        array = {
                            cart_id: cart.id,
                            product_id: product.id,
                            attribute_id: i,
                            value: '',
                            value_id: attr,
                        };
                        attrIDS.push(i)
                    }
                    productAttributes.push(array)
                }
            })

            Object.values(product.attributes).map(attr => {

                if (!attrIDS.includes(attr.attribute_id)) {
                    var array = {
                        cart_id: cart.id,
                        product_id: product.id,
                        attribute_id: attr.attribute_id,
                        value: attr.value,
                        value_id: Array.isArray(attr.value_id) ? attr.value_id[0] : attr.value_id,
                    };
                    productAttributes.push(array)
                }
            })




            // Create db process (get into pool)
            var knexConnection = require('knex')(knexConnectionConfig);

            // Insert attribute into database
            let cartAttr = await knexConnection.transaction(async trx => {
                return trx.insert(productAttributes).into('user_product_attributes');
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

            let query = {
                cartID: cart.id,
                userID: userID,
                noLog: true
            }


            let params = {}
            let carts = await fetchAll('carts', query, req.headers['x-auth-token'])

            let prefix = await getSettings('orderNumberPrefix')
            if (carts.success == true) {


                params.user_id = userID
                params.amount = carts.amount
                params.shipping_charges = carts.shippingCharges
                params.final_price = parseInt(carts.finalPrice)
                params.coupon = carts.coupon
                params.total_discount = carts.totalDiscount
                params.total_tax = carts.totalTax
                params.assigned_by_admin = true
                params.pay_via = payVia
                params.status = 'SUCCESS',
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
                        return trx('carts').where('id', carts.carts[i].id).update({ order_id: order.id, status: "PURCHESED" });
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
            productName: product.name,
        };


        // Send response
        res.status(statusCode).json(response);
    }
    else {
        res.status(422).json({
            success: false,
            error: 'Product Not Found'
        });
    }

}
