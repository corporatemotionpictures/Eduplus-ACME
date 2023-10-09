import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Function to Update Previous Year Question Papers
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }

  // Validate request with rules
  let schema = Joi.object({
    id: Joi.number(),
    title: Joi.string(),
    url: Joi.string(),
    exam_ids: Joi.string().allow(null),
    course_ids: Joi.string().allow(null).allow(null),
    subject_ids: Joi.string().allow(null),
    chapter_ids: Joi.string().allow(null),
    approved: Joi.number(),
    rejected_on: Joi.number().allow(null),
    mode: Joi.string(),
    batch_ids: Joi.string().allow(null),
    language_id: Joi.allow(null),
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

  // Update Previous Year Question Papers in database
  let previousYearQuestion = await knexConnection.transaction(async trx => {
    return trx('previous_year_question_papers').where('id', id).update(params);
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

  //
  let statusCode = previousYearQuestion.id ? 200 : 422;
  let response = {
    success: previousYearQuestion.id ? true : false,
    'previousYearQuestion': previousYearQuestion
  };

  // Destrory process (to clean pool)
  knexConnection.destroy();

  // Send response
  res.status(statusCode).json(response);

}