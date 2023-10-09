import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { postOnly, createLog, replaceUploads, injectMethodNotAllowed, validateRequestParams, genrateToken, jsonSafe, invalidFormData } from 'helpers/api';
import bcrypt from 'bcryptjs';

// Login
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  var knexConnection;


  // set attributes
  let attributes = {
    id: 'id',
    first_name: 'first_name',
    last_name: 'last_name',
    mobile_number: 'mobile_number',
    email: 'email',
    password: 'password',
    type: 'type',
    is_active: 'is_active',
    image: 'image'
  };

  // 
  var user;
  var validUser;
  var existOauth = true;

  // Check If auth provider Exist i.e Google, facebook
  if (req.body.auth_provider == undefined) {

    // Validate request with rules
    let schema = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
    });

    // If everything fine: params object would contain data
    let params = validateRequestParams(req.body, schema, res);

    // If Data Not Valid 
    if (params.status == false) { invalidFormData(res, params.error); return false; }
    else { params = params.value; }


    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    // Fatch user By Mobile number
    user = await knexConnection.transaction(async trx => {
      return knexConnection.select(attributes).table('users').where('email', params.email).whereNot('type', 'USER').andWhere('is_active', 1).first();
    });

    // Destrory process (to clean pool)
    knexConnection.destroy();


    // Check password & generate JWT
    var token = null;
    existOauth = null;
    validUser = user ? await bcrypt.compare(params.password, user.password) : null;

  }

  else {

    // Validate request with rules
    let schema = Joi.object({
      auth_provider: Joi.string().required(),
      email: Joi.string().allow(null),
      oauth_id: Joi.required(),
      first_name: Joi.required(),
      last_name: Joi.required()
    });

    // If everything fine: params object would contain data
    let params = validateRequestParams(req.body, schema, res);

    // If Data Not Valid 
    if (params.status == false) { invalidFormData(res, params.error); return false; }
    else { params = params.value; }

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);


    // Fatch user By Auth ID
    user = await knexConnection.transaction(async trx => {
      return knexConnection.select(attributes).table('users').where('oauth_id', params.oauth_id).first();
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
          return knexConnection.select(attributes).table('users').where('email', params.email).first();
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
        return knexConnection.select(attributes).table('users').where('id', id).where('is_active', 1).first();
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

    }

  }


  var tokenUser = user


  if (validUser) {
    user.image = await replaceUploads(user.image);



    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fatch user From Database
    user.authenticationDetails = await knexConnection.transaction(async trx => {
      return trx.select().table('2fa_details').where('user_id', user.id).first();
    })


    // Destrory process (to clean pool)
    knexConnection.destroy();


    if ((user.type == 'MANAGEMENT' || user.type == 'FACULTY')) {
      user.image = await replaceUploads(user.image);
      var knexConnection = require('knex')(knexConnectionConfig);

      // Fatch user From Database
      let permissions = await knexConnection.transaction(async trx => {
        return trx.select().table('user_permissions').where('user_id', user.id);
      })


      // Destrory process (to clean pool)
      knexConnection.destroy();

      user.module_ids = []
      permissions ? permissions.map((permission) => { user.module_ids.push(permission.module_id) }) : []

      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      // Fatch user From Database
      user.modules = await knexConnection.transaction(async trx => {
        return trx.select().table('modules').whereIn('id', user.module_ids);
      })


      // Destrory process (to clean pool)
      knexConnection.destroy();





      // For falcuties
      if (user.type == 'FACULTY') {

        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        // Fatch user From Database
        let subjects = await knexConnection.transaction(async trx => {
          return trx.select().table('faculty_subjects').where('user_id', user.id);
        })


        // Destrory process (to clean pool)
        knexConnection.destroy();

        user.subject_ids = []
        subjects ? subjects.map((subject) => { user.subject_ids.push(subject.subject_id) }) : []

        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        // Fatch user From Database
        user.subjects = await knexConnection.transaction(async trx => {
          return trx.select().table('subjects').whereIn('id', user.subject_ids);
        })


        // Destrory process (to clean pool)
        knexConnection.destroy();


      }
    }


  }



  if (user) {

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    // Fatch user By Mobile number
    tokenUser = await knexConnection.transaction(async trx => {
      return knexConnection.select().table('users').where('id', user.id).first();
    });

    // Destrory process (to clean pool)
    knexConnection.destroy();

    tokenUser.module_ids = user.module_ids
    tokenUser.subject_ids = user.subject_ids
    user.image = await replaceUploads(user.image);
  }



  // Set Response
  let response = {
    'success': validUser ? true : false,
    'user': validUser ? jsonSafe(user) : null,
    'token': validUser ? genrateToken(tokenUser) : null,
    'existOauth': existOauth
  };

  if (validUser && user.authenticationDetails && user.authenticationDetails.is_active) {

    // Set Response
    response = {
      'success': validUser ? true : false,
      'user': validUser ? jsonSafe(user) : null,
      'token': null,
      'is2FAEnabled': true,
      'userId': user.id,
      'existOauth': existOauth
    };

  }

  let statusCode = validUser ? 200 : 401;

  // Send Response
  res.status(statusCode).json(response);
}