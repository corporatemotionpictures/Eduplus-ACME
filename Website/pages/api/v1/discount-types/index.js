import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch discount_type
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert discount_type
  if (!user) { restrictedAccess(res); return false; }

  let totalCount = 0

  // Filter
  let orderBy = req.query.order_by ? req.query.order_by : 'ASC';
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;
  let moduleID = req.query.moduleID ? `[${req.query.moduleID}]` : null;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let discountTypes = await knexConnection.transaction(async trx => {
    var query;
    query = trx.select('discount_types.*').table('discount_types').orderBy('discount_types.id', orderBy);
    if ((!req.query.forList || req.query.listOnly)) {
      query.where('discount_types.is_active', 1)
    }

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

  //
  let statusCode = discountTypes.data ? 200 : 422;
  let response = {
    success: discountTypes.data ? true : false,
    totalCount: totalCount,
    discountTypes: discountTypes.data,
    error: discountTypes.error
  };

  res.status(statusCode).json(response);
}