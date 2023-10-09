import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Get product By ID
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
//   if (!user) { restrictedAccess(res); return false; }

  // Set attributes 
  let slug = req.query.slug;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch product from database
  let product = await knexConnection.transaction(async trx => {
    return trx.select('products.*').table('products')
      .where('products.slug', slug).first();
  })

  // Destrory process (to clean pool)
  knexConnection.destroy();

  //
  let statusCode = product ? 200 : 422;
  let response = {
    success: product ? true : false,
    product: product,
  };

  // Send Response 
  res.status(statusCode).json(response);
}