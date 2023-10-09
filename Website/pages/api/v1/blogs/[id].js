import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Get Blog By ID
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user) { restrictedAccess(res); return false; }

  // set attributes
  let id = req.query.id;

  // Set Attributes
  let attributes = {
    chapter_id: 'chapters.id',
    chapter_name: 'chapters.name'
  };

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fatch blog From Database
  let blog = await knexConnection.transaction(async trx => {
    return trx.select().table('blogs')
      .where('id', id).first();
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

  if (blog.data) {

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);


    // Combine exam with exam id
    blog.data.exams = await knexConnection.transaction(async trx => {
      return trx.select().table('exams').whereIn('exams.id', JSON.parse(blog.data.exam_ids));
    });

    // Destrory process (to clean pool)
    knexConnection.destroy();

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);


    // Combine course with course id
    blog.data.courses = await knexConnection.transaction(async trx => {
      return trx.select().table('courses').whereIn('courses.id', JSON.parse(blog.data.course_ids));
    });

    // Destrory process (to clean pool)
    knexConnection.destroy();

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);


    // Combine subject with subject id
    blog.data.subjects = await knexConnection.transaction(async trx => {
      return trx.select().table('subjects').whereIn('subjects.id', JSON.parse(blog.data.subject_ids));
    });

    // Destrory process (to clean pool)
    knexConnection.destroy();

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    // Combine chapter with chapter id
    blog.data.chapters = await knexConnection.transaction(async trx => {
      return trx.select().table('chapters').whereIn('chapters.id', JSON.parse(blog.data.chapter_ids));
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    // Set attributes
    let attributes = {
      user_first_name: 'users.first_name',
      user_last_name: 'users.last_name',
      user_image: 'users.image'
    };

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    // Combine chapter with chapter id
    blog.data.all_comments = await knexConnection.transaction(async trx => {
      return knexConnection.select('blog_comments.*', attributes).table('blog_comments')
        .join('users', 'blog_comments.user_id', 'users.id')
        .where('blog_comments.post_id', blog.data.id);
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

  }

  if (blog.data && user && user.type != 'ADMIN' && !req.query.noLog) {
    let logged_data = {
      user_id: user.id,
      action: 'VIEW_BLOG',
      payload: JSON.stringify({
        field_name: 'blogs',
        field_id: blog.data.id,
        ...req.query
      })
    }


    let logs = await createLog(logged_data)


  }


  if (blog.data && user.type != 'ADMIN') {


    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    let params = {
      views: blog.data.views + 1
    }

    // Update Views in blogs
    let blogUpdate = await knexConnection.transaction(async trx => {
      return trx('blogs').where('id', blog.data.id).update(params);
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

  blog.data.image = await replaceUploads(blog.data.image);

  //
  let statusCode = blog.data ? 200 : 422;
  let response = {
    success: blog.data ? true : false,
    blog: blog.data,
    error: blog.error
  };

  // Send Response
  res.status(statusCode).json(response);
}