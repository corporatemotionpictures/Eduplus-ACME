import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import slugify from 'slugify';
import { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';
import { text } from 'express';

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
        // test_id: Joi.number().required(),
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


    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fetch subject from database
    let questions = await knexConnection.transaction(async trx => {
        return trx.select().table('assessment_tests').where('is_active', 1);

    })

    // Destrory process (to clean pool)
    knexConnection.destroy();



    for (let i = 0; i < questions.length; i++) {

        let question = questions[i]
        if (question.id) {
            answers = answers.filter(answer => answer.user_id = user.id)
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

                // Create db process (get into pool)
                var knexConnection = require('knex')(knexConnectionConfig);

                // Fetch subject from database
                let testCompleteData = await knexConnection.transaction(async trx => {
                    return trx.insert(qsn).into('assessment_results');

                })

                // Destrory process (to clean pool)
                knexConnection.destroy();
            }

        }
    }



    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fetch subject from database
    let completeTest = await knexConnection.transaction(async trx => {
        return trx.select().table('assessment_results').where('user_id', user.id);

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

    let rightAnswer = 0
    let totalQuestions = questions.length
    if (completeTest && completeTest.data) {
        let rightAnswers = completeTest.data.filter(test => test.result == 1)
        rightAnswer = rightAnswers.length
    }


    let status = completeTest ? 200 : 422

    let response = {
        success: completeTest ? true : false,
        completeTest: completeTest,
        rightAnswer: rightAnswer,
        totalQuestions: totalQuestions,
    };

    // Send response
    res.status(status).json(response);
}
