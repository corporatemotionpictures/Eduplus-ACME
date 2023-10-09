import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import slugify from 'slugify';
import { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Add new assessment
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert assessment
  // if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }

  // Validate request with rules
  let schema = Joi.object({
    question: Joi.string().required(),
    total_marks: Joi.required(),
    options: Joi.allow(null),

  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  let options = null;

  if (params.options) {
    options = params.options
    delete params.options
  }

  // Create db process (get into pool)
  knexConnection = require('knex')(knexConnectionConfig);

  // Fetch subject from database
  let position = await knexConnection.transaction(async trx => {
    return trx.select().table('self_assessment_tests').orderBy('position', 'DESC').first();

  })

  // Destrory process (to clean pool)
  knexConnection.destroy();

  params.position = position ? parseInt(position.position) + 1 : 1;


  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Insert assessment into database
  let assessment = await knexConnection.transaction(async trx => {
    return trx.insert(params).into('self_assessment_tests');
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



  if (assessment && options) {

    options = Object.values(options)
    options = options.filter(option => option.test_id = assessment.id)


    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Insert assessment into database
    let assessmentOption = await knexConnection.transaction(async trx => {
      return trx.insert(options).into('self_assessment_options');
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
  let statusCode = assessment.id ? 200 : 422;
  let response = {
    success: assessment.id ? true : false,
    assessment: assessment,
    id: assessment.id
  };


  // Send response
  res.status(statusCode).json(response);

}