import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Get validitie By ID
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert validitie
  if (!user) { restrictedAccess(res); return false; }

  // set attributes
  let id = req.query.id;


  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fatch validitie From Database
  let validitie = await knexConnection.transaction(async trx => {
    return knexConnection.select('validities.*').table('validities').where('validities.id', id)
      .where('validities.is_active', 1).first();
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
  let statusCode = validitie.data ? 200 : 422;
  let response = {
    success: validitie.data ? true : false,
    validitie: validitie.data,
    error: validitie.error
  };

  // Send Response
  res.status(statusCode).json(response);
}