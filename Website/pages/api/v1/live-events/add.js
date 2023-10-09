import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData, pushNotification } from 'helpers/api';
import moment from 'moment';
import { create } from 'helpers/zoom';

// Function to insert event
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT') { restrictedAccess(res); return false; }


  if ('id' in req.body) {
    delete req.body.id
  }

  // Validate request with rules
  let schema = {
    title: Joi.string().required(),
    url: Joi.allow(null),
    type: Joi.allow(null),
    event_id: Joi.number().allow(null),
    video_id: Joi.number().allow(null),
    schedule_at: Joi.required(),
    rtmp_url: Joi.string().allow(null),
    language_id: Joi.allow(null),
    rtmp_key: Joi.string().allow(null),
    tags: Joi.string().allow(null),
    description: Joi.string().allow(null),
    status: Joi.string().allow(null),
    mode: Joi.string().allow(null),
    group_id: Joi.string().allow(null),
    batch_ids: Joi.string().allow(null),
    base_type: Joi.string().allow(null),
    youtube_link: Joi.string().allow(null),
    zoomAttributes: Joi.allow(null),
  };

  if (req.body.zoomAttributes && req.body.zoomAttributes.type == 'webinars') {
    schema = {
      ...schema,
      exam_ids: Joi.allow(null),
      course_ids: Joi.allow(null),
      subject_ids: Joi.allow(null),
      chapter_ids: Joi.allow(null),
    }
  } else {
    schema = {
      ...schema,
      exam_ids: Joi.required(),
      course_ids: Joi.required(),
      subject_ids: Joi.required(),
      chapter_ids: Joi.required(),
    }
  }


  schema = Joi.object(schema)

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  // params.created_by = user.id;
  // if ((user.type == 'MANAGEMENT' || user.type == 'FACULTY' )) {
  //   // params.approved = false
  // }

  let zoomAttributes = null
  if (params.zoomAttributes) {
    zoomAttributes = params.zoomAttributes
    delete params.zoomAttributes
  }


  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch subject from database
  let position = await knexConnection.transaction(async trx => {
    return trx.select().table('live_events').orderBy('position', 'DESC').first();

  })

  // Destrory process (to clean pool)
  knexConnection.destroy();


  if (position) {
    params.position = parseInt(position.position) + 1;
  }
  else {
    params.position = 1;
  }



  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch subject from database
  let imageLimits = await knexConnection.transaction(async trx => {
    return trx.select().table('image_size_limits').where('label', 'live_events').first();

  })

  // Destrory process (to clean pool)
  knexConnection.destroy();

  if (imageLimits && imageLimits.default_image_url) {
    params.thumbnail = imageLimits.default_image_url
  }


  if (!params.thumbnail && params.subject_ids && params.subject_ids != '[]') {

    let subjectID = JSON.parse(params.subject_ids)[0]

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fetch subject from database
    let subject = await knexConnection.transaction(async trx => {
      return trx.select().table('subjects').where('id', subjectID).first();

    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    params.thumbnail = subject ? subject.thumbnail : null

  } else {

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fetch exam from database
    let exam = await knexConnection.transaction(async trx => {
      return trx.select().table('exams').first();

    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    params.thumbnail = exam ? exam.thumbnail : null

  }

  if (!params.thumbnail && params.exam_ids) {

    let examID = JSON.parse(params.exam_ids)[0]

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fetch exam from database
    let exam = await knexConnection.transaction(async trx => {
      return trx.select().table('exams').where('id', examID).first();

    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    params.thumbnail = exam ? exam.thumbnail : null
  }

  let occurrences = [
    {
      occurrence_id: null,
      start_time: params.schedule_at,
      duration: params.duration,
      status: 'available'
    }
  ]

  let error = null


  console.log(zoomAttributes)

  if (zoomAttributes) {

    zoomAttributes.start_time = moment(zoomAttributes.start_time).format('yyyy-MM-DDTHH:mm:ssZ')
    let zoomType = zoomAttributes.type == 5 ? 'webinars' : 'meetings'
    zoomAttributes = await create(zoomAttributes, zoomType)

    if (zoomAttributes.message) {
      occurrences = []
      error = zoomAttributes.message
      // zoomType = 'meetings'
      // zoomAttributes = await create(zoomAttributes, zoomType)

      // if (zoomAttributes.message) {
      //   occurrences = []
      //   error = zoomAttributes.message

      // } else {

      //   params.zoom_url = zoomAttributes.join_url
      //   params.zoom_id = zoomAttributes.id
      //   params.zoom_uuid = zoomAttributes.uuid
      //   params.zoom_type = zoomType
      //   params.zoom_status = zoomAttributes.status

      //   if (zoomAttributes.occurrences) {
      //     occurrences = zoomAttributes.occurrences
      //   }
      // }

    } else {

      params.zoom_url = zoomAttributes.join_url
      params.zoom_id = zoomAttributes.id
      params.zoom_uuid = zoomAttributes.uuid
      params.zoom_type = zoomType
      params.zoom_status = zoomAttributes.status

      if (zoomAttributes.occurrences) {
        occurrences = zoomAttributes.occurrences
      }
    }

  }


  let event
  let ids = []
  for (let i = 0; i < occurrences.length; i++) {

    params.occurrence_id = occurrences[i].occurrence_id;
    params.schedule_at = occurrences[i].start_time;
    params.zoom_status = occurrences[i].status;
    params.duration = occurrences[i].duration;

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Insert event into database
    event = await knexConnection.transaction(async trx => {
      return trx.insert(params).into('live_events');
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

    if (event.id) {
      ids.push(event.id)
    }


    if (event.id && (user.type == 'MANAGEMENT' || user.type == 'FACULTY')) {

      var notice = {
        user_id: user.id,
        notification: `New event-${params.title} Added`,
        redirect_url: `/dashboard/live-events/view/${event.id}`,
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

  }

  //
  let statusCode = event && event.id ? 200 : 422;
  let response = {
    success: event && event.id ? true : false,
    event: event,
    id: event && event.id && ids,
    error: error
  };


  // Send response
  res.status(statusCode).json(response);
}