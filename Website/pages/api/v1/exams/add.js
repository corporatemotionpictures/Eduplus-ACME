import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import slugify from 'slugify';
import { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Add new exam
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert exam
  // if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }

  // Validate request with rules
  let schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().allow(null),
    referance_id: Joi.number().allow(null),
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  // Add slug
  params.slug = slugify(params.name, {
    replacement: '-',
    remove: /[*+~.()'"!:@/]/g,
    lower: true,
  })


  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch subject from database
  let examBySlug = await knexConnection.transaction(async trx => {
    return trx.select().table('exams').where('slug', params.slug).first();

  })

  // Destrory process (to clean pool)
  knexConnection.destroy();

  if (examBySlug) {

    let response = {
      success: false,
      error: 'Exam Already Exist'
    };

    // Send response
    res.status(422).json(response);

  } else {

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    // Fetch subject from database
    let position = await knexConnection.transaction(async trx => {
      return trx.select().table('exams').orderBy('position', 'DESC').first();

    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    params.position = position ? parseInt(position.position) + 1 : 1;

    // defaultImage set


    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fetch subject from database
    let imageLimits = await knexConnection.transaction(async trx => {
      return trx.select().table('image_size_limits').where('label', 'exams').first();

    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    if (imageLimits && imageLimits.default_image_url) {
      params.thumbnail = imageLimits.default_image_url
    }

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Insert exam into database
    let exam = await knexConnection.transaction(async trx => {
      return trx.insert(params).into('exams');
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
    let statusCode = exam.id ? 200 : 422;
    let response = {
      success: exam.id ? true : false,
      exam: exam,
      id: exam.id
    };

    // Send response
    res.status(statusCode).json(response);

  }



}
