import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch Previous Year Question Papers By ID
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

  // Fetch one_line_question from database
  let previousYearQuestion = await knexConnection.transaction(async trx => {
    return trx.select('previous_year_question_papers.*').table('previous_year_question_papers')
      .where('previous_year_question_papers.id', id).first();
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


  if (previousYearQuestion.data) {

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);


    // Combine course with exam id
    previousYearQuestion.data.exams = await knexConnection.transaction(async trx => {
      return trx.select().table('exams').whereIn('exams.id', JSON.parse(previousYearQuestion.data.exam_ids));
    });

    // Destrory process (to clean pool)
    knexConnection.destroy();

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);


    // Combine course with course id
    previousYearQuestion.data.courses = await knexConnection.transaction(async trx => {
      return trx.select().table('courses').whereIn('courses.id', JSON.parse(previousYearQuestion.data.course_ids));
    });

    // Destrory process (to clean pool)
    knexConnection.destroy();

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);


    // Combine subject with subject id
    previousYearQuestion.data.subjects = await knexConnection.transaction(async trx => {
      return trx.select().table('subjects').whereIn('subjects.id', JSON.parse(previousYearQuestion.data.subject_ids));
    });

    // Destrory process (to clean pool)
    knexConnection.destroy();

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);


    // Combine chapter with chapter id
    previousYearQuestion.data.chapters = await knexConnection.transaction(async trx => {
      return trx.select().table('chapters').whereIn('chapters.id', JSON.parse(previousYearQuestion.data.chapter_ids));
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    if(previousYearQuestion.data.language_id){

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);


    // Combine chapter with chapter id
    previousYearQuestion.data.languages = await knexConnection.transaction(async trx => {
      return trx.select().table('languages').whereIn('languages.id', JSON.parse(previousYearQuestion.data.language_id));
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();
    }



  }



  if (previousYearQuestion.data && user && user.type != 'ADMIN' && !req.query.noLog) {
    let logged_data = {
      user_id: user.id,
      action: 'VIEW_PREVIOUS_YEAR_QUESTION',
      payload: JSON.stringify({
        field_name: 'previous_year_question_papers',
        field_id: previousYearQuestion.data.id,
        ...req.query
      })
    }


    let logs = await createLog(logged_data)


    let params = {
      views: previousYearQuestion.data.views + 1
    }

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    // Update Views in previousYearQuestions
    let previousYearQuestionUpdate = await knexConnection.transaction(async trx => {
      return trx('previousYearQuestions').where('id', previousYearQuestion.data.id).update(params);
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

  previousYearQuestion.data.url = await replaceUploads(previousYearQuestion.data.url);

  //
  let statusCode = previousYearQuestion.data ? 200 : 422;
  let response = {
    success: previousYearQuestion.data ? true : false,
    previousYearQuestion: previousYearQuestion.data,
    error: previousYearQuestion.error
  };


  // Send response
  res.status(statusCode).json(response);
}