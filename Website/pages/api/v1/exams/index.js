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

  let exams = await knexConnection.transaction(async trx => {
    var query;

    query = trx.select('exams.*').table('exams')

      .modify(function (queryBuilder) {
        // if (subjectIDs) {
        //   queryBuilder.join('subjects', 'subjects.exam_id', 'exams.id').whereIn('subjects.id', subjectIDs)
        // }
      })
      .orderBy('exams.position', orderBy);

    if (req.query.search && req.query.search != '') {
      query.where('exams.name', 'like', '%'.concat(req.query.search).concat('%'))
    }

    if ((!req.query.forList || req.query.listOnly)) {
      query.where('exams.is_active', 1)
    }



    totalCount = await query.clone().count();
    totalCount = totalCount[0]['count(*)'];

    query.groupBy('exams.id')

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

  if (exams.data && user && user.type != 'ADMIN' && !req.query.listOnly && !req.query.noLog) {
    let logged_data = {
      user_id: user.id,
      action: 'VIEW_ALL_EXAMS',
      payload: JSON.stringify({
        field_name: 'exams',
        ...req.query
      })
    }


    let logs = await createLog(logged_data)
  }

  if (exams.data) {
    exams.data = await replaceUploadsArray(exams.data, 'thumbnail');
  }


  //
  let statusCode = exams.data ? 200 : 422;
  let response = {
    success: exams.data ? true : false,
    exams: exams.data,
    totalCount: totalCount,
    error: exams.error,
  };

  res.status(statusCode).json(response);
}