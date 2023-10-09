import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import moment from 'moment'
import { getSettings } from 'helpers/apiService';
import { Vimeo } from 'vimeo';

// Ping pong the client!
export default async function (req, res) {

  var currentDate = moment().unix()

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Delete video from database
  let videos = await knexConnection.transaction(async trx => {
    return trx('videos').select('id', 'video_id').where('approved', -1).where('rejected_on', '<=', currentDate);
  }).then(res => {
    return {
      data: res,
      error: null
    };
  }).catch(err => {
    return {
      id: null,
      error: err.sqlMessage
    };
  });


  // Destrory process (to clean pool)
  knexConnection.destroy();

  var deletedVideos = [];

  // Delete From vimeo
  let vimeoAuth = await getSettings('vimeoAuth');

  let CLIENT_ID = vimeoAuth.CLIENT_ID;
  let CLIENT_SECRET = vimeoAuth.CLIENT_SECRET;
  let ACCESS_TOKEN = vimeoAuth.ACCESS_TOKEN;

  for (let i = 0; i < videos.data.length; i++) {

    const client = new Vimeo(CLIENT_ID, CLIENT_SECRET, ACCESS_TOKEN);

    videos.data[i].video_id = videos.data[i].video_id.replace('/videos/', "");

    // Delete
    var resp = await client.request({
      method: 'DELETE',
      path: `videos/${videos.data[i].video_id}?fields=uri`
    }, async function (error, body, status_code, headers) {
      if (error) {
        // console.log('error');

      } else {
        // console.log('body');

        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        // Delete video from database
        let video = await knexConnection.transaction(async trx => {
          return trx('videos').where('id', videos.data[i].id).where('approved', -1).where('rejected_on', '<=', currentDate).update('is_active', 0);
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
        });


        // Destrory process (to clean pool)
        knexConnection.destroy();

        deletedVideos.push(videos.data[i]);
      }
    });

  }

  let statusCode = videos ? 200 : 422;
  let response = {
    success: videos ? true : false,
    videos: videos,
    deletedVideos: deletedVideos,
  };


  // Send Response
  res.status(statusCode).json(response);
}