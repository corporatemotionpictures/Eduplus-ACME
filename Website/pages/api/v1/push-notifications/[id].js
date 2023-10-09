import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog,  replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Get push Notification By ID
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert push Notification
  if (!user) { restrictedAccess(res); return false; }

  // set attributes
  let id = req.query.id;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fatch pushNotification From Database
  let pushNotification = await knexConnection.transaction(async trx => {
    return trx.select().table('push_notifications').where('id', id).first();
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
  let statusCode = pushNotification.data ? 200 : 422;
  let response = {
    success: pushNotification.data ? true : false,
    pushNotification: pushNotification.data,
    error: pushNotification.error
  };

  // Destrory process (to clean pool)
  knexConnection.destroy();

  // Send Response
  res.status(statusCode).json(response);
}