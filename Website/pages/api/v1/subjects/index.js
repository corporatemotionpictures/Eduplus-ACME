import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, checkPackage, replaceUploadsArray, CourseID, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to fetch subjects
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  // if (!user) { restrictedAccess(res); return false; }

  let orderBy = req.query.order_by ? req.query.order_by : 'ASC';
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let examID = req.query.examID ? req.query.examID.split(',') : null;
  let courseID = req.query.courseID ? req.query.courseID.split(',') : null;
  let subjectID = req.query.subjectID ? req.query.subjectID.split(',') : null;
  let batchIds = req.query.batchIDs ? req.query.batchIDs : null;
  let forDashboard = req.query.forDashboard ? req.query.forDashboard : false;

  var subjectIDs = null;
  if (user && user.type == 'FACULTY' && user.subject_ids) {
    subjectIDs = user.subject_ids;
  }


  var totalCount = 0

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let subjects = await knexConnection.transaction(async trx => {

    var query;

    query = trx.select('subjects.*').table('subjects')
      .modify(function (queryBuilder) {
        if (subjectIDs) {
          queryBuilder.whereIn('subjects.id', subjectIDs)
        }
        if (subjectID) {
          queryBuilder.where('subjects.id', subjectID)
        }
      })
      .orderBy('subjects.position', orderBy);

    if (req.query.search && req.query.search != '') {
      query.where('subjects.name', 'like', '%'.concat(req.query.search).concat('%'))
    }

    if ((!req.query.forList || req.query.listOnly)) {
      query.where('subjects.is_active', 1)
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
      error: err
    };
  })

  // Destrory process (to clean pool)
  knexConnection.destroy();


  if (subjects.data) {


    for (let i = 0; i < subjects.data.length; i++) {

      // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);

      subjects.data[i].exams = await knexConnection.transaction(async trx => {
        return trx.table('exams').whereIn('id', JSON.parse(subjects.data[i].exam_ids)).orderBy('position', 'ASC');
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);

      subjects.data[i].courses = await knexConnection.transaction(async trx => {
        return trx.table('courses').whereIn('id', JSON.parse(subjects.data[i].course_ids)).orderBy('position', 'ASC');
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

    }
  }

  if (subjects.data && user && user.type != 'ADMIN' && !req.query.forList) {

    for (let i = 0; i < subjects.data.length; i++) {

      subjects.data[i].locked = await checkPackage(req.headers['x-auth-token'], [subjects.data[i].id])

    }
  }



  if (subjects.data && user && user.type != 'ADMIN' && !req.query.listOnly && !req.query.noLog) {
    let logged_data = {
      user_id: user.id,
      action: 'VIEW_ALL_SUBJECTS',
      payload: JSON.stringify({
        field_name: 'subjects',
        ...req.query
      })
    }


    let logs = await createLog(logged_data)
  }

  if (subjects.data) {
    subjects.data = await replaceUploadsArray(subjects.data, 'thumbnail')
  }


  if (forDashboard) {

    if (subjects.data) {
      for (let i = 0; i < subjects.data.length; i++) {

        // Create db process (get into pool)
        knexConnection = require('knex')(knexConnectionConfig);

        let chapters = await knexConnection.transaction(async trx => {
          var query;

          query = trx.select().table('chapters')
            .where('chapters.subject_id', subjects.data[i].id).where('chapters.is_active', 1)
            .orderBy('chapters.position', orderBy);

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
          for (let j = 0; j < chapters.data.length; j++) {


            // Create db process (get into pool)
            knexConnection = require('knex')(knexConnectionConfig);

            let videos = await knexConnection.transaction(async trx => {
              var query;

              query = trx.select().table('videos')
                .where('videos.chapter_id', chapters.data[j].id)
                .orderBy('videos.position', orderBy);

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

            chapters.data[j].videos = videos;


          }
        }
        subjects.data[i].chapters = chapters.data;

      }
    }

  }

  //
  let statusCode = subjects.data ? 200 : 422;
  let response = {
    success: subjects.data ? true : false,
    subjects: subjects.data,
    totalCount: totalCount,
    error: subjects.error
  };

  res.status(statusCode).json(response);
}

const intersect = (arrayA, arrayB) => {
  return arrayA.filter(elem => arrayB.includes(elem));
};