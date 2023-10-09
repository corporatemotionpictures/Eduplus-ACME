import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, injectMethodNotAllowed, verifyToken, restrictedAccess } from 'helpers/api';

// Function to Fetch Users
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user) { restrictedAccess(res); return false; }

  // Filters
  let orderBy = req.query.order_by ? req.query.order_by : 'DESC';
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let type = req.query.type ? req.query.type : null;

  var totalCount = 0
  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch users from database
  let users = await knexConnection.transaction(async trx => {
    var query;
    query = trx.select().table('users').orderBy('id', orderBy).whereNotIn('type', ['USER', 'ADMIN']);

     if (req.query.search && req.query.search != '') {
      query.where('users.first_name', 'like', '%'.concat(req.query.search).concat('%'))
      .orWhere('users.last_name', 'like', '%'.concat(req.query.search).concat('%'))
      .orWhere('users.mobile_number', 'like', '%'.concat(req.query.search).concat('%'))
      .orWhere('users.email', 'like', '%'.concat(req.query.search).concat('%'))
    }

    totalCount = await query.clone().count();
    totalCount = totalCount[0]['count(*)'];

    if ((!req.query.offLimit || req.query.offLimit == false) ) {
      query = query.clone().offset(offset).limit(limit)
    }

    return query;

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
  })

  // Destrory process (to clean pool)
  knexConnection.destroy();

  users.data = await replaceUploadsArray(users.data, 'image');

  for (let i = 0; i < users.data.length; i++) {

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fatch user From Database
    let permissions = await knexConnection.transaction(async trx => {
      return trx.select().table('user_permissions').where('user_id', users.data[i].id);
    })


    // Destrory process (to clean pool)
    knexConnection.destroy();
    

    users.data[i].module_ids = []
    permissions ? permissions.map((permission) => { users.data[i].module_ids.push(permission.module_id) }) : []

    users.data[i].module_ids = JSON.stringify(users.data[i].module_ids)

    // For falcuties
    if (users.data[i].type == 'FACULTY') {

      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      // Fatch user From Database
      let subjects = await knexConnection.transaction(async trx => {
        return trx.select().table('faculty_subjects').where('user_id', users.data[i].id);
      })


      // Destrory process (to clean pool)
      knexConnection.destroy();

      

      users.data[i].subject_ids = []
      subjects ? subjects.map((subject) => { users.data[i].subject_ids.push(subject.subject_id) }) : []


      let subject_names = [];

      if (users.data[i].subject_ids.length > 0) {

        users.data[i].subject_ids.map(async subject_id => {

          // Create db process (get into pool)
          var knexConnection = require('knex')(knexConnectionConfig);

          // Fatch user From Database
          let subject = await knexConnection.transaction(async trx => {
            return trx.select().table('subjects').where('id', subject_id).first();
          })


          // Destrory process (to clean pool)
          knexConnection.destroy();

          if(subject){

            subject_names.push(subject.name);
          }


        })

      }

      users.data[i].subject_ids = JSON.stringify(users.data[i].subject_ids)
      users.data[i].subject_names = subject_names;
    }


    

  }

  //
  let statusCode = users.data ? 200 : 422;
  let response = {
    success: users.data ? true : false,
    users: users.data,
    totalCount: totalCount,
    error: users.error
  };


  res.status(statusCode).json(response);
}