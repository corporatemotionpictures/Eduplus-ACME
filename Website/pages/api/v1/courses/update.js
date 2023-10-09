import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import slugify from 'slugify';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, restrictedAccess, verifyToken, invalidFormData } from 'helpers/api';

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
    exam_ids: Joi.string(),
    name: Joi.string(),
    thumbnail: Joi.string(),
    referance_id: Joi.number().allow(null),
    description: Joi.string().allow(null),
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  // Set attributes
  let id = params.id;


  let courseBySlug = null

  if (params.name) {


    // Add slug
    params.slug = slugify(params.name, {
      replacement: '-',
      remove: /[*+~.()'"!:@/]/g,
      lower: true,
    })

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fetch subject from database
    courseBySlug = await knexConnection.transaction(async trx => {
      return trx.select().table('courses').where('slug', params.slug).whereNull('id', id).first();

    })

    // Destrory process (to clean pool)
    knexConnection.destroy();
  }

  if (courseBySlug) {

    let response = {
      success: false,
      error: 'Course Already Exist'
    };

    // Send response
    res.status(422).json(response);

  } else {

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Update course in database
    let course = await knexConnection.transaction(async trx => {
      return trx('courses').where('id', id).update(params);
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
    let statusCode = course.id ? 200 : 422;
    let response = {
      success: course.id ? true : false,
      course: course
    };

    // Send response
    res.status(statusCode).json(response);

  }
}
