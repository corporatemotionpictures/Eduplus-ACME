import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch Posts
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert Posts
  if (!user) { restrictedAccess(res); return false; }


  // Filter
  let orderBy = req.query.order_by ? req.query.order_by : 'DESC';
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let raiseTicket = await knexConnection.transaction(async trx => {

    return trx.select().table('tickets').offset(offset).limit(limit).orderBy('id', orderBy);

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

  //
  let statusCode = raiseTicket.data ? 200 : 422;
  let response = {
    success: raiseTicket.data ? true : false,
    raiseTickets: raiseTicket.data,
    error: raiseTicket.error
  };



  res.status(statusCode).json(response);
}