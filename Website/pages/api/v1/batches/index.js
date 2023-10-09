import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, checkPackage, replaceUploadsArray, CourseID, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch batches
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user) { restrictedAccess(res); return false; }

  // Filters
  let orderBy = req.query.order_by ? req.query.order_by : 'ASC';
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;
  let facultyID = req.query.facultyID ? req.query.facultyID.split(',') : null;

  var totalCount = 0

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch batches from database
  let batches = await knexConnection.transaction(async trx => {

    let query
    query = trx.select('batches.*').table('batches').where('batches.is_active', 1)
      .modify(function (queryBuilder) {
        if (facultyID) {
          queryBuilder.whereIn('batches.faculty_id', facultyID)
        }
      })
      .orderBy('batches.position', orderBy);


    if ((!req.query.forList || req.query.listOnly)) {
      query = query.where('batches.approved', 1)
    }

    totalCount = await query.clone().count();
    totalCount = totalCount[0]['count(*)'];

    if (!req.query.offLimit || req.query.offLimit == false) {
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



  if (batches.data) {
    for (let i = 0; i < batches.data.length; i++) {

      knexConnection = require('knex')(knexConnectionConfig);

      batches.data[i].faculty = await knexConnection.transaction(async trx => {
        return trx.select().table('users').where('id', batches.data[i].faculty_id).first();
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      knexConnection = require('knex')(knexConnectionConfig);

      batches.data[i].schedules = await knexConnection.transaction(async trx => {
        return trx.select().table('batch_schedules').where('batch_id', batches.data[i].id);
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();


    }
  }

  //
  let statusCode = batches.data ? 200 : 422;
  let response = {
    success: batches.data ? true : false,
    batches: batches.data,
    totalCount: totalCount,
    error: batches.error
  };

  // Send response
  res.status(statusCode).json(response);
}