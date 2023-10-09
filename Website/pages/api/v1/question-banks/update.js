import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Function to Update question bank
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
    language_id: Joi.number().allow(null),
    name: Joi.string(),
    exam_ids: Joi.string().allow(null),
    course_ids: Joi.string().allow(null),
    subject_ids: Joi.string().allow(null),
    chapter_ids: Joi.string().allow(null),
    approved: Joi.number(),
    rejected_on: Joi.number().allow(null),
    batch_ids: Joi.string().allow(null),
    questions: Joi.allow(null),
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  // Set attributes
  let id = params.id;

  var questions = '';

  if (params.questions) {
    questions = Object.values(params.questions);

    delete params.questions;

  }

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Update question bank from database
  let questionBank = await knexConnection.transaction(async trx => {
    return trx('question_banks').where('id', id).update(params).transacting(trx).then(trx.commit).catch(trx.rollback);
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


  if (questionBank.id) {

    questions = questions.filter(questionList => questionList.bank_id = id)

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Insert one Line Questions from database
    let oneLineQuestion = await knexConnection.transaction(async trx => {
      return trx('one_line_questions').where('bank_id', id).del();
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Insert one Line Questions from database
    oneLineQuestion = await knexConnection.transaction(async trx => {
      return trx.insert(questions).into('one_line_questions');
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
  let statusCode = questionBank.id ? 200 : 422;
  let response = {
    success: questionBank.id ? true : false,
    'questionBank': questionBank
  };


  // Send response
  res.status(statusCode).json(response);
}
