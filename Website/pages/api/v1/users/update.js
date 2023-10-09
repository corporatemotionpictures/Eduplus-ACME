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

  let schema = {
    id: Joi.number().required(),
    first_name: Joi.string().min(3).max(30),
    last_name: Joi.string().min(3).max(30),
    email: Joi.string().allow(null),
    mobile_number: Joi.string(),
    whatsapp_number: Joi.string(),
    dob: Joi.string().allow(null),
    registration_number: Joi.string().allow(null),
    // package_id: Joi.number(),
    video_view_limit: Joi.number(),
    country_prefix: Joi.string().allow(null),
    fcm_token: Joi.string(),
    is_active: Joi.boolean(),
    is_suspended: Joi.boolean(),
    image: Joi.string().allow(null),
    uuid: Joi.string().allow(null),
    machine_id: Joi.string().allow(null),
    device_id: Joi.string().allow(null),
    branch: Joi.allow(null),
    device_model: Joi.allow(null),
    device_brand: Joi.allow(null),
    gender: Joi.string().allow(null),
    category: Joi.string().allow(null),
    addresses: Joi.allow(null),
    membership_documents: Joi.allow(null),
    academic_details: Joi.allow(null),
    user_guardians: Joi.allow(null),
    password: Joi.allow(null),
    confirm_password: Joi.allow(null),
  }

  if (req.body.password) {
    schema['confirm_password'] = Joi.ref('password')
  }

  schema = Joi.object(schema);
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
    delete params.confirm_password;

  }
  if ('confirm_password' in params) {
    // Use Bcrypt for password
    delete params.confirm_password;
  }

  if ('password' in params && !params.password) {
    // Use Bcrypt for password
    delete params.password;

  }

  // if mobile number exist
  if (params.mobile_number && params.mobile_number != null) {
  }

  var addresses = params.addresses
  delete params.addresses

  var academic_details = params.academic_details
  delete params.academic_details

  var user_guardians = params.user_guardians
  delete params.user_guardians

  var membership_documents = params.membership_documents
  delete params.membership_documents

  // params.device_id = params.uuid
  // delete params.uuid

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

      // Update User Detail on Test Series
      if (user.id) {

        if (user_guardians) {

          user_guardians = Object.values(user_guardians)

          // Create db process (get into pool)
          var knexConnection = require('knex')(knexConnectionConfig);

          // Update user in database
          var guardian = await knexConnection.transaction(async trx => {
            return trx('user_guardians').where('user_id', id).del();
          })

          // Destrory process (to clean pool)
          knexConnection.destroy();

          user_guardians = user_guardians.filter(guardian => guardian.user_id = id)

          // Create db process (get into pool)
          var knexConnection = require('knex')(knexConnectionConfig);

          // Update user in database
          guardian = await knexConnection.transaction(async trx => {
            return trx('user_guardians').insert(user_guardians);
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

        if (membership_documents) {


          // Create db process (get into pool)
          var knexConnection = require('knex')(knexConnectionConfig);

          // Update user in database
          var membershipDocument = await knexConnection.transaction(async trx => {
            return trx('user_membership_doucuments').where('user_id', id).del();
          })

          // Destrory process (to clean pool)
          knexConnection.destroy();

          membership_documents.user_id = user.data.id

          // Create db process (get into pool)
          var knexConnection = require('knex')(knexConnectionConfig);

          // Update user in database
          membershipDocument = await knexConnection.transaction(async trx => {
            return trx('user_membership_doucuments').insert(membership_documents);
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

        if (academic_details) {

          academic_details = Object.values(academic_details)
          // Create db process (get into pool)
          var knexConnection = require('knex')(knexConnectionConfig);

          // Update user in database
          var academic = await knexConnection.transaction(async trx => {
            return trx('academic_details').where('user_id', id).del();
          })

          // Destrory process (to clean pool)
          knexConnection.destroy();

          academic_details = academic_details.filter(academic => academic.user_id = id)

          // Create db process (get into pool)
          var knexConnection = require('knex')(knexConnectionConfig);

          // Update user in database
          academic = await knexConnection.transaction(async trx => {
            return trx('academic_details').insert(academic_details);
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

        if (addresses) {

          addresses = Object.values(addresses)
          // Create db process (get into pool)
          var knexConnection = require('knex')(knexConnectionConfig);

          // Update user in database
          var address = await knexConnection.transaction(async trx => {
            return trx('addresses').where('user_id', id).del();
          })

          // Destrory process (to clean pool)
          knexConnection.destroy();

          addresses = addresses.filter(address => address.user_id = id)

          // Create db process (get into pool)
          var knexConnection = require('knex')(knexConnectionConfig);

          // Update user in database
          address = await knexConnection.transaction(async trx => {
            return trx('addresses').insert(addresses);
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


        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        // Update user in database
        user.data.addresses = await knexConnection.transaction(async trx => {
          return trx('addresses').where('user_id', id);
        })

        // Destrory process (to clean pool)
        knexConnection.destroy();

        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        // Update user in database
        user.data.academic_details = await knexConnection.transaction(async trx => {
          return trx('academic_details').where('user_id', id);
        })

        // Destrory process (to clean pool)
        knexConnection.destroy();

        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        // Update user in database
        user.data.user_guardians = await knexConnection.transaction(async trx => {
          return trx('user_guardians').where('user_id', id);
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


        // Call A Function For User Update on ONS
        // let updateTest = await updateTestUser(user);

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
