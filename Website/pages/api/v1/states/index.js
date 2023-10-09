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

  let states = await knexConnection.transaction(async trx => {
    var query;
    query = trx.select('states.*').table('states').orderBy('states.id', 'ASC');

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
  let statusCode = states.data ? 200 : 422;
  let response = {
    success: states.data ? true : false,
    states: states.data,
    error: states.error
  };

  res.status(statusCode).json(response);
}
