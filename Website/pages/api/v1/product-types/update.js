import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import slugify from 'slugify';
import { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, restrictedAccess, verifyToken, invalidFormData } from 'helpers/api';

// Function to Update course
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }

  // Validate request with rules
  let schema = Joi.object({
    id: Joi.number().required(),
    title: Joi.string(),
    description: Joi.string().allow(null),
    selling_on: Joi.boolean().allow(null),
    is_package: Joi.boolean().allow(null),
    is_free: Joi.boolean().allow(null),
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  // Set attributes
  let id = params.id;

  let productTypeBySlug = null

  if (params.title) {
    // Add slug
    params.slug = slugify(params.title, {
      replacement: '-',
      remove: /[*+~.()'"!:@/]/g,
      lower: true,
    })

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fetch subject from database
    productTypeBySlug = await knexConnection.transaction(async trx => {
      return trx.select().table('product_types').where('slug', params.slug).whereNot('id', params.id).first();

    })

    // Destrory process (to clean pool)
    knexConnection.destroy();
  }


  if (productTypeBySlug) {

    let response = {
      success: false,
      error: 'Product Type Already Exist'
    };

    // Send response
    res.status(422).json(response);

  } else {

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Update course in database
    let productType = await knexConnection.transaction(async trx => {
      return trx('product_types').where('id', id).update(params);
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
    let statusCode = productType.id ? 200 : 422;
    let response = {
      success: productType.id ? true : false,
      productType: productType
    };

    // Send response
    res.status(statusCode).json(response);
  }
}
