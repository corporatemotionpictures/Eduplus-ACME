import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';
import { deleteData } from 'helpers/zoom';

// Function to delete event
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
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

  // Create db process (get into pool)
  knexConnection = require('knex')(knexConnectionConfig);

  // Fatch video From Database
  let eventDetail = await knexConnection.transaction(async trx => {
    return trx.select().table('live_events')
      .where('id', id).first();
  })

  // Destrory process (to clean pool)
  knexConnection.destroy();

  let zoomAttributes = true
  if (!eventDetail.occurrence_id) {
    zoomAttributes = eventDetail ? await deleteData(eventDetail.zoom_id, eventDetail.zoom_type) : false
  }

  let event

  if (zoomAttributes) {

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Delete event from database
    event = await knexConnection.transaction(async trx => {
      return trx('live_events').where('id', id).del();
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
  let statusCode = event && event.id ? 200 : 422;
  let response = {
    success: event && event.id ? true : false,
    'event': event
  };


  // Send response
  res.status(statusCode).json(response);


}