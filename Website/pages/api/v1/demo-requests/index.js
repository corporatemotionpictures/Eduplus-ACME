import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, CourseID, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch demoRequests
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user && (user.type != 'ADMIN' || user.type != 'MANAGEMENT')) { restrictedAccess(res); return false; }

  // Filters
  let orderBy = req.query.order_by ? req.query.order_by : 'DESC';
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;
  let userID = req.query.userID ? req.query.userID.split(',') : null;
  let courseID = req.query.courseID ? req.query.courseID.split(',') : null;
  let examID = req.query.examID ? req.query.examID.split(',') : null;
  let subjectID = req.query.subjectID ? req.query.subjectID.split(',') : null;
  var subjectIDs = null;
  if (user && user.type == 'FACULTY' && user.subject_ids) {
    subjectIDs = user.subject_ids;
  }


  let totalCount = 0

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch demoRequests from database
  let demoRequests = await knexConnection.transaction(async trx => {

    let query
    query = trx.select('demo_requests.*').table('demo_requests')
      .modify(function (queryBuilder) {
        if (userID) {
          queryBuilder.where('users.id', userID)
        }

        if (subjectID) {
          queryBuilder.innerJoin('subjects', 'demo_requests.subject_id', 'subjects.id').whereIn('demo_requests.subject_id', subjectID)
        }
        if (subjectIDs) {
          queryBuilder.innerJoin('subjects', 'demo_requests.subject_id', 'subjects.id').whereIn('demo_requests.subject_id', subjectIDs)
        }
        if (courseID) {
          queryBuilder.innerJoin('courses', 'demo_requests.course_id', 'courses.id').whereIn('demo_requests.course_id', courseID)
        }
        if (examID) {
          queryBuilder.innerJoin('exams', 'demo_requests.exam_id', 'exams.id').whereIn('demo_requests.exam_id', examID)
        }
      })

    totalCount = await query.clone().count();
    totalCount = totalCount[0]['count(*)'];

    query.orderBy('demo_requests.id', orderBy).offset(offset).limit(limit);
    return query
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

  var subject;

  if (demoRequests.data) {
    for (let i = 0; i < demoRequests.data.length; i++) {

      if (demoRequests.data[i].user_id) {
        knexConnection = require('knex')(knexConnectionConfig);

        let user = await knexConnection.transaction(async trx => {
          return trx.select().table('users').where('id', demoRequests.data[i].user_id).first();
        })


        // Destrory process (to clean pool)
        knexConnection.destroy();

        if (user) {
          demoRequests.data[i].name = `${user.first_name} ${user.last_name}`
          demoRequests.data[i].email = `${user.email}`
          demoRequests.data[i].mobile_number = `${user.mobile_number}`
        }
      }

      knexConnection = require('knex')(knexConnectionConfig);

      let course = await knexConnection.transaction(async trx => {
        return trx.select().table('courses').where('id', demoRequests.data[i].course_id).first();
      })

      demoRequests.data[i].course_name = course ? course.name : null;

      // Destrory process (to clean pool)
      knexConnection.destroy();

      knexConnection = require('knex')(knexConnectionConfig);

      let exam = await knexConnection.transaction(async trx => {
        return trx.select().table('exams').where('id', demoRequests.data[i].exam_id).first();
      })

      demoRequests.data[i].exam_name = exam ? exam.name : null;

      // Destrory process (to clean pool)
      knexConnection.destroy();

      knexConnection = require('knex')(knexConnectionConfig);

      let productType = await knexConnection.transaction(async trx => {
        return trx.select().table('product_types').where('id', demoRequests.data[i].course_type_id).first();
      })

      demoRequests.data[i].product_type_name = productType ? productType.title : null;

      // Destrory process (to clean pool)
      knexConnection.destroy();


      knexConnection = require('knex')(knexConnectionConfig);

      let subject = await knexConnection.transaction(async trx => {
        return trx.select().table('subjects').where('id', demoRequests.data[i].subject_id).first();
      })

      demoRequests.data[i].subject_name = subject ? subject.name : null;

      // Destrory process (to clean pool)
      knexConnection.destroy();

    }
  }


  //
  let statusCode = demoRequests.data ? 200 : 422;
  let response = {
    success: demoRequests.data ? true : false,
    demoRequests: demoRequests.data,
    totalCount: totalCount,
    error: demoRequests.error
  };

  // Send Response
  res.status(statusCode).json(response);
}