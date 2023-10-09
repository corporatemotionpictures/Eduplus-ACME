import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { fetchAll, getSettings } from 'helpers/apiService';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch banners
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user) { restrictedAccess(res); return false; }

  // Filters
  let orderBy = req.query.order_by ? req.query.order_by : 'DESC';

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch banners from database
  let banners = await knexConnection.transaction(async trx => {

    let query;
    let attributes;

    // If Fetch by  Course ID
    // 
    query = trx.select().table('banners')
      .orderBy('banners.id', orderBy);

    if (user.type != 'ADMIN') {
      query = query.where('approved', true)
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

  if (banners.data) {
    banners.data = await replaceUploadsArray(banners.data, 'image');
  }


  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let exams = await knexConnection.transaction(async trx => {
    var query = trx.select('exams.*').table('exams');

    if ((!req.query.forList || req.query.listOnly)) {
      query.where('exams.is_active', 1)
    }

    return query;
  });

  // Destrory process (to clean pool)
  knexConnection.destroy();


  if (exams) {
    exams = await replaceUploadsArray(exams, 'thumbnail');

    for (let i = 0; i < exams.length; i++) {

      let products = await fetchAll('products', { examID: exams[i].id, noLog: true, listOnly: true, limit: process.env.HOME_PRODUCT_LIMIT != 'false' ? process.env.HOME_PRODUCT_LIMIT : null, offset: 0 }, req.headers['x-auth-token'])

    

      if (products) {
        exams[i].products = products.products;
      } else {
        exams[i].products = []
      }


    }
  }



  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let courses = await knexConnection.transaction(async trx => {
    var query = trx.select('courses.*').table('courses');

    if ((!req.query.forList || req.query.listOnly)) {
      query.where('courses.is_active', 1)
    }

    return query;
  });

  // Destrory process (to clean pool)
  knexConnection.destroy();


  if (courses) {
    courses = await replaceUploadsArray(courses, 'thumbnail');
    for (let i = 0; i < courses.length; i++) {

      let products = await fetchAll('products', { courseID: courses[i].id, noLog: true, listOnly: true, limit: process.env.HOME_PRODUCT_LIMIT != 'false' ? process.env.HOME_PRODUCT_LIMIT : null, offset: 0 }, req.headers['x-auth-token'])


      if (products) {
        courses[i].products = products.products;
      } else {
        courses[i].products = []
      }


    }
  }


  if (user && user.type != 'ADMIN' && !req.query.listOnly && !req.query.noLog) {
    let logged_data = {
      user_id: user.id,
      action: `VIEW_HOMEPAGE`,
      payload: JSON.stringify({
        field_name: 'app homepage',
        ...req.query
      })
    }


    let logs = await createLog(logged_data)
  }



  let OtsAccessToken = null
  let OtsAccessUrl = null

  let otsIntigration = process.env.NEXT_PUBLIC_OTS_INTIGRATION

  if (user && otsIntigration == "true") {
    let url = process.env.NEXT_PUBLIC_TEST_SERIES_URL.concat('/getMagicToken')

    let ots = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email
      }),
    })

    if (ots.status == 200) {
      let otsJson = await ots.json()
      if (otsJson.success == true) {
        OtsAccessToken = otsJson.token
        OtsAccessUrl = `${process.env.NEXT_PUBLIC_TEST_SERIES_URL}/magicLogin?email=${user.email}&&token=${OtsAccessToken}`
      }
    }
  }


  //
  let statusCode = 200;
  let response = {
    success: true,
    banners: banners.data,
    OtsAccessUrl: OtsAccessUrl,
    OtsAccessToken: OtsAccessToken,
    exams: exams,
    courses: courses,
    error: banners.error
  };

  if (process.env.DOMAIN == 'learnart') {
    let appLinks = await getSettings('learnartConfig');
    response.appLinks = appLinks
  }

  // Send Response
  res.status(statusCode).json(response);
}