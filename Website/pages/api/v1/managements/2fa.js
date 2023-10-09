import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { postOnly, createLog, replaceUploads, injectMethodNotAllowed, validateRequestParams, verifyToken, invalidFormData, jsonSafe, updateTestUser, sendVarCode } from 'helpers/api';
import bcrypt from 'bcryptjs';

// Function to Update User
export default async function base(req, res) {

  // Only allowed POST only methods
  postOnly(req) ? postOnly(req) : injectMethodNotAllowed(res);

  // Validate request with rules
  let schema = Joi.object({
    user_id: Joi.number().required(),
    secret: Joi.allow(null),
    recovery_keys: Joi.allow(null),
    is_active: Joi.allow(null),

  });


  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }


  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let user = await knexConnection.transaction(async trx => {
    return trx.select().table('2fa_details').where('user_id', params.user_id).first();
  })

  // Destrory process (to clean pool)
  knexConnection.destroy();

  if (user) {

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    // Update user in database
    user = await knexConnection.transaction(async trx => {
      return trx('2fa_details').where('user_id', params.user_id).update(params);
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
  } else {

    knexConnection = require('knex')(knexConnectionConfig);

    // Update user in database
    user = await knexConnection.transaction(async trx => {
      return trx('2fa_details').insert(params);
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

  }


  //
  let statusCode = user.id ? 200 : 422;
  let response = {
    success: user.id ? true : false,
    user: user.data,
    error: user.error
  };

  // Send response
  res.status(statusCode).json(response);
}
