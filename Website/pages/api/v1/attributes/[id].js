import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Get attribute By ID
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert attribute
  if (!user) { restrictedAccess(res); return false; }

  // set attributes
  let id = req.query.id;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fatch attribute From Database
  let attribute = await knexConnection.transaction(async trx => {
    return trx.select().table('attributes').where('id', id).where('is_active', 1).first();
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

  if (attribute.data) {
    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    attribute.data.referances = await knexConnection.transaction(async trx => {
      return trx.table('attribute_referances').where('id', attribute.data.referance);
    })


    // Destrory process (to clean pool)
    knexConnection.destroy();

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    attribute.data.values = await knexConnection.transaction(async trx => {
      return trx.table('attribute_values').where('attribute_id', attribute.data.id);
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();
  }

  //
  let statusCode = attribute.data ? 200 : 422;
  let response = {
    success: attribute.data ? true : false,
    attribute: attribute.data,
    error: attribute.error
  };

  // Send Response
  res.status(statusCode).json(response);
}