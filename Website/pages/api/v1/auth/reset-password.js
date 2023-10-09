import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, invalidFormData, jsonSafe, genrateToken, updateTestUser } from 'helpers/api';
import bcrypt from 'bcryptjs';
import { getSettings } from 'helpers/apiService';

// Register user
export default async function base(req, res) {

  // Only allowed POST only methods  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  var knexConnection;

  // Validate request with rules
  let schema = Joi.object({
    id: Joi.required(),
    ver_code: Joi.required(),
    password: Joi.string().min(6).required(),
    confirm_password: Joi.ref('password')
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  let validUser = false;

  // Create db process (get into pool)
  knexConnection = require('knex')(knexConnectionConfig);

  // Check for verification code are  correct  
  var user = await knexConnection.transaction(async trx => {
    return trx.select().table('users').where('id', params.id).first();
  }).then(res => {
    return {
      data: res,
      error: null
    };
  }).catch(err => {
    return {
      data: null,
      error: err.sqlMessage
    };
  });


  // Destrory process (to clean pool)
  knexConnection.destroy();


  let userAuthBase = await getSettings('loginUserID');
  let userVerifiedID = 'is_mobile_verified';

  if (userAuthBase == 'Email') {
    userVerifiedID = 'is_email_verified'
  }

  if (user.data) {
    if (user.data.sms_ver_code == params.ver_code) {

      validUser = true;

      // Use Bcrypt for password
      params.password = await bcrypt.hash(params.password, 12);

      let data = {
        password: params.password,
        [`${userVerifiedID}`]: true
      }

      // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);

      // Update user in database
      user = await knexConnection.transaction(async trx => {
        return trx('users').where('id', params.id).update(data);
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
      });

      // Destrory process (to clean pool)
      knexConnection.destroy();

    }
    else {
      user.error = "Invalid OTP"
    }
  }

  // Create db process (get into pool)
  knexConnection = require('knex')(knexConnectionConfig);

  user.data = await knexConnection.transaction(async trx => {
    return trx.select().table('users').where('id', params.id).where('is_active', 1).first();
  });

  // Destrory process (to clean pool)
  knexConnection.destroy();

  // Update User Detail on Test Series
  if (user.data.id) {

    // Call A Function For User Update on ONS
    // let updateTest = await updateTestUser(user);

  }

    
  if (user.data.id) {
    let logged_data = {
      user_id: user.data.id,
      action: 'RESET_PASSWORD',
    }


    let logs = await createLog(logged_data)
  }

  //
  let statusCode = user.data.id ? 200 : 422;
  let response = {
    success: user.data.id ? true : false,
    user: validUser ? jsonSafe(user.data) : null,
    error: !validUser ? null : ( user.error ? user.error : 'Wrong Verification Code'),
    token: validUser ? genrateToken(user) : null
  };


  // Send response
  res.status(statusCode).json(response);
} 
