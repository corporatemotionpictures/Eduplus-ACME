import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog,  replaceUploads, validateRequestParams,  replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Get course By ID
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user) { restrictedAccess(res); return false; }

  // Validate request with rules
  let schema = Joi.object({
    referance_id: Joi.string().required()
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);


  // Fatch course From Database
  let course = await knexConnection.transaction(async trx => {
    return trx.select().table('courses').where('referance_id', params.referance_id).first();
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

  //
  let statusCode = course.data ? 200 : 422;
  let response = {
    success: course.data ? true : false,
    course: course.data,
    error: course.error
  };

  // Send Response
  res.status(statusCode).json(response);
}