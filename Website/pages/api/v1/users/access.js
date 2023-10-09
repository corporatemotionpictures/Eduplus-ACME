import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog,  replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed, jsonSafe } from 'helpers/api';

// Function to Get User By ID
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user) { restrictedAccess(res); return false; }

  // set attributes
  let id = req.query.id;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fatch user From Database
  let access = await knexConnection.transaction(async trx => {
    return trx.select().table('user_access').where('user_id', user.id).first();
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
  let statusCode = access.data ? 200 : 422;
  let response = {
    success: access.data ? true : false,
    access: jsonSafe(access.data),
    error: access.error
  };


  // Send Response
  res.status(statusCode).json(response);
}