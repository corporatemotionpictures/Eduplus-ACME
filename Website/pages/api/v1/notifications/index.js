import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';

import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch notifications
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user && user.type != 'ADMIN') { restrictedAccess(res); return false; }

  // Filters
  let orderBy = req.query.order_by ? req.query.order_by : 'DESC';

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch notifications from database
  let notifications = await knexConnection.transaction(async trx => {

    let query;
    let attributes;

    // If Fetch by  Course ID
    // 
    query = trx.select().table('admin_notifications')

      .where('viewed', 0)
      .orderBy('id', orderBy);

    if (req.body.userID) {
      query.where('reciever_id', req.body.userID)
    } else {
      query.where('reciever_id', user.id)
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

  if (notifications.data) {

    for (let i = 0; i < notifications.data.length; i++) {

      knexConnection = require('knex')(knexConnectionConfig);

      let createdUser = await knexConnection.transaction(async trx => {
        return trx.select().table('users').where('id', notifications.data[i].user_id).first();
      })

      notifications.data[i].user = createdUser ? createdUser : null;

      // Destrory process (to clean pool)
      knexConnection.destroy();

    }

    notifications.data = await replaceUploadsArray(notifications.data, 'image');

  }


  //
  let statusCode = notifications.data ? 200 : 422;
  let response = {
    success: notifications.data ? true : false,
    notifications: notifications.data,
    error: notifications.error
  };

  // Send Response
  res.status(statusCode).json(response);
}