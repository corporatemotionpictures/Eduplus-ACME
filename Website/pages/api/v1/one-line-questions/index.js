import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { fetchAll } from 'helpers/apiService';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, checkPackage, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch One Line Questions
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user) { restrictedAccess(res); return false; }

  // Filters
  let orderBy = req.query.order_by ? req.query.order_by : 'DESC';
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;
  let bankID = req.query.bankID ? Number.parseInt(req.query.bankID) : null;
  let notLimit = req.query.notLimit ? req.query.notLimit : null;

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

  var totalCount = 0

  var activeproducts = null;
  var languagesAccess = null;
   var chapterAccess = null;
  var accessable = true;
  var subjectIDs = null;
  if (user && user.type != 'ADMIN' && !req.query.forList) {
    activeproducts = await fetchAll('users/active-products', { field: "one-liner-questions", access: true, productID: req.query.productID, noLog: true }, req.headers['x-auth-token'])
    chapterAccess =activeproducts.access &&  activeproducts.access.chapterIDs.length > 0
    languagesAccess =activeproducts.access &&  activeproducts.access.languagesAccess
    subjectIDs =activeproducts.access &&  activeproducts.access.subjectIDs
  }


  let oneLineQuestions = {
    data: [],
    error: null
  }
  if (!languagesAccess || Object.keys(languagesAccess).length > 0) {
    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fetch One Line Questions from database
    oneLineQuestions = await knexConnection.transaction(async trx => {
      let query;
      if (bankID) {

        query = knexConnection.select(attributes, 'one_line_questions.*').table('one_line_questions')
          .innerJoin('question_banks', 'one_line_questions.bank_id', 'question_banks.id')
          .where('question_banks.id', bankID)
          .orderBy('one_line_questions.id', orderBy);
      } else {
        query = knexConnection.select(attributes, 'one_line_questions.*').table('one_line_questions')
          .innerJoin('question_banks', 'one_line_questions.bank_id', 'question_banks.id')
          .orderBy('one_line_questions.id', orderBy);
      }


      query.modify(function (queryBuilder) {
        queryBuilder.where(function () {

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

      if ((!req.query.forList || req.query.listOnly)) {
        query.where('question_banks.is_active', 1)
      }


      totalCount = await query.clone().count();
      totalCount = totalCount[0]['count(*)'];

      if (!notLimit) {
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
  }



  if (oneLineQuestions.data && user.type != 'ADMIN' && !req.query.forList) {

    for (let i = 0; i < oneLineQuestions.data.length; i++) {
      oneLineQuestions.data[i].locked = await checkPackage(req.headers['x-auth-token'], oneLineQuestions.data[i].subject_ids, 'PAID', 'one-liner-questions', null, oneLineQuestions.data[i].language_id, activeproducts, oneLineQuestions.data[i].chapter_ids)
    }

    oneLineQuestions.data = oneLineQuestions.data.filter(data => data.locked == false)

  }

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

  //
  let statusCode = oneLineQuestions.data ? 200 : 422;
  let response = {
    success: oneLineQuestions.data ? true : false,
    oneLineQuestions: oneLineQuestions.data,
    totalCount: totalCount,
    error: oneLineQuestions.error
  };

  // Send response
  res.status(statusCode).json(response);
}