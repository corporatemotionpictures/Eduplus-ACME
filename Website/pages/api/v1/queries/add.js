import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import slugify from 'slugify';
import { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Add new query
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert query
  // if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }

  // Validate request with rules
  let schema = Joi.object({
    name: Joi.string().allow(null),
    email: Joi.string().allow(null),
    mobile_number: Joi.allow(null),
    message: Joi.allow(null),
    linked_in: Joi.allow(null),
    status: Joi.allow(null),
    type: Joi.allow(null),
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }


  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Insert query into database
  let query = await knexConnection.transaction(async trx => {
    return trx.insert(params).into('queries');
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
  let statusCode = query.id ? 200 : 422;
  let response = {
    success: query.id ? true : false,
    query: query,
    id: query.id
  };

  // Send response
  res.status(statusCode).json(response);


}
