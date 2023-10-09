import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import Joi from '@hapi/joi';
import slugify from 'slugify';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Function to Update blog
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
    exam_ids: Joi.string().allow(null),
    course_ids: Joi.string().allow(null).allow(null),
    subject_ids: Joi.string().allow(null),
    chapter_ids: Joi.string().allow(null),
    batch_ids: Joi.string().allow(null),
    body: Joi.allow(null),
    image: Joi.string(),
    approved: Joi.number(),
    rejected_on: Joi.number().allow(null),
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }



  let blogBySlug = null
  // Set attributes
  let id = params.id;

  // Update slug
  if (params.title) {
    params.slug = slugify(params.title, {
      replacement: '-',
      remove: /[*+~.()'"!:@/]/g,
      lower: true,
    })


    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fetch subject from database
    blogBySlug = await knexConnection.transaction(async trx => {
      return trx.select().table('blogs').where('slug', params.slug).whereNot('id', id).first();

    })

    // Destrory process (to clean pool)
    knexConnection.destroy();
  }



  if (blogBySlug) {

    let response = {
      success: false,
      error: 'Blog Title Already Exist'
    };

    // Send response
    res.status(422).json(response);

  } else {


    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);


    // Update blog in database
    let blog = await knexConnection.transaction(async trx => {
      return trx('blogs').where('id', id).update(params);
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
    });

    //
    let statusCode = blog.id ? 200 : 422;
    let response = {
      success: blog.id ? true : false,
      blog: blog,
    };

    // Destrory process (to clean pool)
    knexConnection.destroy();

    // Send response
    res.status(statusCode).json(response);
  }
}
