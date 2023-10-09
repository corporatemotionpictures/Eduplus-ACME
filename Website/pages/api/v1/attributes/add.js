import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import slugify from 'slugify';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Add new attribute
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert attribute
  if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }


  if (req.body.referance) {
    req.body.referance = req.body.referance == '' ? null : req.body.referance
    req.body.referance = req.body.referance.includes('[') ? parseInt(req.body.referance.replace('[', '').replace(']', '')) : req.body.referance
  }


  // Validate request with rules
  let schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    applied_as: Joi.string().required(),
    referance: Joi.string().allow(null),
    is_referance_values: Joi.number().allow(null),
    is_optional_values: Joi.number().allow(null),
    editable: Joi.number().allow(null),
    filterable: Joi.number().allow(null),
    is_multiple: Joi.number().allow(null),
    is_required: Joi.boolean().allow(null),
    values: Joi.allow(null),
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

  if (params.values) {
    var values = Object.values(params.values)
    delete params.values
  }

  if ('is_referance_values' in params) {
    delete params.is_referance_values
    params.is_optional_values = 0
  }

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch subject from database
  let existing = await knexConnection.transaction(async trx => {
    return trx.select().table('attributes').where('slug', params.slug).first();
  })

  // Destrory process (to clean pool)
  knexConnection.destroy();

  if (existing) {
    res.status(405).json({
      success: false,
      error: 'Title Already exist '
    });
  }

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch subject from database
  let position = await knexConnection.transaction(async trx => {
    return trx.select().table('attributes').orderBy('position', 'DESC').first();

  })

  // Destrory process (to clean pool)
  knexConnection.destroy();

  params.position = position ? parseInt(position.position) + 1 : 1;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Insert attribute into database
  let attribute = await knexConnection.transaction(async trx => {
    return trx.insert(params).into('attributes');
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

  if (attribute.id && values && params.is_optional_values == 1) {

    values = values.filter(value => value != null)
    values = values.filter(value => value.attribute_id = attribute.id)

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Insert attribute into database
    let attributeValues = await knexConnection.transaction(async trx => {
      return trx.insert(values).into('attribute_values');
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
  let statusCode = attribute.id ? 200 : 422;
  let response = {
    success: attribute.id ? true : false,
    attribute: attribute,
    id: attribute.id
  };


  // Send response
  res.status(statusCode).json(response);

} 
