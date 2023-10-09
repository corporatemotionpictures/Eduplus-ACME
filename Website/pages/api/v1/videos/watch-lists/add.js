import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams,addComments, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';
import fetch from 'isomorphic-unfetch';

// Add new comments
export default async function base(req, res) {

  // Only allowed comment only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert comments
  if (!user) { restrictedAccess(res); return false; }

  // Validate request with rules
  let schema = Joi.object({
    video_id: Joi.number().required()
  });


  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  params.user_id = user.id;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Insert comment into database
  let watchlist = await knexConnection.transaction(async trx => {
    return trx.insert(params).into('video_watchlist');
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

  //
  let statusCode = watchlist.id ? 200 : 422;
  let response = {
    success: watchlist.id ? true : false,
    watchlist: watchlist,
    id: watchlist.id
  };

  // Send response
  res.status(statusCode).json(response);

} 
