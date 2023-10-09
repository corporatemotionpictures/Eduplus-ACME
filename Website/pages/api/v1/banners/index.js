import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';

import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch banners
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  // if (!user) { restrictedAccess(res); return false; }

  // Filters
  let orderBy = req.query.order_by ? req.query.order_by : 'DESC';


  let totalCount = 0

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch banners from database
  let banners = await knexConnection.transaction(async trx => {

    let query;
    let attributes;

    // If Fetch by  Course ID
    // 
    query = trx.select().table('banners')
      .orderBy('banners.id', orderBy);

    if ((!req.query.forList || req.query.listOnly)) {
      query = query.where('approved', true)
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

  if (banners.data) {

    for (let i = 0; i < banners.data.length; i++) {

      knexConnection = require('knex')(knexConnectionConfig);

      let createdUser = await knexConnection.transaction(async trx => {
        return trx.select().table('users').where('id', banners.data[i].created_by).first();
      })

      banners.data[i].created_user = createdUser ? createdUser.first_name.concat(' ' + createdUser.last_name) : null;

      // Destrory process (to clean pool)
      knexConnection.destroy();

    }

    banners.data = await replaceUploadsArray(banners.data, 'image');

  }



  //
  let statusCode = banners.data ? 200 : 422;
  let response = {
    success: banners.data ? true : false,
    banners: banners.data,
    totalCount: totalCount,
    error: banners.error
  };

  // Send Response
  res.status(statusCode).json(response);
}