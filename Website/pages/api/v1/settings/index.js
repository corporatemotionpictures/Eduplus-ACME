import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploadsArray, replaceUploads, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch setting
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert setting
  if (!user) { restrictedAccess(res); return false; }

  // Filter
  let orderBy = req.query.order_by ? req.query.order_by : 'ASC';
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let settings = await knexConnection.transaction(async trx => {
    var query;
    query = trx.select().table('settings').where('parent', null).where('hidden', 0)
      .orderBy('position', orderBy);


    if (req.query.whereNotIn) {
      query.whereNotIn('key', req.query.whereNotIn.split(','))
    }
    if (req.query.whereIn) {
      query.whereIn('key', req.query.whereIn.split(','))
    }
    return query;

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

  if (settings.data) {

    for (let i = 0; i < settings.data.length; i++) {

      var knexConnection = require('knex')(knexConnectionConfig);

      settings.data[i].childrens = await knexConnection.transaction(async trx => {
        var query;
        query = trx.select().table('settings').where('parent', settings.data[i].id).orderBy('position', orderBy).where('hidden', 0);
        return query;

      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      if (settings.data[i].childrens) {
        for (let j = 0; j < settings.data[i].childrens.length; j++) {
          if (settings.data[i].childrens[j].type == 'image') {
            settings.data[i].childrens[j].value = await replaceUploads(settings.data[i].childrens[j].value);
          }
        }
      }

    }
  }

  //
  let statusCode = settings.data ? 200 : 422;
  let response = {
    success: settings.data ? true : false,
    settings: settings.data,
    error: settings.error
  };

  res.status(statusCode).json(response);
}