import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed, checkPackage } from 'helpers/api';

// Function to Fetch Course
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  // if (!user) { restrictedAccess(res); return false; }

  // Filter
  let orderBy = req.query.order_by ? req.query.order_by : 'ASC';
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;
  let examID = req.query.examID ? req.query.examID.split(',') : null;

  let attributes = {
    exam_ids: 'exams.id',
    exam_name: 'exams.name',
  };


  var subjectIDs = null;
  if (user && user.type == 'FACULTY' && user.subject_ids) {
    subjectIDs = user.subject_ids;
  }

  var totalCount = 0

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let courses = await knexConnection.transaction(async trx => {
    var query;
    query = trx.select('courses.*').table('courses')
      .orderBy('courses.position', orderBy);

    // query = query.select()

    if (req.query.search && req.query.search != '') {
      query.where('courses.name', 'like', '%'.concat(req.query.search).concat('%'))
    }

    if ((!req.query.forList || req.query.listOnly) || req.query.listOnly) {
      query.where('courses.is_active', 1)
    }

    query.modify(function (queryBuilder) {
      queryBuilder.where(function () {
        this.where(function () {
          if (examID) {
            examID.map((id, i) => {
              this.orWhere('exam_ids', 'like', `%[${id}]%`).orWhere('exam_ids', 'like', `%,${id}]%`).orWhere('exam_ids', 'like', `%[${id},%`).orWhere('exam_ids', 'like', `%,${id},%`)
            })
          }
        })
      })
    });


    totalCount = await query.clone().count();
    totalCount = totalCount[0]['count(*)'];

    if ((!req.query.offLimit || req.query.offLimit == false) && (!user || user.type == 'ADMIN')) {
      query = await query.clone().offset(offset).limit(limit)
    }

    return query;

  }).then(res => {

    // totalCount = res.length
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

  if (courses.data) {
    for (let i = 0; i < courses.data.length; i++) {

      // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);

      courses.data[i].exams = await knexConnection.transaction(async trx => {
        return trx.table('exams').whereIn('id', JSON.parse(courses.data[i].exam_ids)).orderBy('position', 'ASC');
      })


      // Destrory process (to clean pool)
      knexConnection.destroy();

    }
  }

  if (courses.data && user && user.type != 'ADMIN' && !req.query.forList) {

    for (let i = 0; i < courses.data.length; i++) {
      courses.data[i].locked = false
      courses.data[i].locked = await checkPackage(req.headers['x-auth-token'], [courses.data[i].id], null, null, 'course')
    }

  }


  if (courses.data && user && user.type != 'ADMIN' && !req.query.listOnly && !req.query.noLog) {
    let logged_data = {
      user_id: user.id,
      action: 'VIEW_ALL_COURSES',
      payload: JSON.stringify({
        field_name: 'courses',
        ...req.query
      })
    }


    let logs = await createLog(logged_data)
  }


  courses.data = await replaceUploadsArray(courses.data, 'thumbnail');

  //
  let statusCode = courses.data ? 200 : 422;
  let response = {
    success: courses.data ? true : false,
    courses: courses.data,
    totalCount: totalCount,
    error: courses.error,
  };

  res.status(statusCode).json(response);
}


const intersect = (arrayA, arrayB) => {
  return arrayA.filter(elem => arrayB.includes(String(elem)));
};