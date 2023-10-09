import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog,  replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Get Question Banks By ID
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user) { restrictedAccess(res); return false; }

  // Set attributes
  let id = req.query.id;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch Question Banks from database
  let questionBank = await knexConnection.transaction(async trx => {
    return trx.select().table('question_banks').where('id', id).first();
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


  if (questionBank.data) {

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);


    // Combine exam with exam id
    questionBank.data.exams = await knexConnection.transaction(async trx => {
      return trx.select().table('exams').whereIn('exams.id', questionBank.data.exam_ids);
    });

    // Destrory process (to clean pool)
    knexConnection.destroy();

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);


    // Combine course with course id
    questionBank.data.courses = await knexConnection.transaction(async trx => {
      return trx.select().table('courses').whereIn('courses.id', questionBank.data.course_ids);
    });

    // Destrory process (to clean pool)
    knexConnection.destroy();

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);


    // Combine subject with subject id
    questionBank.data.subjects = await knexConnection.transaction(async trx => {
      return trx.select().table('subjects').whereIn('subjects.id', questionBank.data.subject_ids);
    });

    // Destrory process (to clean pool)
    knexConnection.destroy();

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);


    // Combine chapter with chapter id
    questionBank.data.chapters = await knexConnection.transaction(async trx => {
      return trx.select().table('chapters').whereIn('chapters.id', questionBank.data.chapter_ids);
    });

    // Destrory process (to clean pool)
    knexConnection.destroy();


  }

  //
  let statusCode = questionBank.data ? 200 : 422;
  let response = {
    success: questionBank.data ? true : false,
    questionBank: questionBank.data,
    error: questionBank.error
  };

  // Send Response 
  res.status(statusCode).json(response);
}