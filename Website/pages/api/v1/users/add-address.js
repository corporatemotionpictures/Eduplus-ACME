import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { postOnly, createLog, replaceUploads, injectMethodNotAllowed, validateRequestParams, invalidFormData, sendVarCode } from 'helpers/api';
import bcrypt from 'bcryptjs';

// Register user
export default async function base(req, res) {


    // Validate request with rules
    let schema = Joi.object({
        user_id: Joi.required(),
        address: Joi.required(),
        city: Joi.required(),
        state: Joi.required(),
        zip_code: Joi.required(),
        country: Joi.required(),
    });

    // If everything fine: params object would contain data
    let params = validateRequestParams(req.body, schema, res);

    // If Data Not Valid 
    if (params.status == false) { invalidFormData(res, params.error); return false; }
    else { params = params.value; }

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Update user in database
    let address = await knexConnection.transaction(async trx => {
        return trx('addresses').insert(params);
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


    //
    let statusCode = address.id ? 200 : 422;
    let response = {
        success: true,
        address: address,
        error: address.error
    };

    // Send response
    res.status(statusCode).json(response);
}
