import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Function to insert enquiry
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only USER type of User allowed to insert enquiry
  if (!user) { restrictedAccess(res); return false; }

  // Validate request with rules
  let schema = Joi.object({
    message: Joi.string().required(),
    exam_id: Joi.number().allow(null),
    course_id: Joi.number().allow(null),
    subject_id: Joi.number().allow(null),
    chapter_id: Joi.number().allow(null),
    reply: Joi.string(),
    image: Joi.string(),
    image_for_user: Joi.string().allow(null),
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  params.user_id = user.id;

  // if (params.chapter_id) {

  //   // Create db process (get into pool)
  //   var knexConnection = require('knex')(knexConnectionConfig);

  //   // Fetch chapter from database
  //   let chapter = await knexConnection.transaction(async trx => {
  //     return trx.select('chapters.*').table('chapters')
  //       .where('chapters.id', params.chapter_id).where('chapters.is_active', 1).first();
  //   })

  //   // Destrory process (to clean pool)
  //   knexConnection.destroy();

  // } else if (params.subject_id) {

  //   // Create db process (get into pool)
  //   var knexConnection = require('knex')(knexConnectionConfig);

  //   // Fetch chapter from database
  //   let subject = await knexConnection.transaction(async trx => {
  //     return trx.select('subjects.*').table('subjects')
  //       .where('subjects.id', params.subject_id).where('subjects.is_active', 1).first();
  //   })

  //   // Destrory process (to clean pool)
  //   knexConnection.destroy();

  //   params.exam_id = subject ? subject.exam_id : null;
  //   params.course_id = subject ? subject.course_id : null;

  // }


  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Insert enquiry into database
  let enquiry = await knexConnection.transaction(async trx => {
    return trx.insert(params).into('enquiries');
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
  });


  if (schedule.id && user && user.type != 'ADMIN' && !req.query.listOnly && !req.query.noLog) {
    let logged_data = {
      user_id: user.id,
      action: `ENQUIEY_GENRATED`,
      payload: JSON.stringify({
        field_name: '',
        ...req.query
      })
    }


    let logs = await createLog(logged_data)
  }

  //
  let statusCode = enquiry.id ? 200 : 422;
  let response = {
    success: enquiry.id ? true : false,
    enquiry: enquiry,
    id: enquiry.id
  };

  // Destrory process (to clean pool)
  knexConnection.destroy();

  // Send response
  res.status(statusCode).json(response);
} 
