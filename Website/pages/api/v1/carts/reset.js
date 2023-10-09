import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Function to Delete cart
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert cart
  if (!user) { restrictedAccess(res); return false; }


  // Create db process (get into pool)
  let knexConnection = require('knex')(knexConnectionConfig);

  // Delete cart from database
  var cart = await knexConnection.transaction(async trx => {
    return trx('carts').where('status', 'ADDED').whereNull('order_id').del();
  }).then(res => {
    return {
      id: res,
      error: null
    };
  }).catch(err => {
    return {
      id: null,
      error: err.sqlMessage
    };
  })

  // Destrory process (to clean pool)
  knexConnection.destroy();


  //
  let statusCode = cart  ? 200 : 422;
  let response = {
    success: cart  ? true : false,
    cart: cart,
  };


  // Send Response
  res.status(statusCode).json(response);

}