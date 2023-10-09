import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import moment from 'moment'

// Ping pong the client!
export default async function (req, res) {

  var currentDate = moment().unix()

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Delete video from database
  let previousYearQuestions = await knexConnection.transaction(async trx => {
    return trx('previous_year_question_papers').select('id').where('approved', -1).where('rejected_on', '<=', currentDate);
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


  // Destrory process (to clean pool)
  knexConnection.destroy();


  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Delete previousYearQuestion from database
  let previousYearQuestion = await knexConnection.transaction(async trx => {
    return trx('previous_year_question_papers').where('approved', -1).where('rejected_on', '<=', currentDate).update('is_active', 0);
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


  // Destrory process (to clean pool)
  knexConnection.destroy();


  let statusCode = previousYearQuestion.id ? 200 : 422;
  let response = {
    success: previousYearQuestion.id ? true : false,
    previousYearQuestions: previousYearQuestions,
  };


  // Send Response
  res.status(statusCode).json(response);
}