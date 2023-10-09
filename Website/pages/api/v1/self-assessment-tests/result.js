import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';
import Cookies from 'cookies'

// Function to Fetch self_assessment_result
export default async function base(req, res) {

    // Only allowed GET only methods
    if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

    // Later parse User from JWT-header token 
    let user = await verifyToken(req);

    // Only ADMIN type of User allowed to insert self_assessment_result
    // if (!user) { restrictedAccess(res); return false; }

    // Filter
    let orderBy = req.query.order_by ? req.query.order_by : 'ASC';
    let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
    let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;
    let userID = req.query.userID ? req.query.userID : null;
    let uuid = null
    let access = true

    if (!userID && user && (user.type == 'USER' || req.query.offLimit) ) {
        userID = user.id
    }

    if (!userID && !user) {

        // Create a cookies instance
        const cookies = new Cookies(req, res)
        let selfAssessmentTestUuid = cookies.get('selfAssessmentTestUuid')

        console.log(selfAssessmentTestUuid)

        if (selfAssessmentTestUuid && selfAssessmentTestUuid != undefined) {
            uuid = selfAssessmentTestUuid
        } else {
            access = false
        }
    }


    // Set attributes
    let attributes = {
        question: 'self_assessment_tests.question',
    };



    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fetch subject from database
    let questions = await knexConnection.transaction(async trx => {
        return trx.select().table('self_assessment_tests').where('is_active', 1);

    })

    // Destrory process (to clean pool)
    knexConnection.destroy();


    var totalCount = 0


    let assessmentResults = {
        data: []
    };

    if (access) {
        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        assessmentResults = await knexConnection.transaction(async trx => {
            var query;

            query = trx.select('uuid', 'user_id').table('self_assessment_results').groupBy('self_assessment_results.uuid').orderBy('self_assessment_results.id', orderBy)
            if (userID) {
                query = query.where('user_id', userID)
            }
            if (uuid) {
                query = query.where('uuid', uuid)
            }


            totalCount = await query.clone().count();
            totalCount = totalCount[0]['count(*)'];

            if (user && user.type != 'USER' && (!req.query.offLimit || req.query.offLimit == false)) {
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

        console.log(assessmentResults)
    }



    if (assessmentResults.data) {

        for (let i = 0; i < assessmentResults.data.length; i++) {

            var knexConnection = require('knex')(knexConnectionConfig);

            assessmentResults.data[i].tests = await knexConnection.transaction(async trx => {
                var query;

                query = trx.select('self_assessment_results.*', attributes).table('self_assessment_results')
                    .join('self_assessment_tests', 'self_assessment_tests.id', 'self_assessment_results.question_id')
                    .where('self_assessment_results.uuid', assessmentResults.data[i].uuid);
                return query;

            })

            // Destrory process (to clean pool)
            knexConnection.destroy();


            // Create db process (get into pool)
            var knexConnection = require('knex')(knexConnectionConfig);

            // Fetch subject from database
            let completeTestSum = await knexConnection.transaction(async trx => {
                return trx.select().table('self_assessment_results').where('uuid', assessmentResults.data[i].uuid).sum('marks').first();

            })

            // Destrory process (to clean pool)
            knexConnection.destroy();

            assessmentResults.data[i].finalMarks = completeTestSum ? completeTestSum['sum(`marks`)'] : 0

            assessmentResults.data[i].totalQuestions = questions.length


            // Create db process (get into pool)
            var knexConnection = require('knex')(knexConnectionConfig);

            // Fetch subject from database
            let finalTestSum = await knexConnection.transaction(async trx => {
                return trx.select().table('self_assessment_tests').where('is_active', 1).sum('total_marks').first();

            })

            // Destrory process (to clean pool)
            knexConnection.destroy();

            assessmentResults.data[i].totalMarks = finalTestSum ? finalTestSum['sum(`total_marks`)'] : 0

            if (assessmentResults.data[i].user_id) {

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

            }


            for (let j = 0; j < assessmentResults.data[i].tests.length; j++) {

                var knexConnection = require('knex')(knexConnectionConfig);

                assessmentResults.data[i].tests[j].question = await knexConnection.transaction(async trx => {
                    var query;

                    query = trx.select('self_assessment_tests.*').table('self_assessment_tests')
                        .where('self_assessment_tests.id', assessmentResults.data[i].tests[j].question_id)
                        .first();
                    return query;

                })

                // Destrory process (to clean pool)
                knexConnection.destroy();
            }

        }
    }

    let result = assessmentResults.data


    if ((userID || uuid) && result && result.length > 0) {
        result = result[0]
    }




    //
    let statusCode = result ? 200 : 422;
    let response = {
        success: result ? true : false,
        assessmentResults: result ? result : [],
        error: assessmentResults.error,
        totalCount: totalCount,
    };

    res.status(statusCode).json(response);
}