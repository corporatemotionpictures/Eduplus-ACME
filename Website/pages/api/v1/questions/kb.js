import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, CourseID, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';
import fetch from 'isomorphic-unfetch';

// Function to Fetch question banks
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user) { restrictedAccess(res); return false; }

  // Filter
  // Filter
  let orderBy = req.query.order_by ? req.query.order_by : 'DESC';
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let examID = req.query.examID ? req.query.examID.split(',') : null;
  let courseID = req.query.courseID ? req.query.courseID.split(',') : null;
  let subjectID = req.query.subjectID ? req.query.subjectID.split(',') : null;
  let chapterID = req.query.chapterID ? req.query.chapterID.split(',') : null;

  var subjectIDs = null;
  if (user && user.type == 'FACULTY' && user.subject_ids) {
    subjectIDs = user.subject_ids;
  }

  // Set attributes
  let attributes = {
    bank_id: 'question_banks.id',
    bank_name: 'question_banks.name'
  };

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch Question Bank From database
  let bankIDs = await knexConnection.transaction(async trx => {
    let query;

    // If Fetch By Chapter ID
    if (chapterID) {
      query = trx.select('id').table('question_banks').where('chapter_id', chapterID);
    }


    // If Fetch by Subject ID
    else if (subjectID || subjectIDs) {
      query = trx.select('id').table('question_banks').where('subject_id', subjectID)
        .modify(function (queryBuilder) {
          if (subjectIDs) {
            queryBuilder.orWhereIn('subject_id', subjectIDs)
          }
        });
    }


    // If Fetch by  Course ID
    else if (courseID && subjectIDs) {
      query = trx.select('id').table('question_banks').where('course_id', courseID).whereIn('subject_id', subjectIDs);
    }

    // If Fetch by  Course ID
    else if (courseID) {
      query = trx.select('id').table('question_banks').where('course_id', courseID);
    }



    return query;

  });

  // Destrory process (to clean pool)
  knexConnection.destroy();


  // Assign bank id as array
  bankIDs = bankIDs.map(bankID => { return bankID.id });

  // Create db process (get into pool)
  knexConnection = require('knex')(knexConnectionConfig);


  // Fetch one_line_question from database
  let questions = await knexConnection.transaction(async trx => {
    return knexConnection.select(attributes, 'questions.*').table('questions')
      .innerJoin('question_banks', 'questions.bank_id', 'question_banks.id')
      .whereIn('questions.bank_id', bankIDs)
      .orderBy('questions.id', orderBy).offset(offset).limit(limit);
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

  // Destrory process (to clean pool)
  knexConnection.destroy();

  //
  let statusCode = questions.data ? 200 : 422;
  let response = {
    success: questions.data ? true : false,
    questions: questions.data,
    error: questions.error
  };


  // Send Response
  res.status(statusCode).json(response);
}
