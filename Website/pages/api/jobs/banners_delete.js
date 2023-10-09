import { knexConnectionConfig } from 'db/knexConnection';
import moment from 'moment'

// Ping pong the client!
export default async function (req, res) {

  var currentDate = moment().unix()
  

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Delete video from database
  let banners = await knexConnection.transaction(async trx => {
    return trx('banners').select('id').where('approved', -1).whereNotNull('rejected_on').where('rejected_on' ,'<=' , currentDate);
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
  knexConnection = require('knex')(knexConnectionConfig);

  // Delete video from database
  let banner = await knexConnection.transaction(async trx => {
    return trx('banners').where('approved', -1).whereNotNull('rejected_on').where('rejected_on' ,'<=' , currentDate).update('is_active', 0);
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