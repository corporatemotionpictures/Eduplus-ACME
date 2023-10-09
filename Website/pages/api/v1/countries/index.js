import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, moneyfy, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch product_type
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert product_type
  // if (!user) { restrictedAccess(res); return false; }

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let countries = await knexConnection.transaction(async trx => {
    var query;
    query = trx.select('countries.*').table('countries').orderBy('countries.id', 'ASC');

    return query;

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
  let statusCode = countries.data ? 200 : 422;
  let response = {
    success: countries.data ? true : false,
    countries: countries.data,
    error: countries.error
  };

  res.status(statusCode).json(response);
}
