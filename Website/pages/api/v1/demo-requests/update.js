import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import Joi from '@hapi/joi';
import slugify from 'slugify';
import moment from 'moment';
import { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Function to Update enquiry
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user) { restrictedAccess(res); return false; }

  // Validate request with rules
  let schema = Joi.object({
    id: Joi.required(),
    message: Joi.string().allow(null),
    user_id: Joi.number().allow(null),
    exam_id: Joi.number().allow(null),
    course_id: Joi.number().allow(null),
    subject_id: Joi.number().allow(null),
    exam_id: Joi.number().allow(null),
    course_type_id: Joi.number().allow(null),
    reply: Joi.string().allow(null),
    image: Joi.string().allow(null),
    image_for_user: Joi.string().allow(null),
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  params.replied_by = user.id;
  params.replied_time = moment().format();

  // Set attributes
  let id = params.id;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Update enquiry in database
  let enquiry = await knexConnection.transaction(async trx => {
    return trx('enquiries').where('id', id).update(params);
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
  });

  //
  let statusCode = enquiry.id ? 200 : 422;
  let response = {
    success: enquiry.id ? true : false,
    enquiry: enquiry,
  };

  // Destrory process (to clean pool)
  knexConnection.destroy();

  // Send response
  res.status(statusCode).json(response);
}
