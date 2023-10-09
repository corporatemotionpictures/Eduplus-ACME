import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { fetchByID, fetchAll } from 'helpers/apiService';
import { v4 as uuidv4 } from 'uuid';
import { getSettings } from 'helpers/apiService';
import moment from 'moment'
import XLSX from "xlsx";
import { getOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';
// Add new attribute
export default async function base(req, res) {
    // Only allowed POST only methods
    if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }
    // let user = await verifyToken(req);
    // Only ADMIN type of User allowed to insert membership_type
    // if (!user) { restrictedAccess(res); return false; }
    let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxLCJ1dWlkIjpudWxsLCJkZXZpY2VfaWQiOm51bGwsImltYWdlIjoiL3VwbG9hZHMvdXNlcnMvMTYzMDkyNzgzMTA2MC5wbmciLCJhdXRoX3Byb3ZpZGVyIjpudWxsLCJvYXV0aF9pZCI6bnVsbCwiZmlyc3RfbmFtZSI6IkFkbWluaXN0cmF0b3IiLCJsYXN0X25hbWUiOiJQYW5lbCIsIm1vYmlsZV9udW1iZXIiOiI3MDQ5OTAzMzMzIiwiY291bnRyeV9wcmVmaXgiOiIxIiwiZW1haWwiOiJhZG1pbkBjbXAuY29tIiwicGFzc3dvcmQiOiIkMnkkMTIkdVRtLzh3djd1NElwRTZ5ZEFPVUxKZWNaSWlVaFdrQkxHZFUzSHloVHRXbGNGSS5iQ2g1MWkiLCJ0eXBlIjoiQURNSU4iLCJkb2IiOm51bGwsImZjbV90b2tlbiI6bnVsbCwiZGV2aWNlX3R5cGUiOm51bGwsInJlZ2lzdHJhdGlvbl9udW1iZXIiOiJCRzIxMDAwIiwiYnJhbmNoIjoiNDMiLCJwYWNrYWdlX2lkIjpudWxsLCJwYXNzaW5nX3llYXIiOm51bGwsInNtc192ZXJfY29kZSI6IjMyNjEiLCJlbWFpbF92ZXJfY29kZSI6bnVsbCwiaXNfbW9iaWxlX3ZlcmlmaWVkIjoxLCJpc19lbWFpbF92ZXJpZmllZCI6MCwiaXNfYWN0aXZlIjoxLCJpc19zdXNwZW5kZWQiOjAsInZpZGVvX3ZpZXdfbGltaXQiOjEwMDAsInZpZGVvX2NvdW50IjowLCJnZW5kZXIiOm51bGwsImNhdGVnb3J5IjpudWxsLCJkZXZpY2VfbW9kZWwiOm51bGwsImRldmljZV9icmFuZCI6bnVsbCwiZGVzaWduYXRpb24iOm51bGwsIndoYXRzYXBwX251bWJlciI6Ijg5ODk4OTg5OTkiLCJtYWNoaW5lX2lkIjpudWxsLCJjcmVhdGVkX2F0IjoiMjAyMC0wMS0yN1QxMDoyNTozMy4wMDBaIiwicmVtb3ZlZF9hdCI6bnVsbH0sImV4cGlyeUF0IjoiMTYzODg3MTg3NjM0MDxGZiMjMjxbbkNHQDcmMS98L059PjVuaD0_aD8uYSIsImlhdCI6MTYzODg3MTg3Nn0.7BHUU4rmjvjhnmij8KoX0qzXkpqoY-oyuXdtD6TGkK4'
    var knexConnection = require('knex')(knexConnectionConfig);
    // Fatch user From Database
    let array = await knexConnection.transaction(async trx => {
        return trx.select('member_ship_payments.*', 'users_genique.mobile').table('member_ship_payments').where('member_ship_payments.status', 'PAID')
            .join('users_genique', 'users_genique.id', 'member_ship_payments.user_id')
            .limit(50).offset(250);
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    console.log(array)

    array.map(async (ar) => {
        let params = {
            membership_id: 1,
            base_price: ar['plan_amount'],
            tax_amount: 18,
            tax_amount: "PERCENT",
            amount: ar['amount'],
            status: 'ADDED',
            uuid: uuidv4(),
            pay_via: 'ONLINE',
            created_at: ar['created_at']
        }

        var knexConnection = require('knex')(knexConnectionConfig);
        // Fatch user From Database
        let user = await knexConnection.transaction(async trx => {
            return trx.select().table('users').where('mobile_number', ar['mobile']).first();
        })
        // Destrory process (to clean pool)
        knexConnection.destroy();
        
        params.user_id = user.id
        let membership = await fetchByID('memberships', params.membership_id, { forUpgarde: params.type, forWeb: true, noLog: true }, token);
        if (membership.success == true) {
            var attributes = [];
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
                let carts = await fetchAll('membership-carts', query, token)
                let prefix = await getSettings('orderNumberPrefix')
                if (carts.success == true) {
                    params.user_id = userID
                    params.amount = carts.amount
                    params.final_price = parseInt(carts.finalPrice)
                    params.total_tax = carts.totalTax
                    params.assigned_by_admin = false
                    params.pay_via = payVia
                    params.status = 'SUCCESS'
                    params.type = 'MEMBERSHIP'
                    params.uuid = uuidv4()
                    params.created_at = ar['created_at']
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
                    }
                    if (cart.id) {
                        let data = {
                            transaction_id: ar['transection_id'],
                            // order_id: ar['transection_id'],
                            // signature: params.response.razorpay_signature,
                            payment_mode: payVia,
                            bank_ref_no: ar['bank_ref_no'],
                            user_id: params.user_id,
                            amount: params.amount,
                            response: JSON.stringify(ar['response']),
                            card_name: JSON.stringify(ar['card_name']),
                            currency: 'INR',
                            status: 'SUCCESS',
                            created_at: ar['created_at'],
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
                // membershipName: jsonData,
            };
            // Send response
            // res.status(statusCode).json(response);
        }
        else {
            res.status(422).json({
                success: false,
                error: membership
            });
        }
    })
    res.status(422).json({
        success: false,
        error: ''
    });
}