import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';

import { getOnly, createLog, replaceUploads, replaceUploadsArray, CourseID, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch Blogs
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  // if (!user) { restrictedAccess(res); return false; }

  // Filters
  let orderBy = req.query.order_by ? req.query.order_by : 'ASC';
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let chapterID = req.query.chapterID ? req.query.chapterID.split(',') : null;
  let subjectID = req.query.subjectID ? req.query.subjectID.split(',') : null;
  let examID = req.query.examID ? req.query.examID.split(',') : null;
  let courseID = req.query.courseID ? req.query.courseID.split(',') : null;
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;
  let batchIds = req.query.batchIDs ? req.query.batchIDs : null;

  var subjectIDs = null;
  if (user && user.type == 'FACULTY' && user.subject_ids) {
    subjectIDs = user.subject_ids;
  }

  // Set Attributes
  let attributes = {
    exam_name: 'exams.name'
  };

  var totalCount = 0

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch blogs from database
  let blogs = await knexConnection.transaction(async trx => {

    let query;

    // 
    query = trx.select('blogs.*').table('blogs')
      .orderBy('blogs.position', orderBy);

    if (req.query.search && req.query.search != '') {
      query.where('blogs.title', 'like', '%'.concat(req.query.search).concat('%'))
    }

    if ((!req.query.forList || req.query.listOnly)) {
      query.where('blogs.is_active', 1).where('blogs.approved', true)
    }

    query.modify(function (queryBuilder) {
      queryBuilder.where(function () {
        this.where(function () {
          if (examID) {
            examID.map((id, i) => {
              this.orWhere('blogs.exam_ids', 'like', `%[${id}]%`).orWhere('blogs.exam_ids', 'like', `%,${id}]%`).orWhere('blogs.exam_ids', 'like', `%[${id},%`).orWhere('blogs.exam_ids', 'like', `%,${id},%`)
            })
          }
        })
        this.where(function () {
          if (courseID) {
            courseID.map((id, i) => {
              this.orWhere('course_ids', 'like', `%[${id}]%`).orWhere('course_ids', 'like', `%,${id}]%`).orWhere('course_ids', 'like', `%[${id},%`).orWhere('course_ids', 'like', `%,${id},%`)
            })
          }
        })
        this.where(function () {
          if (subjectID) {
            subjectID.map((id, i) => {
              this.orWhere('subject_ids', 'like', `%[${id}]%`).orWhere('subject_ids', 'like', `%,${id}]%`).orWhere('subject_ids', 'like', `%[${id},%`).orWhere('subject_ids', 'like', `%,${id},%`)
            })
          }
        })
        this.where(function () {
          if (subjectIDs) {
            subjectIDs.map((id, i) => {
              this.orWhere('subject_ids', 'like', `%[${id}]%`).orWhere('subject_ids', 'like', `%,${id}]%`).orWhere('subject_ids', 'like', `%[${id},%`).orWhere('subject_ids', 'like', `%,${id},%`)
            })
          }
        })
        this.where(function () {
          if (chapterID) {
            chapterID.map((id, i) => {
              this.orWhere('chapter_ids', 'like', `%[${id}]%`).orWhere('chapter_ids', 'like', `%,${id}]%`).orWhere('chapter_ids', 'like', `%[${id},%`).orWhere('chapter_ids', 'like', `%,${id},%`)
            })
          }
        })
      })
    })

    totalCount = await query.clone().count();
    totalCount = totalCount[0]['count(*)'];

    if ((!req.query.offLimit || req.query.offLimit == false)) {
      query = query.clone().offset(offset).limit(limit)
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


  if (blogs.data) {

    for (let i = 0; i < blogs.data.length; i++) {

      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      blogs.data[i].exams = await knexConnection.transaction(async trx => {
        return trx.table('exams').whereIn('id', JSON.parse(blogs.data[i].exam_ids)).orderBy('position', 'ASC');
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      blogs.data[i].courses = await knexConnection.transaction(async trx => {
        return trx.table('courses').whereIn('id', JSON.parse(blogs.data[i].course_ids)).orderBy('position', 'ASC');
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      blogs.data[i].subjects = await knexConnection.transaction(async trx => {
        return trx.table('subjects').whereIn('id', JSON.parse(blogs.data[i].subject_ids)).orderBy('position', 'ASC');
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      blogs.data[i].chapters = await knexConnection.transaction(async trx => {
        return trx.table('chapters').whereIn('id', JSON.parse(blogs.data[i].chapter_ids)).orderBy('position', 'ASC');
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      blogs.data[i].blog_url = process.env.NEXT_PUBLIC_DOMAIN_URL.concat(`/blogs/${blogs.data[i].slug}`);


      knexConnection = require('knex')(knexConnectionConfig);

      let createdUser = await knexConnection.transaction(async trx => {
        return trx.select().table('users').where('id', blogs.data[i].created_by).first();
      })

      blogs.data[i].created_user = createdUser ? createdUser.first_name.concat(' ' + createdUser.last_name) : null;

      // Destrory process (to clean pool)
      knexConnection.destroy();

      // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);

      // Combine chapter with chapter id
      let all_comments = await knexConnection.transaction(async trx => {
        return knexConnection.select('blog_comments.*').table('blog_comments')
          .where('blog_comments.post_id', blogs.data[i].id);
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      blogs.data[i].comments = all_comments ? all_comments.length : 0
    }

    blogs.data = await replaceUploadsArray(blogs.data, 'image');
  }



  if (blogs.data && user && user.type != 'ADMIN' && !req.query.listOnly && !req.query.noLog) {
    let logged_data = {
      user_id: user.id,
      action: 'VIEW_ALL_BLOGS',
      payload: JSON.stringify({
        field_name: 'blogs',
        ...req.query
      })
    }


    let logs = await createLog(logged_data)
  }




  //
  let statusCode = blogs.data ? 200 : 422;
  let response = {
    success: blogs.data ? true : false,
    blogs: blogs.data,
    totalCount: totalCount,
    error: blogs.error
  };

  // Send Response
  res.status(statusCode).json(response);
}

const intersect = (arrayA, arrayB) => {
  return arrayA.filter(elem => arrayB.includes(elem));
};