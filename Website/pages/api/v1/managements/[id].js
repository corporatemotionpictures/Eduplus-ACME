import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed, jsonSafe } from 'helpers/api';

// Function to Get User By ID
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req, false);

  // Only ADMIN type of User allowed to insert course
  if (!user) { restrictedAccess(res); return false; }

  // set attributes
  let id = req.query.id;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fatch user From Database
  user = await knexConnection.transaction(async trx => {
    return trx.select().table('users').where('id', id).first();
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


  if (user.data) {// Create db process (get into pool)
    user.data.image = await replaceUploads(user.data.image);
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fatch user From Database
    let permissions = await knexConnection.transaction(async trx => {
      return trx.select().table('user_permissions').where('user_id', user.data.id);
    })


    // Destrory process (to clean pool)
    knexConnection.destroy();

    user.data.module_ids = []
    permissions ? permissions.map((permission) => { user.data.module_ids.push(permission.module_id) }) : []

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fatch user From Database
    user.data.modules = await knexConnection.transaction(async trx => {
      return trx.select().table('modules').whereIn('id', user.data.module_ids);
    })


    // Destrory process (to clean pool)
    knexConnection.destroy();

    // For falcuties
    if (user.data.type == 'FACULTY') {

      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      // Fatch user From Database
      let subjects = await knexConnection.transaction(async trx => {
        return trx.select().table('faculty_subjects').where('user_id', user.data.id);
      })


      // Destrory process (to clean pool)
      knexConnection.destroy();



      user.data.subject_ids = []
      subjects ? subjects.map((subject) => { user.data.subject_ids.push(subject.subject_id) }) : []

      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      // Fatch user From Database
      user.data.subjects = await knexConnection.transaction(async trx => {
        return trx.select().table('subjects').whereIn('id', user.data.subject_ids);
      })


      // Destrory process (to clean pool)
      knexConnection.destroy();

      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      // Fatch user From Database
      user.data.authenticationDetails = await knexConnection.transaction(async trx => {
        return trx.select().table('2fa_details').where('user_id', user.data.id).first();
      })


      // Destrory process (to clean pool)
      knexConnection.destroy();


    }

  }

  //
  let statusCode = user.data ? 200 : 422;
  let response = {
    success: user.data ? true : false,
    user: jsonSafe(user.data),
    error: user.error
  };

  // Send Response
  res.status(statusCode).json(response);
}