import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch push Notification
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert push Notification
  if (!user) { restrictedAccess(res); return false; }

  // Filter
  let orderBy = req.query.order_by ? req.query.order_by : 'DESC';
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;
  let userID = req.query.userID ? Number.parseInt(req.query.userID) : null;

  let courseID = req.query.courseID ? req.query.courseID.split(',') : null;
  let productID = req.query.productID ? req.query.productID.split(',') : null;


  var totalCount = 0


  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let pushNotifications = await knexConnection.transaction(async trx => {

    let query;
    if (userID) {
      query = trx.select().table('push_notifications')
        .where('user_id', userID)
        .orderBy('id', orderBy);
    } else {
      query = trx.select('title', 'body', 'created_at', 'image').distinct('created_at').table('push_notifications').orderBy('id', orderBy);
    }

    query.modify(function (queryBuilder) {
      queryBuilder.where(function () {
        this.where(function () {
          if (productID) {
            productID.map((id, i) => {
              this.orWhere('product_ids', 'like', `%[${id}]%`).orWhere('product_ids', 'like', `%,${id}]%`).orWhere('product_ids', 'like', `%[${id},%`).orWhere('product_ids', 'like', `%,${id},%`)
            })
          }
        })
        this.where(function () {
          if (courseID) {
            courseID.map((id, i) => {
              this.orWhere('course_ids', 'like', `%[${id}]%`).orWhere('course_ids', 'like', `%,${id}]%`).orWhere('course_ids', 'like', `%[${id},%`).orWhere('course_ids', 'like', `%,${id},%`)
            })
          }
        })

      })
    })

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


  if (!userID && pushNotifications.data) {


    for (let i = 0; i < pushNotifications.data.length; i++) { // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      pushNotifications.data[i].userCount = await knexConnection.transaction(async trx => {

        let query;
        query = trx('push_notifications').countDistinct('user_id as count').where('created_at', pushNotifications.data[i].created_at);
        return query;
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      pushNotifications.data[i].userCount = pushNotifications.data[i].userCount ? pushNotifications.data[i].userCount[0].count : 0
    }
  }


  //
  let statusCode = pushNotifications.data ? 200 : 422;
  let response = {
    success: pushNotifications.data ? true : false,
    pushNotifications: pushNotifications.data,
    totalCount: totalCount,
    error: pushNotifications.error
  };

  res.status(statusCode).json(response);
}