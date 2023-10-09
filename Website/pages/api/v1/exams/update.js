import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import slugify from 'slugify';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, restrictedAccess, verifyToken, invalidFormData } from 'helpers/api';

// Function to Update exam
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert exam
  if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }

  // Validate request with rules
  let schema = Joi.object({
    id: Joi.number().required(),
    name: Joi.string(),
    description: Joi.string().allow(null),
    thumbnail: Joi.string(),
    referance_id: Joi.number().allow(null),
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  // Set attributes
  let id = params.id;
  let examBySlug = null

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
    examBySlug = await knexConnection.transaction(async trx => {
      return trx.select().table('exams').where('slug', params.slug).whereNot('id', id).first();

    })

    // Destrory process (to clean pool)
    knexConnection.destroy();
  }

  if (examBySlug) {

    let response = {
      success: false,
      error: 'Exam Already Exist'
    };

    // Send response
    res.status(422).json(response);

  } else {

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Update exam in database
    let exam = await knexConnection.transaction(async trx => {
      return trx('exams').where('id', id).update(params);
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
    let statusCode = exam.id ? 200 : 422;
    let response = {
      success: exam.id ? true : false,
      exam: exam
    };

    // Send response
    res.status(statusCode).json(response);
  }
}
