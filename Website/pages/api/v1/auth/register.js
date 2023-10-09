import Joi, { object } from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { postOnly, createLog, replaceUploads, injectMethodNotAllowed, validateRequestParams, invalidFormData, sendVarCode } from 'helpers/api';
import bcrypt from 'bcryptjs';
import { getSettings } from 'helpers/apiService';
import fetch from 'isomorphic-unfetch';
import moment from 'moment';

// Register user
export default async function base(req, res) {

  // Only allowed POST only methods 
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Validate request with rules
  let schema = {
    first_name: Joi.string().min(3).max(30),
    last_name: Joi.string().min(3).max(30),
    dob: Joi.string().allow(null),
    college: Joi.string().allow(null),
    gender: Joi.string().allow(null),
    year: Joi.string().allow(null),
    passing_year: Joi.string().allow(null),
    registration_number: Joi.string().allow(null),
    country_prefix: Joi.string().allow(null),
    packege_id: Joi.number().allow(null),
    branch: Joi.allow(null),
    addresses: Joi.allow(null),
    membership_documents: Joi.allow(null),
    gourd: Joi.string().allow(null),
    whatsapp_number: Joi.string().allow(null),
    category: Joi.string().allow(null),
  }


  let userBaseID = 'mobile_number'
  let userSecondoryID = 'mobile_number'
  let userVerifiedID = 'is_mobile_verified'

  let userAuthBase = await getSettings('loginUserID');

  if (userAuthBase == 'Email') {
    userBaseID = 'email'
    userVerifiedID = 'is_email_verified'
    schema['email'] = Joi.string().required();
    schema['mobile_number'] = Joi.string().allow(null);
  } else {
    schema['email'] = Joi.string().allow(null);
    schema['mobile_number'] = Joi.string().required();
  }

  let gourd = req.body.gourd ? req.body.gourd : 'appLogin'
  gourd = await getSettings(gourd)

  if (gourd == 'PASSWORD') {
    schema['password'] = Joi.string().min(6).required()
    schema['confirm_password'] = Joi.ref('password')
  }

  schema = Joi.object(schema);

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }


  if (params.password) {
    // Use Bcrypt for password
    params.password = await bcrypt.hash(params.password, 12);
    delete params.confirm_password;

  }
  if (params.gourd) {
    delete params.gourd;
  }


  params.is_active = 1;
  params.image = "/images/default-profile.jpg";

  let academic_details = {}

  if (params.college) {
    academic_details.institute = params.college
    delete params.college
  }
  if (params.passing_year) {
    academic_details.passing_year = params.passing_year
    delete params.passing_year
  }

  params.video_view_limit = await getSettings('defaultVideoViewLimit')


  // Require `PhoneNumberFormat`.
  var phoneUtil = null;
  var baseNumber = null;
  var country_iso2 = 'IN';

  if (params.mobile_number) {
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

    country_iso2 = country && country.iso2 ? country.iso2 : 'IN'

    // Require `PhoneNumberFormat`.
    phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
    baseNumber = phoneUtil.parseAndKeepRawInput(`+${number}`, country_iso2);

  }

  if (params.mobile_number && phoneUtil && !phoneUtil.isValidNumber(baseNumber)) {

    //
    let statusCode = 422;
    let response = {
      success: false,
      'error': 'Invalid Mobile number (Enter mobile number without country code)'
    };

    res.status(statusCode).json(response);
  } else {

    if (params.mobile_number && country_iso2 == 'IN' && params.mobile_number.startsWith(0)) {
      params.mobile_number = params.mobile_number.substring(1)
    }


    let user = null
    if (params[userBaseID]) {


      // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);

      user = await knexConnection.transaction(async trx => {
        return trx.select().table('users').where(userBaseID, params[userBaseID]).where(userVerifiedID, 1).first();
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

    }


    if (user) {

      //
      let statusCode = 422;
      let response = {
        success: false,
        'error': userBaseID == 'mobile_number' ? 'Mobile Number Already Exist' : 'Email Already Exist'
      };

      res.status(statusCode).json(response);
    }
    else {
      if (params[userSecondoryID]) {// Create db process (get into pool)
        knexConnection = require('knex')(knexConnectionConfig);

        user = await knexConnection.transaction(async trx => {
          return trx.select().table('users').where(userSecondoryID, params[userSecondoryID]).whereNot(userBaseID, params[userBaseID]).first();
        })

        // Destrory process (to clean pool)
        knexConnection.destroy();
      }

      if (user) {

        //
        let statusCode = 422;
        let response = {
          success: false,
          'error': userBaseID == 'mobile_number' ? 'Email Already Exist' : 'Mobile Number Already Exist'
        };

        res.status(statusCode).json(response);
      }

      else {

        // Create db process (get into pool)
        knexConnection = require('knex')(knexConnectionConfig);

        user = await knexConnection.transaction(async trx => {
          return trx.select().table('users').where(userBaseID, params[userBaseID]).where(userVerifiedID, 0).first();
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

        var addresses = params.addresses
        delete params.addresses

        var membership_documents = null

        if (params.membership_documents && params.membership_documents != {}) {
          membership_documents = params.membership_documents
          delete params.membership_documents
        }

        if (!user || !user.data) {

          // Create db process (get into pool)
          var knexConnection = require('knex')(knexConnectionConfig);

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


          // Destrory process (to clean pool)
          knexConnection.destroy();

          if (user.id) {

            // Create db process (get into pool)
            knexConnection = require('knex')(knexConnectionConfig);

            user = await knexConnection.transaction(async trx => {
              return trx.select().table('users').where('id', user.id).first();
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

          }

        } else {

          // Create db process (get into pool)
          var knexConnection = require('knex')(knexConnectionConfig);

          // Register user into database
          let userUpdate = await knexConnection.transaction(async trx => {
            return trx('users').where('id', user.data.id).update(params);
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

          if (userUpdate.id) {

            // Create db process (get into pool)
            knexConnection = require('knex')(knexConnectionConfig);

            user = await knexConnection.transaction(async trx => {
              return trx.select().table('users').where('id', user.data.id).first();
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

          }

        }



        if (user && user.data) {

          if (addresses) {

            // Create db process (get into pool)
            var knexConnection = require('knex')(knexConnectionConfig);

            // Update user in database
            var address = await knexConnection.transaction(async trx => {
              return trx('addresses').where('user_id', user.data.id).del();
            })

            // Destrory process (to clean pool)
            knexConnection.destroy();

            addresses = addresses.filter(address => address.user_id = user.data.id)

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

          if (academic_details && academic_details != {}) {

            // Create db process (get into pool)
            var knexConnection = require('knex')(knexConnectionConfig);

            // Update user in database
            var academic = await knexConnection.transaction(async trx => {
              return trx('academic_details').where('user_id', user.data.id).del();
            })

            // Destrory process (to clean pool)
            knexConnection.destroy();

            academic_details.user_id = user.data.id

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


          if (membership_documents) {


            membership_documents.user_id = user.data.id

            // Create db process (get into pool)
            var knexConnection = require('knex')(knexConnectionConfig);

            // Update user in database
            let membershipDocument = await knexConnection.transaction(async trx => {
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

          var randomstring = require("randomstring");

          let referral_codes = {
            user_id: user.data.id,
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
          knexConnection = require('knex')(knexConnectionConfig);

          user = await knexConnection.transaction(async trx => {
            return trx.select().table('users').where('id', user.data.id).where('is_active', 1).first();
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

          user.data.image = await replaceUploads(user.data.image);
        }



        let error = null
        if (user && user.data && user.data.type != 'ADMIN' && user.data.type != 'MANAGEMENT') {


          let date = moment(Date.now()).subtract(1, 'h').format("YYYY-MM-DD HH:mm:ss")

          // Create db process (get into pool)
          knexConnection = require('knex')(knexConnectionConfig);

          // Fatch user By Mobile number
          var lastOneHoursCount = await knexConnection.transaction(async trx => {
            return trx.select().table('user_verification_codes').where('user_id', user.data.id).andWhere('created_at', '>=', date).count('id as count').first();
          });

          // Destrory process (to clean pool)
          knexConnection.destroy();

          if (lastOneHoursCount.count >= 3) {
            error = error = 'Oops! You have asked for too many OTPs. Please try after 60 mins or contact your institute.'
          }

          if (!error) {

            let param = {};

            // Genrate Varification Code
            param.sms_ver_code = await sendVarCode(user.data);

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


            let data = {
              user_id: user.data.id,
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

        let otsIntigration = process.env.NEXT_PUBLIC_OTS_INTIGRATION

        if (user.data && otsIntigration == "true") {
          let body = {
            name: `${user.data.first_name} ${user.data.last_name}`,
            email: user.data.email,
            mobile_number: user.data.mobile_number,
            subscription_id: null,
            // branch_id: data.branch_id,
          }

          let otsUrl = process.env.NEXT_PUBLIC_TEST_SERIES_URL
          let url = otsUrl.concat('/syncUser')

          let data = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          })
        }


        if (user.data && !error) {
          let logged_data = {
            user_id: user.data.id,
            action: 'REGISTER',
          }


          let logs = await createLog(logged_data)
        }



        //
        let statusCode = user.data && !error ? 200 : 422;
        let response = {
          success: user.data && !error ? true : false,
          'user': !error ? user : null,
          error: error
        };


        // Send response
        res.status(statusCode).json(response);

      }
    }
  }
}