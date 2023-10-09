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
  if (!user) { restrictedAccess(res); return false; }

  // set attributes
  let id = req.query.id;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fatch Course From Database
  let shippingMethod = await knexConnection.transaction(async trx => {
    return trx.select('shipping_methods.*').table('shipping_methods').where('shipping_methods.id', id)
      .where('shipping_methods.is_active', 1).first();
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

  if (shippingMethod.data) {
    shipping_methods.data.monyfiedAmount = await moneyfy(shipping_methods.data.amount, shipping_methods.data.amount_type)

  }

  //
  let statusCode = shippingMethod.data ? 200 : 422;
  let response = {
    success: shippingMethod.data ? true : false,
    shippingMethod: shippingMethod.data,
    error: shippingMethod.error
  };

  // Send Response
  res.status(statusCode).json(response);
}