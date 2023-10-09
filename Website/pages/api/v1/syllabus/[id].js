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
  let syllabus = await knexConnection.transaction(async trx => {
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


  if (syllabus.data) {

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);


    // Combine course with exam id
    syllabus.data.exams = await knexConnection.transaction(async trx => {
      return trx.select().table('exams').whereIn('exams.id', syllabus.data.exam_ids);
    });

    // Destrory process (to clean pool)
    knexConnection.destroy();

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);


    // Combine course with course id
    syllabus.data.courses = await knexConnection.transaction(async trx => {
      return trx.select().table('courses').whereIn('courses.id', syllabus.data.course_ids);
    });

    // Destrory process (to clean pool)
    knexConnection.destroy();

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);


    // Combine subject with subject id
    syllabus.data.subjects = await knexConnection.transaction(async trx => {
      return trx.select().table('subjects').whereIn('subjects.id', syllabus.data.subject_ids);
    });

    // Destrory process (to clean pool)
    knexConnection.destroy();

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);


    // Combine chapter with chapter id
    syllabus.data.chapters = await knexConnection.transaction(async trx => {
      return trx.select().table('chapters').whereIn('chapters.id', syllabus.data.chapter_ids);
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();


  }


  if (syllabus.data && user && user.type != 'ADMIN' && !req.query.noLog) {
    let logged_data = {
      user_id: user.id,
      action: 'VIEW_ALL_SYLLABUS',
      payload: JSON.stringify({
        field_name: 'syllabus',
        field_id: syllabus.id,
        ...req.query
      })
    }


    let logs = await createLog(logged_data)
  }

  if (syllabus.data && user.type != 'ADMIN') {

    let params = {
      views: syllabus.data.views + 1
    }

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    // Update Views in syllabus
    let syllabusUpdate = await knexConnection.transaction(async trx => {
      return trx('syllabus').where('id', syllabus.data.id).update(params);
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

  syllabus.data.url = await replaceUploads(syllabus.data.url);

  //
  let statusCode = syllabus.data ? 200 : 422;
  let response = {
    success: syllabus.data ? true : false,
    syllabus: syllabus.data,
    error: syllabus.error
  };


  // Send response
  res.status(statusCode).json(response);
}