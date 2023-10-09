import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, injectMethodNotAllowed, verifyToken, restrictedAccess, validateRequestParams, genrateToken, jsonSafe, invalidFormData } from 'helpers/api';


// Verify OTP
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user) { restrictedAccess(res); return false; }

  var knexConnection;
  let otsUrl =  process.env.NEXT_PUBLIC_TEST_SERIES_URL

  // Create db process (get into pool)
  knexConnection = require('knex')(knexConnectionConfig);

  user = await knexConnection.transaction(async trx => {
    return trx.select().table('users').where('id', user.id).where('is_active', 1).first();
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
  });

  // Destrory process (to clean pool)
  knexConnection.destroy();



  let OtsAccessToken = null

  if (user && user.data) {
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
    user.data.guardians = await knexConnection.transaction(async trx => {
      return trx('user_guardians').where('user_id', user.data.id);
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();


  }

  let otsIntigration = process.env.NEXT_PUBLIC_OTS_INTIGRATION

  if (user && user.data && otsIntigration == "true") {
    let url = otsUrl.concat('/getMagicToken')

    let ots = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.data.email
      }),
    })

    if (ots.status == 200) {
      let otsJson = await ots.json()
      if (otsJson.success == true) {
        OtsAccessToken = otsJson.token
      }
    }
  }

  // Set Response
  let response = {
    'success': user && user.data ? true : false,
    'user': user && user.data ? jsonSafe(user.data) : null,
    'error': user.error,
    'token': user && user.data ? genrateToken(user.data) : null,
    'OtsAccessToken': user && user.data ? OtsAccessToken : null,
  };

  let statusCode = user && user.data ? 200 : 401;

  // Send Response
  res.status(statusCode).json(response);
}