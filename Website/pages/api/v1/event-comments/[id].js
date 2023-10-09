import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog,  replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch event_comments By ID
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert event_comments
  if (!user) { restrictedAccess(res); return false; }

  // Set attributes
  let id = req.query.id;
  // Set attributes
  let attributes = {
    user_first_name: 'users.first_name',
    user_last_name: 'users.last_name',
    user_image: 'users.image'
  };

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch event from database
  let comment = await knexConnection.transaction(async trx => {
    return knexConnection.select(attributes, 'event_comments.*').table('event_comments')
      .innerJoin('events', 'event_comments.event_id', 'events.id')
      .innerJoin('users', 'event_comments.user_id', 'users.id')
      .where('event_comments.id', id).first();
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


  //
  let statusCode = comment.data ? 200 : 422;
  let response = {
    success: comment && comment.data ? true : false,
    comment: comment && comment.data,
    error: comment && comment.error
  };

  // Destrory process (to clean pool)
  knexConnection.destroy();

  // Send response
  res.status(statusCode).json(response);
}