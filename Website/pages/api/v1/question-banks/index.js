import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, CourseID, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';
import fetch from 'isomorphic-unfetch';

// Function to Fetch question banks
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user) { restrictedAccess(res); return false; }

  // Filter
  let orderBy = req.query.order_by ? req.query.order_by : 'DESC';
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;
  let examID = req.query.examID ? req.query.examID.split(',') : null;
  let courseID = req.query.courseID ? req.query.courseID.split(',') : null;
  let subjectID = req.query.subjectID ? req.query.subjectID.split(',') : null;
  let chapterID = req.query.chapterID ? req.query.chapterID.split(',') : null;
  let batchIds = req.query.batchIDs ? req.query.batchIDs : null;
  let languages = req.query.languages ? req.query.languages.split(',') : null;

  var subjectIDs = null;
  if (user && user.type == 'FACULTY' && user.subject_ids) {
    subjectIDs = user.subject_ids;
  }


  var totalCount = 0

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch Question Bank From database
  let questionBanks = await knexConnection.transaction(async trx => {
    let query;


    // 
    query = trx.select('question_banks.*').table('question_banks')
      .orderBy('question_banks.position', orderBy);


    if ((!req.query.forList || req.query.listOnly)) {
      query = query.where('question_banks.approved', true)
    }
    if (languages) {
      query = query.whereIn('question_banks.language_id', languages)
    }

    if ((!req.query.forList || req.query.listOnly)) {
      query = query.where('question_banks.approved', true)
    }

    if (req.query.search && req.query.search != '') {
      query.where('question_banks.name', 'like', '%'.concat(req.query.search).concat('%'))
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
  })

  // Destrory process (to clean pool)
  knexConnection.destroy();
  if (questionBanks.data) {

    for (let i = 0; i < questionBanks.data.length; i++) {

      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      questionBanks.data[i].exams = await knexConnection.transaction(async trx => {
        return trx.table('exams').whereIn('id', JSON.parse(questionBanks.data[i].exam_ids)).orderBy('position', 'ASC');
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      questionBanks.data[i].courses = await knexConnection.transaction(async trx => {
        return trx.table('courses').whereIn('id', JSON.parse(questionBanks.data[i].course_ids)).orderBy('position', 'ASC');
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      questionBanks.data[i].subjects = await knexConnection.transaction(async trx => {
        return trx.table('subjects').whereIn('id', JSON.parse(questionBanks.data[i].subject_ids)).orderBy('position', 'ASC');
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      questionBanks.data[i].chapters = await knexConnection.transaction(async trx => {
        return trx.table('chapters').whereIn('id', JSON.parse(questionBanks.data[i].chapter_ids)).orderBy('position', 'ASC');
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      knexConnection = require('knex')(knexConnectionConfig);

      let createdUser = await knexConnection.transaction(async trx => {
        return trx.select().table('users').where('id', questionBanks.data[i].created_by).first();
      })

      questionBanks.data[i].created_user = createdUser ? createdUser.first_name.concat(' ' + createdUser.last_name) : null;

      // Destrory process (to clean pool)
      knexConnection.destroy();

      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      questionBanks.data[i].questions = await knexConnection.transaction(async trx => {
        return trx.table('one_line_questions').where('bank_id', questionBanks.data[i].id);
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

    }
  }

  if (questionBanks.data && user && user.type != 'ADMIN' && !req.query.listOnly && !req.query.noLog) {
    let logged_data = {
      user_id: user.id,
      action: 'VIEW_ALL_ONE_LINER_QUESTIONs',
      payload: JSON.stringify({
        field_name: 'question_banks',
        ...req.query
      })
    }


    let logs = await createLog(logged_data)
  }

  //
  let statusCode = questionBanks.data ? 200 : 422;
  let response = {
    success: questionBanks.data ? true : false,
    questionBanks: questionBanks.data,
    totalCount: totalCount,
    error: questionBanks.error
  };



  // Send Response
  res.status(statusCode).json(response);
}


const intersect = (arrayA, arrayB) => {
  return arrayA.filter(elem => arrayB.includes(elem));
};