import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { fetchAll } from 'helpers/apiService';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, getComments, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';
import fetch from 'isomorphic-unfetch';
import { getOne } from 'helpers/zoom';


// Function to Get video By ID
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user) { restrictedAccess(res); return false; }

  let eventType = 'zoom'

  // set attributes
  let id = req.query.id;

  var activeproducts = null;
  var languagesAccess = null;
  var subjectIDs = null;
  var chapterAccess = null;
  var accessable = true;
  if (user && user.type != 'ADMIN' && !req.query.noLog) {
    activeproducts = await fetchAll('users/active-products', { field: "live-events", access: true, productID: req.query.productID, noLog: true }, req.headers['x-auth-token'])
    chapterAccess = activeproducts.access && activeproducts.access.chapterIDs.length > 0
    languagesAccess = activeproducts.access && activeproducts.access.languagesAccess
    subjectIDs = activeproducts.access && activeproducts.access.subjectIDs

    accessable = activeproducts.access && activeproducts.access.subjectIDs.length != 0
  }

  let quality = req.query.quality ? req.query.quality : null;


  let event = {
    data: {},
    error: null
  }
  if (!languagesAccess || Object.keys(languagesAccess).length > 0) {
    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fatch video From Database
    event = await knexConnection.transaction(async trx => {
      return trx.select().table('live_events')
        .where('id', id)
        .where(function () {
          if (languagesAccess && chapterAccess) {
            Object.keys(languagesAccess).map((id, i) => {
              id = parseInt(id)
              this.orWhere(function () {
                this.where(function () {
                  this.where('chapter_ids', 'like', `%[${id}]%`).orWhere('chapter_ids', 'like', `%,${id}]%`).orWhere('chapter_ids', 'like', `%[${id},%`).orWhere('chapter_ids', 'like', `%,${id},%`)
                }).whereIn('language_id', languagesAccess[id])
              })
            })
          }
          else if (languagesAccess && chapterAccess) {
            Object.keys(languagesAccess).map((id, i) => {
              id = parseInt(id)
              this.orWhere(function () {
                this.where(function () {
                  this.where('subject_ids', 'like', `%[${id}]%`).orWhere('subject_ids', 'like', `%,${id}]%`).orWhere('subject_ids', 'like', `%[${id},%`).orWhere('subject_ids', 'like', `%,${id},%`)
                }).whereIn('language_id', languagesAccess[id])
              })
            })
          }

        }).first();
    }).then(res => {
      return {
        data: res,
        error: null
      };
    }).catch(err => {
      return {
        data: null,
        error: err.sqlMessage
      };
    })


    // Destrory process (to clean pool)
    knexConnection.destroy();
  } else if (req.query.mode == 'FREE') {

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fatch video From Database
    event = await knexConnection.transaction(async trx => {
      return trx.select().table('live_events')
        .where('id', id).where('mode', req.query.mode)
        .first();
    }).then(res => {
      return {
        data: res,
        error: null
      };
    }).catch(err => {
      return {
        data: null,
        error: err.sqlMessage
      };
    })


    // Destrory process (to clean pool)
    knexConnection.destroy();

  }



  if (event.data) {

    if (event.data.video_id) {


      let uri = event.data.video_id;
      event.data.video_id = event.data.video_id.replace('/videos/', "");

      let url = `https://player.vimeo.com/video/${event.data.video_id}/config`;
      if (quality != null) {
        url = url + '?quality=' + quality;
      }

      let vimeoData = await fetch(url)
        .then(res => res.json())
        .then(res => {
          let vimeo = {

            thumbnailUrl: res.video ? res.video.thumbs['640'] : null,
            videoUrl: res.request ? res.request.files.hls.cdns[res.request.files.hls.default_cdn].url : null,
            embed: res.video ? res.video.embed_code : null,
            timestamp: res.request ? res.request.timestamp : null,
            duration: res.video ? res.video.duration : null,
            progressive: res.video ? res.request.files.progressive : null,
            live_event: res.video ? res.video.live_event : null,
          }

          event.data.thumbnailUrl = vimeo.thumbnailUrl;
          event.data.videoUrl = vimeo.videoUrl;
          event.data.embed = vimeo.embed;
          event.data.timestamp = vimeo.timestamp;
          event.data.duration = vimeo.duration;
          event.data.live_event = vimeo.live_event;
          event.data.progressive = vimeo.progressive;
          //event.data.res = res;
        });

    }

    if (event.data.zoom_id) {
      event.data.zoomDetails = await getOne(event.data.zoom_id, event.data.zoom_type, event.data.zoom_uuid)
    }

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);


    // Combine exam with exam id
    event.data.exams = await knexConnection.transaction(async trx => {
      return trx.select().table('exams').whereIn('exams.id', JSON.parse(event.data.exam_ids));
    });

    // Destrory process (to clean pool)
    knexConnection.destroy();

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);


    // Combine course with course id
    event.data.courses = await knexConnection.transaction(async trx => {
      return trx.select().table('courses').whereIn('courses.id', JSON.parse(event.data.course_ids));
    });

    // Destrory process (to clean pool)
    knexConnection.destroy();

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);


    // Combine subject with subject id
    event.data.subjects = await knexConnection.transaction(async trx => {
      return trx.select().table('subjects').whereIn('subjects.id', JSON.parse(event.data.subject_ids));
    });

    // Destrory process (to clean pool)
    knexConnection.destroy();


    let chapterIDBase = event.data.chapter_ids.replace('[', '').replace(']', '')
    let chapters = await fetchAll('chapters', { chapterID: chapterIDBase, subjectID: subjectIDs, offLimit: true, productID: req.query.productID, noLog: true }, req.headers['x-auth-token'])
    event.data.chapters = chapters.chapters

    if (event.data.batch_ids) {
      // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);
      // Combine chapter with chapter id
      event.data.batches = await knexConnection.transaction(async trx => {
        return trx.select().table('batches').whereIn('batches.id', JSON.parse(event.data.batch_ids));
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();
    }


  }


  if (event.data && user && user.type != 'ADMIN' && !req.query.noLog) {
    let logged_data = {
      user_id: user.id,
      action: 'VIEW_LIVE_EVENT',
      payload: JSON.stringify({
        field_name: 'live_events',
        field_id: event.data.id,
        ...req.query
      })
    }


    let logs = await createLog(logged_data)

    let params = {
      views: event.data.views + 1
    }


    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    // Update Views in events
    let eventUpdate = await knexConnection.transaction(async trx => {
      return trx('events').where('id', event.data.id).update(params);
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

    var embedLink;
    var embadChatLink;

    if (event.data.video_id) {
      embedLink = `https://player.vimeo.com/video/${event.data.video_id}`;
      embadChatLink = `https://vimeo.com/live-chat/${event.data.video_id}/`;

    }
    else {
      embedLink = `https://vimeo.com/event/${event.data.event_id}/embed`;
      embadChatLink = `https://vimeo.com/event/${event.data.event_id}/chat`;

    }

    event.data.embed_url = embedLink;
    event.data.embed_chat_url = embadChatLink;

  }

  if (event.data) {
    event.data.thumbnail = await replaceUploads(event.data.thumbnail);
  }


  //
  let statusCode = event.data ? 200 : 422;
  let response = {
    success: event.data ? true : false,
    event: event.data,
    error: event.error
  };

  // Send Response
  res.status(statusCode).json(response);
}