import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import slugify from 'slugify';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Function to insert banner
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert banner
  if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }

  // Validate request with rules
  let schema = Joi.object({
    title: Joi.string().required(),
    image: Joi.string(),
    redirect_url: Joi.string().allow(null),
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  params.created_by = user.id;
  if ((user.type == 'MANAGEMENT' || user.type == 'FACULTY' )) {
    params.approved = false
  }

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Insert banner into database
  let banner = await knexConnection.transaction(async trx => {
    return trx.insert(params).into('banners');
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

  if (banner.id && (user.type == 'MANAGEMENT' || user.type == 'FACULTY' )) {

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Update user in database
    var reciever = await knexConnection.transaction(async trx => {
      return trx('users').where('type', "ADMIN").first();
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    var notice = {
      user_id: user.id,
      reciever_id: reciever.id,
      notification : `New Banner-${params.title} Added`,
      redirect_url : `/dashboard/banners/view/${banner.id}`,
      icon : '<i className="fas fa-images"></i>'
    };

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Insert notification into database
    let notification = await knexConnection.transaction(async trx => {
      return trx.insert(notice).into('admin_notifications');
    }).then(res => {
      return {
        id: res[0],
        error: null
      };
    }).catch(err => {
      return {
        id: null,
        error: err
      };
    });


    // Destrory process (to clean pool)
    knexConnection.destroy();


  }

  //
  let statusCode = banner.id ? 200 : 422;
  let response = {
    success: banner.id ? true : false,
    banner: banner,
    id: banner.id
  };


  // Send response
  res.status(statusCode).json(response);
} 
