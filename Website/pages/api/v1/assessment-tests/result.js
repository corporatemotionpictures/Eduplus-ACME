import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch assessment_result
export default async function base(req, res) {

    // Only allowed GET only methods
    if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

    // Later parse User from JWT-header token 
    let user = await verifyToken(req);

    // Only ADMIN type of User allowed to insert assessment_result
    // if (!user) { restrictedAccess(res); return false; }

    // Filter
    let orderBy = req.query.order_by ? req.query.order_by : 'ASC';
    let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
    let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;
    let userID = req.query.userID ? req.query.userID.split(',') : null;


    // Set attributes
    let attributes = {
        question: 'assessment_tests.question',
        right_answer: 'assessment_tests.right_answer',
    };


    
    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fetch subject from database
    let questions = await knexConnection.transaction(async trx => {
        return trx.select().table('assessment_tests').where('is_active', 1);

    })

    // Destrory process (to clean pool)
    knexConnection.destroy();


    var totalCount = 0

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    let assessmentResults = await knexConnection.transaction(async trx => {
        var query;

        query = trx.select('user_id').table('assessment_results').groupBy('assessment_results.user_id').orderBy('assessment_results.id', orderBy)
        if (userID) {
            query = query.where('user_id', userID)
        }


        totalCount = await query.clone().count();
        totalCount = totalCount[0]['count(*)'];

        if (user.type != 'USER' && (!req.query.offLimit || req.query.offLimit == false)) {
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


    if (assessmentResults.data) {

        for (let i = 0; i < assessmentResults.data.length; i++) {

            var knexConnection = require('knex')(knexConnectionConfig);

            assessmentResults.data[i].tests = await knexConnection.transaction(async trx => {
                var query;

                query = trx.select('assessment_results.*', attributes).table('assessment_results')
                    .join('assessment_tests', 'assessment_tests.id', 'assessment_results.question_id')
                    .where('assessment_results.user_id', assessmentResults.data[i].user_id);
                return query;

            })

            // Destrory process (to clean pool)
            knexConnection.destroy();


            let rightAnswers = assessmentResults.data[i].tests.filter(test => test.result == 1)
            assessmentResults.data[i].rightAnswer = rightAnswers.length
            assessmentResults.data[i].totalQuestions = questions.length

            var knexConnection = require('knex')(knexConnectionConfig);

            assessmentResults.data[i].user = await knexConnection.transaction(async trx => {
                var query;

                query = trx.select('users.first_name', 'users.last_name', 'users.mobile_number', 'users.email', 'users.image', 'users.id').table('users')
                    .where('users.id', assessmentResults.data[i].user_id)
                    .first();
                return query;

            })

            // Destrory process (to clean pool)
            knexConnection.destroy();


            for (let j = 0; j < assessmentResults.data[i].tests.length; j++) {

                var knexConnection = require('knex')(knexConnectionConfig);

                assessmentResults.data[i].tests[j].question = await knexConnection.transaction(async trx => {
                    var query;

                    query = trx.select('assessment_tests.*').table('assessment_tests')
                        .where('assessment_tests.id', assessmentResults.data[i].tests[j].question_id)
                        .first();
                    return query;

                })

                // Destrory process (to clean pool)
                knexConnection.destroy();
            }

        }
    }


    //
    let statusCode = assessmentResults.data ? 200 : 422;
    let response = {
        success: assessmentResults.data ? true : false,
        assessmentResults: assessmentResults.data ? assessmentResults.data : [],
        totalCount: totalCount,
        error: assessmentResults.error,
    };

    res.status(statusCode).json(response);
}