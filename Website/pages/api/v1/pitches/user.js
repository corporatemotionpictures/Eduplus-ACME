import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog,  replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Get pitch By ID
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert pitch
  if (!user) { restrictedAccess(res); return false; }

  // set attributes
  let id = req.query.id;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fatch pitch From Database
  let pitch = await knexConnection.transaction(async trx => {
    return trx.select().table('pitches').where('user_id', user.id).first();
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

  if(pitch.data){
    
  pitch.data.file = await replaceUploads(pitch.data.file);
  pitch.data.elevator_video = await replaceUploads(pitch.data.elevator_video);
  }

  //
  let statusCode = pitch.data ? 200 : 422;
  let response = {
    success: pitch.data ? true : false,
    pitch: pitch.data,
    error: pitch.error
  };

  // Send Response
  res.status(statusCode).json(response);
}