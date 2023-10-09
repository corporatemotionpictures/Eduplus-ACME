import { knexConnectionConfig } from 'db/knexConnection';
import { fetchAll } from 'helpers/apiService';
import { getOnly, createLog, replaceUploads, checkPackage, CourseID, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch memberships
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  // if (!user) { restrictedAccess(res); return false; }

  // Filters
  let orderBy = req.query.order_by ? req.query.order_by : 'ASC';
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;


  var totalCount = 0

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch memberships from database
  let memberships = await knexConnection.transaction(async trx => {

    var query;

    query = trx.select('memberships.*').table('memberships')
      .orderBy('memberships.id', orderBy);


    if (req.query.slug) {
      query.where('memberships.slug', req.query.slug)
    }
    if (req.query.type) {
      query.where('memberships.type', req.query.type)
    }
    if ((!req.query.forList || req.query.listOnly)) {
      query.where('memberships.is_active', 1)
    }

    totalCount = await query.clone().count();
    totalCount = totalCount[0]['count(*)'];

    if (!req.query.offLimit || req.query.offLimit == false) {
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

  if (memberships.data) {


    for (let i = 0; i < memberships.data.length; i++) {


      knexConnection = require('knex')(knexConnectionConfig);

      memberships.data[i].tax = await knexConnection.transaction(async trx => {
        return trx.table('taxes').where('id', memberships.data[i].tax_id).first();
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      knexConnection = require('knex')(knexConnectionConfig);

      memberships.data[i].validity = await knexConnection.transaction(async trx => {
        return trx.table('validities').where('id', memberships.data[i].validity_id).first();
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      
      knexConnection = require('knex')(knexConnectionConfig);

      memberships.data[i].freeProducts = await knexConnection.transaction(async trx => {
        return trx.table('membership_products').where('membership_id', memberships.data[i].id);
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();
      
      knexConnection = require('knex')(knexConnectionConfig);

      memberships.data[i].product_ids = await knexConnection.transaction(async trx => {
        return trx.table('membership_products').where('membership_id', memberships.data[i].id).pluck('product_id');
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();
    }
  }

  //
  let statusCode = memberships.data ? 200 : 422;
  let response = {
    success: memberships.data ? true : false,
    memberships: memberships.data,
    totalCount: totalCount,
    error: memberships.error
  };

  // Send response
  res.status(statusCode).json(response);
}
