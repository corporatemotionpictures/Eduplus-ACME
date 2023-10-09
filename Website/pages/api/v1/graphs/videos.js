import { getOnly, createLog, replaceUploads, replaceUploadsArray, injectMethodNotAllowed, restrictedAccess, verifyToken } from 'helpers/api';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';

// Login
export default async function (req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user) { restrictedAccess(res); return false; }


  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fatch log From Database
  let logs = await knexConnection.transaction(async trx => {
    return trx.select().table('logs').where('user_id', user.id).andWhere('action', 'VIEW_VIDEO');
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


  let count = 0;
  var array = [];
  var payload;

  if (logs.data) {

    for (let i = 0; i < logs.data.length; i++) {

      payload = JSON.parse(logs.data[i].payload);
      if (!array.includes(payload.field_id)) {
        array.push(payload.field_id)


        // Create db process (get into pool)
        knexConnection = require('knex')(knexConnectionConfig);

        // Fatch video From Database
        let video = await knexConnection.transaction(async trx => {
          return trx.select().table('videos').where('status', 'active')
            .where('id', payload.field_id).first();
        })

        // Destrory process (to clean pool)
        knexConnection.destroy();

        if (video) {
          count++;
        }
      }

    }
  }


  // Create db process (get into pool)
  knexConnection = require('knex')(knexConnectionConfig);

  // Fatch log From Database
  let videos = await knexConnection.transaction(async trx => {
    return knexConnection.count('*', { as: 'count' }).table('videos').where('status', 'active');
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

  // Set Response
  let response = {
    'success': logs && videos ? true : false,
    'student_video_count': logs.data ? count : 0,
    'video_count': videos.data ? videos.data[0].count : null,
  };

  let statusCode = logs && videos ? 200 : 400;

  // Send Response
  res.status(statusCode).json(response);
}