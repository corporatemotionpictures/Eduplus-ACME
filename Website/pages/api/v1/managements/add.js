import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { postOnly, createLog, replaceUploads, injectMethodNotAllowed, validateRequestParams, invalidFormData, sendVarCode } from 'helpers/api';
import bcrypt from 'bcryptjs';

// Register user
export default async function base(req, res) {

  // Only allowed POST only methods  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Validate request with rules
  let schema = Joi.object({
    first_name: Joi.string().min(3).max(30).label('First Name'),
    last_name: Joi.string().min(3).max(30).label('Last Name'),
    email: Joi.string().allow(null).label('Email'),
    designation: Joi.string().allow(null).label('Designation'),
    dob: Joi.string().allow(null).label('dob'),
    type: Joi.string().allow(null).label('type'),
    category: Joi.string().allow(null).label('category'),
    gender: Joi.string().allow(null).label('gender'),
    module_ids: Joi.allow(null).label('Modules'),
    subject_ids: Joi.allow(null).label('Subjects'),
    mobile_number: Joi.string().required().label('Mobile Number'),
    password: Joi.string().min(6).required().label('Passowrd'),
    confirm_password: Joi.ref('password'),
    is_mobile_verified: Joi.boolean().allow(null).label('Mobile verified'),
    is_email_verified: Joi.boolean().allow(null).label('email verified'),
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  params.is_active = 1;
  params.video_view_limit = 1000;

  // Use Bcrypt for password
  params.password = await bcrypt.hash(params.password, 12);

  // Remove confirm password from params
  delete params.confirm_password;

  var subject_ids = []
  if (params.type && params.type == 'FACULTY') {
    subject_ids = JSON.parse(params.subject_ids);
    delete params['subject_ids'];
  }

  var module_ids = JSON.parse(params.module_ids);
  delete params['module_ids'];


  params.image = params.image ? params.image : "/website/assets/images/faculty_default.jpg";


  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let user = await knexConnection.transaction(async trx => {
    return trx.select().table('users').where('mobile_number', params.mobile_number).orWhere('email', params.email).first();
  })

  // Destrory process (to clean pool)
  knexConnection.destroy();

  if (user) {

    //
    let statusCode = 422;
    let response = {
      success: false,
      'error': 'Mobile Number or Email ID Already Exist'
    };

    res.status(statusCode).json(response);
  }
  else {

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    user = await knexConnection.transaction(async trx => {
      return trx.select().table('users').where('email', params.email).whereNotNull('email').first();
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    if (user) {

      //
      let statusCode = 422;
      let response = {
        success: false,
        'error': 'Email Already Exist'
      };

      res.status(statusCode).json(response);
    }


    else {

      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      // Register user into database
      let user = await knexConnection.transaction(async trx => {
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


      for (let i = 0; i < subject_ids.length; i++) {
        var access_data = {
          subject_id: subject_ids[i],
          user_id: user.id
        };

        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        // Register user into database
        let access = await knexConnection.transaction(async trx => {
          return trx.insert(access_data).into('faculty_subjects');
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

      }


      for (let i = 0; i < module_ids.length; i++) {
        var data = {
          module_id: module_ids[i],
          user_id: user.id
        };

        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        // Register user into database
        let access = await knexConnection.transaction(async trx => {
          return trx.insert(data).into('user_permissions');
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

      }

      // user.image = await replaceUploads(user.image);

      //
      let statusCode = user.id ? 200 : 422;
      let response = {
        success: user.id ? true : false,
        'user': user,
        id: user.id
      };

      // Send response
      res.status(statusCode).json(response);
    }


  }
}
