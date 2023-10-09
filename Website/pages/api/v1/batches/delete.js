import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { fetchAll } from 'helpers/apiService';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Function to Delete batch
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert batch
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


  let lists = ['products', 'live-events']

  let query = {
    limit: 0,
    offset: 0,
    batches: id
  }

  for (let i = 0; i < lists.length; i++) {
    let label = lists[i]

    let data = await fetchAll(label, query, req.headers['x-auth-token'])

    count += parseInt(data.totalCount)

    if (count > 0) {
      break;
    }
  }
  var batch = null;

  if (count <= 0) {

    // Create db process (get into pool)
    let knexConnection = require('knex')(knexConnectionConfig);

    // Delete batch from database
    var batch = await knexConnection.transaction(async trx => {
      return trx('batch_schedules').where('batch_id', id).del();
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

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    // Delete batch from database
    batch = await knexConnection.transaction(async trx => {
      return trx('batches').where('id', id).del();
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
  let statusCode = batch && batch.id ? 200 : 422;
  let response = {
    success: batch && batch.id ? true : false,
    batch: batch,
  };


  // Send Response
  res.status(statusCode).json(response);

}