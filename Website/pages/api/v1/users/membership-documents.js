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
    let orderBy = req.query.order_by ? req.query.order_by : 'ASC';
    let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
    let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;


    var subjectIDs = null;
    if (user && user.type == 'FACULTY' && user.subject_ids) {
        subjectIDs = user.subject_ids;
    }

    var totalCount = 0

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    let membershipDocuments = await knexConnection.transaction(async trx => {
        var query;

        query = trx.select('user_membership_doucuments.*', {
            'membership_title': 'memberships.title',
            'user_first_name': 'users.first_name',
            'user_last_name': 'users.last_name',
        }).table('user_membership_doucuments')
            .join('memberships', 'memberships.id', 'user_membership_doucuments.membership_id')
            .join('users', 'users.id', 'user_membership_doucuments.user_id')


            .orderBy('user_membership_doucuments.created_at', orderBy);

        if (req.query.search && req.query.search != '') {
            query.where('memberships.title', 'like', '%'.concat(req.query.search).concat('%'))
            .orWhere('users.first_name', 'like', '%'.concat(req.query.search).concat('%'))
            .orWhere('users.last_name', 'like', '%'.concat(req.query.search).concat('%'))
            .orWhere('users.mobile_number', 'like', '%'.concat(req.query.search).concat('%'))
            .orWhere('users.email', 'like', '%'.concat(req.query.search).concat('%'))
        }

        if (req.query.approved) {
            query.where('user_membership_doucuments.approved', req.query.approved)
        }

        totalCount = await query.clone().count();
        totalCount = totalCount[0]['count(*)'];

        query.groupBy('user_membership_doucuments.id')

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


    //
    let statusCode = membershipDocuments.data ? 200 : 422;
    let response = {
        success: membershipDocuments.data ? true : false,
        membershipDocuments: membershipDocuments.data,
        totalCount: totalCount,
        error: membershipDocuments.error,
    };

    res.status(statusCode).json(response);
}