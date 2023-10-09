import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog,  replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Get Subject By ID
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user) { restrictedAccess(res); return false; }

  // Set attributes 
  let id = req.query.id;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch subject from database
  let subject = await knexConnection.transaction(async trx => {
    return trx.select('subjects.*').table('subjects')
      .where('subjects.id', id).where('subjects.is_active', 1).first();

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


  if(subject.data){
    // Create db process (get into pool)
    subject.data.thumbnail = await replaceUploads(subject.data.thumbnail);

    knexConnection = require('knex')(knexConnectionConfig);

    subject.data.exams = await knexConnection.transaction(async trx => {
      return trx.table('exams').whereIn('id', JSON.parse(subject.data.exam_ids)).orderBy('position', 'ASC');
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    knexConnection = require('knex')(knexConnectionConfig);

    subject.data.exams = await knexConnection.transaction(async trx => {
      return trx.table('exams').whereIn('id', JSON.parse(subject.data.exam_ids)).orderBy('position', 'ASC');
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();
  }


  if (subject.data && user && user.type != 'ADMIN' && !req.query.noLog) {
    let logged_data = {
      user_id: user.id,
      action: 'VIEW_SUBJECT',
      payload: JSON.stringify({
        field_name: 'subjects',
        field_id: subject.data.id,
        ...req.query
      })
    }


    let logs = await createLog(logged_data)

    
    let params = {
      views: subject.data.views + 1
    }

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);
    
    // Update Views in subjects
    let subjectUpdate = await knexConnection.transaction(async trx => {
      return trx('subjects').where('id', subject.data.id).update(params);
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
  let statusCode = subject.data ? 200 : 422;
  let response = {
    success: subject.data ? true : false,
    subject: subject.data,
    error: subject.error
  };

  // Send Response 
  res.status(statusCode).json(response);
}