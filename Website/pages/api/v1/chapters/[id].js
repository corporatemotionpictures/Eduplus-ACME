import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog,  replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch Chapters By ID
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

  // Fetch chapter from database
  let chapter = await knexConnection.transaction(async trx => {
    return knexConnection.select('chapters.*').table('chapters')
      .where('chapters.id', id).where('chapters.is_active', 1).first();
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

  if(chapter.data){
    // Create db process (get into pool)

    knexConnection = require('knex')(knexConnectionConfig);

    chapter.data.exams = await knexConnection.transaction(async trx => {
      return trx.table('exams').whereIn('id', JSON.parse(chapter.data.exam_ids)).orderBy('position', 'ASC');
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    knexConnection = require('knex')(knexConnectionConfig);

    chapter.data.exams = await knexConnection.transaction(async trx => {
      return trx.table('exams').whereIn('id', JSON.parse(chapter.data.exam_ids)).orderBy('position', 'ASC');
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();
  }

  if (chapter.data && user && user.type != 'ADMIN' && !req.query.noLog) {
    let logged_data = {
      user_id: user.id,
      action: 'VIEW_CHAPTER',
      payload: JSON.stringify({
        field_name: 'chapters',
        field_id: chapter.data.id,
        ...req.query
      })
    }


    let logs = await createLog(logged_data)

    let params = {
      views: chapter.data.views + 1
    }

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);


    // Update Views in chapters
    let chapterUpdate = await knexConnection.transaction(async trx => {
      return trx('chapters').where('id', chapter.data.id).update(params);
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
  let statusCode = chapter.data ? 200 : 422;
  let response = {
    success: chapter.data ? true : false,
    chapter: chapter.data,
    error: chapter.error
  };

  // Send response
  res.status(statusCode).json(response);
}