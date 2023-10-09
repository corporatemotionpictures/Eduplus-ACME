import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import Joi from '@hapi/joi';
import slugify from 'slugify';
import { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Function to Update webSliders
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }

  // Validate request with rules
  let schema = Joi.object({
    id: Joi.number().required(),
    lower_title: Joi.string().allow(null),
    upper_title: Joi.string().allow(null),
    sub_title: Joi.string().allow(null),
    button_text: Joi.string().allow(null),
    button_url: Joi.string().allow(null),
    app_button: Joi.string().allow(null),
    banner_type: Joi.string().allow(null),
    image: Joi.string(),
    video: Joi.string(),
    approved: Joi.number(),
    rejected_on: Joi.number().allow(null),
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }


  // Set attributes
  let id = params.id;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);


  // Update webSliders in database
  let webSliders = await knexConnection.transaction(async trx => {
    return trx('web_sliders').where('id', id).update(params);
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
  });

  //
  let statusCode = webSliders.id ? 200 : 422;
  let response = {
    success: webSliders.id ? true : false,
    webSliders: webSliders,
  };

  // Destrory process (to clean pool)
  knexConnection.destroy();

  // Send response
  res.status(statusCode).json(response);
}
