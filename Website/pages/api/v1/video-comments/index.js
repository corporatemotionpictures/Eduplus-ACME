import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch comments
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert user
  if (!user) { restrictedAccess(res); return false; }

  // Filters
  let orderBy = req.query.order_by ? req.query.order_by : 'ASC';

  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let userID = req.query.userID ? Number.parseInt(req.query.userID) : null;
  let videoID = req.query.videoID ? Number.parseInt(req.query.videoID) : null;

  // Set attributes
  let attributes = {
    user_first_name: 'users.first_name',
    user_last_name: 'users.last_name',
    user_image: 'users.image'
  };

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch comments from database
  let comments = await knexConnection.transaction(async trx => {
    if (userID) {
      return trx.select('video_comments.*', attributes).table('video_comments')
        .innerJoin('users', 'video_comments.user_id', 'users.id')
        .where('video_comments.user_id', userID)
        .orderBy('video_comments.id', orderBy).offset(offset);
    }
    else if (videoID) {
      return trx.select('video_comments.*', attributes).table('video_comments')
        .innerJoin('users', 'video_comments.user_id', 'users.id')
        .innerJoin('videos', 'video_comments.video_id', 'videos.id')
        .where('video_comments.video_id', videoID)
        .orderBy('video_comments.id', orderBy).offset(offset);
    }
    else {
      return trx.select('video_comments.*', attributes).table('video_comments')
        .innerJoin('users', 'video_comments.user_id', 'users.id')
        .innerJoin('videos', 'video_comments.video_id', 'videos.id')
        .orderBy('video_comments.id', orderBy).offset(offset);
    }
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

  if (comments.data) {

    comments.data = await replaceUploadsArray(comments.data, 'user_image');

    for (let i = 0; i < comments.data.length; i++) {

      if (comments.data[i].subject_id !== null) {

        // Create db process (get into pool)
        knexConnection = require('knex')(knexConnectionConfig);

        let replies = await knexConnection.transaction(async trx => {
          return trx.select('comment_replies.*', attributes).table('comment_replies')
            .innerJoin('users', 'comment_replies.user_id', 'users.id')
            .where('comment_replies.comment_id', comments.data[i].id);
        })
        comments.data[i].replies = replies

        comments.data[i].replies = await replaceUploadsArray(comments.data[i].replies, 'user_image');


        // Destrory process (to clean pool)
        knexConnection.destroy();
      }
    }
  }


  //
  let statusCode = comments.data ? 200 : 422;
  let response = {
    success: comments.data ? true : false,
    comments: comments.data,
    error: comments.error
  };


  // Send response
  res.status(statusCode).json(response);
}