import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Get Course By ID
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  // if (!user) { restrictedAccess(res); return false; }

  // set attributes
  let id = req.query.id;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fatch Course From Database
  let productType = await knexConnection.transaction(async trx => {
    return trx.select('product_types.*').table('product_types').where('product_types.id', id)
      .where('product_types.is_active', 1).first();
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

  if(productType.data){

    if(productType.data.include_ids){

      knexConnection = require('knex')(knexConnectionConfig);

      productType.data.modules = await knexConnection.transaction(async trx => {
        return trx.table('app_modules').whereIn('id', JSON.parse(productType.data.include_ids));
      })
  
      // Destrory process (to clean pool)
      knexConnection.destroy();
    }
  }

  //
  let statusCode = productType.data ? 200 : 422;
  let response = {
    success: productType.data ? true : false,
    productType: productType.data,
    error: productType.error
  };

  // Send Response
  res.status(statusCode).json(response);
}