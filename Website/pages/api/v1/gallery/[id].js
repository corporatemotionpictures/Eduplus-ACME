import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Get Blog By ID
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user) { restrictedAccess(res); return false; }

  // set attributes
  let id = req.query.id;

  // Set Attributes
  let attributes = {
    chapter_id: 'chapters.id',
    chapter_name: 'chapters.name'
  };

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fatch gallery From Database
  let gallery = await knexConnection.transaction(async trx => {
    return trx.select().table('gallery')
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

  if (gallery.data) {
    gallery.data.image = await replaceUploads(gallery.data.image);

  }


  //
  let statusCode = gallery.data ? 200 : 422;
  let response = {
    success: gallery.data ? true : false,
    gallery: gallery.data,
    error: gallery.error
  };

  // Send Response
  res.status(statusCode).json(response);
}