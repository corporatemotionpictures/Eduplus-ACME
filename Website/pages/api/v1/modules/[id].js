import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Get module By ID
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert module
  if (!user) { restrictedAccess(res); return false; }

  // set attributes
  let id = req.query.id;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fatch module From Database
  let module = await knexConnection.transaction(async trx => {
    return trx.select('modules.*').table('modules').where('modules.id', id)
      .where('modules.is_active', 1).first();
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


  if (module.data) {
    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    module.data.items = await knexConnection.transaction(async trx => {
      return trx.table('modules').where('parent_id', module.data.id).orderBy('modules.position', orderBy);
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();


    if (module.data.parent_id) {

      // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);

      module.data.parent = await knexConnection.transaction(async trx => {
        return trx.table('modules').where('id', module.data.parent_id).first();
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();
    }

    if (module.data.items) {
      for (let j = 0; j < module.data.items; j++) {

        // Create db process (get into pool)
        knexConnection = require('knex')(knexConnectionConfig);

        module.data.items[j].items = await knexConnection.transaction(async trx => {
          return trx.table('modules').where('parent_id', module.data.items[j].id).orderBy('modules.position', orderBy);
        })


        // Destrory process (to clean pool)
        knexConnection.destroy();
      }
    }

  }

  //
  let statusCode = module.data ? 200 : 422;
  let response = {
    success: module.data ? true : false,
    module: module.data,
    error: module.error
  };

  // Send Response
  res.status(statusCode).json(response);
}