import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, checkPackage, replaceUploadsArray, CourseID, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch schedule
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
  let productID = req.query.productID ? req.query.productID.split(',') : null;
  let batchID = req.query.batchID ? req.query.batchID.split(',') : null;

  var totalCount = 0

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch schedule from database
  let schedule = await knexConnection.transaction(async trx => {

    let query
    query = trx.select('demo_classes.*').table('demo_classes')
      .modify(function (queryBuilder) {
        if (productID) {
          queryBuilder.whereIn('demo_classes.product_id', productID)
        }
        if (batchID) {
          queryBuilder.whereIn('demo_classes.batch_id', batchID)
        }
        if (req.query.maxDate) {
          queryBuilder.max('demo_classes.scheduled_at')
        } else {
          queryBuilder.orderBy('demo_classes.id', orderBy)
        }
      })
      ;

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

let  maxdate= null

  if (schedule.data) {
    for (let i = 0; i < schedule.data.length; i++) {

      knexConnection = require('knex')(knexConnectionConfig);

      schedule.data[i].product = await knexConnection.transaction(async trx => {
        return trx.select().table('products').where('id', schedule.data[i].product_id).first();
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      knexConnection = require('knex')(knexConnectionConfig);

      schedule.data[i].user = await knexConnection.transaction(async trx => {
        return trx.select().table('users').where('id', schedule.data[i].user_id).first();
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      knexConnection = require('knex')(knexConnectionConfig);

      schedule.data[i].batch = await knexConnection.transaction(async trx => {
        return trx.select().table('batches').where('id', schedule.data[i].batch_id).first();
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      knexConnection = require('knex')(knexConnectionConfig);

      schedule.data[i].zoom_schedules = await knexConnection.transaction(async trx => {
        return trx.select().table('zoom_schedules').where('product_id', schedule.data[i].product_id).where('batch_id', schedule.data[i].batch_id).where('date', schedule.data[i].scheduled_at).first();
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      maxdate = schedule.data[i]['max(`demo_classes`.`scheduled_at`)']

    }
  }

  //
  let statusCode = schedule.data ? 200 : 422;
  let response = {
    success: schedule.data ? true : false,
    schedule: schedule.data,
    totalCount: totalCount,
    maxdate: maxdate,
    error: schedule.error
  };

  // Send response
  res.status(statusCode).json(response);
}