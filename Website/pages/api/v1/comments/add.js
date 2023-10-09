import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

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
    comment: Joi.string().allow(null),
    post_id: Joi.number().required()
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
  let comment = await knexConnection.transaction(async trx => {
    return trx.insert(params).into('comments');
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

  if (comment.id) {

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);


    // increese commetns value in post table
    let increese = await knexConnection.transaction(async trx => {
      return trx('posts').where('id', params.post_id).increment({ comments: 1 });
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
  let statusCode = comment.id ? 200 : 422;
  let response = {
    success: comment.id ? true : false,
    comment: comment,
    id: comment.id
  };

  // Send response
  res.status(statusCode).json(response);

} 
