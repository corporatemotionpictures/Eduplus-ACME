import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, checkToken, restrictedAccess, verifyToken, invalidFormData } from 'helpers/api';

// Function to Update posts
export default async function base(req, res) {

// Only allowed POST only methods
if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

let schemaVaribles = {
  id : Joi.number().required(),
  message: Joi.string(),
  ticket_type: Joi.string(),
  image: Joi.string(),
};

let user = null;

let checkUser = await checkToken(req);

if (checkUser) {

  // Later parse User from JWT-header token 
  user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert posts
  if (!user) { restrictedAccess(res); return false; }

}
else {

  // define schema for not user
  schemaVaribles.name = Joi.string();
  schemaVaribles.mobile_number = Joi.string();
  schemaVaribles.city = Joi.string();
}

// Validate request with rules
let schema = Joi.object(schemaVaribles);

// If everything fine: params object would contain data
let params = validateRequestParams(req.body, schema, res);

// If Data Not Valid 
if (params.status == false) { invalidFormData(res, params.error); return false; }
else { params = params.value; }

if(user){
  params.user_id =  user.id;
  params.is_user =  1;
  params.name = user.first_name.concat(' ' +user.last_name);
  params.mobile_number = user.mobile_number;
  params.city= user.city;
}

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Update raiseTicket in database
  let raiseTicket = await knexConnection.transaction(async trx => {
    return trx('raise_tickets').where('id', params.id).update(params);
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
  })

  //
  let statusCode = raiseTicket.id ? 200 : 422;
  let response = {
    success: raiseTicket.id ? true : false,
    raiseTicket: raiseTicket
  };

  // Destrory process (to clean pool)
  knexConnection.destroy();

  // Send response
  res.status(statusCode).json(response);
}
