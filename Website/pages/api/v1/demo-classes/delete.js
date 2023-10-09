import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Function to Delete Chapter
export default async function base(req, res) {

  //  verify token 
  

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }


  // Validate request with rules
  let schema = Joi.object({
    id: Joi.number().required()
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  // Set attributes
  let id = params.id;
  params.is_active = false;


  var count = 0;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Delete chapter from database
  let subject = await knexConnection.transaction(async trx => {
    return trx('subjects').where('chapter_id', id).count('*', { as: 'count' }).first();
  });

  // Destrory process (to clean pool)
  knexConnection.destroy();

  count += parseInt(subject.count);

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Delete chapter from database
  let chapter = await knexConnection.transaction(async trx => {
    return trx('chapters').where('chapter_id', id).count('*', { as: 'count' }).first();
  });

  // Destrory process (to clean pool)
  knexConnection.destroy();

  count += parseInt(chapter.count);

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Delete chapter from database
  let video = await knexConnection.transaction(async trx => {
    return trx('videos').where('chapter_id', id).count('*', { as: 'count' }).first();
  });

  // Destrory process (to clean pool)
  knexConnection.destroy();

  count += parseInt(video.count);

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Delete chapter from database
  let blog = await knexConnection.transaction(async trx => {
    return trx('blogs').where('chapter_id', id).count('*', { as: 'count' }).first();
  })

  // Destrory process (to clean pool)
  knexConnection.destroy();


  count += parseInt(blog.count);

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Delete chapter from database
  let pyq = await knexConnection.transaction(async trx => {
    return trx('previous_year_question_papers').where('chapter_id', id).count('*', { as: 'count' }).first();
  })

  // Destrory process (to clean pool)
  knexConnection.destroy();

  count += parseInt(pyq.count);

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Delete chapter from database
  let qb = await knexConnection.transaction(async trx => {
    return trx('question_banks').where('chapter_id', id).count('*', { as: 'count' }).first();
  })

  // Destrory process (to clean pool)
  knexConnection.destroy();

  count += parseInt(qb.count);


  var batch = null;

  if (count <= 0) {

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Delete batch from database
    batch = await knexConnection.transaction(async trx => {
      return trx('batches').where('id', id).update(params);
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
  let statusCode = batch ? 200 : 422;
  let response = {
    success: batch ? true : false,
    'batch': batch ? batch : null,
    subChild : count
  };


  // Send response
  res.status(statusCode).json(response);
}
