import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { randomstring } from 'randomstring';
import { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Add new referral
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert referral
  if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }


  let rools = {
    referance_type: Joi.string().required(),
    user_discount_type: Joi.string(),
    user_amount: Joi.string().required(),
    user_minimum_amount: Joi.number().allow(null),
    user_maximum_amount: Joi.number().allow(null),
    user_amount_upto: Joi.number().allow(null),
    referrar_discount_type: Joi.string(),
    referrar_amount: Joi.string().required(),
    referrar_minimum_amount: Joi.number().allow(null),
    referrar_order_amount_usage: Joi.number().allow(null),
    referrar_maximum_amount: Joi.number().allow(null),
    referrar_amount_upto: Joi.number().allow(null),
    start_date: Joi.string().allow(null),
    expiry_date: Joi.string().allow(null),
    [`${req.body.referance_type}_ids`]: Joi.string().required()
  }

  // Validate request with rules
  let schema = Joi.object(rools);

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);


  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }


  params.referance_ids = params[`${req.body.referance_type}_ids`];

  let counts = 1;
  delete params[`${req.body.referance_type}_ids`];

  var referral;
  for (let i = 0; i < counts; i++) {

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Insert referral into database
    referral = await knexConnection.transaction(async trx => {
      return trx.insert(params).into('referrals');
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

  //
  let statusCode = referral.id ? 200 : 422;
  let response = {
    success: referral.id ? true : false,
    referral: referral,
    id: referral.id
  };


  // Send response
  res.status(statusCode).json(response);

}
