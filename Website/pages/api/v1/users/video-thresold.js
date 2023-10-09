import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed, jsonSafe } from 'helpers/api';

// Function to Get User By ID
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req, false);

  // Only ADMIN type of User allowed to insert course
  if (!user) { restrictedAccess(res); return false; }


  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fatch user From Database
  user = await knexConnection.transaction(async trx => {
    return trx.select().table('users').where('id', user.id).first();
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


  if (user.data) {
    user.data.image = await replaceUploads(user.data.image);
  }

  //
  let statusCode = user.data ? 200 : 422;
  let response = {
    success: user.data ? true : false,
    video_view_limit: user.data ? user.data.video_view_limit : 0,
    video_count: user.data ? user.data.video_count : 0,
    error: user.error
  };

  // Send Response
  res.status(statusCode).json(response);
}