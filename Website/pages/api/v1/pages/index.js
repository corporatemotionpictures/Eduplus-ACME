import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch module
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert module
  // if (!user) { restrictedAccess(res); return false; }

  // Filter
  let orderBy = req.query.order_by ? req.query.order_by : 'ASC';
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;
  let parentID = req.query.parentID ? req.query.parentID.split(',') : null;
  var pages;


  var totalCount = 0

  if (req.query.forSelectList) {

    var knexConnection = require('knex')(knexConnectionConfig);

    pages = await knexConnection.transaction(async trx => {
      var query;
      query = trx.select('pages.*').table('pages').where('is_parent', 0)
        .whereNot('page_url', 'like', `%https:%`).whereNot('page_url', 'like', `%http:%`).whereNot('page_url', 'like', `%www.:%`)
        .where('pages.is_active', 1).orderBy('pages.position', orderBy);

      totalCount = await query.clone().count();
      totalCount = totalCount[0]['count(*)'];

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

    for (let i = 0; i < pages.data.length; i++) {
      pages.data[i].page_url = pages.data[i].page_url ? pages.data[i].page_url : `/${pages.data[i].slug}`
    }


  }

  else if (req.query.byType) {

    pages = {
      data: {}
    };

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    var moduleTypes = await knexConnection.transaction(async trx => {
      return trx.select('visibility').table('pages').groupBy('visibility');
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();


    for (let i = 0; i < moduleTypes.length; i++) {

      let data = {}
      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      data.items = await knexConnection.transaction(async trx => {
        var query;
        query = trx.select('pages.*').table('pages')
          .whereNull('pages.parent_id').where('pages.visibility', moduleTypes[i].visibility)
          .where('pages.is_active', 1).orderBy('pages.position', orderBy);

        return query;

      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      if (data.items) {
        for (let i = 0; i < data.items.length; i++) {

          // Create db process (get into pool)
          knexConnection = require('knex')(knexConnectionConfig);

          data.items[i].items = await knexConnection.transaction(async trx => {
            return trx.table('pages').where('parent_id', data.items[i].id).orderBy('pages.position', orderBy).where('pages.is_active', 1);
          })

          // Destrory process (to clean pool)
          knexConnection.destroy();

          if (data.items[i].items) {
            for (let j = 0; j < data.items[i].items; j++) {

              // Create db process (get into pool)
              knexConnection = require('knex')(knexConnectionConfig);

              data.items[i].items[j].items = await knexConnection.transaction(async trx => {
                return trx.table('pages').where('parent_id', data.items[i].items[j].id).orderBy('pages.position', orderBy).where('pages.is_active', 1);
              })


              // Destrory process (to clean pool)
              knexConnection.destroy();
            }
          }


        }
      }

      pages.data = {
        ...pages.data,
        [`${moduleTypes[i].visibility}`]: data.items
      }
    }

  } else {
    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    pages = await knexConnection.transaction(async trx => {
      var query;
      query = trx.select('pages.*').table('pages').where('admin_visibility', 1)
        .modify(function (queryBuilder) {
          if (parentID && (!req.query.offLimit || req.query.offLimit == false)) {
            queryBuilder.whereIn('pages.parent_id', parentID)
          }
          if (req.query.visibility) {
            queryBuilder.where('pages.visibility', req.query.visibility)
          }
          if (req.query.is_parent) {
            queryBuilder.where('pages.is_parent', req.query.is_parent)
          }
        })
        .where('pages.is_active', 1).orderBy('pages.position', orderBy);

      totalCount = await query.clone().count();
      totalCount = totalCount[0]['count(*)'];

      if ((!req.query.offLimit || req.query.offLimit == false) && (!user || user.type == 'ADMIN')) {
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

  }

  //
  let statusCode = pages.data ? 200 : 422;
  let response = {
    success: pages.data ? true : false,
    pages: pages.data,
    totalCount: totalCount,
    error: pages.error
  };

  res.status(statusCode).json(response);
}


const intersect = (arrayA, arrayB) => {
  return arrayA.filter(elem => arrayB.includes(String(elem)));
};