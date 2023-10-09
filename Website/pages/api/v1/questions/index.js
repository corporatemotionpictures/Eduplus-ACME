import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog,  replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch Questions
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user) { restrictedAccess(res); return false; }

  // Filters
  let orderBy = req.query.order_by ? req.query.order_by : 'DESC';
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;
  let bankID = req.query.bankID ? Number.parseInt(req.query.bankID) : null;

  // Set attributes
  let attributes = {
    bank_id: 'question_banks.id',
    bank_name: 'question_banks.name',
  };

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch Questions from database
  let questions = await knexConnection.transaction(async trx => {
    if (bankID) {
      return knexConnection.select(attributes, 'questions.*').table('questions')
        .innerJoin('question_banks', 'questions.bank_id', 'question_banks.id')
        .where('question_banks.id', bankID)
        .orderBy('questions.id', orderBy).offset(offset).limit(limit);
    } else {
      return knexConnection.select(attributes, 'questions.*').table('questions')
        .innerJoin('question_banks', 'questions.bank_id', 'question_banks.id')
        .orderBy('questions.id', orderBy).offset(offset).limit(limit);
    }
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
  let statusCode = questions.data ? 200 : 422;
  let response = {
    success: questions.data ? true : false,
    questions: questions.data,
    error: questions.error
  };

  // Destrory process (to clean pool)
  knexConnection.destroy();

  // Send response
  res.status(statusCode).json(response);
}