import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch batches By ID
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user) { restrictedAccess(res); return false; }

  // Set attributes
  let id = req.query.id;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch batch from database
  let batch = await knexConnection.transaction(async trx => {
    return knexConnection.select(attributes, 'batches.*').table('batches')
      .where('batches.id', id)
      .where('batches.is_active', 1)
      .first();
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

  if (batch.data && user.type != 'ADMIN') {

    knexConnection = require('knex')(knexConnectionConfig);

    batch.data.faculty = await knexConnection.transaction(async trx => {
      return trx.select().table('users').where('id', batch.data.faculty_id).first();
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();


    knexConnection = require('knex')(knexConnectionConfig);

    batch.data.schedules = await knexConnection.transaction(async trx => {
      return trx.select().table('batch_schedules').where('batch_id', batch.data.id);
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

  }


  //
  let statusCode = batch.data ? 200 : 422;
  let response = {
    success: batch.data ? true : false,
    batch: batch.data,
    error: batch.error
  };

  // Send response
  res.status(statusCode).json(response);
}