import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';

import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch popupModels
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Filters
  let orderBy = req.query.order_by ? req.query.order_by : 'DESC';


  let totalCount = 0

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch popupModels from database
  let popupModels = await knexConnection.transaction(async trx => {

    let query;
    let attributes;

    // If Fetch by  Course ID
    //

    query = trx.select().table('popup_models')
      .orderBy('popup_models.id', orderBy);

    if (req.query.pageUrl) {
      query.where('page_url', req.query.pageUrl)
    }

    if( req.query.pageUrl){
      query.where('is_active', 1)
    }

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
  });

  // Destrory process (to clean pool)
  knexConnection.destroy();

  if (popupModels.data) {

    popupModels.data = await replaceUploadsArray(popupModels.data, 'image');

    if (req.query.pageUrl) {
      popupModels.data = totalCount > 0 ? popupModels.data[0] : null
    }

  }

  //
  let statusCode = popupModels.data ? 200 : 422;
  let response = {
    success: popupModels.data ? true : false,
    popupModels: popupModels.data,
    totalCount: totalCount,
    error: popupModels.error
  };

  // Send Response
  res.status(statusCode).json(response);
}