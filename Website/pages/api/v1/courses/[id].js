import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Get Course By ID
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  // if (!user) { restrictedAccess(res); return false; }

  // set attributes
  let id = req.query.id;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fatch Course From Database
  let course = await knexConnection.transaction(async trx => {
    return trx.select('courses.*').table('courses').where('courses.id', id)
      .where('courses.is_active', 1).first();
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

  if (course.data && user && user.type != 'ADMIN' && !req.query.noLog) {
    let logged_data = {
      user_id: user.id,
      action: 'VIEW_COURSE',
      payload: JSON.stringify({
        field_name: 'courses',
        field_id: course.data.id,
        ...req.query
      })
    }


    let logs = await createLog(logged_data)

    
    let params = {
      views: course.data.views + 1
    }

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    // Update Views in courses
    let courseUpdate = await knexConnection.transaction(async trx => {
      return trx('courses').where('id', course.data.id).update(params);
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


  if(course.data){
    // Create db process (get into pool)
    course.data.thumbnail = await replaceUploads(course.data.thumbnail);

    knexConnection = require('knex')(knexConnectionConfig);

    course.data.exams = await knexConnection.transaction(async trx => {
      return trx.table('exams').whereIn('id', JSON.parse(course.data.exam_ids)).orderBy('position', 'ASC');
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();
  }

  //
  let statusCode = course.data ? 200 : 422;
  let response = {
    success: course.data ? true : false,
    course: course.data,
    error: course.error
  };

  // Send Response
  res.status(statusCode).json(response);
}