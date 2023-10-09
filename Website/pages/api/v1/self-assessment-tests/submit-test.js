import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { v4 as uuidv4 } from 'uuid';
import { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';
import { text } from 'express';
import Cookies from 'cookies'

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


    let uuid = uuidv4();
    let userID = null

    if (user) {
        userID = user.id;
        params.user_id = userID
    }

    let answers = params.answers
    delete params.answers

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fetch subject from database
    let questions = await knexConnection.transaction(async trx => {
        return trx.select().table('self_assessment_tests').where('is_active', 1);

    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    for (let i = 0; i < questions.length; i++) {

        let question = questions[i]
        if (question.id) {

            if (userID) {
                answers = answers.filter(answer => answer.user_id = userID)
            }
            let qsn = answers.filter(answer => answer.question_id == question.id)

            if (qsn && qsn.length > 0) {
                qsn = qsn[0]


                // Create db process (get into pool)
                var knexConnection = require('knex')(knexConnectionConfig);

                let answer = await knexConnection.transaction(async trx => {
                    var query;

                    query = trx.select('self_assessment_options.*').table('self_assessment_options').where('test_id', qsn.question_id).where('option', qsn.answer).first()
                    return query;

                })


                // Destrory process (to clean pool)
                knexConnection.destroy();

                if (answer && answer.marks) {
                    qsn.marks = answer.marks
                }

                qsn.uuid = uuid;


                // Create db process (get into pool)
                var knexConnection = require('knex')(knexConnectionConfig);

                // Fetch subject from database
                let testCompleteData = await knexConnection.transaction(async trx => {
                    return trx.insert(qsn).into('self_assessment_results');

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
        return trx.select().table('self_assessment_results').where('uuid', uuid);

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

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fetch subject from database
    let completeTestSum = await knexConnection.transaction(async trx => {
        return trx.select().table('self_assessment_results').where('uuid', uuid).sum('marks').first();

    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    let finalMarks = completeTestSum ? completeTestSum['sum(`marks`)'] : 0


    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fetch subject from database
    let finalTestSum = await knexConnection.transaction(async trx => {
        return trx.select().table('self_assessment_tests').where('is_active', 1).sum('total_marks').first();

    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    let totalMarks = finalTestSum ? finalTestSum['sum(`total_marks`)'] : 0

    let status = completeTest ? 200 : 422

    if (!user) {

        // Create a cookies instance
        const cookies = new Cookies(req, res)

        cookies.set('selfAssessmentTestUuid', uuid, {
            httpOnly: true // true by default
        })
    }

    let response = {
        success: completeTest ? true : false,
        completeTest: completeTest,
        finalMarks: finalMarks,
        totalMarks: totalMarks,
    };

    // Send response
    res.status(status).json(response);
}
