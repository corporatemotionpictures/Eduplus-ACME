import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Function to Update batch
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }

  // Validate request with rules
  let schema = Joi.object({
    id: Joi.number().required(),
    product_id: Joi.string().allow(null),
    batch_id: Joi.string().allow(null),
    scheduled_at: Joi.string().allow(null),

  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  // Set attributes
  let id = params.id;


  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Update batch in database
  let batch = await knexConnection.transaction(async trx => {
    return trx('zoom_schedules').where('id', id).update(params);
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
  let statusCode = batch.id ? 200 : 422;
  let response = {
    success: batch.id ? true : false,
    'batch': batch
  };


  // Send response
  res.status(statusCode).json(response);

}