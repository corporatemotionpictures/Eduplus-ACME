import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { fetchAll } from 'helpers/apiService';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, checkPackage, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch Previous Year Question Papers
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user) { restrictedAccess(res); return false; }

  // Filter
  let orderBy = req.query.order_by ? req.query.order_by : 'ASC';
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let examID = req.query.examID ? req.query.examID.split(',') : null;
  let courseID = req.query.courseID ? req.query.courseID.split(',') : null;
  let subjectID = req.query.subjectID ? req.query.subjectID.split(',') : null;
  let chapterID = req.query.chapterID ? req.query.chapterID.split(',') : null;
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : null;
  let batchIds = req.query.batchIDs ? req.query.batchIDs : null;
  let languages = req.query.languages ? req.query.languages.split(',') : null;

  var subjectIDs = null;
  if (user && user.type == 'FACULTY' && user.subject_ids) {
    subjectIDs = user.subject_ids;
  }


  var totalCount = 0



  var activeproducts = null;
  var languagesAccess = null;
   var chapterAccess = null;
  var accessable = true;
  if (user && user.type != 'ADMIN' && !req.query.forList) {
    activeproducts = await fetchAll('users/active-products', { field: "previous-year-question-papers", access: true, productID: req.query.productID, noLog: true }, req.headers['x-auth-token'])
    chapterAccess = activeproducts.access && activeproducts.access.chapterIDs.length > 0
    languagesAccess = activeproducts.access && activeproducts.access.languagesAccess
  }

  let previousYearQuestions = {
    data: [],
    error: null
  }
  if (!languagesAccess || Object.keys(languagesAccess).length > 0) {
    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fetch Previous Year Question Papers from database
    previousYearQuestions = await knexConnection.transaction(async trx => {

      let query = trx.select('previous_year_question_papers.*').table('previous_year_question_papers')
        .orderBy('previous_year_question_papers.position', orderBy);


      if (req.query.search && req.query.search != '') {
        query.where('previous_year_question_papers.title', 'like', '%'.concat(req.query.search).concat('%'))
      }

      if ((!req.query.forList || req.query.listOnly)) {
        query = query.where('previous_year_question_papers.approved', true)
      }

      if ((!req.query.forList || req.query.listOnly)) {
        query.where('previous_year_question_papers.is_active', 1)
      }


      query.modify(function (queryBuilder) {
        queryBuilder.where(function () {
          this.where(function () {
            if (languages) {
              languages.map((id, i) => {
                this.orWhere('language_id', 'like', `%[${id}]%`).orWhere('language_id', 'like', `%,${id}]%`).orWhere('language_id', 'like', `%[${id},%`).orWhere('language_id', 'like', `%,${id},%`)
              }).orWhereIn('language_id', languages)
            }
          })
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
                this.orWhere('subject_ids', 'like', `%[${id}]%`).orWhere('subject_ids', 'like', `%,${id}]%`).orWhere('subject_ids', 'like', `%[${id},%`)
              })
            }
          })
          this.where(function () {
            if (chapterID) {
              chapterID.map((id, i) => {
                this.orWhere('chapter_ids', 'like', `%[${id}]%`).orWhere('chapter_ids', 'like', `%,${id}]%`).orWhere('chapter_ids', 'like', `%[${id},%`)
              })
            }
          })
          this.where(function () {

            if (languagesAccess && chapterAccess) {
              Object.keys(languagesAccess).map((id, i) => {
                id = parseInt(id)
                this.orWhere(function () {
                  this.where(function () {
                    this.where('chapter_ids', 'like', `%[${id}]%`).orWhere('chapter_ids', 'like', `%,${id}]%`).orWhere('chapter_ids', 'like', `%[${id},%`).orWhere('chapter_ids', 'like', `%,${id},%`)
                  }).where(function () {
                    languagesAccess[id].map((id, i) => {
                      this.orWhere('language_id', 'like', `%[${id}]%`).orWhere('language_id', 'like', `%,${id}]%`).orWhere('language_id', 'like', `%[${id},%`).orWhere('language_id', 'like', `%,${id},%`).orWhere('language_id', '=', `${id}`)
                    })
                  })
                })
              })
            }
            else if (languagesAccess) {
              Object.keys(languagesAccess).map((id, i) => {
                id = parseInt(id)
                this.orWhere(function () {
                  this.where(function () {
                    this.where('subject_ids', 'like', `%[${id}]%`).orWhere('subject_ids', 'like', `%,${id}]%`).orWhere('subject_ids', 'like', `%[${id},%`).orWhere('subject_ids', 'like', `%,${id},%`)
                  }).where(function () {
                    languagesAccess[id].map((id, i) => {
                      this.orWhere('language_id', 'like', `%[${id}]%`).orWhere('language_id', 'like', `%,${id}]%`).orWhere('language_id', 'like', `%[${id},%`).orWhere('language_id', 'like', `%,${id},%`).orWhere('language_id', '=', `${id}`)
                    })
                  })
                })
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
  }

  if (previousYearQuestions.data) {


    for (let i = 0; i < previousYearQuestions.data.length; i++) {

      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      previousYearQuestions.data[i].exams = await knexConnection.transaction(async trx => {
        return trx.table('exams').whereIn('id', JSON.parse(previousYearQuestions.data[i].exam_ids)).orderBy('position', 'ASC');
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      previousYearQuestions.data[i].courses = await knexConnection.transaction(async trx => {
        return trx.table('courses').whereIn('id', JSON.parse(previousYearQuestions.data[i].course_ids)).orderBy('position', 'ASC');
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      previousYearQuestions.data[i].subjects = await knexConnection.transaction(async trx => {
        return trx.table('subjects').whereIn('id', JSON.parse(previousYearQuestions.data[i].subject_ids)).orderBy('position', 'ASC');
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      previousYearQuestions.data[i].chapters = await knexConnection.transaction(async trx => {
        return trx.table('chapters').whereIn('id', JSON.parse(previousYearQuestions.data[i].chapter_ids)).orderBy('position', 'ASC');
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      knexConnection = require('knex')(knexConnectionConfig);

      let createdUser = await knexConnection.transaction(async trx => {
        return trx.select().table('users').where('id', previousYearQuestions.data[i].created_by).first();
      })

      previousYearQuestions.data[i].created_user = createdUser ? createdUser.first_name.concat(' ' + createdUser.last_name) : null;

      // Destrory process (to clean pool)
      knexConnection.destroy();
    }
  }


  if (previousYearQuestions.data && user && user.type != 'ADMIN' && !req.query.listOnly && !req.query.noLog) {
    let logged_data = {
      user_id: user.id,
      action: 'VIEW_ALL_DOCUMENTS',
      payload: JSON.stringify({
        field_name: 'previous_year_question_papers',
        ...req.query
      })
    }


    let logs = await createLog(logged_data)
  }

  previousYearQuestions.data = await replaceUploadsArray(previousYearQuestions.data, 'url');

  if (previousYearQuestions.data && user && user.type != 'ADMIN' && !req.query.forList) {

    for (let i = 0; i < previousYearQuestions.data.length; i++) {


      previousYearQuestions.data[i].locked = await checkPackage(req.headers['x-auth-token'], previousYearQuestions.data[i].subject_ids, previousYearQuestions.data[i].mode, 'previous-year-question-papers', null, previousYearQuestions.data[i].language_id, activeproducts, previousYearQuestions.data[i].chapter_ids)

      knexConnection = require('knex')(knexConnectionConfig);

      let createdUser = await knexConnection.transaction(async trx => {
        return trx.select().table('users').where('id', previousYearQuestions.data[i].created_by).first();
      })

      previousYearQuestions.data[i].created_user = createdUser ? createdUser.first_name.concat(' ' + createdUser.last_name) : null;

      // Destrory process (to clean pool)
      knexConnection.destroy();

    }
    previousYearQuestions.data = previousYearQuestions.data.filter(data => data.locked == false)
  }

  //
  let statusCode = previousYearQuestions.data ? 200 : 422;
  let response = {
    success: previousYearQuestions.data ? true : false,
    previousYearQuestions: previousYearQuestions.data,
    totalCount: totalCount,
    error: previousYearQuestions.error
  };


  // Send response
  res.status(statusCode).json(response);
}