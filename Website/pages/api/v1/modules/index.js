import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed, googleApi } from 'helpers/api';

// Function to Fetch module
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert module
  if (!user) { restrictedAccess(res); return false; }

  // Filter
  let orderBy = req.query.order_by ? req.query.order_by : 'ASC';
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;
  let parentID = req.query.parentID ? req.query.parentID.split(',') : null;
  var modules;


  var totalCount = 0



  if (req.query.byType) {

    modules = {
      data: []
    };

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    var moduleTypes = await knexConnection.transaction(async trx => {
      return trx.select('type').table('modules').groupBy('type');
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    for (let i = 0; i < moduleTypes.length; i++) {


      var ids = []

      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      ids = await knexConnection.transaction(async trx => {
        var query;
        query = trx.select('modules.*').table('modules').where('modules.type', moduleTypes[i].type).whereNotNull('modules.parent_id').pluck('modules.parent_id')
          .where('modules.is_active', 1).orderBy('modules.position', orderBy);



        return query;

      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      let data = {
        title: moduleTypes[i].type
      }

      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      data.items = await knexConnection.transaction(async trx => {
        var query;
        query = trx.select('modules.*').table('modules')
          .whereNull('modules.parent_id').where('modules.type', moduleTypes[i].type)
          .where('modules.is_active', 1).orderBy('modules.position', orderBy);


        if (user.type != 'ADMIN') {
          query.where(function () {
            this.whereIn('id', ids).orWhereIn('id', user.module_ids)
          })
        }


        if (req.query.search && req.query.search != '') {
          query.join('modules as childModule', 'childModule.parent_id', 'modules.id')
            .where(function () {
              this.where(function () {
                this.where('childModule.title', 'like', '%'.concat(req.query.search).concat('%')).where('childModule.is_active', 1)
              }).orWhere('modules.title', 'like', '%'.concat(req.query.search).concat('%'))
            }).groupBy('modules.id')
        }

        return query;

      })

      // Destrory process (to clean pool)
      knexConnection.destroy();



      if (data.items) {
        for (let i = 0; i < data.items.length; i++) {


          // Create db process (get into pool)
          knexConnection = require('knex')(knexConnectionConfig);

          data.items[i].items = await knexConnection.transaction(async trx => {
            let query = trx.table('modules').select('modules.*').where('modules.parent_id', data.items[i].id).orderBy('modules.position', orderBy).where('modules.is_active', 1);

            if (user.type != 'ADMIN') {
              query.whereIn('id', user.module_ids)
            }

            if (req.query.search && req.query.search != '') {
              query.join('modules as parentModule', 'parentModule.id', 'modules.parent_id')
                .where(function(){
                  this.where(function () {
                    this.where('parentModule.title', 'like', '%'.concat(req.query.search).concat('%')).where('parentModule.is_active', 1)
                  }).orWhere('modules.title', 'like', '%'.concat(req.query.search).concat('%'))
                })
            }

            return query;
          })

          // Destrory process (to clean pool)
          knexConnection.destroy();

          if (ids.includes(data.items[i].id) && data.items[i].items.length == 0) {
            data.items[i] = null
          }

          if (data.items[i] && data.items[i].items) {
            for (let j = 0; j < data.items[i].items; j++) {

              // Create db process (get into pool)
              knexConnection = require('knex')(knexConnectionConfig);

              data.items[i].items[j].items = await knexConnection.transaction(async trx => {
                return trx.table('modules').where('parent_id', data.items[i].items[j].id).orderBy('modules.position', orderBy).where('modules.is_active', 1);
              })



              // Destrory process (to clean pool)
              knexConnection.destroy();
            }
          }


        }
      }


      modules.data.push(data)


    }




  } else {


    var ids = []

    if (req.query.withoutParent) {

      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      ids = await knexConnection.transaction(async trx => {
        var query;
        query = trx.select('modules.*').table('modules').whereNotNull('modules.parent_id').pluck('modules.parent_id')
          .orderBy('modules.position', orderBy);

        return query;

      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

    }

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    modules = await knexConnection.transaction(async trx => {
      var query;
      query = trx.select('modules.*').table('modules')
        .modify(function (queryBuilder) {
          if (parentID && (!req.query.offLimit || req.query.offLimit == false)) {
            queryBuilder.whereIn('modules.parent_id', parentID)
          }
          else if (req.query.withoutParent) {
            queryBuilder.whereNotIn('id', ids)
          }
          else {
            queryBuilder.where('modules.parent_id', null)
          }
        })
        .orderBy('modules.position', orderBy);

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

    if (modules.data) {
      for (let i = 0; i < modules.data.length; i++) {

        // Create db process (get into pool)
        knexConnection = require('knex')(knexConnectionConfig);

        modules.data[i].items = await knexConnection.transaction(async trx => {
          return trx.table('modules').where('parent_id', modules.data[i].id).orderBy('modules.position', orderBy);
        })

        // Destrory process (to clean pool)
        knexConnection.destroy();

        if (modules.data[i].items) {
          for (let j = 0; j < modules.data[i].items; j++) {

            // Create db process (get into pool)
            knexConnection = require('knex')(knexConnectionConfig);

            modules.data[i].items[j].items = await knexConnection.transaction(async trx => {
              return trx.table('modules').where('parent_id', modules.data[i].items[j].id).orderBy('modules.position', orderBy);
            })


            // Destrory process (to clean pool)
            knexConnection.destroy();
          }
        }


      }
    }
  }

  // googleApi()


  //
  let statusCode = modules.data ? 200 : 422;
  let response = {
    success: modules.data ? true : false,
    modules: modules.data,
    totalCount: totalCount,
    error: modules.error
  };

  res.status(statusCode).json(response);
}


const intersect = (arrayA, arrayB) => {
  return arrayA.filter(elem => arrayB.includes(String(elem)));
};