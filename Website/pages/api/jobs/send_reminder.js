import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';

// Ping pong the client!
export default async function (req, res) {

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Delete video from database
  let banners = await knexConnection.transaction(async trx => {
    return trx('banners').select('id').where('approved', -1).where('rejected_on' ,'<=' , new Date());
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
  


  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Delete video from database
  let banner = await knexConnection.transaction(async trx => {
    return trx('banners').where('approved', -1).where('rejected_on' ,'<=' , new Date()).update('is_active', 0);
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


  let statusCode = banner.id ? 200 : 422;
  let response = {
    success: banner.id ? true : false,
    banners: banners,
  };


  // Send Response
  res.status(statusCode).json(response);
}