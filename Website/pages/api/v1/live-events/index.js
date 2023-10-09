import { knexConnectionConfig } from 'db/knexConnection';
import { fetchAll } from 'helpers/apiService';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, CourseID, checkPackage, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';
import fetch from 'isomorphic-unfetch';
import { getOne } from 'helpers/zoom';


// Function to Fetch Users
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);


  if (!req.query.mode || req.query.mode != 'FREE') {
    if (!user) { restrictedAccess(res); return false; }
  }


  // Set attributes
  let attributes = {
    chapter_id: 'chapters.id',
    chapter_name: 'chapters.name'
  };

  let orderBy = req.query.order_by ? req.query.order_by : 'ASC';
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;
  let examID = req.query.examID ? req.query.examID.split(',') : null;
  let courseID = req.query.courseID ? req.query.courseID.split(',') : null;
  let subjectID = req.query.subjectID ? req.query.subjectID.split(',') : null;
  let chapterID = req.query.chapterID ? req.query.chapterID.split(',') : null;
  let batches = req.query.batches ? req.query.batches.split(',') : null;
  let mode = req.query.mode ? req.query.mode : null;
  let quality = req.query.quality ? Number.parseInt(req.query.quality) : null;
  let includeVimeo = req.query.includeVimeo ? req.query.includeVimeo : false;
  let languages = req.query.languages ? req.query.languages.split(',') : null;

  var subjectIDs = null;

  if (user && user.type == 'FACULTY' && user.subject_ids) {
    subjectIDs = user.subject_ids;
  }

  var activeproducts = null;
  var languagesAccess = null;
  var batchIds = null;
  var chapterAccess = null;
  var accessable = true;
  if (!req.query.forList) {
    activeproducts = await fetchAll('users/active-products', { field: "live-events", access: true, productID: req.query.productID, noLog: true }, req.headers['x-auth-token'])
    if (activeproducts && activeproducts.access) {
      chapterAccess = activeproducts.access && activeproducts.access.chapterIDs.length > 0
      languagesAccess = activeproducts.access && activeproducts.access.languagesAccess
      batchIds = activeproducts.access && activeproducts.access.batchIds
      accessable = activeproducts.access && activeproducts.access.subjectIDs.length != 0
    }

  }


  var totalCount = 0
  let events = {
    data: [],
    error: null
  }
  if (req.query.viewType || req.query.mode) {
    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fetch video from database
    events = await knexConnection.transaction(async trx => {

      let query;

      // 
      query = trx.select('live_events.*').table('live_events').where('live_events.status', 'active')
        .orderBy('live_events.event_status', 'DESC').orderBy('live_events.position', orderBy)


      if (req.query.search && req.query.search != '') {
        query.where('live_events.title', 'like', '%'.concat(req.query.search).concat('%'))
      }


      if ((!req.query.forList || req.query.listOnly)) {
        query.where('live_events.is_active', 1)
      }

      if (mode) {
        query.where('live_events.mode', mode)
      }
      if (languages) {
        query.whereIn('live_events.language_id', languages)
      }
      if (req.query.viewType == 'webinar') {
        query.where('live_events.zoom_type', 'webinars')
      }



      query.modify(function (queryBuilder) {
        queryBuilder.where(function () {
          this.where(function () {
            if (examID) {
              examID.map((id, i) => {
                this.orWhere('exam_ids', 'like', `%[${id}]%`).orWhere('exam_ids', 'like', `%,${id}]%`).orWhere('exam_ids', 'like', `%[${id},%`).orWhere('exam_ids', 'like', `%,${id},%`)
              })
            }
          })
          this.where(function () {
            if (courseID) {
              courseID.map((id, i) => {
                this.orWhere('course_ids', 'like', `%[${id}]%`).orWhere('course_ids', 'like', `%,${id}]%`).orWhere('course_ids', 'like', `%[${id},%`).orWhere('course_ids', 'like', `%,${id},%`)
              })
            }
          })
          this.where(function () {
            if (subjectID) {
              subjectID.map((id, i) => {
                this.orWhere('subject_ids', 'like', `%[${id}]%`).orWhere('subject_ids', 'like', `%,${id}]%`).orWhere('subject_ids', 'like', `%[${id},%`).orWhere('subject_ids', 'like', `%,${id},%`)
              })
            }
          })
          this.where(function () {
            if (subjectIDs) {
              subjectIDs.map((id, i) => {
                this.orWhere('subject_ids', 'like', `%[${id}]%`).orWhere('subject_ids', 'like', `%,${id}]%`).orWhere('subject_ids', 'like', `%[${id},%`).orWhere('subject_ids', 'like', `%,${id},%`)
              })
            }
          })
          this.where(function () {
            if (chapterID) {
              chapterID.map((id, i) => {
                this.orWhere('chapter_ids', 'like', `%[${id}]%`).orWhere('chapter_ids', 'like', `%,${id}]%`).orWhere('chapter_ids', 'like', `%[${id},%`).orWhere('chapter_ids', 'like', `%,${id},%`)
              })
            }
          })
          this.where(function () {
            if (batches) {
              batches.map((id, i) => {
                this.orWhere('batch_ids', 'like', `%[${id}]%`).orWhere('batch_ids', 'like', `%,${id}]%`).orWhere('batch_ids', 'like', `%[${id},%`).orWhere('batch_ids', 'like', `%,${id},%`)
              })
            }
          })
          this.where('mode', 'FREE').orWhere(function () {
            if (batchIds) {
              batchIds.map((id, i) => {
                this.orWhere('batch_ids', 'like', `%[${id}]%`).orWhere('batch_ids', 'like', `%,${id}]%`).orWhere('batch_ids', 'like', `%[${id},%`).orWhere('batch_ids', 'like', `%,${id},%`).orWhere('batch_ids', '[]')
              })
            }
          })
          this.where('mode', 'FREE').orWhere(function () {

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
            else if (languagesAccess) {
              Object.keys(languagesAccess).map((id, i) => {
                id = parseInt(id)
                this.orWhere(function () {
                  this.where(function () {
                    this.where('subject_ids', 'like', `%[${id}]%`).orWhere('subject_ids', 'like', `%,${id}]%`).orWhere('subject_ids', 'like', `%[${id},%`).orWhere('subject_ids', 'like', `%,${id},%`)
                  }).whereIn('language_id', languagesAccess[id])
                })
              })
            }
          })
        })
      })


      totalCount = await query.clone().count();
      totalCount = totalCount[0]['count(*)'];

      if ((!req.query.offLimit || req.query.offLimit == false)) {
        query = query.clone().offset(offset).limit(limit)
      }

      return query;

    }).then(res => {
      return {
        data: res,
        error: null
      };
    }).catch(err => {
      return {
        data: null,
        error: err
      };
    })


    // Destrory process (to clean pool)
    knexConnection.destroy();
  }
  else if (!languagesAccess || Object.keys(languagesAccess).length > 0) {
    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fetch video from database
    events = await knexConnection.transaction(async trx => {

      let query;

      // 
      query = trx.select('live_events.*').table('live_events').where('live_events.status', 'active')
        .orderBy('live_events.event_status', orderBy).orderBy('live_events.position', orderBy)


      if (req.query.search && req.query.search != '') {
        query.where('live_events.title', 'like', '%'.concat(req.query.search).concat('%'))
      }


      if ((!req.query.forList || req.query.listOnly)) {
        query.where('live_events.is_active', 1)
      }

      if (mode) {
        query.where('live_events.mode', mode)
      }
      if (languages) {
        query.whereIn('live_events.language_id', languages)
      }
      if (req.query.viewType) {
        query.where('live_events.zoom_type', req.query.viewType)
      }



      query.modify(function (queryBuilder) {
        queryBuilder.where(function () {
          this.where(function () {
            if (examID) {
              examID.map((id, i) => {
                this.orWhere('exam_ids', 'like', `%[${id}]%`).orWhere('exam_ids', 'like', `%,${id}]%`).orWhere('exam_ids', 'like', `%[${id},%`).orWhere('exam_ids', 'like', `%,${id},%`)
              })
            }
          })
          this.where(function () {
            if (courseID) {
              courseID.map((id, i) => {
                this.orWhere('course_ids', 'like', `%[${id}]%`).orWhere('course_ids', 'like', `%,${id}]%`).orWhere('course_ids', 'like', `%[${id},%`).orWhere('course_ids', 'like', `%,${id},%`)
              })
            }
          })
          this.where(function () {
            if (subjectID) {
              subjectID.map((id, i) => {
                this.orWhere('subject_ids', 'like', `%[${id}]%`).orWhere('subject_ids', 'like', `%,${id}]%`).orWhere('subject_ids', 'like', `%[${id},%`).orWhere('subject_ids', 'like', `%,${id},%`)
              })
            }
          })
          this.where(function () {
            if (subjectIDs) {
              subjectIDs.map((id, i) => {
                this.orWhere('subject_ids', 'like', `%[${id}]%`).orWhere('subject_ids', 'like', `%,${id}]%`).orWhere('subject_ids', 'like', `%[${id},%`).orWhere('subject_ids', 'like', `%,${id},%`)
              })
            }
          })
          this.where(function () {
            if (chapterID) {
              chapterID.map((id, i) => {
                this.orWhere('chapter_ids', 'like', `%[${id}]%`).orWhere('chapter_ids', 'like', `%,${id}]%`).orWhere('chapter_ids', 'like', `%[${id},%`).orWhere('chapter_ids', 'like', `%,${id},%`)
              })
            }
          })
          this.where(function () {
            if (batches) {
              batches.map((id, i) => {
                this.orWhere('batch_ids', 'like', `%[${id}]%`).orWhere('batch_ids', 'like', `%,${id}]%`).orWhere('batch_ids', 'like', `%[${id},%`).orWhere('batch_ids', 'like', `%,${id},%`)
              })
            }
          })
          this.where(function () {
            if (batchIds) {
              batchIds.map((id, i) => {
                this.orWhere('batch_ids', 'like', `%[${id}]%`).orWhere('batch_ids', 'like', `%,${id}]%`).orWhere('batch_ids', 'like', `%[${id},%`).orWhere('batch_ids', 'like', `%,${id},%`).orWhere('batch_ids', '[]')
              })
            }
          })
          this.where(function () {

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
            else if (languagesAccess) {
              Object.keys(languagesAccess).map((id, i) => {
                id = parseInt(id)
                this.orWhere(function () {
                  this.where(function () {
                    this.where('subject_ids', 'like', `%[${id}]%`).orWhere('subject_ids', 'like', `%,${id}]%`).orWhere('subject_ids', 'like', `%[${id},%`).orWhere('subject_ids', 'like', `%,${id},%`)
                  }).whereIn('language_id', languagesAccess[id])
                })
              })
            }
          })
        })
      })


      totalCount = await query.clone().count();
      totalCount = totalCount[0]['count(*)'];

      if ((!req.query.offLimit || req.query.offLimit == false)) {
        query = query.clone().offset(offset).limit(limit)
      }

      return query;

    }).then(res => {
      return {
        data: res,
        error: null
      };
    }).catch(err => {
      return {
        data: null,
        error: err
      };
    })


    // Destrory process (to clean pool)
    knexConnection.destroy();
  }



  if (events.data) {


    for (let i = 0; i < events.data.length; i++) {


      let eventType = events.data[i].base_type

      knexConnection = require('knex')(knexConnectionConfig);

      let createdUser = await knexConnection.transaction(async trx => {
        return trx.select().table('users').where('id', events.data[i].created_by).first();
      })

      events.data[i].created_user = createdUser ? createdUser.first_name.concat(' ' + createdUser.last_name) : null;

      // Destrory process (to clean pool)
      knexConnection.destroy();


      var embedLink;
      var embadChatLink;

      if (eventType != 'ZOOM') {

        if (events.data[i].video_id) {
          embedLink = `https://player.vimeo.com/video/${events.data[i].video_id}`;
          embadChatLink = `https://vimeo.com/live-chat/${events.data[i].video_id}/`;

        }
        else {
          embedLink = `https://vimeo.com/event/${events.data[i].event_id}/embed`;
          embadChatLink = `https://vimeo.com/event/${events.data[i].event_id}/chat`;

        }

        events.data[i].embed_url = embedLink;
        events.data[i].embed_chat_url = embadChatLink;

      }


      if (events.data[i].zoom_id  && !req.query.forList) {
        events.data[i].zoomDetails = await getOne(events.data[i].zoom_id, events.data[i].zoom_type,  events.data[i].zoom_uuid)
      }


      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      events.data[i].exams = await knexConnection.transaction(async trx => {
        return trx.table('exams').whereIn('id', JSON.parse(events.data[i].exam_ids)).orderBy('position', 'ASC');
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      events.data[i].courses = await knexConnection.transaction(async trx => {
        return trx.table('courses').whereIn('id', JSON.parse(events.data[i].course_ids)).orderBy('position', 'ASC');
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      events.data[i].subjects = await knexConnection.transaction(async trx => {
        return trx.table('subjects').whereIn('id', JSON.parse(events.data[i].subject_ids)).orderBy('position', 'ASC');
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      events.data[i].chapters = await knexConnection.transaction(async trx => {
        return trx.table('chapters').whereIn('id', JSON.parse(events.data[i].chapter_ids)).orderBy('position', 'ASC');
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

    }

    events.data = await replaceUploadsArray(events.data, 'thumbnail');
  }


  if (events.data && user && user.type != 'ADMIN' && !req.query.listOnly && !req.query.noLog) {
    let logged_data = {
      user_id: user.id,
      action: 'VIEW_ALL_LIVE_EVENTS',
      payload: JSON.stringify({
        field_name: 'live_events',
        ...req.query
      })
    }


    let logs = await createLog(logged_data)
  }

  var completeDuration = 0;

  if (events.data && user && user.type != 'ADMIN' && !req.query.forList) {

    for (let i = 0; i < events.data.length; i++) {

      events.data[i].locked = await checkPackage(req.headers['x-auth-token'], events.data[i].subject_ids, events.data[i].mode, 'live-events', null, events.data[i].language_id, activeproducts, events.data[i].chapter_ids)
    }
    events.data = events.data.filter(data => data.locked == false)
  }

  //
  let statusCode = events.data ? 200 : 422;
  let response = {
    success: events.data ? true : false,
    events: events.data,
    completeDuration: completeDuration ? completeDuration : 0,
    totalCount: totalCount,
    error: events.error,
  };

  res.status(statusCode).json(response);
}

const intersect = (arrayA, arrayB) => {
  return arrayA.filter(elem => arrayB.includes(elem));
};