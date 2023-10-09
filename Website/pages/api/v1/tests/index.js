import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch exam
export default async function base(req, res) {

    // Only allowed GET only methods
    if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

    // Later parse User from JWT-header token 
    let user = await verifyToken(req);

    // Only ADMIN type of User allowed to insert exam
    if (!user) { restrictedAccess(res); return false; }

    // Filter
    let orderBy = req.query.order_by ? req.query.order_by : 'DESC';
    let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
    let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;
    let userID = req.query.userID ? req.query.userID.split(',') : null;


    var subjectIDs = null;
    if (user && user.type == 'FACULTY' && user.subject_ids) {
        subjectIDs = user.subject_ids;
    }

    var totalCount = 0


    // Set Attributes
    let attributes = {
        user_id: 'users.id',
        first_name: 'users.first_name',
        last_name: 'users.last_name',
        email: 'users.email',
        mobile_number: 'users.mobile_number'
    };

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    let completedTests = await knexConnection.transaction(async trx => {
        var query;

        query = trx.select('completed_tests.*', 'videos.title', attributes).table('completed_tests')
            .join('videos', 'completed_tests.test_id', 'videos.id')
            .innerJoin('users', 'completed_tests.user_id', 'users.id')
            .orderBy('completed_tests.id', orderBy);

        if (req.query.search && req.query.search != '') {
            query.where('videos.title', 'like', '%'.concat(req.query.search).concat('%'))
        }

        if (userID) {
            query.where('completed_tests.user_id', userID)
        }

        if ((!req.query.forList || req.query.listOnly)) {
            query.where('videos.is_active', 1)
        }

        // For Filter
        query.modify(function (queryBuilder) {
            queryBuilder.where(function () {

                this.where(function () {
                    if (subjectIDs) {
                        subjectIDs.map((id, i) => {
                            this.orWhere('videos.subject_ids', 'like', `%[${id}]%`).orWhere('videos.subject_ids', 'like', `%,${id}]%`).orWhere('videos.subject_ids', 'like', `%[${id},%`).orWhere('videos.subject_ids', 'like', `%,${id},%`)
                        })
                    }
                })

            })
        })

        totalCount = await query.clone().count();
        totalCount = totalCount[0]['count(*)'];

        query.groupBy('completed_tests.id')

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


    if (completedTests && completedTests.data) {
        for (let i = 0; i < completedTests.data.length; i++) {

            // Create db process (get into pool)
            knexConnection = require('knex')(knexConnectionConfig);

            completedTests.data[i].testQuestions = await knexConnection.transaction(async trx => {
                return trx.table('test_questions').where('test_id', completedTests.data[i].id).orderBy('id', 'ASC');
            })


            // Destrory process (to clean pool)
            knexConnection.destroy();
        }
    }




    //
    let statusCode = completedTests.data ? 200 : 422;
    let response = {
        success: completedTests.data ? true : false,
        completedTests: completedTests.data,
        totalCount: totalCount,
        error: completedTests,
    };

    res.status(statusCode).json(response);
}