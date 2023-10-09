import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog,  replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch One Line Questions By ID
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user) { restrictedAccess(res); return false; }

  // Set attributes
  let id = req.query.id;
  let attributes = {
    bank_id: 'question_banks.id',
    bank_name: 'question_banks.name',
    exam_ids: 'question_banks.exam_ids',
    course_ids: 'question_banks.course_id',
    subject_ids: 'question_banks.subject_ids',
    chapter_ids: 'question_banks.chapter_ids',
  };

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch one_line_question from database
  let oneLineQuestion = await knexConnection.transaction(async trx => {
    return knexConnection.select(attributes, 'one_line_questions.*').table('one_line_questions')
      .innerJoin('question_banks', 'one_line_questions.bank_id', 'question_banks.id')
      .where('one_line_questions.id', id).first();
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

  if (oneLineQuestion.data && user.type != 'ADMIN') {

    let params = {
      views: oneLineQuestion.data.views + 1
    }

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    // Update Views in oneLineQuestions
    let oneLineQuestionUpdate = await knexConnection.transaction(async trx => {
      return trx('one_line_questions').where('id', oneLineQuestion.data.id).update(params);
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

  }

  //
  let statusCode = oneLineQuestion.data ? 200 : 422;
  let response = {
    success: oneLineQuestion.data ? true : false,
    oneLineQuestion: oneLineQuestion.data,
    error: oneLineQuestion.error
  };

  // Send response
  res.status(statusCode).json(response);
}