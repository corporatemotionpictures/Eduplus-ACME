import { knexConnectionConfig } from 'db/knexConnection';
import { fetchAll } from 'helpers/apiService';
import { getOnly, createLog, replaceUploads, checkPackage, CourseID, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch Chapters
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user) { restrictedAccess(res); return false; }

  // Filters
  let orderBy = req.query.order_by ? req.query.order_by : 'ASC';
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;
  let examID = req.query.examID ? req.query.examID.split(',') : null;
  let courseID = req.query.courseID ? req.query.courseID.split(',') : null;
  let subjectID = req.query.subjectID ? req.query.subjectID.split(',') : null;
  let chapterID = req.query.chapterID ? req.query.chapterID.split(',') : null;
  let batchIds = req.query.batchIDs ? req.query.batchIDs : null;

  var subjectIDs = null;
  if (user && user.type == 'FACULTY' && user.subject_ids) {
    subjectIDs = user.subject_ids;
  }

  var totalCount = 0

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch chapters from database
  let chapters = await knexConnection.transaction(async trx => {

    var query;

    query = trx.select('chapters.*').table('chapters')
      .orderBy('chapters.position', orderBy);


    if (req.query.search && req.query.search != '') {
      query.where('chapters.name', 'like', '%'.concat(req.query.search).concat('%'))
    }
    
    if ((!req.query.forList || req.query.listOnly)) {
      query.where('chapters.is_active', 1).where('chapters.approved', true)
    }

    if (chapterID) {
      query.whereIn('chapters.id', chapterID)
    }


    query.modify(function (queryBuilder) {
      queryBuilder.where(function () {
        this.where(function () {
          if (examID) {
            examID.map((id, i) => {
              this.orWhere('exam_ids', 'like', `%[${id}]%`).orWhere('exam_ids', 'like', `%,${id}]%`).orWhere('exam_ids', 'like', `%[${id},%`).orWhere('exam_ids', 'like', `%,${id},%`)
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
      })
    })

    totalCount = await query.clone().count();
    totalCount = totalCount[0]['count(*)'];

    if (!req.query.offLimit || req.query.offLimit == false) {
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
  })

  // Destrory process (to clean pool)
  knexConnection.destroy();

  if (chapters.data) {


    for (let i = 0; i < chapters.data.length; i++) {

      // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);

      chapters.data[i].exams = await knexConnection.transaction(async trx => {
        return trx.table('exams').whereIn('id', JSON.parse(chapters.data[i].exam_ids)).orderBy('position', 'ASC');
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);

      chapters.data[i].courses = await knexConnection.transaction(async trx => {
        return trx.table('courses').whereIn('id', JSON.parse(chapters.data[i].course_ids)).orderBy('position', 'ASC');
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);

      chapters.data[i].subjects = await knexConnection.transaction(async trx => {
        return trx.table('subjects').whereIn('id', JSON.parse(chapters.data[i].subject_ids)).orderBy('position', 'ASC');
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

    }
  }

  
  if (chapters.data && user && user.type != 'ADMIN' && !req.query.listOnly && !req.query.noLog) {
    let logged_data = {
      user_id: user.id,
      action: 'VIEW_ALL_CHAPTERS',
      payload: JSON.stringify({
        field_name: 'chapters',
        ...req.query
      })
    }


    let logs = await createLog(logged_data)
  }


  if (chapters.data && user.type != 'ADMIN' && !req.query.forList) {
    for (let i = 0; i < chapters.data.length; i++) {

      let videos = await fetchAll('videos', { chapterID: chapters.data[i].id, listOnly: true, offLimit: true, productID: req.query.productID, noLog: true }, req.headers['x-auth-token'])
      chapters.data[i].videos = videos.videos

      chapters.data[i].locked = await checkPackage(req.headers['x-auth-token'], chapters.data[i].subject_ids, 'PAID', null , null , null , null , [chapters.data[i].id])


      knexConnection = require('knex')(knexConnectionConfig);

      let createdUser = await knexConnection.transaction(async trx => {
        return trx.select().table('users').where('id', chapters.data[i].created_by).first();
      })

      chapters.data[i].created_user = createdUser ? createdUser.first_name.concat(' ' + createdUser.last_name) : null;

      // Destrory process (to clean pool)
      knexConnection.destroy();

    }

    chapters.data = chapters.data.filter(data => data.locked == false)
  }

  //
  let statusCode = chapters.data ? 200 : 422;
  let response = {
    success: chapters.data ? true : false,
    chapters: chapters.data,
    totalCount: totalCount,
    error: chapters.error
  };

  // Send response
  res.status(statusCode).json(response);
}

const intersect = (arrayA, arrayB) => {
  return arrayA.filter(elem => arrayB.includes(elem));
};