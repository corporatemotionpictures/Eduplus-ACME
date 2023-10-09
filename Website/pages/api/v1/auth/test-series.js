import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog,  replaceUploads, replaceUploadsArray, injectMethodNotAllowed, restrictedAccess, verifyToken, jsonSafe, invalidFormData } from 'helpers/api';
import bcrypt from 'bcryptjs';

// Login
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user) { restrictedAccess(res); return false; }
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

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // 
  var validUser;
  if (user.data != undefined) {
    user = user.data;
  }

  // Fatch user By Mobile number
  user = await knexConnection.transaction(async trx => {
    return knexConnection.select(attributes).table('users').where('id', user.id).andWhere('is_active', 1).first();
  });

  // Check password & generate JWT
  var token = null;
  validUser = user ? true : null;

  // Genrate response for Genique EduPlus test series
  if (validUser) {

    user = {
      'userId': user.id,
      'role': (user.type == 'ADMIN') ? 1 : 3,
      'roleText': (user.type == 'ADMIN') ? 'System Administrator' : 'Student',
      'name': user.first_name.concat(' ' + user.last_name),
      'profilepic': user.image,
      'packageId': 4,
      'email': user.email,
      'mobile_number': user.mobile_number,
      'status': user.is_active,
      'aprovel_status': user.is_active,
      'password': user.password,
    }

  }

  user.profilepic = await replaceUploads(user.profilepic);


  // Set Response
  let response = {
    'success': validUser ? true : false,
    'user': validUser ? user : null,
  };

  let statusCode = validUser ? 200 : 401;


  // Destrory process (to clean pool)
  knexConnection.destroy();

  // Send Response
  res.status(statusCode).json(response);
}