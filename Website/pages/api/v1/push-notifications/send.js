import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';

import { getSettings } from 'helpers/apiService';
import  { postOnly, createLog,  validateRequestParams, replaceUploadsArray, pushNotification, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';
import Joi from '@hapi/joi';

// Function to Fetch push Notification
export default async function base(req, res) {

  
  var fcmKey = await getSettings("fcmServerKey");

  // Only allowed post only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert push Notification
  if (!user) { restrictedAccess(res); return false; }

  // Validate request with rules
  let schema = Joi.object({
    title: Joi.string().required(),
    body: Joi.string().required(),
    user_id: Joi.required(),
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

   // Create db process (get into pool)
   var knexConnection = require('knex')(knexConnectionConfig);
 
   // Fatch exam From Database
   let users = await knexConnection.transaction(async trx => {
     return trx.select().table('users').where('referance_id', params.user_id).first();
   });
 
   // Destrory process (to clean pool)
   knexConnection.destroy();

   let fcmTokens = [];

   if(users && !fcmTokens.includes(users.fcm_token)){
    fcmTokens.push(users.fcm_token);
   }

  let data = {
    title : params.title,
    body : params.body,
  }

 
  let pushNotification = await fetch("https://fcm.googleapis.com/fcm/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `key=${fcmKey}`
    },
    body: JSON.stringify({
      registration_ids: fcmTokens,
      notification: { title: data.title, body: data.body }
    })
  }).then(res => {

    return true;
  });


  //
  let statusCode = pushNotification ? 200 : 422;
  let response = {
    success: pushNotification ? true : false,
    pushNotifications: pushNotification
  };


  res.status(statusCode).json(response);
}