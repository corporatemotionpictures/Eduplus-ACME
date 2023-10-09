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


  if (user.data) {
    user.data.image = await replaceUploads(user.data.image);

    // // Create db process (get into pool)
    // knexConnection = require('knex')(knexConnectionConfig);

    // // Fetch package from database
    // let packageDetail = await knexConnection.transaction(async trx => {
    //   return trx.select('packages.title').table('packages')
    //     .where('packages.id', user.data.package_id).first();
    // })

    // // Destrory process (to clean pool)
    // knexConnection.destroy();

    // user.data.package = packageDetail ? packageDetail.title : '';
    // user.data.packageName = packageDetail ? packageDetail.title : '';



    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Update user in database
    user.data.addresses = await knexConnection.transaction(async trx => {
      return trx('addresses').where('user_id', user.data.id);
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Update user in database
    user.data.academic_details = await knexConnection.transaction(async trx => {
      return trx('academic_details').where('user_id', user.data.id);
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Update user in database
    user.data.user_guardians = await knexConnection.transaction(async trx => {
      return trx('user_guardians').where('user_id', user.data.id);
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();


    user.data.branch_id = user.data.branch;

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Update user in database
    user.data.branch = await knexConnection.transaction(async trx => {
      return trx('courses').where('id', user.data.branch).first();
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();


    user.data.branch = user.data.branch ? user.data.branch.name : ''
    user.data.image = await replaceUploads(user.data.image);

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Update user in database
    user.data.membership_documents = await knexConnection.transaction(async trx => {
      return trx('user_membership_doucuments').select('user_membership_doucuments.*', 'memberships.title').where('user_membership_doucuments.user_id', user.data.id)
        .join('memberships', 'user_membership_doucuments.membership_id', 'memberships.id');
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    user.data.membership_documents = await replaceUploadsArray(user.data.membership_documents, 'document');


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