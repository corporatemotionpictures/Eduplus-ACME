import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Function to insert package
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
    title: Joi.string().required(),
    subject_ids: Joi.string().allow(null),
    course_ids: Joi.string().allow(null),
    batch_ids: Joi.string().allow(null),
    amount: Joi.required(),
    type: Joi.required(),
    validity: Joi.required(),
    status: Joi.required(),
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Insert package from database
  let packagedetail = await knexConnection.transaction(async trx => {
    return trx.insert(params).into('packages');
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

  //
  let statusCode = packagedetail.id ? 200 : 422;
  let response = {
    success: packagedetail.id ? true : false,
    'packagedetail': packagedetail,
    error : packagedetail.error
  };

  // Destrory process (to clean pool)
  knexConnection.destroy();

  // Send response
  res.status(statusCode).json(response);
}
