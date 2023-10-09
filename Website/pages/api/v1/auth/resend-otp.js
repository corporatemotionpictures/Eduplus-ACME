import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import  { postOnly, createLog, replaceUploads, injectMethodNotAllowed, validateRequestParams, invalidFormData, sendVarCode } from 'helpers/api';
import moment from 'moment';

// Register user
export default async function base(req, res) {

    // Only allowed POST only methods  // Only allowed POST only methods
    if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }


    // Create db process (get into pool)
    let knexConnection = require('knex')(knexConnectionConfig);

    // Update user in database
    let user = await knexConnection.transaction(async trx => {
        return trx('users').where('id', req.body.id).first();
    }).then(async res => {
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

    let error = null

    let date = moment(Date.now()).subtract(1, 'h').format("YYYY-MM-DD HH:mm:ss")


    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    // Fatch user By Mobile number
    var lastOneHoursCount = await knexConnection.transaction(async trx => {
        return trx.select().table('user_verification_codes').where('user_id', user.data.id).andWhere('created_at', '>=', date).count('id as count').first();
    });

    // Destrory process (to clean pool)
    knexConnection.destroy();

    if (lastOneHoursCount.count >= 3) {
        error = error = 'Oops! You have asked for too many OTPs. Please try after 60 mins or contact your institute.'
    }

    var updatedUser = null

    await sendVarCode(user.data)

    if (!error) {

        let params = {}

        // Genrate Varification Code
        params.sms_ver_code = await sendVarCode(user.data);


        // Create db process (get into pool)
        knexConnection = require('knex')(knexConnectionConfig);

        // Update user in database
        updatedUser = await knexConnection.transaction(async trx => {
            return trx('users').where('id', user.data.id).update(params);
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


        let data = {
            user_id: user.data.id,
            otp: params.sms_ver_code
        }

        // Create db process (get into pool)
        knexConnection = require('knex')(knexConnectionConfig);

        // Update user in database
        let Store = await knexConnection.transaction(async trx => {
            return trx('user_verification_codes').insert(data);
        })

        // Destrory process (to clean pool)
        knexConnection.destroy();
    }

    //
    let statusCode = !error && updatedUser.id ? 200 : 422;
    let response = {
        success: !error && updatedUser.id ? true : false,
        'user': !error ? user : null,
        'error': error,
    };


    // Send response
    res.status(statusCode).json(response);

}