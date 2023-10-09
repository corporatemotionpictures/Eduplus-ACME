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

  var totalCount = 0

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let pitches = await knexConnection.transaction(async trx => {
    var query;

    query = trx.select('pitches.*').table('pitches')
      .orderBy('pitches.id', orderBy);

    totalCount = await query.clone().count();
    totalCount = totalCount[0]['count(*)'];

    query.groupBy('pitches.id')

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

  if (pitches.data) {
    pitches.data = await replaceUploadsArray(pitches.data, 'file');
    pitches.data = await replaceUploadsArray(pitches.data, 'elevator_video');
  }

  
  if (pitches.data) {
    for (let i = 0; i < pitches.data.length; i++) {

      knexConnection = require('knex')(knexConnectionConfig);

      let user = await knexConnection.transaction(async trx => {
        return trx.select().table('users').where('id', pitches.data[i].user_id).first();
      })

      pitches.data[i].user = user ? user : null;

      // Destrory process (to clean pool)
      knexConnection.destroy();

    }
  }



  //
  let statusCode = pitches.data ? 200 : 422;
  let response = {
    success: pitches.data ? true : false,
    pitches: pitches.data,
    totalCount: totalCount,
    error: pitches.error,
  };

  res.status(statusCode).json(response);
}