import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Function to insert video
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }

  // Validate request with rules
  let schema = Joi.object({
    title: Joi.string().required(),
    video_id: Joi.allow(null),
    tags: Joi.allow(null),
    exam_ids: Joi.required(),
    course_ids: Joi.required(),
    subject_ids: Joi.required(),
    chapter_ids: Joi.required(),
    language_id: Joi.allow(null),
    description: Joi.string().allow(null),
    status: Joi.string().allow(null),
    type: Joi.string().allow(null),
    duration: Joi.allow(null),
    base_type: Joi.string().allow(null),
    thumbnail: Joi.string().allow(null),
    mode: Joi.string().allow(null),
    batch_ids: Joi.string().allow(null),
    lacture_type: Joi.string().allow(null),
    questions: Joi.allow(null),
    video_url: Joi.allow(null),
    group_id: Joi.string()
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  params.created_by = user.id;
  if ((user.type == 'MANAGEMENT' || user.type == 'FACULTY')) {
    params.approved = false
  }


  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch subject from database
  let position = await knexConnection.transaction(async trx => {
    return trx.select().table('videos').orderBy('position', 'DESC').first();

  })

  // Destrory process (to clean pool)
  knexConnection.destroy();

  if (position) {
    params.position = parseInt(position.position) + 1;
  }
  else {
    params.position = 1;
  }

  let questions = []

  if (params.questions) {
    questions = Object.values(params.questions)
    delete params.questions
  }


  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch subject from database
  let imageLimits = await knexConnection.transaction(async trx => {
    return trx.select().table('image_size_limits').where('label', 'videos').first();

  })

  // Destrory process (to clean pool)
  knexConnection.destroy();

  if (imageLimits && imageLimits.default_image_url) {
    params.thumbnail = imageLimits.default_image_url
  }


  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Insert video into database
  let video = await knexConnection.transaction(async trx => {
    return trx.insert(params).into('videos');
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



  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Update user in database
  user = await knexConnection.transaction(async trx => {
    return trx('users').increment("video_view_limit", 0);
  })

  // Destrory process (to clean pool)
  knexConnection.destroy();

  if (video.id) {

    questions = questions.filter(question => question.test_id = video.id)
    questions = questions.filter(question => delete question.id)

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Insert video into database
    let question = await knexConnection.transaction(async trx => {
      return trx.insert(questions).into('test_questions');
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


  if (video.id && (user.type == 'MANAGEMENT' || user.type == 'FACULTY')) {



    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Update user in database
    var reciever = await knexConnection.transaction(async trx => {
      return trx('users').where('type', "ADMIN").first();
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    var notice = {
      user_id: user.id,
      reciever_id: reciever.id,
      notification: `New ${params.lacture_type == 'VIDEO' ? 'Video' : 'Test'}-${params.title} Added`,
      redirect_url: `/dashboard/videos/view/${video.id}`,
      icon: '<i className="fas fa-file-alt"></i>'
    };

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Insert notification into database
    let notification = await knexConnection.transaction(async trx => {
      return trx.insert(notice).into('admin_notifications');
    }).then(res => {
      return {
        id: res[0],
        error: null
      };
    }).catch(err => {
      return {
        id: null,
        error: err
      };
    });


    // Destrory process (to clean pool)
    knexConnection.destroy();

  }


  //
  let statusCode = video.id ? 200 : 422;
  let response = {
    success: video.id ? true : false,
    video: video,
    id: video.id
  };


  // Send response
  res.status(statusCode).json(response);
}
