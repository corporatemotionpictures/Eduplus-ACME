import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Function to insert batch
export default async function base(req, res) {

  //  verify token 


  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }

  // Validate request with rules
  let schema = Joi.object({
    product_id: Joi.required(),
    batch_id: Joi.required(),
    user_id: Joi.allow(null),
    scheduled_at: Joi.allow(null),
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }


  // Create db process (get into pool)
  var knexConnection

  let data = []

  params.user_id = params.user_id ? params.user_id : user.id


  // Create db process (get into pool)
  knexConnection = require('knex')(knexConnectionConfig);

  // Insert batch from database
  let schedule = await knexConnection.transaction(async trx => {
    return trx.insert(params).into('demo_classes');
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

  

  if (schedule.id && user && user.type != 'ADMIN' && !req.query.listOnly && !req.query.noLog) {
    let logged_data = {
      user_id: user.id,
      action: `DEMO_APPLIED`,
      payload: JSON.stringify({
        field_name: 'products',
        field_id: params.product_id,
        ...req.query
      })
    }


    let logs = await createLog(logged_data)
  }


  //
  let statusCode = schedule.id ? 200 : 422;
  let response = {
    success: schedule.id ? true : false,
    'schedule': schedule
  };



  // Send response
  res.status(statusCode).json(response);
}
