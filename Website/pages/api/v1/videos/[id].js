import { knexConnectionConfig } from 'db/knexConnection';
import { fetchAll, getSettings } from 'helpers/apiService';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, getComments, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';
import fetch from 'isomorphic-unfetch';


// Function to Get video By ID
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user) { restrictedAccess(res); return false; }

  // set attributes
  let id = req.query.id;

  let quality = req.query.quality ? req.query.quality : null;

  var activeproducts = null;
  var languagesAccess = null;
  var chapterAccess = null;
  var accessable = true;
  var subjectIDs = null;
  if (user && user.type != 'ADMIN' && !req.query.noLog) {
    activeproducts = await fetchAll('users/active-products', { field: "videos", access: true, productID: req.query.productID, noLog: true }, req.headers['x-auth-token'])
    chapterAccess = activeproducts.access && activeproducts.access.chapterIDs.length > 0
    languagesAccess = activeproducts.access && activeproducts.access.languagesAccess
    accessable = activeproducts.access && activeproducts.access.subjectIDs.length != 0
    subjectIDs = activeproducts.access && activeproducts.access.subjectIDs
  }

  let video = {
    data: {},
    error: null
  }
  if (!languagesAccess || Object.keys(languagesAccess).length > 0) {  // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fatch video From Database
    video = await knexConnection.transaction(async trx => {
      return trx.select().table('videos')
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

  if (video.data) {

    if (video.data.lacture_type == 'VIDEO') {

      let uri = video.data.video_id;
      video.data.video_id = video.data.video_id.replace('/videos/', "");

      let url = `https://player.vimeo.com/video/${video.data.video_id}/config`;
      if (quality != null) {
        url = url + '?quality=' + quality;
      }

      let vimeoData = await fetch(url)
        .then(res => res.json())
        .then(res => {
          console.log(res.request)
          let vimeo = {


            thumbnailUrl: res.video ? res.video.thumbs['640'] : null,
            videoUrl: res.request ? ((res.request.files.progressive && res.request.files.progressive[0]) ? res.request.files.progressive[0].url : (res.request.files.hls.cdns[res.request.files.hls.default_cdn] ? res.request.files.hls.cdns[res.request.files.hls.default_cdn].url : null)) : null,
            embed: res.video ? res.video.embed_code : null,
            timestamp: res.request ? res.request.timestamp : null,
            duration: res.video ? res.video.duration : null,
            progressive: res.video ? res.request.files.progressive : null
          }

          video.data.thumbnailUrl = vimeo.thumbnailUrl;
          video.data.videoUrl = vimeo.videoUrl;
          video.data.embed = vimeo.embed;
          video.data.timestamp = vimeo.timestamp;
          video.data.duration = vimeo.duration;
          video.data.progressive = vimeo.progressive;
          // video.data.res = res;
        });

      if (video.data.progressive.length <= 0) {



        let vimeoAuth = await getSettings('vimeoAuth');

        let CLIENT_ID = vimeoAuth.CLIENT_ID;
        let CLIENT_SECRET = vimeoAuth.CLIENT_SECRET;
        let ACCESS_TOKEN = vimeoAuth.ACCESS_TOKEN;



        let url = `https://api.vimeo.com/videos/${video.data.video_id}`;
        if (quality != null) {
          url = url + '?quality=' + quality;
        }

        let vimeoData = await fetch(url, {
          headers: {
            Accept: "application/vnd.vimeo.*+json;version=3.4",
            "Content-Type": "application/json",
            Authorization: "bearer " + ACCESS_TOKEN,
          }
        })
          .then(res => res.json())
          .then(res => {

            console.log(res)
            let vimeo = {

              thumbnailUrl: res.video ? res.video.thumbs['640'] : null,
              videoUrl: res.play ? ((res.play.progressive && res.play.progressive[0]) ? res.play.progressive[0].link : (res.play.hls.cdns[res.play.hls.default_cdn] ? res.play.hls.cdns[res.play.hls.default_cdn].url : null)) : null,
              embed: res.embed ? res.embed.html : null,
              timestamp: res.request ? res.request.timestamp : null,
              duration: res ? res.duration : null,
              progressive: res.play ? res.play.progressive : null
            }

            video.data.videoUrl = vimeo.videoUrl;
            video.data.progressive = vimeo.progressive;

            for (let p = 0; p < video.data.progressive.length; p++) {
              video.data.progressive[p].url = video.data.progressive[p].link
              video.data.progressive[p].quality = video.data.progressive[p].width
            }

            if (video.data.progressive.length > 0) {
              video.data.videoUrl = video.data.progressive[0].url;
            }
          });

      }
    }



    // video comments
    // let comments = await getComments(uri);
    // video.data.count_comments = comments.total;
    // video.data.comments = comments.data;

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);


    // Combine course with course id
    video.data.exams = await knexConnection.transaction(async trx => {
      return trx.select().table('exams').whereIn('exams.id', JSON.parse(video.data.exam_ids));
    });

    // Destrory process (to clean pool)
    knexConnection.destroy();

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);


    // Combine course with course id
    video.data.courses = await knexConnection.transaction(async trx => {
      return trx.select().table('courses').whereIn('courses.id', JSON.parse(video.data.course_ids));
    });

    // Destrory process (to clean pool)
    knexConnection.destroy();

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);


    // Combine subject with subject id
    video.data.subjects = await knexConnection.transaction(async trx => {
      return trx.select().table('subjects').whereIn('subjects.id', JSON.parse(video.data.subject_ids));
    });

    // Destrory process (to clean pool)
    knexConnection.destroy();

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);


    // Combine subject with subject id
    video.data.language = await knexConnection.transaction(async trx => {
      return trx.select().table('languages').where('languages.id', video.data.language_id).first();
    });

    // Destrory process (to clean pool)
    knexConnection.destroy();

    let chapterIDBase = video.data.chapter_ids.replace('[', '').replace(']', '')
    let query = { chapterID: chapterIDBase, offLimit: true, productID: req.query.productID, noLog: true }
    if (subjectIDs) {
      query.subjectID = subjectIDs
    }

    let chapters = await fetchAll('chapters', query, req.headers['x-auth-token'])
    video.data.chapters = chapters.chapters

    // Set attributes
    let attributes = {
      user_first_name: 'users.first_name',
      user_last_name: 'users.last_name',
      user_image: 'users.image'
    };

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    // Combine comment with video id
    video.data.all_comments = await knexConnection.transaction(async trx => {
      return trx.select('video_comments.*', attributes).table('video_comments')
        .join('users', 'video_comments.user_id', 'users.id')
        .where('video_comments.video_id', video.data.id);
    });

    // Destrory process (to clean pool)
    knexConnection.destroy();

    video.data.count_comments = 0;

    if (video.data.all_comments) {

      video.data.count_comments = video.data.all_comments.length;

      video.data.all_comments = await replaceUploadsArray(video.data.all_comments, 'user_image');

      for (let i = 0; i < video.data.all_comments.length; i++) {

        if (video.data.all_comments[i].subject_id !== null) {

          // Create db process (get into pool)
          knexConnection = require('knex')(knexConnectionConfig);

          let replies = await knexConnection.transaction(async trx => {
            return trx.select('comment_replies.*', attributes).table('comment_replies')
              .innerJoin('users', 'comment_replies.user_id', 'users.id')
              .where('comment_replies.comment_id', video.data.all_comments[i].id);
          })
          video.data.all_comments[i].replies = replies

          video.data.all_comments[i].replies = await replaceUploadsArray(video.data.all_comments[i].replies, 'user_image');


          // Destrory process (to clean pool)
          knexConnection.destroy();
        }

      }

    }

    if (video.data.lacture_type == 'TEST') {

      // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);


      // Combine subject with subject id
      video.data.questions = await knexConnection.transaction(async trx => {
        return trx.select().table('test_questions').where('test_questions.test_id', video.data.id);
      });

      // Destrory process (to clean pool)
      knexConnection.destroy();
    }

  }


  if (video.data && user && user.type != 'ADMIN' && !req.query.noLog) {
    let logged_data = {
      user_id: user.id,
      action: video.data.lacture_type != 'TEST' ? 'VIEW_VIDEO' : 'VIEW_TEST',
      payload: JSON.stringify({
        field_name: 'videos',
        field_id: video.data.id,
        ...req.query
      })
    }


    if (video.data.lacture_type == 'VIDEO') {
      let logs = await createLog(logged_data)

      let params = {
        views: video.data.views + 1
      }

      // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);

      // Update Views in Videos
      let videoUpdate = await knexConnection.transaction(async trx => {
        return trx('videos').where('id', video.data.id).update(params);
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

  }


  video.data.thumbnail = await replaceUploads(video.data.thumbnail);

  //
  let statusCode = video.data ? 200 : 422;
  let response = {
    success: video.data ? true : false,
    video: video.data,
    error: video.error
  };

  // Send Response
  res.status(statusCode).json(response);
}