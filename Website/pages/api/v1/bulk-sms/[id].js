import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog,  replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Get bulk sms By ID
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert bulk sms
  if (!user) { restrictedAccess(res); return false; }

  // set attributes
  let id = req.query.id;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fatch bulk Sms From Database
  let bulkSms = await knexConnection.transaction(async trx => {
    return trx.select().table('send_sms').where('id', id).first();
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
  let statusCode = bulkSms.data ? 200 : 422;
  let response = {
    success: bulkSms.data ? true : false,
    bulkSms: bulkSms.data,
    error: bulkSms.error
  };

  // Destrory process (to clean pool)
  knexConnection.destroy();

  // Send Response
  res.status(statusCode).json(response);
}