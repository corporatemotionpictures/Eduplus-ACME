import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { fetchAll } from 'helpers/apiService';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, checkPackage, verifyToken, CourseID, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';
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
  let examID = req.query.examID ? req.query.examID.split(',') : null;
  let courseID = req.query.courseID ? req.query.courseID.split(',') : null;
  let subjectID = req.query.subjectID ? req.query.subjectID.split(',') : null;
  let chapterID = req.query.chapterID ? req.query.chapterID.split(',') : null;
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : null;
  let batchIds = req.query.batchIDs ? req.query.batchIDs : null;

  var subjectIDs = null;
  if (user && user.type == 'FACULTY' && user.subject_ids) {
    subjectIDs = user.subject_ids;
  }

  var activeproducts = null;
  var languagesAccess = null;
   var chapterAccess = null;
  var accessable = true;
  if (user && user.type != 'ADMIN' && !req.query.forList) {
    activeproducts = await fetchAll('users/active-products', { field: "one-liner-questions", access: true, productID: req.query.productID, noLog: true }, req.headers['x-auth-token'])
    chapterAccess = activeproducts.access && activeproducts.access.chapterIDs.length > 0
    languagesAccess = activeproducts.access && activeproducts.access.languagesAccess
  }

  let bankIDs = {
    data: [],
    error: null
  }
  if (!languagesAccess || Object.keys(languagesAccess).length > 0) {// Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fetch Question Bank From database
    bankIDs = await knexConnection.transaction(async trx => {
      let query;

      query = trx.select('question_banks.*').table('question_banks').pluck('id')


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
          this.where(function () {

            if (languagesAccess && chapterAccess) {
              Object.keys(languagesAccess).map((id, i) => {
                id = parseInt(id)
                this.orWhere(function () {
                  this.where(function () {
                    this.where('chapter_ids', 'like', `%[${id}]%`).orWhere('chapter_ids', 'like', `%,${id}]%`).orWhere('chapter_ids', 'like', `%[${id},%`).orWhere('chapter_ids', 'like', `%,${id},%`)
                  }).whereIn('language_id', languagesAccess[id])
                })
              })
            }
            else if (languagesAccess) {
              Object.keys(languagesAccess).map((id, i) => {
                id = parseInt(id)
                this.orWhere(function () {
                  this.where(function () {
                    this.where('subject_ids', 'like', `%[${id}]%`).orWhere('subject_ids', 'like', `%,${id}]%`).orWhere('subject_ids', 'like', `%[${id},%`).orWhere('subject_ids', 'like', `%,${id},%`)
                  }).whereIn('language_id', languagesAccess[id])
                })
              })
            }
          })
        })
      })

      return query;

    });

    // Destrory process (to clean pool)
    knexConnection.destroy();
  }

  // Set attributes
  let attributes = {
    bank_id: 'question_banks.id',
    bank_name: 'question_banks.name',
    exam_ids: 'question_banks.exam_ids',
    course_ids: 'question_banks.course_ids',
    subject_ids: 'question_banks.subject_ids',
    chapter_ids: 'question_banks.chapter_ids',
    language_id: 'question_banks.language_id',
  };


  // Create db process (get into pool)
  knexConnection = require('knex')(knexConnectionConfig);

  // Fetch one_line_question from database
  let oneLineQuestions = await knexConnection.transaction(async trx => {
    return trx.select('one_line_questions.*', attributes).table('one_line_questions')
      .innerJoin('question_banks', 'one_line_questions.bank_id', 'question_banks.id')
      .whereIn('one_line_questions.bank_id', bankIDs)
      .orderBy('one_line_questions.id', orderBy).offset(offset).limit(limit);
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


  if (oneLineQuestions.data && user && user.type != 'ADMIN' && !req.query.listOnly && !req.query.noLog) {
    let logged_data = {
      user_id: user.id,
      action: 'VIEW_ALL_ONE_LINER_QUESTIONS',
      payload: JSON.stringify({
        field_name: 'one_liner_questions',
        ...req.query
      })
    }


    let logs = await createLog(logged_data)
  }

  if (oneLineQuestions.data && user.type != 'ADMIN' && !req.query.forList) {

    for (let i = 0; i < oneLineQuestions.data.length; i++) {

      oneLineQuestions.data[i].locked = await checkPackage(req.headers['x-auth-token'], oneLineQuestions.data[i].subject_ids, 'PAID', 'one-liner-questions', null, oneLineQuestions.data[i].language_id, activeproducts, oneLineQuestions.data[i].chapter_ids)

    }
    oneLineQuestions.data = oneLineQuestions.data.filter(data => data.locked == false)
  }

  //
  let statusCode = oneLineQuestions.data ? 200 : 422;
  let response = {
    success: oneLineQuestions.data ? true : false,
    oneLineQuestions: oneLineQuestions.data,
    error: oneLineQuestions.error
  };

  // Send Response
  res.status(statusCode).json(response);
}
