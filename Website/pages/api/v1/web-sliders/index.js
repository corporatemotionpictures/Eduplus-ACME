import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';

import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch webSliders
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  // if (!user) { restrictedAccess(res); return false; }

  // Filters
  let orderBy = req.query.order_by ? req.query.order_by : 'ASC';


  let totalCount = 0

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch webSliders from database
  let webSliders = await knexConnection.transaction(async trx => {

    let query;
    let attributes;

    // If Fetch by  Course ID
    // 
    query = trx.select().table('web_sliders')
      .orderBy('web_sliders.position', orderBy);

    if ((!req.query.forList || req.query.listOnly)) {
      query = query.where('approved', true).where('is_active', 1)
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
      error: err
    };
  });

  // Destrory process (to clean pool)
  knexConnection.destroy();

  if (webSliders.data) {

    for (let i = 0; i < webSliders.data.length; i++) {

      knexConnection = require('knex')(knexConnectionConfig);

      let createdUser = await knexConnection.transaction(async trx => {
        return trx.select().table('users').where('id', webSliders.data[i].created_by).first();
      })

      webSliders.data[i].created_user = createdUser ? createdUser.first_name.concat(' ' + createdUser.last_name) : null;

      // Destrory process (to clean pool)
      knexConnection.destroy();

    }

    webSliders.data = await replaceUploadsArray(webSliders.data, 'image');
    webSliders.data = await replaceUploadsArray(webSliders.data, 'video');

  }



  //
  let statusCode = webSliders.data ? 200 : 422;
  let response = {
    success: webSliders.data ? true : false,
    webSliders: webSliders.data,
    totalCount: totalCount,
    error: webSliders.error
  };

  // Send Response
  res.status(statusCode).json(response);
}