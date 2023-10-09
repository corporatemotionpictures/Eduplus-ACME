import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch assessment
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert assessment
  // if (!user) { restrictedAccess(res); return false; }

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

  let assessmentTests = await knexConnection.transaction(async trx => {
    var query;

    query = trx.select('self_assessment_tests.*').table('self_assessment_tests')
      .orderBy('self_assessment_tests.position', orderBy);

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
      error: err.sqlMessage
    };
  })

  // Destrory process (to clean pool)
  knexConnection.destroy();

  if (assessmentTests.data) {
    for (let i = 0; i < assessmentTests.data.length; i++) {

      if (user && user.type != 'USER' && (!req.query.offLimit || req.query.offLimit == false)) {
        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        assessmentTests.data[i].options = await knexConnection.transaction(async trx => {
          var query;

          query = trx.select('self_assessment_options.*').table('self_assessment_options').where('test_id', assessmentTests.data[i].id)
          return query;

        })


        // Destrory process (to clean pool)
        knexConnection.destroy();
      }
      else {

        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        assessmentTests.data[i].options = await knexConnection.transaction(async trx => {
          var query;

          query = trx.select('self_assessment_options.option').table('self_assessment_options').where('test_id', assessmentTests.data[i].id).pluck('option')
          return query;

        })


        // Destrory process (to clean pool)
        knexConnection.destroy();

      }
    }
  }

  //
  let statusCode = assessmentTests.data ? 200 : 422;
  let response = {
    success: assessmentTests.data ? true : false,
    assessmentTests: assessmentTests.data,
    totalCount: totalCount,
    error: assessmentTests.error,
  };

  res.status(statusCode).json(response);
}