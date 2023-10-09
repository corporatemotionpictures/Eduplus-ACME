import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Get Course By ID
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

  // Fatch Course From Database
  let tax = await knexConnection.transaction(async trx => {
    return trx.select('taxes.*').table('taxes').where('taxes.id', id)
      .where('taxes.is_active', 1).first();
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

  if (tax.data) {
    taxes.data.monyfiedAmount = await moneyfy(taxes.data.amount, taxes.data.amount_type)

  }

  //
  let statusCode = tax.data ? 200 : 422;
  let response = {
    success: tax.data ? true : false,
    tax: tax.data,
    error: tax.error
  };

  // Send Response
  res.status(statusCode).json(response);
}