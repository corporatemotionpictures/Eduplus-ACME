import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, restrictedAccess, verifyToken, invalidFormData } from 'helpers/api';

// Function to Update course
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }


  let rools = {
    id: Joi.number().required(),
    user_discount_type: Joi.string().allow(null),
    user_amount: Joi.string().allow(null),
    user_minimum_amount: Joi.number().allow(null),
    user_maximum_amount: Joi.number().allow(null),
    user_amount_upto: Joi.number().allow(null),
    referrar_discount_type: Joi.string().allow(null),
    referrar_amount: Joi.string().allow(null),
    referrar_minimum_amount: Joi.number().allow(null),
    referrar_maximum_amount: Joi.number().allow(null),
    referrar_amount_upto: Joi.number().allow(null),
    referrar_order_amount_usage: Joi.number().allow(null),
    start_date: Joi.string().allow(null),
    expiry_date: Joi.string().allow(null),
    referance_type: Joi.string().allow(null),
    [`${req.body.referance_type}_ids`]: Joi.string().allow(null),
  }


  // Validate request with rules
  let schema = Joi.object(rools);

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);


  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }


  params.referance_ids = params[`${req.body.referance_type}_ids`];
  delete params[`${req.body.referance_type}_ids`];



  // Set attributes
  let id = params.id;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Update course in database
  let referral = await knexConnection.transaction(async trx => {
    return trx('referrals').where('id', id).update(params);
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

  // Destrory process (to clean pool)
  knexConnection.destroy();

  //
  let statusCode = referral.id ? 200 : 422;
  let response = {
    success: referral.id ? true : false,
    referral: referral
  };

  // Send response
  res.status(statusCode).json(response);
}
