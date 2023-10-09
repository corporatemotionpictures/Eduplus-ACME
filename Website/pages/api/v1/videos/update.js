import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Function to Update video
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
    video_id: Joi.string(),
    tags: Joi.allow(null),
    description: Joi.string().allow(null),
    status: Joi.string(),
    exam_ids: Joi.string().allow(null),
    course_ids: Joi.string().allow(null),
    subject_ids: Joi.string(),
    language_id: Joi.allow(null),
    chapter_ids: Joi.string(),
    position: Joi.number(),
    thumbnail: Joi.string().allow(null),
    approved: Joi.number(),
    type: Joi.string().allow(null),
    rejected_on: Joi.number().allow(null),
    base_type: Joi.string().allow(null),
    duration: Joi.allow(null),
    lacture_type: Joi.string().allow(null),
    questions: Joi.allow(null),
    video_url: Joi.allow(null),
    mode: Joi.string(),

  });

  // Validate Request with data
  let reqData = req.body;

  // If everything fine: params object would contain data
  let params = validateRequestParams(reqData, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  let questions = []

  if (params.questions) {
    questions = Object.values(params.questions)
    delete params.questions
  }


  // Set attributes
  let id = params.id;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Update data in database
  let video = await knexConnection.transaction(async trx => {
    return trx('videos').where('id', id).update(params);
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

  if (video.id) {

    questions = questions.filter(question => question.test_id = id)
    let ids = questions.map((question) => {
      return question.id

    })



    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Update user in database
    var question = await knexConnection.transaction(async trx => {
      return trx('test_questions').where('test_id', id).whereNotIn('id', ids).del();
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    for (let i = 0; i < questions.length; i++) {

      if (questions[i].id && questions[i].id != '') {


        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        // Update data in database
        question = await knexConnection.transaction(async trx => {
          return trx('test_questions').where('id', questions[i].id).update(questions[i]);
        })


        // Destrory process (to clean pool)
        knexConnection.destroy();
      } else {

        delete questions[i].id
        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        // Insert video into database
        question = await knexConnection.transaction(async trx => {
          return trx.insert(questions[i]).into('test_questions');
        })


        // Destrory process (to clean pool)
        knexConnection.destroy();


      }



    }



  }




  //
  let statusCode = video.id ? 200 : 422;
  let response = {
    success: video.id ? true : false,
    video: video
  };


  // Send response
  res.status(statusCode).json(response);

}