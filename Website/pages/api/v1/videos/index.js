import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { fetchAll } from 'helpers/apiService';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, CourseID, checkPackage, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';
import fetch from 'isomorphic-unfetch';


// Function to Fetch Users
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user) { restrictedAccess(res); return false; }

  let orderBy = req.query.order_by ? req.query.order_by : 'ASC';
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;
  let examID = req.query.examID ? req.query.examID.split(',') : null;
  let courseID = req.query.courseID ? req.query.courseID.split(',') : null;
  let subjectID = req.query.subjectID ? req.query.subjectID.split(',') : null;
  let chapterID = req.query.chapterID ? req.query.chapterID.split(',') : null;
  let quality = req.query.quality ? Number.parseInt(req.query.quality) : null;
  let mode = req.query.mode ? req.query.mode : null;
  let includeVimeo = req.query.includeVimeo ? req.query.includeVimeo : false;
  let batchIds = req.query.batchIDs ? req.query.batchIDs : null;
  let languages = req.query.languages ? req.query.languages.split(',') : null;

  var subjectIDs = null;
  if (user && user.type == 'FACULTY' && user.subject_ids) {
    subjectIDs = user.subject_ids;
  }

  var activeproducts = null;
   var chapterAccess = null;
   var languagesAccess = null;
  var accessable = true;
  if (user && user.type != 'ADMIN' && !req.query.forList) {
    activeproducts = await fetchAll('users/active-products', { field: "videos", access: true, productID: req.query.productID, noLog: true }, req.headers['x-auth-token'])
    chapterAccess = activeproducts.access && activeproducts.access.chapterIDs.length > 0
    languagesAccess = activeproducts.access && activeproducts.access.languagesAccess
    accessable = activeproducts.access && activeproducts.access.subjectIDs.length != 0
  }



  var totalCount = 0

  let videos = {
    data: {},
    error: null
  }
  if (!languagesAccess || Object.keys(languagesAccess).length > 0) {  // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fetch video from database
    videos = await knexConnection.transaction(async trx => {

      let query;

      // 
      query = trx.select('videos.*').table('videos').where('videos.status', 'active')
        .orderBy('videos.position', orderBy);


      if (req.query.search && req.query.search != '') {
        query.where('videos.title', 'like', '%'.concat(req.query.search).concat('%'))
      }


      if (mode) {
        query = query.where('videos.mode', mode)
      }
      if (languages) {
        query = query.whereIn('videos.language_id', languages)
      }

      if ((!req.query.forList || req.query.listOnly)) {
        query.where('videos.is_active', 1)
      }

      if ((!req.query.forList || req.query.listOnly)) {
        query = query.where('videos.approved', true)
      }



      // For Filter
      query.modify(function (queryBuilder) {
        queryBuilder.where(function () {
          this.where(function () {
            if (examID) {
              examID.map((id, i) => {
                this.orWhere('videos.exam_ids', 'like', `%[${id}]%`).orWhere('videos.exam_ids', 'like', `%,${id}]%`).orWhere('videos.exam_ids', 'like', `%[${id},%`).orWhere('videos.exam_ids', 'like', `%,${id},%`)
              })
            }
          })
          this.where(function () {
            if (courseID) {
              courseID.map((id, i) => {
                this.orWhere('videos.course_ids', 'like', `%[${id}]%`).orWhere('videos.course_ids', 'like', `%,${id}]%`).orWhere('videos.course_ids', 'like', `%[${id},%`).orWhere('videos.course_ids', 'like', `%,${id},%`)
              })
            }
          })
          this.where(function () {
            if (subjectID) {
              subjectID.map((id, i) => {
                this.orWhere('videos.subject_ids', 'like', `%[${id}]%`).orWhere('videos.subject_ids', 'like', `%,${id}]%`).orWhere('videos.subject_ids', 'like', `%[${id},%`).orWhere('videos.subject_ids', 'like', `%,${id},%`)
              })
            }
          })
          this.where(function () {
            if (subjectIDs) {
              subjectIDs.map((id, i) => {
                this.orWhere('videos.subject_ids', 'like', `%[${id}]%`).orWhere('videos.subject_ids', 'like', `%,${id}]%`).orWhere('videos.subject_ids', 'like', `%[${id},%`).orWhere('videos.subject_ids', 'like', `%,${id},%`)
              })
            }
          })
          this.where(function () {
            if (chapterID) {
              chapterID.map((id, i) => {
                this.orWhere('videos.chapter_ids', 'like', `%[${id}]%`).orWhere('videos.chapter_ids', 'like', `%,${id}]%`).orWhere('videos.chapter_ids', 'like', `%[${id},%`).orWhere('videos.chapter_ids', 'like', `%,${id},%`)
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

 


  var completeDuration = 0;
  if (videos.data) {


    for (let i = 0; i < videos.data.length; i++) {

      if (user && user.type != 'ADMIN' && !req.query.forList) {
        if (includeVimeo == true && !req.query.listOnly && videos.data[i].lacture_type == 'VIDEO') {
          videos.data[i].video_id = videos.data[i].video_id.replace('/videos/', "");


          let url = `https://player.vimeo.com/video/${videos.data[i].video_id}/config`;
          if (quality != null) {
            url = url + '?quality=' + quality;
          }

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

                videos.data[i].thumbnailUrl = vimeo.thumbnailUrl;
                videos.data[i].videoUrl = vimeo.videoUrl;
                videos.data[i].embed = vimeo.embed;
                videos.data[i].timestamp = vimeo.timestamp;
                // videos.data[i].res = res;
              }
            });


        }

        completeDuration += parseFloat(videos.data[i].duration);

        // Create db process (get into pool)
        knexConnection = require('knex')(knexConnectionConfig);

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
        videos.data[i].locked = (userData.data.video_view_limit <= userData.data.video_count) ? true : false;
        var locked = (userData.data.video_view_limit <= userData.data.video_count) ? true : false;

        if (locked == false) {
          videos.data[i].locked = await checkPackage(req.headers['x-auth-token'], videos.data[i].subject_ids, videos.data[i].mode, 'videos', null, videos.data[i].language_id, activeproducts, videos.data[i].chapter_ids)
        }
      }

     

      if (videos.data[i].lacture_type == 'TEST') {

        // Create db process (get into pool)
        knexConnection = require('knex')(knexConnectionConfig);
  
  
        // Combine subject with subject id
        videos.data[i].questions = await knexConnection.transaction(async trx => {
          return trx.select().table('test_questions').where('test_questions.test_id', videos.data[i].id);
        });
  
        // Destrory process (to clean pool)
        knexConnection.destroy();
      }

      if (!req.query.listOnly) {

        knexConnection = require('knex')(knexConnectionConfig);

        let createdUser = await knexConnection.transaction(async trx => {
          return trx.select().table('users').where('id', videos.data[i].created_by).first();
        })

        videos.data[i].created_user = createdUser ? createdUser.first_name.concat(' ' + createdUser.last_name) : null;

        // Destrory process (to clean pool)
        knexConnection.destroy();

        // Create db process (get into pool)
        knexConnection = require('knex')(knexConnectionConfig);

        videos.data[i].exams = await knexConnection.transaction(async trx => {
          return trx.table('exams').whereIn('id', JSON.parse(videos.data[i].exam_ids)).orderBy('position', 'ASC');
        })

        // Destrory process (to clean pool)
        knexConnection.destroy();

        // Create db process (get into pool)
        knexConnection = require('knex')(knexConnectionConfig);

        videos.data[i].courses = await knexConnection.transaction(async trx => {
          return trx.table('courses').whereIn('id', JSON.parse(videos.data[i].course_ids)).orderBy('position', 'ASC');
        })

        // Destrory process (to clean pool)
        knexConnection.destroy();

        // Create db process (get into pool)
        knexConnection = require('knex')(knexConnectionConfig);

        videos.data[i].subjects = await knexConnection.transaction(async trx => {
          return trx.table('subjects').whereIn('id', JSON.parse(videos.data[i].subject_ids)).orderBy('position', 'ASC');
        })

        // Destrory process (to clean pool)
        knexConnection.destroy();

        // Create db process (get into pool)
        knexConnection = require('knex')(knexConnectionConfig);

        videos.data[i].chapters = await knexConnection.transaction(async trx => {
          return trx.table('chapters').whereIn('id', JSON.parse(videos.data[i].chapter_ids)).orderBy('position', 'ASC');
        })

        // Destrory process (to clean pool)
        knexConnection.destroy();
      }
    }

    if (user && user.type != 'USER' && !req.query.forList) {
      videos.data = videos.data.filter(data => (data.locked == false || !data.locked))
    }


    videos.data = await replaceUploadsArray(videos.data, 'thumbnail');
  }


  if (videos.data && user && user.type != 'ADMIN' && !req.query.listOnly && !req.query.noLog) {
    let logged_data = {
      user_id: user.id,
      action: 'VIEW_ALL_VIDEOS',
      payload: JSON.stringify({
        field_name: 'videos',
        ...req.query
      })
    }


    let logs = await createLog(logged_data)
  }


  //
  let statusCode = videos.data ? 200 : 422;
  let response = {
    success: videos.data ? true : false,
    videos: videos.data,
    totalCount: totalCount,
    completeDuration: completeDuration,
    error: videos.error,
  };

  res.status(statusCode).json(response);
}

const intersect = (arrayA, arrayB) => {
  return arrayA.filter(elem => arrayB.includes(elem));
};