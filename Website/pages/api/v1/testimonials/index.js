import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';

import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch testimonials
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  // if (!user) { restrictedAccess(res); return false; }

  // Filters
  let orderBy = req.query.order_by ? req.query.order_by : 'ASC';
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 4;


  let totalCount = 0

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch testimonials from database
  let testimonials = await knexConnection.transaction(async trx => {

    let query;
    let attributes;

    // If Fetch by  Course ID
    // 
    query = trx.select().table('testimonials')
      .orderBy('testimonials.position', orderBy);

    if ((!req.query.forList || req.query.listOnly)) {
      query = query.where('is_active', 1)
    }

    if ((!req.query.offLimit || req.query.offLimit == false)) {
      query = query.clone().offset(offset).limit(limit)
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

  if (testimonials.data) {

    for (let i = 0; i < testimonials.data.length; i++) {

      knexConnection = require('knex')(knexConnectionConfig);

      let createdUser = await knexConnection.transaction(async trx => {
        return trx.select().table('users').where('id', testimonials.data[i].created_by).first();
      })

      testimonials.data[i].created_user = createdUser ? createdUser.first_name.concat(' ' + createdUser.last_name) : null;

      // Destrory process (to clean pool)
      knexConnection.destroy();

    }

    testimonials.data = await replaceUploadsArray(testimonials.data, 'image');

  }



  //
  let statusCode = testimonials.data ? 200 : 422;
  let response = {
    success: testimonials.data ? true : false,
    testimonials: testimonials.data,
    totalCount: totalCount,
    error: testimonials.error
  };

  // Send Response
  res.status(statusCode).json(response);
}