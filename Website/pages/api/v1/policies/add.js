import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import slugify from 'slugify';
import { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Add new policy
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert policy
  // if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }

  // Validate request with rules
  let schema = Joi.object({
    title: Joi.string().required(),
    body: Joi.string().allow(null),
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


  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch subject from database
  let policyBySlug = await knexConnection.transaction(async trx => {
    return trx.select().table('policies').where('slug', params.slug).first();

  })

  // Destrory process (to clean pool)
  knexConnection.destroy();

  if (policyBySlug) {

    let response = {
      success: false,
      error: 'Policy Already Exist'
    };

    // Send response
    res.status(422).json(response);

  } else {

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    // Fetch subject from database
    let position = await knexConnection.transaction(async trx => {
      return trx.select().table('policies').orderBy('position', 'DESC').first();

    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    params.position = position ? parseInt(position.position) + 1 : 1;


    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Insert policy into database
    let policy = await knexConnection.transaction(async trx => {
      return trx.insert(params).into('policies');
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

    //
    let statusCode = policy.id ? 200 : 422;
    let response = {
      success: policy.id ? true : false,
      policy: policy,
      id: policy.id
    };

    // Send response
    res.status(statusCode).json(response);

  }



}
