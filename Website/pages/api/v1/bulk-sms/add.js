import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData, sendSMS } from 'helpers/api';

// Add new bulk sms
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert bulk sms
  if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }

  // Validate request with rules
  let schema = Joi.object({
    message: Joi.string().required(),
    user_id: Joi.number().required()
  });

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  // Fatch user From Database
  user = await knexConnection.transaction(async trx => {
    return trx.select('mobile_number').table('users').where('id', params.user_id).first();
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
  })

  // Destrory process (to clean pool)
  knexConnection.destroy();

  params.mobile_number = user.data.mobile_number

  if (params.mobile_number !== null) {

    // Send SMS
    let sms = await sendSMS(params);

    // Delete Params
    delete params.mobile_number;


    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);


    // Insert bulkSms into database
    var bulkSms = await knexConnection.transaction(async trx => {
      return trx.insert(params).into('send_sms');
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
  let statusCode = bulkSms ? 200 : 422;
  let response = {
    success: bulkSms ? true : false,
    bulkSms: bulkSms ? bulkSms : null
  };

  // Send response
  res.status(statusCode).json(response);

} 
