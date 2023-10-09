import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { fetchAll } from 'helpers/apiService';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Function to Delete queris
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert queris
  if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }


  // Validate request with rules
  let schema = Joi.object({
    id: Joi.number().required()
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  // Set attributes
  let id = params.id;
  params.is_active = false;

  var count = 0;


  let lists = []

  let query = {
    limit: 0,
    offset: 0,
    querisID: id
  }

  for (let i = 0; i < lists.length; i++) {
    let label = lists[i]

    let data = await fetchAll(label, query, req.headers['x-auth-token'])

    count += parseInt(data.totalCount)


    if (count > 0) {
      break;
    }
  }

  var queris = null;

  if (count <= 0) {

    // Create db process (get into pool)
    let knexConnection = require('knex')(knexConnectionConfig);

    // Delete queris from database
    var queris = await knexConnection.transaction(async trx => {
      return trx('queries').where('id', id).del();
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
  let statusCode = queris && queris.id ? 200 : 422;
  let response = {
    success: queris && queris.id ? true : false,
    queris: queris,
  };


  // Send Response
  res.status(statusCode).json(response);

}