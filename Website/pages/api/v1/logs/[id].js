import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog,  replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Get log By ID
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert log
  if (!user) { restrictedAccess(res); return false; }

  // set attributes
  let id = req.query.id;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fatch log From Database
  let log = await knexConnection.transaction(async trx => {
    return trx.select().table('logs').where('id', id).first();
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


  if (log.data) {

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    let field_details = await knexConnection.transaction(async trx => {
      return trx.select().table(log.data.field_name).where(log.data.field_name + '.id', log.data.field_id).first();
    });

    // Destrory process (to clean pool)
    knexConnection.destroy();


    if (field_details) {

      log.data.link_id = field_details.id;
      var link_name;
      if (field_details.title) {
        link_name = field_details.title;
      }
      else if (field_details.name) {
        link_name = field_details.name;
      }
      else if (field_details.question) {
        link_name = field_details.question;
      }
      log.data.link_name = link_name;
    }
  }

  //
  let statusCode = log.data ? 200 : 422;
  let response = {
    success: log.data ? true : false,
    log: log.data,
    error: log.error
  };

  // Send Response
  res.status(statusCode).json(response);
}