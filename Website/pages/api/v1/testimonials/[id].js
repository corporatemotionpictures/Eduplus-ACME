import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog,  replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Get testimonial By ID
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

  // Fatch testimonial From Database
  let testimonial = await knexConnection.transaction(async trx => {
    return trx.select().table('testimonials')
      .where('id', id).first();
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

  testimonial.data.image = await replaceUploads(testimonial.data.image);

  //
  let statusCode = testimonial.data ? 200 : 422;
  let response = {
    success: testimonial.data ? true : false,
    testimonial: testimonial.data,
    error: testimonial.error
  };

  // Send Response
  res.status(statusCode).json(response);
}