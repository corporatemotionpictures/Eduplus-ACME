import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch attribute
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert attribute
  // if (!user) { restrictedAccess(res); return false; }

  // Filter
  let orderBy = req.query.order_by ? req.query.order_by : 'ASC';
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;


  var subjectIDs = null;
  if (user && user.type == 'FACULTY' && user.subject_ids) {
    subjectIDs = user.subject_ids;
  }

  let totalCount = 0

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let attributes = await knexConnection.transaction(async trx => {
    var query;

    query = trx.select('attributes.*').table('attributes')
      .orderBy('attributes.position', orderBy);

    if ((!req.query.forList || req.query.listOnly)) {
      query.where('attributes.is_active', 1)
    }

    if (req.query.forOptionalValues) {
      query.where('attributes.is_optional_values', 1)
    }

    if (req.query.forFilter) {
      query.where('attributes.filterable', 1)
    }

    totalCount = await query.clone().count();
    totalCount = totalCount[0]['count(*)'];

    if (!req.query.offLimit || req.query.offLimit == false) {
      query = query.clone().offset(offset).limit(limit)
    }

    query.groupBy('attributes.id')

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


  if (attributes.data) {
    for (let i = 0; i < attributes.data.length; i++) {

      // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);

      attributes.data[i].referances = await knexConnection.transaction(async trx => {
        return trx.table('attribute_referances').where('id', attributes.data[i].referance).first();
      })


      // Destrory process (to clean pool)
      knexConnection.destroy();

      if (attributes.data[i].referance && attributes.data[i].referances) {

        // Create db process (get into pool)
        knexConnection = require('knex')(knexConnectionConfig);

        attributes.data[i].values = await knexConnection.transaction(async trx => {
          let query = trx.table(attributes.data[i].referances.model).where('is_active', 1).orderBy('id', 'ASC');

          if (attributes.data[i].referances.fetch_condition) {
            query.whereIn('type', attributes.data[i].referances.fetch_condition.split(','))
          }
          return query
        })

        // Destrory process (to clean pool)
        knexConnection.destroy();
      }
      else {
        // Create db process (get into pool)
        knexConnection = require('knex')(knexConnectionConfig);

        attributes.data[i].values = await knexConnection.transaction(async trx => {
          return trx.table('attribute_values').where('attribute_id', attributes.data[i].id);
        })

        // Destrory process (to clean pool)
        knexConnection.destroy();
      }



    }
  }

  //
  let statusCode = attributes.data ? 200 : 422;
  let response = {
    success: attributes.data ? true : false,
    attributes: attributes.data,
    error: attributes.error,
    totalCount: totalCount
  };

  res.status(statusCode).json(response);
}