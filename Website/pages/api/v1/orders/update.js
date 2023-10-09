import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, restrictedAccess, verifyToken, invalidFormData } from 'helpers/api';

// Function to Update cart
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert cart
  if (!user) { restrictedAccess(res); return false; }


  // Validate request with rules
  let schema = Joi.object({
    id: Joi.number().required(),
    quantity: Joi.number().allow(null),
    attributes: Joi.allow(null),
    
  });


  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  // Set carts
  let id = params.id;

  var attributes = params.attributes
  delete params.attributes

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Update product in database
  let cart = await knexConnection.transaction(async trx => {
    return trx('carts').select('carts.*').where('id', id).update(params);
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


  if (attributes) {

    attributes.map(async(attr) => {

      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      // Update product in database
      let cartUpdate = await knexConnection.transaction(async trx => {
        return trx('user_product_attributes').select('user_product_attributes.*')
          .where('cart_id', id).where('attribute_id', attr.attribute_id).update({ 'value_id': attr.value_id });
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
    })

  }

  //
  let statusCode = cart.id ? 200 : 422;
  let response = {
    success: cart.id ? true : false,
    cart: cart
  };

  // Send response
  res.status(statusCode).json(response);
}
