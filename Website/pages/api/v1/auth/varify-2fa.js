import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { generateSecret, generateQRCode, verify } from 'helpers/2fa';
import { postOnly, createLog, replaceUploads, injectMethodNotAllowed, validateRequestParams, genrateToken, jsonSafe, invalidFormData } from 'helpers/api';
import bcrypt from 'bcryptjs';

// Login
export default async function base(req, res) {

    // Only allowed POST only methods
    if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

    var knexConnection;


    // set attributes
    let attributes = {
        id: 'id',
        first_name: 'first_name',
        last_name: 'last_name',
        mobile_number: 'mobile_number',
        email: 'email',
        password: 'password',
        type: 'type',
        is_active: 'is_active',
        image: 'image'
    };

    // 
    var user;
    var validUser;
    var existOauth = true;



    // Validate request with rules
    let schema = Joi.object({
        id: Joi.number().required(),
        code: Joi.string().required(),
    });

    // If everything fine: params object would contain data
    let params = validateRequestParams(req.body, schema, res);

    // If Data Not Valid 
    if (params.status == false) { invalidFormData(res, params.error); return false; }
    else { params = params.value; }


    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    // Fatch user By Mobile number
    user = await knexConnection.transaction(async trx => {
        return knexConnection.select(attributes).table('users').where('id', params.id).whereNot('type', 'USER').andWhere('is_active', 1).first();
    });

    // Destrory process (to clean pool)
    knexConnection.destroy();

    let error = null

    if (user) {
        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        // Fatch user From Database
        user.authenticationDetails = await knexConnection.transaction(async trx => {
            return trx.select().table('2fa_details').where('user_id', user.id).first();
        })


        // Destrory process (to clean pool)
        knexConnection.destroy();
    }

    if (user.authenticationDetails) {
        validUser = verify(params.code, user.authenticationDetails.secret);

        if (!validUser) {
            let recoveryCodes = user.authenticationDetails.recovery_keys ? JSON.parse(user.authenticationDetails.recovery_keys) : []
            validUser = recoveryCodes.includes(params.code)


            if (validUser) {

                recoveryCodes = recoveryCodes.filter(code => code != params.code)
                // Create db process (get into pool)
                var knexConnection = require('knex')(knexConnectionConfig);

                // Fatch user From Database
                let update = await knexConnection.transaction(async trx => {
                    return trx('2fa_details').where('user_id', user.id).update({ recovery_keys: JSON.stringify(recoveryCodes) });
                })


                // Destrory process (to clean pool)
                knexConnection.destroy();
            }

        }
    }


    if (validUser) {
        user.image = await replaceUploads(user.image);

        if ((user.type == 'MANAGEMENT' || user.type == 'FACULTY')) {
            user.image = await replaceUploads(user.image);
            var knexConnection = require('knex')(knexConnectionConfig);

            // Fatch user From Database
            let permissions = await knexConnection.transaction(async trx => {
                return trx.select().table('user_permissions').where('user_id', user.id);
            })


            // Destrory process (to clean pool)
            knexConnection.destroy();

            user.module_ids = []
            permissions ? permissions.map((permission) => { user.module_ids.push(permission.module_id) }) : []

            // Create db process (get into pool)
            var knexConnection = require('knex')(knexConnectionConfig);

            // Fatch user From Database
            user.modules = await knexConnection.transaction(async trx => {
                return trx.select().table('modules').whereIn('id', user.module_ids);
            })


            // Destrory process (to clean pool)
            knexConnection.destroy();


            // Create db process (get into pool)
            var knexConnection = require('knex')(knexConnectionConfig);

            // Fatch user From Database
            user.authenticationDetails = await knexConnection.transaction(async trx => {
                return trx.select().table('2fa_details').where('user_id', user.id).first();
            })


            // Destrory process (to clean pool)
            knexConnection.destroy();



            // For falcuties
            if (user.type == 'FACULTY') {

                // Create db process (get into pool)
                var knexConnection = require('knex')(knexConnectionConfig);

                // Fatch user From Database
                let subjects = await knexConnection.transaction(async trx => {
                    return trx.select().table('faculty_subjects').where('user_id', user.id);
                })


                // Destrory process (to clean pool)
                knexConnection.destroy();

                user.subject_ids = []
                subjects ? subjects.map((subject) => { user.subject_ids.push(subject.subject_id) }) : []

                // Create db process (get into pool)
                var knexConnection = require('knex')(knexConnectionConfig);

                // Fatch user From Database
                user.subjects = await knexConnection.transaction(async trx => {
                    return trx.select().table('subjects').whereIn('id', user.subject_ids);
                })


                // Destrory process (to clean pool)
                knexConnection.destroy();


            }
        }


    } else {
        error = 'Invalid Code'
    }


    let tokenUser = user



    if (user) {

        // Create db process (get into pool)
        knexConnection = require('knex')(knexConnectionConfig);

        // Fatch user By Mobile number
        tokenUser = await knexConnection.transaction(async trx => {
            return knexConnection.select().table('users').where('id', user.id).first();
        });

        // Destrory process (to clean pool)
        knexConnection.destroy();

        tokenUser.module_ids = user.module_ids
        tokenUser.subject_ids = user.subject_ids
        user.image = await replaceUploads(user.image);
    }

    // Set Response
    let response = {
        'success': validUser ? true : false,
        'user': validUser ? jsonSafe(user) : null,
        'token': validUser ? genrateToken(tokenUser) : null,
        'existOauth': existOauth,
        'error': error,

    };

    let statusCode = validUser ? 200 : 401;

    // Send Response
    res.status(statusCode).json(response);
}