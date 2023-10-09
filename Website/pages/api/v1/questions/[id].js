import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog,  replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch  Questions By ID
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
  };

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch one_line_question from database
  let question = await knexConnection.transaction(async trx => {
    return knexConnection.select(attributes, 'questions.*').table('questions')
      .innerJoin('question_banks', 'questions.bank_id', 'question_banks.id')
      .where('questions.id', id).first();
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
  });

  //
  let statusCode = question.data ? 200 : 422;
  let response = {
    success: question.data ? true : false,
    question: question.data,
    error: question.error
  };

  // Destrory process (to clean pool)
  knexConnection.destroy();

  // Send response
  res.status(statusCode).json(response);
}