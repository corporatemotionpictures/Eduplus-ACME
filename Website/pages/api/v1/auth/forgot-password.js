import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, invalidFormData, sendVarCode } from 'helpers/api';
import { getSettings } from 'helpers/apiService';
import bcrypt from 'bcryptjs';
import moment from 'moment';

// Register user
export default async function base(req, res) {

  // Only allowed POST only methods  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Validate request with rules
  let schema = Joi.object({
    mobile_number: Joi.string().required()
  });

  let userBaseID = 'mobile_number'

  let userAuthBase = await getSettings('loginUserID');

  if (userAuthBase == 'Email') {
    schema = Joi.object({
      email: Joi.string().required()
    });

    userBaseID = 'email'
  }

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fatch user By Mobile number
  var user = await knexConnection.transaction(async trx => {
    return trx.select().table('users').where(userBaseID, params[userBaseID]).andWhere('is_active', 1).first();
  });

  // Destrory process (to clean pool)
  knexConnection.destroy();

  let updateUser;
  let error = null;

  if (user) {

    let date = moment(Date.now()).subtract(1, 'h').format("YYYY-MM-DD HH:mm:ss")

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    // Fatch user By Mobile number
    var lastOneHoursCount = await knexConnection.transaction(async trx => {
      return trx.select().table('user_verification_codes').where('user_id', user.id).andWhere('created_at', '>=', date).count('id as count').first();
    });

    // Destrory process (to clean pool)
    knexConnection.destroy();

    if (lastOneHoursCount.count >= 3) {
      error = 'Oops! You have asked for too many OTPs. Please try after 60 mins or contact your institute.'
    }
  }


  if (user && !error) {


    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    // Genrate Varification Code
    params.sms_ver_code = await sendVarCode(user);

    // Update user in database
    updateUser = await knexConnection.transaction(async trx => {
      return trx('users').where('id', user.id).update(params);
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
    });

    // Destrory process (to clean pool)
    knexConnection.destroy();

    let data = {
      user_id: user.id,
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
  else {
    updateUser = null
  }



  if (updateUser && !error) {
    let logged_data = {
      user_id: user.id,
      action: 'FORGOT_PASSWORD',
    }


    let logs = await createLog(logged_data)
  }

  //
  let statusCode = updateUser && !error ? 200 : 422;
  let response = {
    success: updateUser && !error ? true : false,
    user: updateUser && !error ? user : null,
    error: error
  };


  // Send response
  res.status(statusCode).json(response);
}
