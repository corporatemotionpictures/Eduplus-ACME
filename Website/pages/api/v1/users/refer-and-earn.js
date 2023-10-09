import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';
import { fetchByID } from 'helpers/apiService';

// Function to Get User By ID
export default async function base(req, res) {

    // Only allowed GET only methods
    if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

    // Later parse User from JWT-header token 
    let user = await verifyToken(req);

    // Only ADMIN type of User allowed to insert course
    if (!user) { restrictedAccess(res); return false; }

    let userID = req.query.userID ? req.query.userID : user.id

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fatch user From Database
    let referralCode = await knexConnection.transaction(async trx => {
        let query = knexConnection.select('referral_codes.*').table('referral_codes')
            .where('user_id', userID).first();

        return query;
    })


    // Destrory process (to clean pool)
    knexConnection.destroy();

    if (!referralCode) {
        var randomstring = require("randomstring");

        let referral_codes = {
            user_id: userID,
            code: randomstring.generate(6),
        }

        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        // Update user in database
        let referralCodes = await knexConnection.transaction(async trx => {
            return trx('referral_codes').insert(referral_codes);
        }).then(async res => {
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

        // Fatch user From Database
        referralCode = await knexConnection.transaction(async trx => {
            let query = knexConnection.select('referral_codes.*').table('referral_codes')
                .where('user_id', userID).first();

            return query;
        })


        // Destrory process (to clean pool)
        knexConnection.destroy();
    }


    let minReferrarAmount

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fatch user From Database
    let referrals = await knexConnection.transaction(async trx => {
        let query = knexConnection.select('referrals.referrar_discount_type').table('referrals')
            .min('referrar_amount').where('referrals.referrar_discount_type', 'PERCENT');

        return query;
    })


    // Destrory process (to clean pool)
    knexConnection.destroy();


    if (referrals && referrals.length > 0) {

        minReferrarAmount = `${referrals[0]['min(`referrar_amount`)']} %`
    } else {
        minReferrarAmount = `10 %`
    }

    let maxReferrarAmount

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fatch user From Database
    referrals = await knexConnection.transaction(async trx => {
        let query = knexConnection.select('referrals.referrar_discount_type').table('referrals')
            .max('referrar_amount').where('referrals.referrar_discount_type', 'PERCENT');

        return query;
    })


    // Destrory process (to clean pool)
    knexConnection.destroy();


    if (referrals && referrals.length > 0) {
        maxReferrarAmount = `${referrals[0]['max(`referrar_amount`)']} %`
    } else {
        maxReferrarAmount = `10 %`
    }


    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fatch user From Database
    let userReferrals = await knexConnection.transaction(async trx => {
        let query = knexConnection.select('user_referrals.*').table('user_referrals')
            .join('orders', 'orders.id', 'user_referrals.order_id')
            .where('user_referrals.user_id', userID);

        return query;
    })


    // Destrory process (to clean pool)
    knexConnection.destroy();


    if (userReferrals) {
        for (let i = 0; i < userReferrals.length; i++) {
            let userReferral = userReferrals[i]

            // Create db process (get into pool)
            var knexConnection = require('knex')(knexConnectionConfig);

            // Fatch user From Database
            let order = await knexConnection.transaction(async trx => {
                let query = knexConnection.select('orders.*').table('orders')
                    .where('id', userReferral.order_id).first();

                return query;
            })


            // Destrory process (to clean pool)
            knexConnection.destroy();

            if (order) {
                userReferral.order = await fetchByID('orders', order.order_number, {}, req.headers['x-auth-token'])
                userReferral.order = userReferral.order.success == true ? userReferral.order.order : []
            }

        }
    }


    //
    let statusCode = referralCode ? 200 : 422;
    let response = {
        success: referralCode ? true : false,
        referralCode: referralCode,
        minReferrarAmount: minReferrarAmount,
        maxReferrarAmount: maxReferrarAmount,
        userReferrals: userReferrals,
        error: user
    };



    // Send Response
    res.status(statusCode).json(response);
}