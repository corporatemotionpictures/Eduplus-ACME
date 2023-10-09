import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, CourseID, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch enquiries
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
  let examID = req.query.examID ? req.query.examID.split(',') : null;
  let courseID = req.query.courseID ? req.query.courseID.split(',') : null;
  let subjectID = req.query.subjectID ? req.query.subjectID.split(',') : null;
  let chapterID = req.query.chapterID ? req.query.chapterID.split(',') : null;
  var subjectIDs = null;
  if (user && user.type == 'FACULTY' && user.subject_ids) {
    subjectIDs = user.subject_ids;
  }

  // Set Attributes
  let attributes = {
    user_id: 'users.id',
    first_name: 'users.first_name',
    last_name: 'users.last_name',
    email: 'users.email',
    mobile_number: 'users.mobile_number'
  };

  let totalCount = 0

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch enquiries from database
  let enquiries = await knexConnection.transaction(async trx => {

    let query
    query = trx.select('enquiries.*', attributes).table('enquiries')
      .innerJoin('users', 'enquiries.user_id', 'users.id')
      .modify(function (queryBuilder) {
        if (userID) {
          queryBuilder.where('users.id', userID)
        }
        if (chapterID) {
          queryBuilder.innerJoin('chapters', 'enquiries.chapter_id', 'chapters.id').whereIn('enquiries.chapter_id', chapterID)
        }
        if (subjectID) {
          queryBuilder.innerJoin('subjects', 'enquiries.subject_id', 'subjects.id').whereIn('enquiries.subject_id', subjectID)
        }
        if (subjectIDs) {
          queryBuilder.innerJoin('subjects', 'enquiries.subject_id', 'subjects.id').whereIn('enquiries.subject_id', subjectIDs)
        }
        if (courseID) {
          queryBuilder.innerJoin('courses', 'enquiries.course_id', 'courses.id').whereIn('enquiries.course_id', courseID)
        }
        if (examID) {
          queryBuilder.innerJoin('exams', 'enquiries.exam_id', 'exams.id').whereIn('enquiries.exam_id', examID)
        }
      })

    totalCount = await query.clone().count();
    totalCount = totalCount[0]['count(*)'];

    query.orderBy('enquiries.id', orderBy).offset(offset).limit(limit);
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

  if (enquiries.data) {
    for (let i = 0; i < enquiries.data.length; i++) {

      enquiries.data[i].user_name = `${enquiries.data[i].first_name} ${enquiries.data[i].last_name}`

      knexConnection = require('knex')(knexConnectionConfig);

      let exam = await knexConnection.transaction(async trx => {
        return trx.select().table('exams').where('id', enquiries.data[i].exam_id).first();
      })

      enquiries.data[i].exam_name = exam ? exam.name : null;

      // Destrory process (to clean pool)
      knexConnection.destroy();

      knexConnection = require('knex')(knexConnectionConfig);

      let course = await knexConnection.transaction(async trx => {
        return trx.select().table('courses').where('id', enquiries.data[i].course_id).first();
      })

      enquiries.data[i].course_name = course ? course.name : null;

      // Destrory process (to clean pool)
      knexConnection.destroy();


      knexConnection = require('knex')(knexConnectionConfig);

      let subject = await knexConnection.transaction(async trx => {
        return trx.select().table('subjects').where('id', enquiries.data[i].subject_id).first();
      })

      enquiries.data[i].subject_name = subject ? subject.name : null;

      // Destrory process (to clean pool)
      knexConnection.destroy();


      knexConnection = require('knex')(knexConnectionConfig);

      let chapter = await knexConnection.transaction(async trx => {
        return trx.select().table('chapters').where('id', enquiries.data[i].chapter_id).first();
      })

      enquiries.data[i].chapter_name = chapter ? chapter.name : null;

      // Destrory process (to clean pool)
      knexConnection.destroy();

      knexConnection = require('knex')(knexConnectionConfig);

      let repliedUser = await knexConnection.transaction(async trx => {
        return trx.select().table('users').where('id', enquiries.data[i].replied_by).first();
      })

      enquiries.data[i].replied_user = repliedUser ? repliedUser.first_name.concat(' ' + repliedUser.last_name) : null;

      // Destrory process (to clean pool)
      knexConnection.destroy();

    }


    enquiries.data = await replaceUploadsArray(enquiries.data, 'image');
    enquiries.data = await replaceUploadsArray(enquiries.data, 'image_for_user');
  }


  //
  let statusCode = enquiries.data ? 200 : 422;
  let response = {
    success: enquiries.data ? true : false,
    enquiries: enquiries.data,
    totalCount: totalCount,
    error: enquiries.error
  };

  // Send Response
  res.status(statusCode).json(response);
}