import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { postOnly, createLog, replaceUploads, injectMethodNotAllowed, validateRequestParams, invalidFormData, sendVarCode } from 'helpers/api';
import bcrypt from 'bcryptjs';

// Register user
export default async function base(req, res) {


    // Validate request with rules
    let schema = Joi.object({
        id: Joi.required(),
        approved: Joi.allow(null),
    });

    // If everything fine: params object would contain data
    let params = validateRequestParams(req.body, schema, res);

    // If Data Not Valid 
    if (params.status == false) { invalidFormData(res, params.error); return false; }
    else { params = params.value; }

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Update user in database
    let userMembershipDoucument = await knexConnection.transaction(async trx => {
        return trx('user_membership_doucuments').where('id', params.id).update(params);
    }).then(async res => {
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

    //
    let statusCode = userMembershipDoucument.id ? 200 : 422;
    let response = {
        success: true,
        userMembershipDoucument: userMembershipDoucument,
        error: userMembershipDoucument
    };

    // Send response
    res.status(statusCode).json(response);
}
