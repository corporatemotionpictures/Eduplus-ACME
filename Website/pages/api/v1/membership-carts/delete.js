import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';
import { CartesianAxis } from 'recharts';

// Function to Delete cart
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert cart
  if (!user) { restrictedAccess(res); return false; }


  // Validate request with rules
  let schema = Joi.object({
    id: Joi.number().required()
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  // Set carts
  let id = params.id;
  params.is_active = false;

  // Create db process (get into pool)
  knexConnection = require('knex')(knexConnectionConfig);

  // Delete cart from database
  var cartdata = await knexConnection.transaction(async trx => {
    return trx('membership_carts').where('id', id).first();
  })

  // Destrory process (to clean pool)
  knexConnection.destroy();

  cartdata = cartdata ? cartdata.membership_id : null


  // Create db process (get into pool)
  knexConnection = require('knex')(knexConnectionConfig);

  // Delete cart from database
  var cart = await knexConnection.transaction(async trx => {
    return trx('membership_carts').where('id', id).del();
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

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let carts = await knexConnection.transaction(async trx => {
    var query;

    query = trx.select('membership_carts.*').table('membership_carts').where('user_id', user.id)
    return query;

  })

  // Destrory process (to clean pool)
  knexConnection.destroy();

  //
  let statusCode = cart && cart.id ? 200 : 422;
  let response = {
    success: cart && cart.id ? true : false,
    cart: cart,
    count: carts.length,
  };


  // Send Response
  res.status(statusCode).json(response);

}