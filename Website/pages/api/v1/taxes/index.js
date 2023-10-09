import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, moneyfy, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';
import taxes from '../../../dashboard/taxes';

// Function to Fetch product_type
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert product_type
  if (!user) { restrictedAccess(res); return false; }

  // Filter
  let orderBy = req.query.order_by ? req.query.order_by : 'ASC';
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;
  let type = req.query.type ? req.query.type : null;

  var totalCount = 0

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let taxes = await knexConnection.transaction(async trx => {
    var query;
    query = trx.select('taxes.*').table('taxes').orderBy('taxes.position', orderBy);
    if ((!req.query.forList || req.query.listOnly)) {
      query.where('taxes.is_active', 1)
    }
    if (type) {
      query.where('taxes.amount_type', type)
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


  if (taxes.data) {
    for (let i = 0; i < taxes.data.length; i++) {
      taxes.data[i].monyfiedAmount = await moneyfy(taxes.data[i].amount, taxes.data[i].amount_type)
    }
  }

  //
  let statusCode = taxes.data ? 200 : 422;
  let response = {
    success: taxes.data ? true : false,
    taxes: taxes.data,
    totalCount: totalCount,
    error: taxes.error
  };

  res.status(statusCode).json(response);
}
