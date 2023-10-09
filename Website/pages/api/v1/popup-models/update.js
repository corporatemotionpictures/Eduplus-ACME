import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import Joi from '@hapi/joi';
import slugify from 'slugify';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Function to Update popupModel
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
    page_url: Joi.string(),
    link: Joi.string().allow(null),
    image: Joi.string()
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }


  let models = null

  if (params.page_url) {
    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fatch popupModel From Database
    models = await knexConnection.transaction(async trx => {
      return trx.select().table('popup_models')
        .where('page_url', params.page_url).whereNot('id', params.id).first();
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();
  }

  if (models) {
    let response = {
      success: false,
      error: 'Image allrady added on this url'
    };


    // Send response
    res.status(422).json(response);

  } else {


    // Set attributes
    let id = params.id;

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);


    // Update popupModel in database
    let popupModel = await knexConnection.transaction(async trx => {
      return trx('popup_models').where('id', id).update(params);
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
    let statusCode = popupModel.id ? 200 : 422;
    let response = {
      success: popupModel.id ? true : false,
      popupModel: popupModel,
    };

    // Destrory process (to clean pool)
    knexConnection.destroy();

    // Send response
    res.status(statusCode).json(response);
  }
}
