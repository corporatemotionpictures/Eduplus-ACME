import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import slugify from 'slugify';
import { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Add new pitch
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert pitch
  // if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }

  // Validate request with rules
  let schema = Joi.object({
    company_name: Joi.string().allow(null),
    contact_person_name: Joi.string().allow(null),
    contact_number: Joi.allow(null),
    is_company_registered: Joi.allow(null),
    is_product_launched: Joi.allow(null),
    status: Joi.allow(null),
    duration: Joi.allow(null),
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }
  

  if(params.duration){
    delete params.duration
  }
  if(!params.is_product_launched){
    params.is_product_launched = 0
  }
  if(!params.is_company_registered){
    params.is_company_registered = 0
  }

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch subject from database
  let pitchByUser = await knexConnection.transaction(async trx => {
    return trx.select().table('pitches').where('user_id', user.id).first();

  })

  // Destrory process (to clean pool)
  knexConnection.destroy();

  if (pitchByUser) {

    let response = {
      success: false,
      error: 'pitch Already Exist',
      pitch: pitchByUser
    };

    // Send response
    res.status(422).json(response);

  } else {


    params.user_id = user.id

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Insert pitch into database
    let pitch = await knexConnection.transaction(async trx => {
      return trx.insert(params).into('pitches');
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

    //
    let statusCode = pitch.id ? 200 : 422;
    let response = {
      success: pitch.id ? true : false,
      pitch: pitch,
      id: pitch.id
    };

    // Send response
    res.status(statusCode).json(response);

  }



}
