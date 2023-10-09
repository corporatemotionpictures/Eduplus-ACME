import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, restrictedAccess, verifyToken, invalidFormData } from 'helpers/api';

// Function to Update setting
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert setting
  if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }



  // Set attributes
  var setting = null;

  let params = req.body;


  if (!req.body.id) {
    for (let i = 0; i < Object.keys(params).length; i++) {



      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);
      // Update setting in database
      setting = await knexConnection.transaction(async trx => {
        return trx('settings').where('id', Object.keys(params)[i]).first();
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      var value = params[Object.keys(params)[i]]

      if (setting.type == 'multiple-fields') {
        value = JSON.stringify(Object.values(params[Object.keys(params)[i]]))
      }


      // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);
      // Update setting in database
      setting = await knexConnection.transaction(async trx => {
        return trx('settings').where('id', Object.keys(params)[i]).update('value', value);
      }).then(res => {
        return {
          id: res,
          error: null
        };
      }).catch(err => {
        return {
          id: null,
          error: err
        };
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();
    }
  } else {

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);
    // Update setting in database
    setting = await knexConnection.transaction(async trx => {
      return trx('settings').where('id', params.id).update(params);
    }).then(res => {
      return {
        id: res,
        error: null
      };
    }).catch(err => {
      return {
        id: null,
        error: err
      };
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();
  }

  //
  let statusCode = setting.id ? 200 : 422;
  let response = {
    success: setting.id ? true : false,
    setting: setting
  };

  // Send response
  res.status(statusCode).json(response);
}
