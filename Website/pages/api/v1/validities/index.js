import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch validitie
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert validitie
  if (!user) { restrictedAccess(res); return false; }

  // Filter
  let type = req.query.type ? req.query.type : null;
  let orderBy = req.query.order_by ? req.query.order_by : 'DESC';
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let attributes;

  var totalCount = 0


  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let validities = await knexConnection.transaction(async trx => {
    var query;

    query = knexConnection.select(attributes).table('validities')
      .modify(function (queryBuilder) {
        if (type) {
          queryBuilder.where('validities.duration_type', type)
        }
      });

    if ((!req.query.forList || req.query.listOnly)) {
      query.where('validities.is_active', 1)
    }

    totalCount = await query.clone().count();
    totalCount = totalCount[0]['count(*)'];

    if ((!req.query.offLimit || req.query.offLimit == false)) {
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
      error: err
    };
  })

  // Destrory process (to clean pool)
  knexConnection.destroy();

  //
  let statusCode = validities.data ? 200 : 422;
  let response = {
    success: validities.data ? true : false,
    validities: validities.data,
    totalCount: totalCount,
    error: validities.error
  };

  res.status(statusCode).json(response);
}