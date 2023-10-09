import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import define from 'src/json/worddefination.json'
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, CourseID, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch Posts
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert Posts
  if (!user) { restrictedAccess(res); return false; }

  // Set attributes
  let attributes = {
    user_first_name: 'users.first_name',
    user_last_name: 'users.last_name',
    user_image: 'users.image'
  };

  // Filter
  let orderBy = req.query.order_by ? req.query.order_by : 'DESC';
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let userID = req.query.userID ? Number.parseInt(req.query.userID) : null;
  let examID = req.query.examID ? req.query.examID.split(',') : null;
  let courseID = req.query.courseID ? req.query.courseID.split(',') : null;
  let subjectID = req.query.subjectID ? req.query.subjectID.split(',') : null;
  let chapterID = req.query.chapterID ? req.query.chapterID.split(',') : null;

  var subjectIDs = null;
  if (user && user.type == 'FACULTY' && user.subject_ids) {
    subjectIDs = user.subject_ids;
  }

  let totalCount = 0

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let posts = await knexConnection.transaction(async trx => {


    var query = '';
    query = trx.select('posts.*', attributes).table('posts')
      .innerJoin('users', 'posts.user_id', 'users.id')
      .modify(function (queryBuilder) {
        if (subjectIDs) {
          queryBuilder.innerJoin('subjects', 'posts.subject_id', 'subjects.id').whereIn('posts.subject_id', subjectIDs)
        }
        if (userID) {
          queryBuilder.where('users.id', userID)
        }
        if (examID) {
          queryBuilder.innerJoin('exams', 'posts.exam_id', 'exams.id').whereIn('posts.exam_id', examID)
        }
        if (courseID) {
          queryBuilder.innerJoin('courses', 'posts.course_id', 'courses.id').whereIn('posts.course_id', courseID)
        }
        if (subjectID) {
          queryBuilder.innerJoin('subjects', 'posts.subject_id', 'subjects.id').whereIn('posts.subject_id', subjectID)
        }
        if (chapterID) {
          queryBuilder.innerJoin('chapters', 'posts.chapter_id', 'chapters.id').whereIn('posts.chapter_id', chapterID)
        }
      })

    totalCount = await query.clone().count();
    totalCount = totalCount[0]['count(*)'];

    if ((!req.query.forList || req.query.listOnly)) {
      query = query.where('posts.hide', 0)
    }

    return query;
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

  var exam;
  var course;
  var subject;
  var chapter;

  if (posts.data) {
    for (let i = 0; i < posts.data.length; i++) {

      // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);

      exam = await knexConnection.transaction(async trx => {
        return trx.select('*').table('exams')
          .where('id', posts.data[i].exam_id).first();
      })

      posts.data[i].exam_name = exam ? exam.name : '';

      // Destrory process (to clean pool)
      knexConnection.destroy();


      // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);

      course = await knexConnection.transaction(async trx => {
        return trx.select().table('courses')
          .where('id', posts.data[i].course_id).first();
      })

      posts.data[i].course_name = course ? course.name : '';

      // Destrory process (to clean pool)
      knexConnection.destroy();
      // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);

      subject = await knexConnection.transaction(async trx => {
        return trx.select().table('subjects')
          .where('id', posts.data[i].subject_id).first();
      })
      posts.data[i].subject_name = subject ? subject.name : '';

      // Destrory process (to clean pool)
      knexConnection.destroy();
      // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);

      chapter = await knexConnection.transaction(async trx => {
        return trx.select().table('chapters')
          .where('id', posts.data[i].chapter_id).first();
      })
      posts.data[i].chapter_name = chapter ? chapter.name : '';

      // Destrory process (to clean pool)
      knexConnection.destroy();


    }

    posts.data = await replaceUploadsArray(posts.data, 'image');

  }

  if (posts.data && user && user.type != 'ADMIN' && !req.query.listOnly && !req.query.noLog) {
    let logged_data = {
      user_id: user.id,
      action: `VIEW_ALL_POSTS`,
      payload: JSON.stringify({
        field_name: 'posts',
        ...req.query
      })
    }


    let logs = await createLog(logged_data)
  }



  //
  let statusCode = posts.data ? 200 : 422;
  let response = {
    success: posts.data ? true : false,
    posts: posts.data,
    error: posts.error, 
    totalCount: totalCount, 
  };



  res.status(statusCode).json(response);
}

const intersect = (arrayA, arrayB) => {
  return arrayA.filter(elem => arrayB.includes(elem));
};