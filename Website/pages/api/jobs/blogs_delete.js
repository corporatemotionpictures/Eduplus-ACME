import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import moment from 'moment'

// Ping pong the client!
export default async function (req, res) {

    var currentDate = moment().unix()
    
  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Delete video from database
  let blogs = await knexConnection.transaction(async trx => {
    return trx('blogs').select('id').where('approved', -1).where('rejected_on' ,'<=' , currentDate);
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
  let blog = await knexConnection.transaction(async trx => {
    return trx('blogs').where('approved', -1).where('rejected_on' ,'<=' , currentDate).update('is_active', 0);
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


  let statusCode = blog.id ? 200 : 422;
  let response = {
    success: blog.id ? true : false,
    blogs: blogs,
  };


  // Send Response
  res.status(statusCode).json(response);
}