import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch exam
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert exam
  if (!user) { restrictedAccess(res); return false; }

  let totalCount = 0

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let attributereferances = await knexConnection.transaction(async trx => {
    var query;

    query = trx.select('attribute_referances.*').table('attribute_referances')

    totalCount = await query.clone().count();
    totalCount = totalCount[0]['count(*)'];

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
  let statusCode = attributereferances.data ? 200 : 422;
  let response = {
    success: attributereferances.data ? true : false,
    attributereferances: attributereferances.data,
    totalCount: totalCount,
    error: attributereferances.error,
  };

  res.status(statusCode).json(response);
}