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
    first_name: Joi.string().min(3).max(30),
    last_name: Joi.string().min(3).max(30),
    email: Joi.string().allow(null),
    mobile_number: Joi.string().required(),
    whatsapp_number: Joi.string(),
    dob: Joi.string().allow(null),
    college: Joi.string().allow(null),
    video_view_limit: Joi.required(),
    registration_number: Joi.string(),
    country_prefix: Joi.string().allow(null),
    // package_id: Joi.number().allow(null),
    branch: Joi.allow(null),
    gender: Joi.string().allow(null),
    category: Joi.string().allow(null),
    addresses: Joi.allow(null),
    academic_details: Joi.allow(null),
    user_guardians: Joi.allow(null),
    password: Joi.string().min(6).required().label('Passowrd'),
    confirm_password: Joi.ref('password'),
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  params.is_active = 1;
  params.image = params.image ? params.image : "/images/default-profile.jpg";


  // Use Bcrypt for password
  params.password = await bcrypt.hash(params.password, 12);

  // Remove confirm password from params
  delete params.confirm_password;

  var addresses = params.addresses
  delete params.addresses

  var academic_details = params.academic_details
  delete params.academic_details

  var user_guardians = params.user_guardians
  delete params.user_guardians


  let country_prefix = params.country_prefix ? params.country_prefix : '91'
  params.country_prefix = params.country_prefix ? params.country_prefix : '91'
  let number = country_prefix.concat(params.mobile_number)

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fatch exam From Database
  let country = await knexConnection.transaction(async trx => {
    return trx.select().table('countries').where('code', country_prefix).first();
  })

  // Destrory process (to clean pool)
  knexConnection.destroy();
  let country_iso2 = country ? country.iso2 : 'IN'

  // Require `PhoneNumberFormat`.
  const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
  const baseNumber = phoneUtil.parseAndKeepRawInput(`+${number}`, country_iso2);

  if (!phoneUtil.isValidNumber(baseNumber)) {

    //
    let statusCode = 422;
    let response = {
      success: false,
      'error': 'Invalid Mobile number (Enter mobile number without country code)'
    };

    res.status(statusCode).json(response);
  } else {

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    let user = await knexConnection.transaction(async trx => {
      return trx.select().table('users').where('mobile_number', params.mobile_number).first();
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

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
        knexConnection = require('knex')(knexConnectionConfig);

        // Register user into database
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

        user.image = await replaceUploads(user.image);

        // Update User Detail on Test Series
        if (user.id) {

          if (user_guardians) {

            user_guardians = Object.values(user_guardians)

            // Create db process (get into pool)
            var knexConnection = require('knex')(knexConnectionConfig);

            // Update user in database
            var guardian = await knexConnection.transaction(async trx => {
              return trx('user_guardians').where('user_id', user.id).del();
            })

            // Destrory process (to clean pool)
            knexConnection.destroy();

            user_guardians = user_guardians.filter(guardian => guardian.user_id = user.id)

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

          if (academic_details) {

            academic_details = Object.values(academic_details)
            // Create db process (get into pool)
            var knexConnection = require('knex')(knexConnectionConfig);

            // Update user in database
            var academic = await knexConnection.transaction(async trx => {
              return trx('academic_details').where('user_id', user.id).del();
            })

            // Destrory process (to clean pool)
            knexConnection.destroy();

            academic_details = academic_details.filter(academic => academic.user_id = user.id)

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
              return trx('addresses').where('user_id', user.id).del();
            })

            // Destrory process (to clean pool)
            knexConnection.destroy();

            addresses = addresses.filter(address => address.user_id = user.id)

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


          var randomstring = require("randomstring");

          let referral_codes = {
            user_id: user.id,
            code: randomstring.generate(6),
          }

          // Create db process (get into pool)
          var knexConnection = require('knex')(knexConnectionConfig);

          // Update user in database
          let referralCodes = await knexConnection.transaction(async trx => {
            return trx('referral_codes').insert(referral_codes);
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
          user.guardians = await knexConnection.transaction(async trx => {
            return trx('user_guardians').where('user_id', user.id);
          })

          // Destrory process (to clean pool)
          knexConnection.destroy();


          // Call A Function For User Update on ONS
          // let updateTest = await updateTestUser(user);

        }

        //
        let statusCode = user.id ? 200 : 422;
        let response = {
          success: user.id ? true : false,
          'user': user
        };

        // Destrory process (to clean pool)
        knexConnection.destroy();

        // Send response
        res.status(statusCode).json(response);

      }
    }
  }
}
