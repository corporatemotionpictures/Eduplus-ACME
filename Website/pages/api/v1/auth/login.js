import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getSettings } from 'helpers/apiService';
import { postOnly, createLog, replaceUploads, injectMethodNotAllowed, sendVarCode, validateRequestParams, genrateToken, jsonSafe, invalidFormData } from 'helpers/api';
import bcrypt from 'bcryptjs';
import fetch from 'isomorphic-unfetch';
import moment from 'moment';
import Cookies from 'cookies'

// Login
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  var knexConnection;
  let otsUrl = process.env.NEXT_PUBLIC_TEST_SERIES_URL

  // 
  var user;
  var validUser;
  var existOauth = true;
  var error = 'User not Found';

  let gourd = req.body.gourd ? req.body.gourd : 'appLogin'
  let gourdAuth = gourd
  gourd = await getSettings(gourd)


  let userBaseID = 'mobile_number'

  let userAuthBase = await getSettings('loginUserID');

  if (userAuthBase == 'Email') {
    userBaseID = 'email'
  }


  let deviceId;
  let machineID;

  let AdminUser = process.env.ADMINISTRATOR_USER ? process.env.ADMINISTRATOR_USER.split(',') : []

  if (req.body.machine_id) {

    machineID = req.body.machine_id
    delete req.body.machine_id
  }

  // Check If auth provider Exist i.e Google, facebook
  if (req.body.auth_provider == undefined) {

    // Validate request with rules
    let schema = Joi.object({
      [`${userBaseID}`]: Joi.string().required(),
      gourd: Joi.string(),
      uuid: Joi.string(),
    });


    if (gourd == 'PASSWORD') {
      schema = Joi.object({
        [`${userBaseID}`]: Joi.string().required(),
        password: Joi.string().required(),
        gourd: Joi.string(),
        uuid: Joi.string(),
      });
    }


    // If everything fine: params object would contain data
    let params = validateRequestParams(req.body, schema, res);


    // If Data Not Valid 
    if (params.status == false) { invalidFormData(res, params.error); return false; }
    else { params = params.value; }

    if (params.gourd) {
      delete params.gourd
    }



    if (params.uuid) {
      deviceId = params.uuid
      delete params.uuid
    }

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    // Fatch user By Mobile number
    user = await knexConnection.transaction(async trx => {
      return trx.select().table('users').where(userBaseID, params[userBaseID]).where('is_active', 1).whereNot('type', 'ADMIN').first();
    });

    // Destrory process (to clean pool)
    knexConnection.destroy();

    // Check password & generate JWT
    var token = null;
    existOauth = null;

    if (gourd == 'PASSWORD') {

      validUser = user && user.password ? await bcrypt.compare(params.password, user.password) : null;

      if (!validUser) {
        error = 'Incorrect Credentials'
      }
    } else {
      validUser = user ? true : null;
    }

  }

  else {

    // Validate request with rules
    let schema = Joi.object({
      auth_provider: Joi.string().required(),
      email: Joi.string().allow(null),
      oauth_id: Joi.required(),
      first_name: Joi.required(),
      last_name: Joi.required(),
      uuid: Joi.string(),
    });

    // If everything fine: params object would contain data
    let params = validateRequestParams(req.body, schema, res);

    // If Data Not Valid 
    if (params.status == false) { invalidFormData(res, params.error); return false; }
    else { params = params.value; }


    if (params.uuid) {
      deviceId = params.uuid
      delete params.uuid
    }

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);


    // Fatch user By Auth ID
    user = await knexConnection.transaction(async trx => {
      return trx.select().table('users').where('oauth_id', params.oauth_id).first();
    });

    // Destrory process (to clean pool)
    knexConnection.destroy();


    // Check if Oauth ID Already exist
    if (user) {

      validUser = true;

    }
    else {

      if (params.email) {

        // Create db process (get into pool)
        knexConnection = require('knex')(knexConnectionConfig);


        // Fatch user By Email ID
        var userExist = await knexConnection.transaction(async trx => {
          return trx.select().table('users').where('email', params.email).first();
        });

        // Destrory process (to clean pool)
        knexConnection.destroy();

      }

      var id;

      // Check if User Already registered with this email id
      if (userExist) {

        params.is_active = true;
        id = userExist.id;

        // Create db process (get into pool)
        knexConnection = require('knex')(knexConnectionConfig);


        // if Email exist then update users
        user = await knexConnection.transaction(async trx => {
          return trx('users').where('id', id).update(params);
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
      else {

        // Set password to null
        params.password = null;
        params.mobile_number = null;
        params.is_active = true;

        // Create db process (get into pool)
        knexConnection = require('knex')(knexConnectionConfig);


        // if Email not exist then insert data
        user = await knexConnection.transaction(async trx => {
          return trx.insert(params).into('users');
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


        existOauth = false;
        id = user.id;

      }

      validUser = true;


      // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);


      // select user details
      user = await knexConnection.transaction(async trx => {
        return trx.select().table('users').where('id', id).where('is_active', 1).first();
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

    }

  }

  if (validUser && user && user.type != 'ADMIN') {
    let logged_data = {
      user_id: user.id,
      action: 'LOGIN',
    }


    let logs = await createLog(logged_data)
  }


  if (user && !AdminUser.includes(user[userBaseID]) && validUser && user.type != 'ADMIN' && (gourd == 'OTP' || (gourdAuth == 'appLogin' && (!user.uuid || user.uuid == '')))) {

    if (user.by_pass_user == 1) {
      let param = {};
      // Genrate Varification Code
      param.uuid = deviceId;
      param.by_pass_user = 0;

      // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);

      // Update user in database
      let updatedUser = await knexConnection.transaction(async trx => {
        return trx('users').where('id', user.id).update(param);
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
      knexConnection = require('knex')(knexConnectionConfig);


      // select user details
      user = await knexConnection.transaction(async trx => {
        return trx.select().table('users').where('id', user.id).where('is_active', 1).first();
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

    } else {
      let param = {};

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
        error = error = 'Oops! You have asked for too many OTPs. Please try after 60 mins or contact your institute.'
        validUser = false
      }

      if (validUser) {

        // Genrate Varification Code
        param.sms_ver_code = await sendVarCode(user);

        // Create db process (get into pool)
        knexConnection = require('knex')(knexConnectionConfig);

        // Update user in database
        let updatedUser = await knexConnection.transaction(async trx => {
          return trx('users').where('id', user.id).update(param);
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
          user_id: user.id,
          otp: param.sms_ver_code
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
    }

  }

  if (user) {

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Update user in database
    user.addresses = await knexConnection.transaction(async trx => {
      return trx('addresses').where('user_id', user.id);
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Update user in database
    user.academic_details = await knexConnection.transaction(async trx => {
      return trx('academic_details').where('user_id', user.id);
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Update user in database
    user.user_guardians = await knexConnection.transaction(async trx => {
      return trx('user_guardians').where('user_id', user.id);
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();


    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Update user in database
    user.branchDetail = await knexConnection.transaction(async trx => {
      return trx('courses').where('id', user.branch).first();
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

  }


  if (user) {

    user.image = await replaceUploads(user.image);



    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Update user in database
    user.addresses = await knexConnection.transaction(async trx => {
      return trx('addresses').where('user_id', user.id);
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Update user in database
    user.academic_details = await knexConnection.transaction(async trx => {
      return trx('academic_details').where('user_id', user.id);
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Update user in database
    user.user_guardians = await knexConnection.transaction(async trx => {
      return trx('user_guardians').where('user_id', user.id);
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

  }

  let OtsAccessToken = null

  let otsIntigration = process.env.NEXT_PUBLIC_OTS_INTIGRATION


  if (validUser && otsIntigration == "true") {
    let url = otsUrl.concat('/getMagicToken')

    let ots = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email
      }),
    })

    if (ots) {


      if (ots.status == 200) {
        let otsJson = await ots.json()
        if (otsJson.success == true) {
          OtsAccessToken = otsJson.token
        }

      }
      else {

        let body = {
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          mobile_number: user.mobile_number,
          subscription_id: null,
          // branch_id: data.branch_id,
        }

        otsUrl = process.env.NEXT_PUBLIC_TEST_SERIES_URL
        url = otsUrl.concat('/syncUser')

        let data = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        })

        if (data) {
          otsUrl = process.env.NEXT_PUBLIC_TEST_SERIES_URL
          url = otsUrl.concat('/getMagicToken')

          ots = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.email
            }),
          })

          if (ots) {


            if (ots.status == 200) {
              let otsJson = await ots.json()
              if (otsJson.success == true) {
                OtsAccessToken = otsJson.token
              }
            }
          }

        }
      }
    }
  }

  let validDevice = true

  if (gourdAuth == 'appLogin' && validUser && user.uuid && user.uuid != '') {
    if (deviceId != user.uuid) {
      validDevice = false
      error = "You have already logged in another device. You cannot login here. Please contact your admin to reset your device."
    }
  }


  if (validUser && user.machine_id && user.machine_id != '' && machineID && !AdminUser.includes(user[userBaseID])) {
    if (machineID != user.machine_id) {
      validDevice = false
      error = "You have already logged in another device. You cannot login here. Please contact your admin to reset your device."
    }

  } else if (validUser && (!user.machine_id || user.machine_id == '' || AdminUser.includes(user[userBaseID])) && machineID) {

    let param = {}
    // Genrate Varification Code
    param.machine_id = machineID;

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    // Update user in database
    let updatedUser = await knexConnection.transaction(async trx => {
      return trx('users').where('id', user.id).update(param);
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

  // Set Response
  let response = {
    'success': validUser && validDevice == true ? true : false,
    'user': validUser && validDevice == true ? jsonSafe(user) : null,
    'existOauth': existOauth,
    'error': validUser && validDevice == true ? null : error,
  };



  if (user && (AdminUser.includes(user[userBaseID]) || (gourd == 'PASSWORD' && (gourdAuth != 'appLogin' || (user.uuid && user.uuid != ''))))) {

    if (validUser && validDevice == true) {

      // Create a cookies instance
      const cookies = new Cookies(req, res)
      let selfAssessmentTestUuid = cookies.get('selfAssessmentTestUuid')

      console.log('selfAssessmentTestUuid')
      console.log(selfAssessmentTestUuid)
      if (selfAssessmentTestUuid && selfAssessmentTestUuid != undefined) {

        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        // Delete assessment from database
        let assessmentResults = await knexConnection.transaction(async trx => {
          return trx('self_assessment_results').where('uuid', selfAssessmentTestUuid).update({ 'user_id': user.id });
        })


        // Destrory process (to clean pool)
        knexConnection.destroy();

        console.log(assessmentResults)

        if (assessmentResults) {
          // Delete a cookie
          cookies.set('selfAssessmentTestUuid')
        }
      }

    }


    // Set Response
    response = {
      'success': validUser && validDevice == true ? true : false,
      'user': validUser && validDevice == true ? jsonSafe(user) : null,
      'token': validUser && validDevice == true ? genrateToken(user) : null,
      'existOauth': existOauth,
      'error': validUser && validDevice == true ? null : error,
      'OtsAccessToken': validUser && validDevice == true ? OtsAccessToken : null,
    };
  }

  let statusCode = validUser && validDevice == true ? 200 : 401;

  // Send Response
  res.status(statusCode).json(response);
}