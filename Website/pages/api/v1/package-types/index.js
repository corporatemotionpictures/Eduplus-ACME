import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch package_type
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert package_type
  // if (!user) { restrictedAccess(res); return false; }

  // Filter
  let orderBy = req.query.order_by ? req.query.order_by : 'ASC';
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;
  let moduleID = req.query.moduleID ? req.query.moduleID.split(',') : null;


  let totalCount = 0
  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let packageTypes = await knexConnection.transaction(async trx => {
    var query;
    query = trx.select('course_types.*').table('course_types').orderBy('course_types.position', orderBy);
    if ((!req.query.forList || req.query.listOnly)) {
      query.where('course_types.is_active', 1)
    }

    query.modify(function (queryBuilder) {
      queryBuilder.where(function () {
        this.where(function () {
          if (moduleID) {
            moduleID.map((id, i) => {
              this.orWhere('include_ids', 'like', `%[${id}]%`).orWhere('include_ids', 'like', `%,${id}]%`).orWhere('include_ids', 'like', `%[${id},%`).orWhere('include_ids', 'like', `%,${id},%`)
            })
          }
        })
      })
    })

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

  if (packageTypes.data) {
    for (let i = 0; i < packageTypes.data.length; i++) {

      // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);

      packageTypes.data[i].modules = await knexConnection.transaction(async trx => {
        return trx.table('app_modules').whereIn('id', JSON.parse(packageTypes.data[i].include_ids));
      })


      // Destrory process (to clean pool)
      knexConnection.destroy();

    }
  }

  //
  let statusCode = packageTypes.data ? 200 : 422;
  let response = {
    success: packageTypes.data ? true : false,
    packageTypes: packageTypes.data,
    totalCount: totalCount,
    error: packageTypes.error
  };

  res.status(statusCode).json(response);
}


const intersect = (arrayA, arrayB) => {
  return arrayA.filter(elem => arrayB.includes(String(elem)));
};