import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { add } from 'helpers/apiService';
import define from 'src/json/worddefination.json'
import { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Add new posts
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert posts
  if (!user) { restrictedAccess(res); return false; }

  // Validate request with rules
  let schema = Joi.object({
    body: Joi.string().required(),
    exam_id: Joi.number(),
    course_id: Joi.number(),
    subject_id: Joi.number(),
    chapter_id: Joi.number(),
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  if (params.chapter_id) {

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fetch chapter from database
    let chapter = await knexConnection.transaction(async trx => {
      return trx.select().table('chapters')
        .where('chapters.id', params.chapter_id).where('chapters.is_active', 1).first();
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    params.exam_id = chapter ? chapter.exam_id : null;
    params.course_id = chapter ? chapter.course_id : null;
    params.subject_id = chapter ? chapter.subject_id : null;

  } else if (params.subject_id) {

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fetch chapter from database
    let subject = await knexConnection.transaction(async trx => {
      return trx.select().table('subjects')
        .where('subjects.id', params.subject_id).where('subjects.is_active', 1).first();
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    params.exam_id = subject ? subject.exam_id : null;
    params.course_id = subject ? subject.course_id : null;

  }

  params.user_id = user.id;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Insert post into database
  let post = await knexConnection.transaction(async trx => {
    return trx.insert(params).into('posts');
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

  if (post.id) {

    let body = {
      title: `${define.post} posted by ${user.first_name} ${user.last_name}`,
      body: params.body,
      subject_ids: `[${params.subject_id}]`,
      action:"Discussion"
    };

    let pushNotification = await add('push-notifications', body, null, req.headers['x-auth-token']);
  }

  if (post.id && user && user.type != 'ADMIN' && !req.query.listOnly && !req.query.noLog) {
    let logged_data = {
      user_id: user.id,
      action: `POST_ADDED`,
      payload: JSON.stringify({
        field_name: '',
        ...req.query
      })
    }


    let logs = await createLog(logged_data)
  }


  //
  let statusCode = post.id ? 200 : 422;
  let response = {
    success: post.id ? true : false,
    post: post,
    id: post.id
  };

  // Send response
  res.status(statusCode).json(response);

}
