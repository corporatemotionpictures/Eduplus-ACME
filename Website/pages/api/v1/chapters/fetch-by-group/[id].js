import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog,  replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch Chapters By ID
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user) { restrictedAccess(res); return false; }

  // Set attributes
  let id = req.query.id;

  // Set attributes
  let attributes = {
    exam_name: 'exams.name',
    course_name: 'courses.name',
    subject_name: 'subjects.name'
  };

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch chapter from database
  let chapters = await knexConnection.transaction(async trx => {
    return knexConnection.select(attributes, 'chapters.*').table('chapters')
      .innerJoin('exams', 'chapters.exam_id', 'exams.id')
      .innerJoin('courses', 'chapters.course_id', 'courses.id')
      .innerJoin('subjects', 'chapters.subject_id', 'subjects.id')
      .where('chapters.group_id', id).where('chapters.is_active', 1);
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

  //
  let statusCode = chapters.data ? 200 : 422;
  let response = {
    success: chapters.data ? true : false,
    chapters: chapters.data,
    error: chapters.error
  };

  // Send response
  res.status(statusCode).json(response);
}