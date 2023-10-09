import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, checkToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Add new posts
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  let schemaVaribles = {
    message: Joi.string(),
    status: Joi.string(),
    ticket_type: Joi.allow(null),
    response_by: Joi.allow(null),
    ticket_id: Joi.number()
  };



  if (req.headers['x-auth-token'] == undefined) {
    req.headers['x-auth-token'] = null
  }


  let user = null;

  let checkUser = await checkToken(req);

  if (checkUser) {

    // Later parse User from JWT-header token 
    user = await verifyToken(req);

    // Only User allowed to insert posts
    if (!user) { restrictedAccess(res); return false; }

    if (user.type == 'ADMIN' || (user.type == 'MANAGEMENT' || user.type == 'FACULTY')) {

      // define schema for admin
      schemaVaribles.name = Joi.string().required();
      schemaVaribles.mobile_number = Joi.string().required();
      schemaVaribles.city = Joi.required();

    }

  }
  else {

    // define schema for not user
    schemaVaribles.name = Joi.string().required();
    schemaVaribles.mobile_number = Joi.string().required();
    schemaVaribles.city = Joi.required();


  }

  // Validate request with rules
  let schema = Joi.object(schemaVaribles);

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  params.ticket_type = params.ticket_type ? params.ticket_type : 'QUERY';


  if (user && (user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY')) {
    params.user_id = user.id;
    params.is_user = 1;
    params.name = user.first_name.concat(' ' + user.last_name);
    params.mobile_number = user.mobile_number;
    params.city = user.city;
  }
  else if (user && (user.type == 'ADMIN' || (user.type == 'MANAGEMENT' || user.type == 'FACULTY'))) {
    params.response_by = user.id;
    params.status = params.status ? params.status : 'IN_PROCESS';
  }

  let ticket = {
    name: params.name,
    mobile_number: params.mobile_number,
    city: params.city,
    query: params.message,
    is_user: params.is_user ? params.is_user : 0,
    user_id: params.user_id ? params.user_id : null,
    status: params.status ? params.status : 'CREATED'
  }

  let raiseTicket;

  if (!params.ticket_id) {

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Insert raiseTicket into database
    raiseTicket = await knexConnection.transaction(async trx => {
      return trx.insert(ticket).into('tickets');
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

  }

  ticket = {
    ticket_id: params.ticket_id ? params.ticket_id : raiseTicket.id,
    message: params.message,
    ticket_type: params.ticket_type ? params.ticket_type : 'QUERY',
    response_by: params.response_by ? params.response_by : null,
  }


  // Create db process (get into pool)
  knexConnection = require('knex')(knexConnectionConfig);

  // Insert raiseTicket into database
  raiseTicket = await knexConnection.transaction(async trx => {
    return trx.insert(ticket).into('raise_tickets');
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

  if (raiseTicket.id && user && user.type != 'ADMIN' && !req.query.listOnly && !req.query.noLog) {
    let logged_data = {
      user_id: user.id,
      action: `RAISE_TICKET_ADDED`,
      payload: JSON.stringify({
        field_name: '',
        ...req.query
      })
    }


    let logs = await createLog(logged_data)
  }

  //
  let statusCode = raiseTicket.id ? 200 : 422;
  let response = {
    success: raiseTicket.id ? true : false,
    raiseTicket: raiseTicket,
    id: raiseTicket.id
  };

  // Send response
  res.status(statusCode).json(response);

}
