import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import  { postOnly, createLog, replaceUploads,  injectMethodNotAllowed, validateRequestParams, genrateToken, jsonSafe, invalidFormData } from 'helpers/api';
import bcrypt from 'bcryptjs';

// Login
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

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
  var user;
  var validUser;
  var existOauth = true;

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

  // Fatch user By Mobile number
  user = await knexConnection.transaction(async trx => {
    return knexConnection.select(attributes).table('users').where('email', params.email).andWhere('is_active', 1).first();
  });


  // Destrory process (to clean pool)
  knexConnection.destroy();


  // Check password & generate JWT
  var token = null;
  existOauth = null;
  validUser = user ? await bcrypt.compare(params.password, user.password) : null;

  // Genrate response for Genique EduPlus test series
  if (validUser) {

    user = {
      'userId': user.id,
      'role': (user.type == 'ADMIN') ? 1 : 3,
      'roleText': (user.type == 'ADMIN') ? 'System Administrator' : 'Student',
      'name': user.first_name.concat(' ' + user.last_name),
      'profilepic': user.image,
      'packageId': 4,
      'userEmail': user.email,
      'mobile_number': user.mobile_number,
      'status': user.is_active,
      'aprovel_status': user.is_active,
      'created_at': user.created_at,
    }

  }


  user.profilepic = await replaceUploads(user.profilepic);


  // Set Response
  let response = {
    'success': validUser ? true : false,
    'user': validUser ? jsonSafe(user) : null,
  };

  let statusCode = validUser ? 200 : 401;


  // Send Response
  res.status(statusCode).json(response);
}