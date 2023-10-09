import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import slugify from 'slugify';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Function to insert popupModel
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert popupModel
  if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }

  // Validate request with rules
  let schema = Joi.object({
    page_url: Joi.string().required(),
    link: Joi.string().allow(null),
    image: Joi.string()
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }


  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fatch popupModel From Database
  let models = await knexConnection.transaction(async trx => {
    return trx.select().table('popup_models')
      .where('page_url', params.page_url).first();
  })

  // Destrory process (to clean pool)
  knexConnection.destroy();

  if (models) {
    let response = {
      success: false,
      error: 'Image allrady added on this url'
    };


    // Send response
    res.status(422).json(response);

  } else {

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Insert popupModel into database
    let popupModel = await knexConnection.transaction(async trx => {
      return trx.insert(params).into('popup_models');
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


    // Destrory process (to clean pool)
    knexConnection.destroy();

    //
    let statusCode = popupModel.id ? 200 : 422;
    let response = {
      success: popupModel.id ? true : false,
      popupModel: popupModel,
      id: popupModel.id
    };


    // Send response
    res.status(statusCode).json(response);
  }
}
