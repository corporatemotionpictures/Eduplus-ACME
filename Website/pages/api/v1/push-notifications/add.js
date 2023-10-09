import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';
import { getSettings, fetchAllFcmtoken } from 'helpers/apiService';
import fetch from "isomorphic-unfetch";

// Add new push Notification
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert push Notification
  if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }

  // Validate request with rules
  let schema = Joi.object({
    title: Joi.string().required(),
    body: Joi.string().required(),
    user_id: Joi.number(),
    image: Joi.string().allow(null),
    course_ids: Joi.string().allow(null),
    subject_ids: Joi.string().allow(null),
    product_ids: Joi.string().allow(null),
    onlyOneUser: Joi.allow(null),
    action: Joi.allow(null),
    user_id: Joi.allow(null),
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  let paramsData = []
  let subjects = null


  var fcmKey = await getSettings("fcmServerKey");

  let query = {}
  if (params.course_ids && params.course_ids != '[]') {
    query.course_ids = params.course_ids
  }

  if (params.subject_ids && params.subject_ids != '[]') {

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    subjects = await knexConnection.transaction(async trx => {
      var querydata;
      querydata = trx.select('subjects.name').table('subjects')
        .orderBy('subjects.position', 'ASC').whereIn('id', JSON.parse(params.subject_ids));

      return querydata;

    })

    // Destrory process (to clean pool)
    knexConnection.destroy();
    if (subjects) {

      for (let i = 0; i < subjects.length; i++) {

        if (i == 0) {
          params.body = `${params.body} in ${subjects[i].name}`
        }
        else if (i > 0 && i < subjects.length - 1) {
          params.body = `${params.body} , ${subjects[i].name}`
        }
        else if (i == subjects.length - 1) {
          params.body = `${params.body} and ${subjects[i].name}`
        }
      }
    }
  }

  if (params.product_ids && params.product_ids != '[]') {
    query.product_ids = params.product_ids
  }
  if (params.subject_ids && params.subject_ids != '[]') {
    query.subject_ids = params.subject_ids
  }
  if (params.course_ids && params.course_ids != '[]') {
    query.course_ids = params.course_ids
  }

  if (params.onlyOneUser) {
    query.userID = params.user_id ? params.user_id : user.id

    delete params.onlyOneUser
    if (params.user_id) {
      delete params.user_id
    }
  }

  // Fetch All Fcm Token
  let users = await fetchAllFcmtoken(query, req.headers['x-auth-token']);
  var fcm_tokens = [];



  let notifications = null

  if (users.user) {
    for (let i = 0; i < users.user.length; i++) {

      if (!fcm_tokens.includes(users.user[i].fcm_token)) {
        fcm_tokens.push(users.user[i].fcm_token);


        paramsData.push({
          title: params.title,
          body: params.body,
          user_id: users.user[i].id,
          course_ids: params.course_ids && params.course_ids != '[]' ? params.course_ids : null,
          product_ids: params.product_ids && params.product_ids != '[]' ? params.product_ids : null,
          image: params.image
        })
      }
    };

    await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `key=${fcmKey}`
      },
      body: JSON.stringify({
        registration_ids: fcm_tokens,
        notification: {
          title: params.title,
          body: params.body,
          image: params.image,
          show_in_foreground: true,
          priority: 'high',
          importance: 'max',
        },
        data: { action: params.action, room: {}, foreground: true,
        priority: 'high',
        importance: 'max' },

      })
    }).then((res) => {
      notifications = res
    });


    try {
      notifications = notifications ? await notifications.json() : null
    } catch (error) {
      notifications = null
    }
  }



  // notifications = await notifications.json()



  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Insert pushnotification into database
  let pushNotification = await knexConnection.transaction(async trx => {
    return trx.insert(paramsData).into('push_notifications');
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
  let statusCode = pushNotification.id ? 200 : 422;
  let response = {
    success: pushNotification.id ? true : false,
    pushNotification: pushNotification,
    notifications: notifications,
    id: pushNotification.id
  };



  // Send response
  res.status(statusCode).json(response);

}
