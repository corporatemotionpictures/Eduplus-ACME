import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Get posts By ID
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert posts
  if (!user) { restrictedAccess(res); return false; }

  // set attributes
  let id = req.query.id;

  // Set attributes
  let attributes = {
    user_first_name: 'users.first_name',
    user_last_name: 'users.last_name',
    user_image: 'users.image'
  };

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fatch post From Database
  let post = await knexConnection.transaction(async trx => {
    return trx.select('posts.*', attributes).table('posts')
      .innerJoin('users', 'posts.user_id', 'users.id').where('posts.id', id).first();
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


  if (post.data) {

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    let exam = await knexConnection.transaction(async trx => {
      return trx.select().table('exams')
        .where('id', post.data.exam_id).first();
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    post.data.exam_name = exam ? exam.name : ''

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    let course = await knexConnection.transaction(async trx => {
      return trx.select().table('courses')
        .where('id', post.data.course_id).first();
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    post.data.course_name = course ? course.name : ''

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    let subject = await knexConnection.transaction(async trx => {
      return trx.select().table('subjects')
        .where('id', post.data.subject_id).first();
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    post.data.subject_name = subject ? subject.name : ''

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    let chapter = await knexConnection.transaction(async trx => {
      return trx.select().table('chapters')
        .where('id', post.data.chapter_id).first();
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    post.data.chapter_name = chapter ? chapter.name : ''


    post.data.image = await replaceUploads(post.data.image);


  }

  if (post.data && user && user.type != 'ADMIN' && !req.query.listOnly && !req.query.noLog) {
    let logged_data = {
      user_id: user.id,
      action: `VIEW_POST`,
      payload: JSON.stringify({
        field_name: 'posts',
        field_id: post.data.id,
        ...req.query
      })
    }


    let logs = await createLog(logged_data)
  }

  //
  let statusCode = post.data ? 200 : 422;
  let response = {
    success: post.data ? true : false,
    post: post.data,
    error: post.error
  };

  // Send Response
  res.status(statusCode).json(response);
}