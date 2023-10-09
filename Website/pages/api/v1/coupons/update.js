import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, restrictedAccess, verifyToken, invalidFormData } from 'helpers/api';

// Function to Update course
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }


  let rools = {
    id: Joi.number().required(),
    discount_type: Joi.string(),
    amount: Joi.string().required(),
    description: Joi.string().allow(null),
    individual_use: Joi.number().allow(null),
    referance_type: Joi.string().required(),
    restricted_user_types: Joi.string().allow(null),
    usage_limit: Joi.number().allow(null),
    minimum_amount: Joi.number().allow(null),
    maximum_amount: Joi.number().allow(null),
    amount_upto: Joi.number().allow(null),
    email_restrictions: Joi.string().allow(null),
    applied_on: Joi.string().required(),
    start_date: Joi.required(),
    expiry_date: Joi.allow(null),
    suggested: Joi.number().allow(null),
    first_order: Joi.number().allow(null),
    on_bulk: Joi.number().allow(null),
    bulk_count: Joi.number().allow(null),
    membership_id: Joi.number().allow(null),
    [`${req.body.referance_type}_ids`]: Joi.string().required(),
    type: Joi.string().allow(null),
  }


  if (req.body.on_bulk == "1") {
    rools.bulk_count = Joi.number().required();
  }
  else if (req.body.type == "DISCOUNT" || req.body.type == 'MEMBERSHIP') {
    rools.code = Joi.string().allow(null);
  } else {
    rools.code = Joi.string().required();
  }

  if (req.body.applied_on == 'AUTOMATIC') {
    rools.automatic_discount_type_id = Joi.string().required().label('Discount Type Required');
  }

  // Validate request with rules
  let schema = Joi.object(rools);

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);


  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }


  params.referance_ids = params[`${req.body.referance_type}_ids`];

  params.first_order = params.first_order ? params.first_order : 0
  params.suggested = params.suggested ? params.suggested : 0


  delete params[`${req.body.referance_type}_ids`];
  delete params.on_bulk;
  delete params.bulk_count;


  // Set attributes
  let id = params.id;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Update course in database
  let coupon = await knexConnection.transaction(async trx => {
    return trx('coupons').where('id', id).update(params);
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
  let statusCode = coupon.id ? 200 : 422;
  let response = {
    success: coupon.id ? true : false,
    coupon: coupon
  };

  // Send response
  res.status(statusCode).json(response);
}
