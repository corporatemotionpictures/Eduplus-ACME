import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Get announcement By ID
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert announcement
  if (!user) { restrictedAccess(res); return false; }

  // set attributes
  let id = req.query.id;


  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fatch announcement From Database
  let announcement = await knexConnection.transaction(async trx => {
    return knexConnection.select('announcements.*').table('announcements').where('announcements.id', id)
      .where('announcements.is_active', 1).first();
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

  //
  let statusCode = announcement.data ? 200 : 422;
  let response = {
    success: announcement.data ? true : false,
    announcement: announcement.data ? announcement.data : [],
    error: announcement.error
  };

  // Send Response
  res.status(statusCode).json(response);
}