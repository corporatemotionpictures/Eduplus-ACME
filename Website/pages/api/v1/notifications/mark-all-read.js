import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Function to Update chapter
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user && user.type != 'ADMIN') { restrictedAccess(res); return false; }

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Update chapter in database
  let notification = await knexConnection.transaction(async trx => {
    return trx('admin_notifications').where('reciever_id', user.id).update('viewed', 1);
  }).then(res => {
    return {
      id: res,
      error: null
    };
  }).catch(err => {
    return {
      id: null,
      error: err.sqlMessage
    };
  })

  //
  let statusCode = notification.id ? 200 : 422;
  let response = {
    success: notification.id ? true : false,
    'notification': notification
  };

  // Destrory process (to clean pool)
  knexConnection.destroy();

  // Send response
  res.status(statusCode).json(response);

}