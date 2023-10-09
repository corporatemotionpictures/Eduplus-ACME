import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams,addreplys, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';
import fetch from 'isomorphic-unfetch';

// Add new replys
export default async function base(req, res) {

  // Only allowed reply only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert replys
  if (!user) { restrictedAccess(res); return false; }

  // Validate request with rules
  let schema = Joi.object({
    reply: Joi.string().required(),
    comment_id: Joi.number().required()
  });


  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  params.user_id = user.id;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Insert reply into database
  let reply = await knexConnection.transaction(async trx => {
    return trx.insert(params).into('comment_replies');
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

  if (reply.id) {

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);


    // increese commetns value in video table
    let increese = await knexConnection.transaction(async trx => {
      return trx('videos').where('id', params.video_id).increment({ replys: 1 });
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
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

  }

  //
  let statusCode = reply.id ? 200 : 422;
  let response = {
    success: reply.id ? true : false,
    reply: reply,
    id: reply.id
  };

  // Send response
  res.status(statusCode).json(response);

} 
