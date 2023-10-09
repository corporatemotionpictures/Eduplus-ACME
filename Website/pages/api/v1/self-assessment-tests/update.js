import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import slugify from 'slugify';
import { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, restrictedAccess, verifyToken, invalidFormData } from 'helpers/api';

// Function to Update assessment
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert assessment
  if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }

  // Validate request with rules
  let schema = Joi.object({
    id: Joi.number().required(),
    question: Joi.string().required(),
    total_marks: Joi.required(),
    options: Joi.allow(null),
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }


  let id = params.id;


  let options = null;

  if (params.options) {
    options = params.options
    delete params.options
  }


  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Update assessment in database
  let assessment = await knexConnection.transaction(async trx => {
    return trx('self_assessment_tests').where('id', id).update(params);
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

  if (assessment && options) {


    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Delete assessment from database
    let assessmentOptions = await knexConnection.transaction(async trx => {
      return trx('self_assessment_options').where('test_id', id).del();
    })


    // Destrory process (to clean pool)
    knexConnection.destroy();


    options = Object.values(options)
    options = options.filter(option => option.test_id = assessment.id)


    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Insert assessment into database
    let assessmentOption = await knexConnection.transaction(async trx => {
      return trx.insert(options).into('self_assessment_options');
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

  }


  //
  let statusCode = assessment.id ? 200 : 422;
  let response = {
    success: assessment.id ? true : false,
    assessment: assessment
  };


  // Send response
  res.status(statusCode).json(response);

}