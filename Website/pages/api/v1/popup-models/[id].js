import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Get popupModel By ID
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

  // Fatch popupModel From Database
  let popupModel = await knexConnection.transaction(async trx => {


    let query = trx.select().table('popup_models')
      .where('page_url', id).first();

    if (!user || user.type == 'USER') {
      query.where('is_active', 1)
    }

    return query
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

  popupModel.data.image = await replaceUploads(popupModel.data.image);

  //
  let statusCode = popupModel.data ? 200 : 422;
  let response = {
    success: popupModel.data ? true : false,
    popupModel: popupModel.data,
    error: popupModel.error
  };

  // Send Response
  res.status(statusCode).json(response);
}