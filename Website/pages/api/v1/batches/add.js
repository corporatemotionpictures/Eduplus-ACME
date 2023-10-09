import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Function to insert batch
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
    title: Joi.string(),
    faculty_id: Joi.string(),
    schedules: Joi.allow(null),
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  params.created_by = user.id;
  if ((user.type == 'MANAGEMENT' || user.type == 'FACULTY')) {
    params.approved = false
  }


  let schedules = params.schedules
  delete params.schedules

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch batch from database
  let position = await knexConnection.transaction(async trx => {
    return trx.select().table('batches').orderBy('position', 'DESC').first();

  })

  // Destrory process (to clean pool)
  knexConnection.destroy();

  params.position = position ? parseInt(position.position) + 1 : 1;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Insert batch from database
  let batch = await knexConnection.transaction(async trx => {
    return trx.insert(params).into('batches');
  }).then(res => {
    return {
      id: res[0],
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


  if (batch.id) {

    schedules = Object.values(schedules)

    schedules.map(sc => sc.batch_id = batch.id)

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    // Insert batch from database
    let schedule = await knexConnection.transaction(async trx => {
      return trx.insert(schedules).into('batch_schedules');
    }).then(res => {
      return {
        id: res[0],
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

  if (batch.id && (user.type == 'MANAGEMENT' || user.type == 'FACULTY')) {


    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Update user in database
    var reciever = await knexConnection.transaction(async trx => {
      return trx('users').where('type', "ADMIN").first();
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    var notice = {
      user_id: user.id,
      reciever_id: reciever.id,
      notification: `New batch-${params.title} Added`,
      redirect_url: `/batches/${batch.id}`,
      icon: '<i className="fas fa-file-alt"></i>'
    };

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Insert notification into database
    let notification = await knexConnection.transaction(async trx => {
      return trx.insert(notice).into('admin_notifications');
    }).then(res => {
      return {
        id: res[0],
        error: null
      };
    }).catch(err => {
      return {
        id: null,
        error: err
      };
    });


    // Destrory process (to clean pool)
    knexConnection.destroy();

  }

  //
  let statusCode = batch.id ? 200 : 422;
  let response = {
    success: batch.id ? true : false,
    'batch': batch
  };



  // Send response
  res.status(statusCode).json(response);
}
