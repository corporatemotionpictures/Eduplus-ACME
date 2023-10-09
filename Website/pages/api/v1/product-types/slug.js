import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Get exam By ID
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  // if (!user) { restrictedAccess(res); return false; }

  // Set attributes 
  let slug = req.query.slug;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch exam from database
  let productType = await knexConnection.transaction(async trx => {
    return trx.select('product_types.*').table('product_types')
      .where('product_types.slug', slug).where('product_types.is_active', 1).first();
  })

  // Destrory process (to clean pool)
  knexConnection.destroy();


  //
  let statusCode = productType ? 200 : 422;
  let response = {
    success: productType ? true : false,
    productType: productType,
    error: productType.error
  };

  // Send Response 
  res.status(statusCode).json(response);
}