import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch Bulk Sms
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert Bulk Sms
  if (!user) { restrictedAccess(res); return false; }

  // Filter
  let orderBy = req.query.order_by ? req.query.order_by : 'DESC';
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;
  let userID = req.query.userID ? Number.parseInt(req.query.userID) : null;


  var totalCount = 0

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let bulkSms = await knexConnection.transaction(async trx => {

    let query
    if (userID) {
      query = trx.select().table('send_sms')
        .where('user_id', userID)
        .orderBy('id', orderBy);
    } else {
      query = trx.select('message', 'created_at').table('send_sms')
        .distinct('created_at');
    }

    totalCount = await query.clone().countDistinct('created_at');
    totalCount = totalCount[0]['count(distinct `created_at`)'];

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
  });

  // Destrory process (to clean pool)
  knexConnection.destroy();

  //
  let statusCode = bulkSms.data ? 200 : 422;
  let response = {
    success: bulkSms.data ? true : false,
    bulkSms: bulkSms.data,
    totalCount: totalCount,
    error: bulkSms.error
  };


  res.status(statusCode).json(response);
}