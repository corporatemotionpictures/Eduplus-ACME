import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import slugify from 'slugify';
import { getOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Add new exam
export default async function base(req, res) {

    // Only allowed POST only methods
    if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

    // Later parse User from JWT-header token 
    let user = await verifyToken(req);

    // Only ADMIN type of User allowed to insert exam
    // if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }

    let id = req.query.test_id

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fetch subject from database
    let completeTest = await knexConnection.transaction(async trx => {
        let query = trx.select().table('completed_tests').where('test_id', id).first();
        if (req.query.userID) {
            query = query.where('user_id', req.query.userID)
        } else {
            query = query.where('user_id', user.id)
        }

        return query;

    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fetch subject from database
    let totalQuestions = await knexConnection.transaction(async trx => {
        return trx.select().table('test_questions').where('test_id', id);

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


        for (let i = 0; i < completeTest.answers.length; i++) {

            // Create db process (get into pool)
            var knexConnection = require('knex')(knexConnectionConfig);

            // Fetch subject from database
            completeTest.answers[i].question = await knexConnection.transaction(async trx => {
                return trx.select().table('test_questions').where('id', completeTest.answers[i].question_id).first();

            })

            // Destrory process (to clean pool)
            knexConnection.destroy();
        }

    }

    
    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fetch subject from database
    let test = await knexConnection.transaction(async trx => {
        return trx.select().table('videos').where('id', id).first();

    })

    // Destrory process (to clean pool)
    knexConnection.destroy();


    let status = completeTest ? 200 : 422

    let response = {
        success: completeTest ? true : false,
        completeTest: completeTest,
        test: test,
        totalQuestions: totalQuestions,
    };

    // Send response
    res.status(status).json(response);

}
