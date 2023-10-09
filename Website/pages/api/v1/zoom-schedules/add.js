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
    product_id: Joi.string(),
    batch_id: Joi.string(),
    schedules: Joi.allow(null),
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  params.created_by = user.id;
  if ((user.type == 'MANAGEMENT' || user.type == 'FACULTY')) {
    params.approved = false
  }


  // Create db process (get into pool)
  var knexConnection

  let data = []

  let schedules = Object.keys(params.schedules)


  schedules.map(sce => {
    let sc = {}
    sc.date = sce
    sc.zoom_link = params.schedules[sce]
    sc.batch_id = params.batch_id
    sc.product_id = params.product_id
    data.push(sc)
  })



  // Create db process (get into pool)
  knexConnection = require('knex')(knexConnectionConfig);

  // Insert batch from database
  let schedule = await knexConnection.transaction(async trx => {
    return trx.insert(data).into('zoom_schedules');
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


  //
  let statusCode = schedule.id ? 200 : 422;
  let response = {
    success: schedule.id ? true : false,
    'schedule': schedule
  };



  // Send response
  res.status(statusCode).json(response);
}
