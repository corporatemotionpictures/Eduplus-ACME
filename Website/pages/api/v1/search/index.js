import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { fetchAll } from 'helpers/apiService';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed, search, checkPackage } from 'helpers/api';
import fetch from 'isomorphic-unfetch';

// Function to Fetch Course
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user) { restrictedAccess(res); return false; }

  // Filter
  let orderBy = req.query.order_by ? req.query.order_by : 'DESC';
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;
  let searchKey = req.query.searchKey ? req.query.searchKey : null;
  let includeVimeo = req.query.includeVimeo ? req.query.includeVimeo : false;

  var activeproducts = null;
  var languagesAccess = [];
  var chapterAccess = null;
  var accessable = true;
  if (user && user.type != 'ADMIN') {
    activeproducts = await fetchAll('users/active-products', { access: true, noLog: true }, req.headers['x-auth-token'])
    chapterAccess = activeproducts.access && activeproducts.access.chapterIDs.length > 0
    languagesAccess = activeproducts.access && activeproducts.access && languagesAccess
  }

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch All exams
  let exams = await knexConnection.transaction(async trx => {
    return trx.select().table('exams').where('is_active', 1).orderBy('id', orderBy).modify(function (queryBuilder) {
      queryBuilder.where(function () {
        if (activeproducts) {
          this.whereIn('id', activeproducts.access && examIDs)
        }
      })
    });
  })

  // Destrory process (to clean pool)
  knexConnection.destroy();

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch All Courses
  let courses = await knexConnection.transaction(async trx => {
    return trx.select().table('courses').where('is_active', 1).orderBy('id', orderBy).modify(function (queryBuilder) {
      queryBuilder.where(function () {
        if (activeproducts) {
          this.whereIn('id', activeproducts.access && courseIDs)
        }
      })
    });
  })

  // Destrory process (to clean pool)
  knexConnection.destroy();

  // Create db process (get into pool)
  knexConnection = require('knex')(knexConnectionConfig);


  // Fetch All Subjects
  let subjects = await knexConnection.transaction(async trx => {
    return trx.select().table('subjects').where('is_active', 1).orderBy('id', orderBy).modify(function (queryBuilder) {
      if (activeproducts) {
        queryBuilder.where(function () {
          this.whereIn('id', activeproducts.access && subjectIDs)
        })
      }
    });
  })

  // Destrory process (to clean pool)
  knexConnection.destroy();

  chapterAccess = null

  if (user && user.type != 'ADMIN') {
    activeproducts = await fetchAll('users/active-products', { field: 'videos', access: true, noLog: true }, req.headers['x-auth-token'])
    chapterAccess = activeproducts.access &&  activeproducts.access.chapterIDs.length > 0
    languagesAccess = activeproducts.access &&  activeproducts.access.languagesAccess
  }

  let videos = []

  if (activeproducts && languagesAccess && Object.keys(languagesAccess).length > 0) {


    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);


    // Fetch All Videos
    videos = await knexConnection.transaction(async trx => {
      return trx.select().table('videos').orderBy('id', orderBy).where('status', 'active').modify(function (queryBuilder) {
        if (languagesAccess && chapterAccess) {
          queryBuilder.where(function () {

            Object.keys(languagesAccess).map((id, i) => {
              id = parseInt(id)
              this.orWhere(function () {
                this.where(function () {
                  this.where('chapter_ids', 'like', `%[${id}]%`).orWhere('chapter_ids', 'like', `%,${id}]%`).orWhere('chapter_ids', 'like', `%[${id},%`).orWhere('chapter_ids', 'like', `%,${id},%`)
                }).whereIn('language_id', languagesAccess[id])
              })
            })
          })
        }
        else if (languagesAccess) {
          queryBuilder.where(function () {

            Object.keys(languagesAccess).map((id, i) => {
              id = parseInt(id)
              this.orWhere(function () {
                this.where(function () {
                  this.where('subject_ids', 'like', `%[${id}]%`).orWhere('subject_ids', 'like', `%,${id}]%`).orWhere('subject_ids', 'like', `%[${id},%`).orWhere('subject_ids', 'like', `%,${id},%`)
                }).whereIn('language_id', languagesAccess[id])
              })
            })
          })
        }
      });
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

  }


  if (user && user.type != 'ADMIN') {
    activeproducts = await fetchAll('users/active-products', { field: 'one-liner-questions', access: true, noLog: true }, req.headers['x-auth-token'])
    chapterAccess = activeproducts.access && activeproducts.access.chapterIDs.length > 0
    languagesAccess = activeproducts.access && activeproducts.access.languagesAccess
  }

  // Create db process (get into pool)
  knexConnection = require('knex')(knexConnectionConfig);


  let oneLineQuestions = await knexConnection.transaction(async trx => {
    return trx.select().table('one_line_questions').orderBy('id', orderBy);
  })

  // Destrory process (to clean pool)
  knexConnection.destroy();


  if (user && user.type != 'ADMIN') {
    activeproducts = await fetchAll('users/active-products', { field: 'previous-year-question-papers', access: true, noLog: true }, req.headers['x-auth-token'])
    chapterAccess = activeproducts.access && activeproducts.access.chapterIDs.length > 0
    languagesAccess = activeproducts.access && activeproducts.access.languagesAccess
  }

  let pyqPapers = []

  if (activeproducts && languagesAccess && Object.keys(languagesAccess).length > 0) {
    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);


    pyqPapers = await knexConnection.transaction(async trx => {
      return trx.select().table('previous_year_question_papers').orderBy('id', orderBy)
        .modify(function (queryBuilder) {
          if (languagesAccess && chapterAccess) {
            queryBuilder.where(function () {

              Object.keys(languagesAccess).map((id, i) => {
                id = parseInt(id)
                this.orWhere(function () {
                  this.where(function () {
                    this.where('chapter_ids', 'like', `%[${id}]%`).orWhere('chapter_ids', 'like', `%,${id}]%`).orWhere('chapter_ids', 'like', `%[${id},%`).orWhere('chapter_ids', 'like', `%,${id},%`)
                  }).whereIn('language_id', languagesAccess[id])
                })
              })
            })
          }
          else if (languagesAccess) {
            queryBuilder.where(function () {

              Object.keys(languagesAccess).map((id, i) => {
                id = parseInt(id)
                this.orWhere(function () {
                  this.where(function () {
                    this.where('subject_ids', 'like', `%[${id}]%`).orWhere('subject_ids', 'like', `%,${id}]%`).orWhere('subject_ids', 'like', `%[${id},%`).orWhere('subject_ids', 'like', `%,${id},%`)
                  }).whereIn('language_id', languagesAccess[id])
                })
              })
            })
          }
        });
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();
  }

  // Check If search key exist
  if (searchKey) {
    // Create Options
    let optionsKB = ['name']
    let optionsVideo = ['title', 'tags']
    let optionsOLQ = ['question']
    let optionsPYQ = ['title']

    // Call Function for Search
    exams = search(optionsKB, exams, searchKey)
    courses = search(optionsKB, courses, searchKey)
    subjects = search(optionsKB, subjects, searchKey)
    videos = search(optionsVideo, videos, searchKey)
    oneLineQuestions = search(optionsOLQ, oneLineQuestions, searchKey)
    pyqPapers = search(optionsPYQ, pyqPapers, searchKey)


    if (videos) {
      for (let i = 0; i < videos.length; i++) {

        if (includeVimeo == true) {

          videos[i].video_id = videos[i].video_id.replace('/videos/', "");


          let url = `https://player.vimeo.com/video/${videos[i].video_id}/config`;


          let vimeoData = await fetch(url)
            .then(res => res.json())
            .then(res => {
              if (res.video) {
                let vimeo = {

                  thumbnailUrl: res.video ? res.video.thumbs['640'] : null,
                  videoUrl: res.request ? res.request.files.hls.cdns[res.request.files.hls.default_cdn].url : null,
                  embed: res.video ? res.video.embed_code : null,
                  timestamp: res.request ? res.request.timestamp : null,
                  duration: res.video ? res.video.duration : null
                }

                videos[i].thumbnailUrl = vimeo.thumbnailUrl;
                videos[i].videoUrl = vimeo.videoUrl;
                videos[i].embed = vimeo.embed;
                videos[i].timestamp = vimeo.timestamp;

              }
            });

        }


        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        // Fatch user From Database
        let userData = await knexConnection.transaction(async trx => {
          return trx.select('video_view_limit', 'video_count').table('users').where('id', user.id).first();
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

        videos[i].locked = (userData.data.video_view_limit <= userData.data.video_count) ? true : false;

        if (videos[i].created_by) {

          knexConnection = require('knex')(knexConnectionConfig);

          let createdUser = await knexConnection.transaction(async trx => {
            return trx.select().table('users').where('id', videos[i].created_by).first();
          })

          videos[i].created_user = createdUser ? createdUser.first_name.concat(' ' + createdUser.last_name) : null;
        }
        // Destrory process (to clean pool)
        knexConnection.destroy();

        // Create db process (get into pool)
        knexConnection = require('knex')(knexConnectionConfig);

        videos[i].exams = await knexConnection.transaction(async trx => {
          return trx.table('exams').whereIn('id', JSON.parse(videos[i].exam_ids)).orderBy('position', 'ASC');
        })

        // Destrory process (to clean pool)
        knexConnection.destroy();

        // Create db process (get into pool)
        knexConnection = require('knex')(knexConnectionConfig);

        videos[i].courses = await knexConnection.transaction(async trx => {
          return trx.table('courses').whereIn('id', JSON.parse(videos[i].course_ids)).orderBy('position', 'ASC');
        })

        // Destrory process (to clean pool)
        knexConnection.destroy();

        // Create db process (get into pool)
        knexConnection = require('knex')(knexConnectionConfig);

        videos[i].subjects = await knexConnection.transaction(async trx => {
          return trx.table('subjects').whereIn('id', JSON.parse(videos[i].subject_ids)).orderBy('position', 'ASC');
        })

        // Destrory process (to clean pool)
        knexConnection.destroy();

        // Create db process (get into pool)
        knexConnection = require('knex')(knexConnectionConfig);

        videos[i].chapters = await knexConnection.transaction(async trx => {
          return trx.table('chapters').whereIn('id', JSON.parse(videos[i].chapter_ids)).orderBy('position', 'ASC');
        })

        // Destrory process (to clean pool)
        knexConnection.destroy();

      }


    }
    videos = await replaceUploadsArray(videos, 'thumbnail');


  }

  //
  let statusCode = courses ? 200 : 422;
  let response = {
    success: courses ? true : false,
    exams: exams,
    courses: courses,
    subjects: subjects,
    videos: videos,
    oneLineQuestions: oneLineQuestions,
    pyqPapers: pyqPapers
  };

  res.status(statusCode).json(response);
}