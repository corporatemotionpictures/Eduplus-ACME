import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';
import { update, create, deleteData, getOne } from 'helpers/zoom';
import moment from 'moment'

// Function to Update event
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
    url: Joi.string().allow(null),
    type: Joi.string(),
    event_id: Joi.number().allow(null),
    video_id: Joi.number().allow(null),
    duration: Joi.number().allow(null),
    language_id: Joi.allow(null),
    schedule_at: Joi.string(),
    rtmp_url: Joi.string().allow(null),
    rtmp_key: Joi.string().allow(null),
    tags: Joi.allow(null),
    description: Joi.string().allow(null),
    status: Joi.string(),
    exam_ids: Joi.string().allow(null),
    course_ids: Joi.string().allow(null),
    subject_ids: Joi.string(),
    chapter_ids: Joi.string(),
    position: Joi.number(),
    thumbnail: Joi.string().allow(null),
    converted: Joi.boolean().allow(null),
    mode: Joi.string(),
    batch_ids: Joi.string().allow(null),
    zoomAttributes: Joi.allow(null),
    approved: Joi.number(),
    rejected_on: Joi.number().allow(null),
    event_status: Joi.string().allow(null),
    youtube_link: Joi.string().allow(null),
    zoomAttributes: Joi.allow(null),
  });

  // Validate Request with data
  let reqData = req.body;

  // If everything fine: params object would contain data
  let params = validateRequestParams(reqData, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  let zoomAttributes = null
  if (params.zoomAttributes) {
    zoomAttributes = params.zoomAttributes
    delete params.zoomAttributes

    if (Object.keys(zoomAttributes.recurrence).length == 0) {
      delete zoomAttributes.recurrence
    }
  }


  // Set attributes
  let id = params.id;


  let occurrences = null
  let eventDetail


  if (zoomAttributes) {


    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    // Fatch video From Database
    eventDetail = await knexConnection.transaction(async trx => {
      return trx.select().table('live_events')
        .where('id', id).first();
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    zoomAttributes.start_time = moment(zoomAttributes.start_time).format('yyyy-MM-DDTHH:mm:ssZ')
    let zoomType = zoomAttributes.type == 5 ? 'webinars' : 'meetings'
    if (eventDetail.zoom_id && (!zoomAttributes.type || zoomAttributes.type == eventDetail.zoom_type)) {

      let recuursion = zoomAttributes.recurrence
      zoomAttributes = await update(zoomAttributes, eventDetail.zoom_id, zoomType)
      zoomAttributes = await getOne(eventDetail.zoom_id, zoomType)

      if (zoomAttributes.message) {
        occurrences = []
        error = zoomAttributes.message
      } else {

        params.zoom_url = zoomAttributes.join_url
        params.zoom_id = zoomAttributes.id
        params.zoom_uuid = zoomAttributes.uuid
        params.zoom_type = zoomType
        params.zoom_status = zoomAttributes.status

        if (zoomAttributes.occurrences && recuursion) {
          occurrences = zoomAttributes.occurrences
        }
      }

    } else {

      occurrences = [
        {
          occurrence_id: null,
          start_time: params.schedule_at,
          duration: params.duration,
          status: 'available'
        }
      ]

      if (eventDetail.zoom_id && zoomAttributes.type != eventDetail.zoom_type) {
        await deleteData(eventDetail.zoom_id, eventDetail.zoom_type)
      }

      zoomAttributes = await create(zoomAttributes, zoomType)

      if (zoomAttributes.message) {
        occurrences = []
        error = zoomAttributes.message
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


  }


  let event

  if (!occurrences) {

    if (params.event_status == 'STARTED') {
      params.started_by = user.id
    }

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Update data in database
    event = await knexConnection.transaction(async trx => {
      return trx('live_events').where('id', id).update(params);
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
  } else {



    delete params.id
    let eventUpdate
    let updatedArray = []
    for (let i = 0; i < occurrences.length; i++) {

      params.occurrence_id = occurrences[i].occurrence_id;
      params.schedule_at = occurrences[i].start_time;
      params.zoom_status = occurrences[i].status;
      params.duration = occurrences[i].duration;

      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      // Update data in database
      eventUpdate = await knexConnection.transaction(async trx => {
        return trx('live_events').where('occurrence_id', occurrences[i].occurrence_id).update(params);
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

      if (eventUpdate.id) {
        updatedArray.push(occurrences[i].occurrence_id)
      }
    }


    for (let i = 0; i < occurrences.length; i++) {

      if (!updatedArray.includes(occurrences[i].occurrence_id)) {
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
      }

      if (eventUpdate.id) {
        updatedArray.push(occurrences[i].occurrence_id)
      }
    }


    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Delete event from database
    let eventDelete = await knexConnection.transaction(async trx => {
      return trx('live_events').where('zoom_id', eventDetail.zoom_id).where('event_status', 'NOT_STARTED').whereNotIn('occurrence_id', updatedArray).del();
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

  }


  //
  let statusCode = event && event.id ? 200 : 422;
  let response = {
    success: event && event.id ? true : false,
    event: event
  };



  // Send response
  res.status(statusCode).json(response);

}