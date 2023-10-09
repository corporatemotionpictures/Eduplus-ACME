import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { randomstring } from 'randomstring';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Add new coupon
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert coupon
  if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }


  let rools = {
    discount_type: Joi.string(),
    amount: Joi.string().required(),
    description: Joi.string().allow(null),
    individual_use: Joi.boolean().allow(null),
    referance_type: Joi.string().required(),
    type: Joi.string().allow(null),
    usage_limit: Joi.number().allow(null),
    minimum_amount: Joi.number().allow(null),
    maximum_amount: Joi.number().allow(null),
    amount_upto: Joi.number().allow(null),
    email_restrictions: Joi.string().allow(null),
    applied_on: Joi.string().required(),
    start_date: Joi.string().allow(null),
    expiry_date: Joi.string().allow(null),
    restricted_user_types: Joi.string().allow(null),
    on_bulk: Joi.number().allow(null),
    suggested: Joi.number().allow(null),
    first_order: Joi.number().allow(null),
    bulk_count: Joi.number().allow(null),
    membership_id: Joi.number().allow(null),
    word_limit: Joi.number().allow(null),
    [`${req.body.referance_type}_ids`]: Joi.string().required()
  }


  if (req.body.on_bulk == "1") {
    rools.bulk_count = Joi.number().required();
  } else if(req.body.type == "DISCOUNT" || req.body.type == "MEMBERSHIP") {
    rools.code = Joi.string().allow(null);
  }else{
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


  let word_limit = params.word_limit ? params.word_limit : 0;
  let counts = params.bulk_count ? params.bulk_count : 1;
  delete params[`${req.body.referance_type}_ids`];
  delete params.on_bulk;
  delete params.bulk_count;
  delete params.word_limit;

  var coupon;
  var randomstring = require("randomstring");
  for (let i = 0; i < counts; i++) {


    params.code = (word_limit != 0 || params.type == 'DISCOUNT' || params.type == 'MEMBERSHIP') ? randomstring.generate(word_limit) : params.code;

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fetch subject from database
    let position = await knexConnection.transaction(async trx => {
      return trx.select().table('coupons').orderBy('position', 'DESC').first();

    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    params.position = position ? parseInt(position.position) + 1 : 1;

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Insert coupon into database
    coupon = await knexConnection.transaction(async trx => {
      return trx.insert(params).into('coupons');
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

  //
  let statusCode = coupon.id ? 200 : 422;
  let response = {
    success: coupon.id ? true : false,
    coupon: coupon,
    id: coupon.id
  };


  // Send response
  res.status(statusCode).json(response);

} 
