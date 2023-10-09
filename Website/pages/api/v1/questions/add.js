import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Function to insert Questions
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }


  // Validate request with rules
  let schema = Joi.object({
    title: Joi.string().required(),
    body: Joi.string().required(),
    answer: Joi.string().required(),
    bank_id: Joi.number().required(),
    options: Joi.string(),
    image: Joi.string(),
    is_image_based_question: Joi.boolean()
  })

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Insert Questions from database
  let question = await knexConnection.transaction(async trx => {
    return trx.insert(params).into('questions');
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
  });

  //
  let statusCode = question.id ? 200 : 422;
  let response = {
    success: question.id ? true : false,
    question: question,
    id: question.id
  };

  // Destrory process (to clean pool)
  knexConnection.destroy();

  // Send response
  res.status(statusCode).json(response);
}
