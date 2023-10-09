import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, checkPackage, replaceUploadsArray, CourseID, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch days
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

  var totalCount = 0

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch days from database
  let days = await knexConnection.transaction(async trx => {

    let query
    query = trx.select('days.*').table('days')
      .orderBy('days.id', orderBy);

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


  //
  let statusCode = days.data ? 200 : 422;
  let response = {
    success: days.data ? true : false,
    days: days.data,
    totalCount: totalCount,
    error: days.error
  };

  // Send response
  res.status(statusCode).json(response);
}