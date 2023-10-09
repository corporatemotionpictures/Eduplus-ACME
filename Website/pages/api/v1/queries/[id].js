import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog,  replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Get query By ID
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert query
  if (!user) { restrictedAccess(res); return false; }

  // set attributes
  let id = req.query.id;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fatch query From Database
  let query = await knexConnection.transaction(async trx => {
    return trx.select().table('queries').where('id', id).first();
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

  if(query.data){
    
  query.data.file = await replaceUploads(query.data.file);
  query.data.elevator_video = await replaceUploads(query.data.elevator_video);
  }

  //
  let statusCode = query.data ? 200 : 422;
  let response = {
    success: query.data ? true : false,
    query: query.data,
    error: query.error
  };

  // Send Response
  res.status(statusCode).json(response);
}