import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import slugify from 'slugify';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Function to Update subject
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }


  // Validate request with rules
  let schema = Joi.object({
    id: Joi.number(),
    name: Joi.string(),
    exam_ids: Joi.string().allow(null),
    course_ids: Joi.string().allow(null),
    thumbnail: Joi.string(),
    position: Joi.number(),
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }


  // Set attributes
  let id = params.id;

  let subjectBySlug = null

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
    subjectBySlug = await knexConnection.transaction(async trx => {
      return trx.select().table('subjects').where('slug', params.slug).whereNull('id', id).first();

    })

    // Destrory process (to clean pool)
    knexConnection.destroy();
    
  }

  if (subjectBySlug) {

    let response = {
      success: false,
      error: 'Subject Already Exist'
    };

    // Send response
    res.status(422).json(response);

  } else {

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Update subject from database
    let subject = await knexConnection.transaction(async trx => {
      return trx('subjects').where('id', id).update(params);
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

    //
    let statusCode = subject.id ? 200 : 422;
    let response = {
      success: subject.id ? true : false,
      subject: subject
    };

    // Destrory process (to clean pool)
    knexConnection.destroy();

    // Send response
    res.status(statusCode).json(response);
  }
}
