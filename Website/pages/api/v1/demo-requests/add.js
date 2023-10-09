import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Function to insert demoRequest
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only USER type of User allowed to insert demoRequest
  // if (!user) { restrictedAccess(res); return false; }

  // Validate request with rules
  let schema = Joi.object({
    name: Joi.string().allow(null),
    email: Joi.string().allow(null),
    course_id: Joi.number().allow(null),
    subject_id: Joi.number().allow(null),
    exam_id: Joi.number().allow(null),
    course_type_id: Joi.number().allow(null),
    mobile_number: Joi.string().allow(null),
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }


  if(user){
    params.user_id = user.id;
  }


  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Insert demoRequest into database
  let demoRequest = await knexConnection.transaction(async trx => {
    return trx.insert(params).into('demo_requests');
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
  });


  if (demoRequest.id && user && user.type != 'ADMIN' && !req.query.listOnly && !req.query.noLog) {
    let logged_data = {
      user_id: user.id,
      action: `DEMO_CLASS_REQUEST_GENRATED`,
      payload: JSON.stringify({
        field_name: '',
        ...req.query
      })
    }


    let logs = await createLog(logged_data)
  }

  //
  let statusCode = demoRequest.id ? 200 : 422;
  let response = {
    success: demoRequest.id ? true : false,
    demoRequest: demoRequest,
    id: demoRequest.id
  };

  // Destrory process (to clean pool)
  knexConnection.destroy();

  // Send response
  res.status(statusCode).json(response);
} 
