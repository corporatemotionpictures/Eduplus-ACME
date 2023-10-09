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
  let forDashboard = req.query.forDashboard ? req.query.forDashboard : false;
  let batchIds = req.query.batchIDs ? req.query.batchIDs : null;

  var subjectIDs = null;
  if (user && user.type == 'FACULTY' && user.subject_ids) {
    subjectIDs = user.subject_ids;
  }

  let attributes = {
    exam_name: 'exams.name',
    course_id: 'courses.id',
    course_name: 'courses.name'
  };

  let totalCount = 0

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let subjects = await knexConnection.transaction(async trx => {

    var query;


    if (examID) {
      attributes.exam_name = 'exams.name';
    }
    if (courseID) {
      attributes.course_name = 'courses.name';
    }
    if (subjectID || subjectIDs) {
      attributes.subject_name = 'subjects.name';
    }


    query = knexConnection.select(attributes, 'subjects.*').table('subjects')
      .innerJoin('exams', 'subjects.exam_id', 'exams.id')
      .innerJoin('courses', 'subjects.course_id', 'courses.id')
      .modify(function (queryBuilder) {
        if (subjectIDs) {
          queryBuilder.whereIn('subjects.subject_id', subjectIDs)
        }
        if (examID) {
          queryBuilder.where('subjects.exam_id', examID)
        }
        if (courseID) {
          queryBuilder.where('subjects.course_id', courseID)
        }
        if (subjectID) {
          queryBuilder.where('subjects.subject_id', subjectID)
        }
      })
      .orderBy('subjects.position', orderBy);

    if ((!req.query.forList || req.query.listOnly)) {
      query.where('subjects.is_active', 1)
    }

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

  if (subjects.data && batchIds) {
    subjects.data = subjects.data.filter(subject => subject.batch_ids == null || !isEmptyArray(intersect(JSON.parse(subject.batch_ids), batchIds)));
  }

  if (subjects.data && user && user.type != 'ADMIN' && !req.query.forList) {

    for (let i = 0; i < subjects.data.length; i++) {
      subjects.data[i].locked = await checkPackage(req.headers['x-auth-token'], [subjects.data[i].id])
    }
  }

  if (subjects.data) {
    subjects.data = await replaceUploadsArray(subjects.data, 'thumbnail')
  }


  if (forDashboard) {

    if (subjects.data) {
      for (let i = 0; i < subjects.data.length; i++) {

        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

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
            var knexConnection = require('knex')(knexConnectionConfig);

            let events = await knexConnection.transaction(async trx => {
              var query;

              query = trx.select().table('live_events')
                .where('live_events.chapter_id', chapters.data[j].id)
                .orderBy('live_events.position', orderBy);

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

            chapters.data[j].events = events;


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