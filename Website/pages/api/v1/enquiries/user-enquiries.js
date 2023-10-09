import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Get Enquiry By ID
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

  let attributes = {
    'user_first_name': 'users.first_name',
    'user_last_name': 'users.last_name'
  };

  // set attributes
  let id = user.id;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fatch Enquiry From Database
  let enquiry = await knexConnection.transaction(async trx => {
    return trx.select('enquiries.*', attributes).table('enquiries')
      .innerJoin('users', 'enquiries.user_id', 'users.id')
      .where('enquiries.user_id', id).orderBy('enquiries.id', orderBy).offset(offset).limit(limit);
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
    for (let i = 0; i < enquiry.data.length; i++) {

      knexConnection = require('knex')(knexConnectionConfig);

      let exam = await knexConnection.transaction(async trx => {
        return trx.select().table('exams').where('id', enquiry.data[i].exam_id).first();
      })

      enquiry.data[i].exam_name = exam ? exam.name : null;

      // Destrory process (to clean pool)
      knexConnection.destroy();

      knexConnection = require('knex')(knexConnectionConfig);

      let course = await knexConnection.transaction(async trx => {
        return trx.select().table('courses').where('id', enquiry.data[i].course_id).first();
      })

      enquiry.data[i].course_name = course ? course.name : null;

      // Destrory process (to clean pool)
      knexConnection.destroy();


      knexConnection = require('knex')(knexConnectionConfig);

      let subject = await knexConnection.transaction(async trx => {
        return trx.select().table('subjects').where('id', enquiry.data[i].subject_id).first();
      })

      enquiry.data[i].subject_name = subject ? subject.name : null;

      // Destrory process (to clean pool)
      knexConnection.destroy();


      knexConnection = require('knex')(knexConnectionConfig);

      let chapter = await knexConnection.transaction(async trx => {
        return trx.select().table('chapters').where('id', enquiry.data[i].chapter_id).first();
      })

      enquiry.data[i].chapter_name = chapter ? chapter.name : null;

      // Destrory process (to clean pool)
      knexConnection.destroy();

      enquiry.data[i].image = await replaceUploads(enquiry.data[i].image);
      enquiry.data[i].body = enquiry.data[i].message;

      
      knexConnection = require('knex')(knexConnectionConfig);

      let repliedUser = await knexConnection.transaction(async trx => {
        return trx.select().table('users').where('id', enquiry.data[i].replied_by).first();
      })

      enquiry.data[i].replied_user = repliedUser ? repliedUser.first_name.concat(' ' + repliedUser.last_name) : null;

      // Destrory process (to clean pool)
      knexConnection.destroy();

      enquiry.data[i].image = await replaceUploads(enquiry.data[i].image);
      enquiry.data[i].image_for_user = await replaceUploads(enquiry.data[i].image_for_user);
    }

  }


  if (enquiry.data && user && user.type != 'ADMIN' && !req.query.listOnly && !req.query.noLog) {
    let logged_data = {
      user_id: user.id,
      action: `VIEW_ALL_ENQUIRIES`,
      payload: JSON.stringify({
        field_name: 'enquiries',
        ...req.query
      })
    }


    let logs = await createLog(logged_data)
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