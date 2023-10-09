import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import  { postOnly, createLog, replaceUploads, injectMethodNotAllowed, validateRequestParams, verifyToken, invalidFormData, jsonSafe, updateTestUser, sendVarCode } from 'helpers/api';
import bcrypt from 'bcryptjs';

// Function to Update User
export default async function base(req, res) {

  // Only allowed POST only methods
  postOnly(req) ? postOnly(req) : injectMethodNotAllowed(res);

  // Validate request with rules
  let schema = Joi.object({
    id: Joi.number().required(),
    first_name: Joi.string().allow(null).min(3).max(30).label('First Name'),
    last_name: Joi.string().allow(null).min(3).max(30).label('Last Name'),
    email: Joi.string().allow(null).label('Email'),
    designation: Joi.string().allow(null).label('Designation'),
    dob: Joi.string().allow(null).label('dob'),
    type: Joi.string().allow(null).label('type'),
    is_mobile_verified: Joi.boolean().allow(null).label('Mobile verified'),
    is_email_verified: Joi.boolean().allow(null).label('Email verified'),
    category: Joi.string().allow(null).label('category'),
    gender: Joi.string().allow(null).label('gender'),
    module_ids: Joi.allow(null).label('Modules'),
    subject_ids: Joi.allow(null).label('Subjects'),
    mobile_number: Joi.string().allow(null).label('Mobile Number'),
    password: Joi.string().allow(null).min(6).label('Passowrd'),
    confirm_password: Joi.ref('password'),
    image: Joi.string().allow(null),

  });


  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  // Set attributes
  let id = params.id;

  if (params.password) {

    // Use Bcrypt for password
    params.password = await bcrypt.hash(params.password, 12);

    // Remove confirm password from params
    // delete params.password;
    delete params.confirm_password;

  }
  if (params.confirm_password == null) {
    delete params.confirm_password;
  }
  if (params.password == null) {
    delete params.password;
  }

  // delete params.confirm_password;
  // delete params.password;

  var subject_ids = []
  if (params.type && params.type == 'FACULTY') {
    subject_ids = JSON.parse(params.subject_ids);
    delete params['subject_ids'];
  }
  var module_ids = []

  if (params.module_ids) {

    module_ids = JSON.parse(params.module_ids);
    delete params['module_ids'];
  }

  let user = null

  if (params.mobile_number) {

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    user = await knexConnection.transaction(async trx => {
      return trx.select().table('users').where('mobile_number', params.mobile_number).whereNot('id', params.id).first();
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();
  }

  if (user) {

    //
    let statusCode = 422;
    let response = {
      success: false,
      'error': 'Mobile Number Already Exist'
    };

    res.status(statusCode).json(response);
  }
  else {

    if (params.email) {

      // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);

      user = await knexConnection.transaction(async trx => {
        return trx.select().table('users').where('email', params.email).whereNot('id', params.id).whereNotNull('email').first();
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();
    }

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
      knexConnection = require('knex')(knexConnectionConfig);

      // Update user in database
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

      // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);


      user.data = await knexConnection.transaction(async trx => {
        return trx.select().table('users').where('id', id).first();
      })
      // Destrory process (to clean pool)
      knexConnection.destroy();




      let accessDelete = null

      if (subject_ids.length > 0) {
        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        // Register user into database
        accessDelete = await knexConnection.transaction(async trx => {
          return trx('faculty_subjects').where('user_id', id).del();
        })

        // Destrory process (to clean pool)
        knexConnection.destroy();
      }

      for (let i = 0; i < subject_ids.length; i++) {



        var access_data = {
          subject_id: subject_ids[i],
          user_id: id
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

      if (module_ids.length > 0) {


        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        // Register user into database
        accessDelete = await knexConnection.transaction(async trx => {
          return trx('user_permissions').where('user_id', id).del();
        })

        // Destrory process (to clean pool)
        knexConnection.destroy();
      }


      for (let i = 0; i < module_ids.length; i++) {



        var data = {
          module_id: module_ids[i],
          user_id: id
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


      user.data.image = await replaceUploads(user.data.image);

      //
      let statusCode = user.id ? 200 : 422;
      let response = {
        success: user.id ? true : false,
        user: jsonSafe(user.data),
        error: user.error
      };

      // Send response
      res.status(statusCode).json(response);
    }
  }
}
