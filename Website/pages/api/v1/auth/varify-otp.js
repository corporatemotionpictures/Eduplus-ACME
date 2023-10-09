import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { postOnly, createLog, replaceUploads, injectMethodNotAllowed, validateRequestParams, genrateToken, jsonSafe, invalidFormData } from 'helpers/api';
import { getSettings } from 'helpers/apiService';
import Cookies from 'cookies'

// Verify OTP
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }


  let machineID;

  if (req.body.machine_id) {

    machineID = req.body.machine_id
    delete req.body.machine_id
  }

  var knexConnection;


  let userBaseID = 'mobile_number'
  let verifyBaseID = 'is_mobile_verified'

  let userAuthBase = await getSettings('loginUserID');

  if (userAuthBase == 'Email') {
    userBaseID = 'email'
    verifyBaseID = 'is_email_verified'
  }

  // Validate request with rules
  let schema = Joi.object({
    id: Joi.required(),
    [`${userBaseID}`]: Joi.allow(null),
    ver_code: Joi.required(),      //Commented till Actual production app run
    uuid: Joi.required(),      //Commented till Actual production app run
  });


  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  let otsUrl = process.env.NEXT_PUBLIC_TEST_SERIES_URL

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  let validUser = false;
  let validDevice = null;

  // Create db process (get into pool)
  knexConnection = require('knex')(knexConnectionConfig);

  // Check for verification code are  correct  
  var user = await knexConnection.transaction(async trx => {
    return knexConnection.select().table('users').where('id', params.id).first();
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


  if (user.data) {


    if (user.data.sms_ver_code == params.ver_code) {

      if (user.data.uuid != null && user.data.uuid != '') {

        if (user.data.uuid == params.uuid) {
          validDevice = true;
          validUser = true;
        }
        else {
          user.error = "Invalid Device";
        }
      }
      else {
        validDevice = true;
        validUser = true;
      }

      validUser = true;

    }
    else {
      user.error = "Invalid OTP";
    }
  }

  if (validUser && validDevice) {

    let data = {
      [`${verifyBaseID}`]: true,
      is_active: true,
      uuid: params.uuid    //Commented till Actual production app run
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

  // Create db process (get into pool)
  knexConnection = require('knex')(knexConnectionConfig);


  user.data = await knexConnection.transaction(async trx => {
    return knexConnection.select().table('users').where('id', params.id).where('is_active', 1).first();
  });

  // Destrory process (to clean pool)
  knexConnection.destroy();

  if (user.data) {

    user.data.image = await replaceUploads(user.data.image);


    // // Create db process (get into pool)
    // knexConnection = require('knex')(knexConnectionConfig);

    // // Fetch package from database
    // let packageDetail = await knexConnection.transaction(async trx => {
    //   return trx.select('packages.title').table('packages')
    //     .where('packages.id', user.data.package_id).first();
    // })

    // // Destrory process (to clean pool)
    // knexConnection.destroy();

    // user.data.package = packageDetail ? packageDetail.title : '';


    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Update user in database
    user.data.addresses = await knexConnection.transaction(async trx => {
      return trx('addresses').where('user_id', user.data.id);
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Update user in database
    user.data.academic_details = await knexConnection.transaction(async trx => {
      return trx('academic_details').where('user_id', user.data.id);
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Update user in database
    user.data.user_guardians = await knexConnection.transaction(async trx => {
      return trx('user_guardians').where('user_id', user.data.id);
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Update user in database
    user.data.branchDetail = await knexConnection.transaction(async trx => {
      return trx('courses').where('id', user.data.branch).first();
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();



  }

  let OtsAccessToken = null

  let otsIntigration = process.env.NEXT_PUBLIC_OTS_INTIGRATION

  if (validUser && validDevice && otsIntigration == "true") {
    let url = otsUrl.concat('/getMagicToken')

    let ots = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.data.email
      }),
    })

    if (ots.status == 200) {
      let otsJson = await ots.json()
      if (otsJson.success == true) {
        OtsAccessToken = otsJson.token
      }
    }
  }


  if (validUser && validDevice && user.data.machine_id && user.data.machine_id != '' && machineID) {

    if (machineID != user.data.machine_id) {
      validDevice = false
      error = "You have already logged in another device. You cannot login here. Please contact your admin to reset your device."
    }

  } else if (validUser && validDevice && (!user.data.machine_id || user.data.machine_id == '') && machineID) {

    let param = {}
    // Genrate Varification Code
    param.machine_id = machineID;

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    // Update user in database
    let updatedUser = await knexConnection.transaction(async trx => {
      return trx('users').where('id', user.data.id).update(param);
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

  if (validUser && validDevice) {
    let logged_data = {
      user_id: user.data.id,
      action: 'VERIFY_OTP',
    }


    let logs = await createLog(logged_data)
  }

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
        return trx('self_assessment_results').where('uuid', selfAssessmentTestUuid).update({ 'user_id': user.data.id });
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
  let response = {
    'success': validUser && validDevice,
    'user': validUser && validDevice ? jsonSafe(user.data) : null,
    'error': user.error,
    'token': validUser && validDevice ? genrateToken(user.data) : null,
    'OtsAccessToken': validUser && validDevice ? OtsAccessToken : null,
    'device': validDevice
  };

  let statusCode = validUser && validDevice ? 200 : 401;

  // Send Response
  res.status(statusCode).json(response);
}