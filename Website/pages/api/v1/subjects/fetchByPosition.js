import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog,  replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Get Subject By ID
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user) { restrictedAccess(res); return false; }

  // Set attributes
  let attributes = {
    exam_id: 'exams.id',
    exam_name: 'exams.name',
    course_id: 'courses.id',
    course_name: 'courses.name'
  };

  let position = req.query.position ? req.query.position : null;
  let id = req.query.id ? req.query.id : null;


  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch subject from database
  let subject = await knexConnection.transaction(async trx => {
    return knexConnection.select(attributes, 'subjects.*').table('subjects')
      .innerJoin('exams', 'subjects.exam_id', 'exams.id')
      .innerJoin('courses', 'subjects.course_id', 'courses.id')
      .where('subjects.position', position).whereNot('subjects.id', id).where('subjects.is_active', 1).first();

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

if(subject.data){
    subject.data.thumbnail = await replaceUploads(subject.data.thumbnail);
}

  //
  let statusCode = subject.data ? 200 : 422;
  let response = {
    success: subject.data ? true : false,
    subject: subject.data ? subject.data : null,
    error: subject.error
  };

  // Send Response 
  res.status(statusCode).json(response);
}