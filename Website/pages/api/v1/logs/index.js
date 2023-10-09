import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';
let field_details;

// Function to Fetch log
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert log
  if (!user) { restrictedAccess(res); return false; }

  // Filter
  let orderBy = req.query.order_by ? req.query.order_by : 'DESC';
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 5;
  let userID = req.query.userID ? Number.parseInt(req.query.userID) : null;

  var totalCount = 0

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let logs = await knexConnection.transaction(async trx => {
    let query
    if (userID) {
      query = trx.select().table('logs')
        .where('user_id', userID)
        .orderBy('id', orderBy);
    } else {
      query = trx.select().table('logs')
        .orderBy('id', orderBy);
    }


    totalCount = await query.clone().count();
    totalCount = totalCount[0]['count(*)'];

    if ((!req.query.offLimit || req.query.offLimit == false) && (!user || user.type == 'ADMIN')) {
      query = query.clone().offset(offset).limit(limit)
    }

    return query

  }).then(res => {
    return {
      data: res,
      error: null
    };
  }).catch(err => {
    return {
      data: null,
      error: err.sqlMessage
    };
  });

  // Destrory process (to clean pool)
  knexConnection.destroy();

  let payload;
  if (logs.data.length > 0) {
    for (let i = 0; i < logs.data.length; i++) {
      if (logs.data[i] !== undefined && logs.data[i].payload !== null) {

        payload = JSON.parse(logs.data[i].payload)

        if (logs.data[i].action.includes('VIEW_')) {

          let notField = ['my_courses']


          let data = null

          if (!notField.includes(payload.field_name)) {

            if (payload.field_id) {

              // Create db process (get into pool)
              knexConnection = require('knex')(knexConnectionConfig);

              data = await knexConnection.transaction(async trx => {
                return knexConnection.select().table(payload.field_name).where('id', payload.field_id).first()
              })

              // Destrory process (to clean pool)
              knexConnection.destroy()

            }
          }


          if (payload.field_name == 'previous_year_question_papers') {
            payload.field_name = 'documents'
          }
          payload.field_name = payload.field_name.replace(/_/g, ' ')

          if (data) {
            payload.tag = payload.field_name
            payload.field_name = data.name ? data.name : data.title

          }

          payload.field_name = `${payload.field_name} Page`
          logs.data[i].payload = payload
        } else {

          let data = null

          if (payload.field_id) {

            // Create db process (get into pool)
            knexConnection = require('knex')(knexConnectionConfig);

            data = await knexConnection.transaction(async trx => {
              return knexConnection.select().table(payload.field_name).where('id', payload.field_id).first()
            })

            // Destrory process (to clean pool)
            knexConnection.destroy()

          }

          if (payload.field_name == 'previous_year_question_papers') {
            payload.field_name = 'documents'
          }

          payload.field_name = payload.field_name.replace(/_/g, ' ')

          if (data) {
            payload.field_name = data.name ? data.name : data.title

          }
          payload.tag = payload.field_name

          payload.field_name = logs.data[i].action.replace(/_/g, ' ')

          payload.field_name = `${payload.field_name}`
          logs.data[i].payload = payload
        }

      }
    }
  }


  let statusCode = logs.data ? 200 : 422;
  let response = {
    success: logs.data ? true : false,
    logs: logs.data,
    totalCount: totalCount,
    error: logs.error
  };


  res.status(statusCode).json(response);
}

