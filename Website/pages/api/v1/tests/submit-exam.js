import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import slugify from 'slugify';
import { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Add new exam
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert exam
  // if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }

  // Validate request with rules
  let schema = Joi.object({
    test_id: Joi.number().required(),
    answers: Joi.allow(null),
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  params.user_id = user.id


  let answers = params.answers
  delete params.answers

  let wrongAnswerCount = 0
  let rightAnswerCount = 0
  let unattemptAnswerCount = 0
  let finalMarks = 0
  let marks = 0


  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch subject from database
  let exam = await knexConnection.transaction(async trx => {
    return trx.select().table('videos').where('id', params.test_id).first();

  })

  // Destrory process (to clean pool)
  knexConnection.destroy();

  if (exam) {

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fetch subject from database
    exam.questions = await knexConnection.transaction(async trx => {
      return trx.select().table('test_questions').where('test_id', exam.id);

    })

    // Destrory process (to clean pool)
    knexConnection.destroy();


    let questions = exam.questions
    questions.map(question => {
      if (question.id) {
        let qsn = answers.filter(answer => answer.question_id == question.id)

        if (qsn && qsn.length > 0) {
          qsn = qsn[0]

          if (qsn.answer == question.answer) {
            rightAnswerCount++
            qsn.result = 1
          } else {
            wrongAnswerCount++
            qsn.result = 0
          }
        } else {
          unattemptAnswerCount++;
        }

      }
    })



    params.wrong_answer_count = wrongAnswerCount
    params.right_answer_count = rightAnswerCount
    params.unattept_question_count = unattemptAnswerCount
    params.marks = (rightAnswerCount / (questions.length)) * 100
    params.final_marks = 100

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fetch subject from database
    let testComplete = await knexConnection.transaction(async trx => {
      return trx.insert(params).into('completed_tests');

    }).then(res => {
      return {
        id: res[0],
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


    if (testComplete) {

      answers = answers.filter(answer => answer.completed_test_id = testComplete.id)

      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      // Fetch subject from database
      let testCompleteData = await knexConnection.transaction(async trx => {
        return trx.insert(answers).into('completed_test_options');

      })

      // Destrory process (to clean pool)
      knexConnection.destroy();





    }



    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fetch subject from database
    let completeTest = await knexConnection.transaction(async trx => {
      return trx.select().table('completed_tests').where('test_id', exam.id).where('user_id', user.id).first();

    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    if (completeTest) {


      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      // Fetch subject from database
      completeTest.answers = await knexConnection.transaction(async trx => {
        return trx.select().table('completed_test_options').where('completed_test_id', completeTest.id);

      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

    }


    let status = completeTest ? 200 : 422

    let response = {
      success: completeTest ? true : false,
      completeTest: completeTest
    };

    // Send response
    res.status(status).json(response);

  } else {

    let response = {
      success: false,
      error: 'Exam Not Exist'
    };

    // Send response
    res.status(422).json(response);

  }


  // if (testComplete) {

  //   let response = {
  //     success: false,
  //     error: 'Exam Already Exist'
  //   };

  //   // Send response
  //   res.status(422).json(response);

  // }

}
