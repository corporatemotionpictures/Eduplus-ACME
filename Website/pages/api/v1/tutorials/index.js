import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch exam
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert exam
  // if (!user) { restrictedAccess(res); return false; }

  // Filter
  let orderBy = req.query.order_by ? req.query.order_by : 'ASC';
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;


  var subjectIDs = null;
  if (user && user.type == 'FACULTY' && user.subject_ids) {
    subjectIDs = user.subject_ids;
  }

  var totalCount = 0

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let tutorials = await knexConnection.transaction(async trx => {
    var query;

    query = trx.select('tutorials.*').table('tutorials')

      .orderBy('tutorials.id', orderBy);

    if (req.query.search && req.query.search != '') {
      query.where('tutorials.title', 'like', '%'.concat(req.query.search).concat('%'))
    }



    totalCount = await query.clone().count();
    totalCount = totalCount[0]['count(*)'];

    query.groupBy('tutorials.id')

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
      error: err.sqlMessage
    };
  })

  // Destrory process (to clean pool)
  knexConnection.destroy();


  //
  let statusCode = tutorials.data ? 200 : 422;
  let response = {
    success: tutorials.data ? true : false,
    tutorials: tutorials.data,
    totalCount: totalCount,
    error: tutorials.error,
  };

  res.status(statusCode).json(response);
}