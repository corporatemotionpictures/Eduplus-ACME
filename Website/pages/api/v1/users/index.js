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
  let courseID = req.query.courseID ? req.query.courseID.split(',') : null;

  var totalCount = 0

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch users from database
  let users = await knexConnection.transaction(async trx => {
    var query;
    query = trx.select().table('users').orderBy('id', orderBy);


    if (req.query.search && req.query.search != '') {
      query.where('users.first_name', 'like', '%'.concat(req.query.search).concat('%'))
      .orWhere('users.last_name', 'like', '%'.concat(req.query.search).concat('%'))
      .orWhere('users.mobile_number', 'like', '%'.concat(req.query.search).concat('%'))
      .orWhere('users.email', 'like', '%'.concat(req.query.search).concat('%'))
    }

    
    if (type) {
      query.where('type', type)
    }
    if (courseID) {
      query.whereIn('branch', courseID)
    }
    

    totalCount = await query.clone().count();
    totalCount = totalCount[0]['count(*)'];

    if ((!req.query.offLimit || req.query.offLimit == false)) {
      query = query.clone().offset(offset).limit(limit)
    }else{
      query.where('is_active', 1)
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


    users.data[i].name_with_mobile = `${users.data[i].first_name} ${users.data[i].last_name} - ${users.data[i].mobile_number}`

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Update user in database
    users.data[i].branchDetail = await knexConnection.transaction(async trx => {
        return trx('courses').where('id', users.data[i].branch).first();
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();


    if (type == 'MANAGEMENT') {

      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      // Fatch user From Database
      let access = await knexConnection.transaction(async trx => {
        return trx.select().table('user_access').where('user_id', users.data[i].id).first();
      })


      // Destrory process (to clean pool)
      knexConnection.destroy();

      let subject_names = [];

      if (access && access.subject_ids && JSON.parse(access.subject_ids).length > 0) {

        access.subject_ids = JSON.parse(access.subject_ids)
        access.subject_ids.map(async subject_id => {

          // Create db process (get into pool)
          var knexConnection = require('knex')(knexConnectionConfig);

          // Fatch user From Database
          let subject = await knexConnection.transaction(async trx => {
            return trx.select().table('subjects').where('id', subject_id).first();
          })


          // Destrory process (to clean pool)
          knexConnection.destroy();

          subject_names.push(subject.name);

        })

      }

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