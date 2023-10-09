import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Function to insert question bank
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);



  // Only ADMIN type of User allowed to insert course
  if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }

  // Validate request with rules
  let schema = Joi.object({
    name: Joi.string().required(),
    exam_ids: Joi.string().allow(null),
    course_ids: Joi.string().allow(null),
    subject_ids: Joi.string(),
    chapter_ids: Joi.string(),
    language_id: Joi.number(),
    batch_ids: Joi.string().allow(null),
    questions: Joi.required(null),
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  params.created_by = user.id;
  if ((user.type == 'MANAGEMENT' || user.type == 'FACULTY' )) {
    params.approved = false
  }

  var questions = '';

  if (params.questions) {
    questions = Object.values(params.questions);

    delete params.questions;

  }

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Insert question bank to database
  let questionBank = await knexConnection.transaction(async trx => {
    return trx.insert(params).into('question_banks');
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

  if (questionBank.id) {

    questions = questions.filter(questionList => questionList.bank_id = questionBank.id)

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Insert one Line Questions from database
    let oneLineQuestion = await knexConnection.transaction(async trx => {
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


  if (questionBank.id && (user.type == 'MANAGEMENT' || user.type == 'FACULTY' )) {

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Update user in database
    var reciever = await knexConnection.transaction(async trx => {
      return trx('users').where('type', "ADMIN").first();
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    var notice = {
      user_id: user.id,
      reciever_id: reciever.id,
      notification: `New on liner questions-${params.name} Added`,
      redirect_url: `/one_liner_question`,
      icon: '<i className="fas fa-file-alt"></i>'
    };

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Insert notification into database
    let notification = await knexConnection.transaction(async trx => {
      return trx.insert(notice).into('admin_notifications');
    }).then(res => {
      return {
        id: res[0],
        error: null
      };
    }).catch(err => {
      return {
        id: null,
        error: err
      };
    });


    // Destrory process (to clean pool)
    knexConnection.destroy();

  }

  //
  let statusCode = questionBank.id ? 200 : 422;
  let response = {
    success: questionBank.id ? true : false,
    questionBank: questionBank,
    id: questionBank.id
  };


  // Send response
  res.status(statusCode).json(response);
}
