import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog,  replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Get Enquiry By ID
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }

  // set attributes
  let id = req.query.id;

  // Set Attributes
  let attributes = {
    user_id: 'users.id',
    first_name: 'users.first_name',
    last_name: 'users.last_name',
    email: 'users.email',
    mobile_number: 'users.mobile_number',
  };

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fatch Enquiry From Database
  let enquiry = await knexConnection.transaction(async trx => {
    return trx.select('enquiries.*', attributes).table('enquiries')
      .innerJoin('users', 'enquiries.user_id', 'users.id')
      .where('enquiries.id', id).first();
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


  if (enquiry.data) {

    knexConnection = require('knex')(knexConnectionConfig);

      let exam = await knexConnection.transaction(async trx => {
        return trx.select().table('exams').where('id', enquiry.data.exam_id).first();
      })

      enquiry.data.exam_name = exam ? exam.name : null;

      // Destrory process (to clean pool)
      knexConnection.destroy();

      knexConnection = require('knex')(knexConnectionConfig);

      let course = await knexConnection.transaction(async trx => {
        return trx.select().table('courses').where('id', enquiry.data.course_id).first();
      })

      enquiry.data.course_name = course ? course.name : null;

      // Destrory process (to clean pool)
      knexConnection.destroy();


      knexConnection = require('knex')(knexConnectionConfig);

      let subject = await knexConnection.transaction(async trx => {
        return trx.select().table('subjects').where('id', enquiry.data.subject_id).first();
      })

      enquiry.data.subject_name = subject ? subject.name : null;

      // Destrory process (to clean pool)
      knexConnection.destroy();


      knexConnection = require('knex')(knexConnectionConfig);

      let chapter = await knexConnection.transaction(async trx => {
        return trx.select().table('chapters').where('id', enquiry.data.chapter_id).first();
      })

      enquiry.data.chapter_name = chapter ? chapter.name : null;

      // Destrory process (to clean pool)
      knexConnection.destroy();

      
      knexConnection = require('knex')(knexConnectionConfig);

      let repliedUser = await knexConnection.transaction(async trx => {
        return trx.select().table('users').where('id', enquiry.data.replied_by).first();
      })

      enquiry.data.replied_user = repliedUser ? repliedUser.first_name.concat(' ' + repliedUser.last_name) : null;

      // Destrory process (to clean pool)
      knexConnection.destroy();

      enquiry.data.image = await replaceUploads(enquiry.data.image);
      enquiry.data.image_for_user = await replaceUploads(enquiry.data.image_for_user);

  }


  //
  let statusCode = enquiry.data ? 200 : 422;
  let response = {
    success: enquiry.data ? true : false,
    enquiry: enquiry.data,
    error: enquiry.error
  };

  // Send Response
  res.status(statusCode).json(response);
}