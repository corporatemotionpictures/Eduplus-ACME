import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog,  replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Get webSlider By ID
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

  // Fatch webSlider From Database
  let webSlider = await knexConnection.transaction(async trx => {
    return trx.select().table('web_sliders')
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

  webSlider.data.image = await replaceUploads(webSlider.data.image);

  //
  let statusCode = webSlider.data ? 200 : 422;
  let response = {
    success: webSlider.data ? true : false,
    webSlider: webSlider.data,
    error: webSlider.error
  };

  // Send Response
  res.status(statusCode).json(response);
}