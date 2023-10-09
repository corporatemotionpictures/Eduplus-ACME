import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import slugify from 'slugify';
import { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Function to insert membership
export default async function base(req, res) {

  //  verify token 


  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }

  // Validate request with rules
  let schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().allow(null),
    amount: Joi.allow(null),
    tax_id: Joi.allow(null),
    validity_id: Joi.allow(null),
    type: Joi.allow(null),
    product_ids: Joi.allow(null),
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }


  // Add slug
  params.slug = slugify(params.title, {
    replacement: '-',
    remove: /[*+~.()'"!:@/]/g,
    lower: true,
  })

  let productIds = null

  if (params.product_ids) {
    productIds = params.product_ids
    delete params.product_ids
  }

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Insert chapter from database
  let membership = await knexConnection.transaction(async trx => {
    return trx.insert(params).into('memberships');
  }).then(res => {
    return {
      id: res[0],
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

  if (membership && productIds) {
    productIds = JSON.parse(productIds)
    for (let i = 0; i < productIds.length; i++) {

      params = {
        membership_id: membership.id,
        product_id: productIds[i],
      }


      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      // Insert chapter from database
      let membershipProduct = await knexConnection.transaction(async trx => {
        return trx.insert(params).into('membership_products');
      }).then(res => {
        return {
          id: res[0],
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

    }

  }


  //
  let statusCode = membership.id ? 200 : 422;
  let response = {
    success: membership.id ? true : false,
    'membership': membership
  };



  // Send response
  res.status(statusCode).json(response);
}
