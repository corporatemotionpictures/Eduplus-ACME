import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';

import { getOnly, createLog, replaceUploads, replaceUploadsArray, CourseID, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch Blogs
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  // if (!user) { restrictedAccess(res); return false; }

  // Filters
  let orderBy = req.query.order_by ? req.query.order_by : 'ASC';
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;


  var totalCount = 0

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch gallery from database
  let gallery = await knexConnection.transaction(async trx => {

    let query;

    // 
    query = trx.select('gallery.*').table('gallery')
      .orderBy('gallery.position', orderBy);

    if (req.query.search && req.query.search != '') {
      query.where('gallery.name', 'like', '%'.concat(req.query.search).concat('%'))
    }

    if ((!req.query.forList || req.query.listOnly)) {
      query.where('gallery.is_active', 1)
    }

    totalCount = await query.clone().count();
    totalCount = totalCount[0]['count(*)'];

    if (user) {
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
  });

  // Destrory process (to clean pool)
  knexConnection.destroy();


  if (gallery.data) {

    gallery.data = await replaceUploadsArray(gallery.data, 'cover_image');
    gallery.data = await replaceUploadsArray(gallery.data, 'images');
  }



  if (gallery.data && user && user.type != 'ADMIN' && !req.query.listOnly && !req.query.noLog) {
    let logged_data = {
      user_id: user.id,
      action: 'VIEW_ALL_BLOGS',
      payload: JSON.stringify({
        field_name: 'gallery',
        ...req.query
      })
    }


    let logs = await createLog(logged_data)
  }




  //
  let statusCode = gallery.data ? 200 : 422;
  let response = {
    success: gallery.data ? true : false,
    gallery: gallery.data,
    totalCount: totalCount,
    error: gallery.error
  };

  // Send Response
  res.status(statusCode).json(response);
}

const intersect = (arrayA, arrayB) => {
  return arrayA.filter(elem => arrayB.includes(elem));
};