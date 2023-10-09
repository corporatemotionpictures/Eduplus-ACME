import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Get User By ID
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user) { restrictedAccess(res); return false; }

  // set attributes
  let attributes = {
    id: 'users.id',
    fcm_token: 'users.fcm_token'
  };


  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fatch user From Database
  user = await knexConnection.transaction(async trx => {
    let query = knexConnection.select('users.id', 'users.fcm_token').table('users');

    if (req.query.userID) {
      query.where('users.id', req.query.userID)
    }
    if (!req.query.forSMS) {
      query.whereNot('users.fcm_token', null)
    }
    if (req.query.product_ids && req.query.product_ids.length > 0 && req.query.product_ids != '[]') {
      query.join('carts', 'carts.user_id', 'users.id').where('carts.status', 'PURCHESED')
        .whereIn('carts.product_id', JSON.parse(req.query.product_ids))
    }

    if (req.query.course_ids && req.query.course_ids.length > 0 && req.query.course_ids != '[]') {
      if (req.query.product_ids && req.query.product_ids.length > 0 && req.query.product_ids != '[]') {
        query.join('products', 'products.id', 'carts.product_id').where(function () {
          JSON.parse(req.query.course_ids).map((id, i) => {
            this.orWhere('products.course_ids', 'like', `%[${id}]%`).orWhere('products.course_ids', 'like', `%,${id}]%`).orWhere('products.course_ids', 'like', `%[${id},%`).orWhere('products.course_ids', 'like', `%,${id},%`)
          })
        })

      } else {

        query.join('carts', 'carts.user_id', 'users.id').where('carts.status', 'PURCHESED')
          .join('products', 'products.id', 'carts.product_id').where(function () {
            JSON.parse(req.query.course_ids).map((id, i) => {
              this.orWhere('products.course_ids', 'like', `%[${id}]%`).orWhere('products.course_ids', 'like', `%,${id}]%`).orWhere('products.course_ids', 'like', `%[${id},%`).orWhere('products.course_ids', 'like', `%,${id},%`)
            })
          })
      }

    }
    if (req.query.subject_ids && req.query.subject_ids.length > 0 && req.query.subject_ids != '[]') {
      if (req.query.course_ids && req.query.course_ids.length > 0 && req.query.course_ids != '[]') {
        query.where(function () {
          JSON.parse(req.query.subject_ids).map((id, i) => {
            this.orWhere('products.subject_ids', 'like', `%[${id}]%`).orWhere('products.subject_ids', 'like', `%,${id}]%`).orWhere('products.subject_ids', 'like', `%[${id},%`).orWhere('products.subject_ids', 'like', `%,${id},%`)
          })
        })

      }
     else if (req.query.product_ids && req.query.product_ids.length > 0 && req.query.product_ids != '[]') {
        query.join('products', 'products.id', 'carts.product_id').where(function () {
          JSON.parse(req.query.subject_ids).map((id, i) => {
            this.orWhere('products.subject_ids', 'like', `%[${id}]%`).orWhere('products.subject_ids', 'like', `%,${id}]%`).orWhere('products.subject_ids', 'like', `%[${id},%`).orWhere('products.subject_ids', 'like', `%,${id},%`)
          })
        })

      }
       else {

        query.join('carts', 'carts.user_id', 'users.id').where('carts.status', 'PURCHESED')
          .join('products', 'products.id', 'carts.product_id').where(function () {
            JSON.parse(req.query.subject_ids).map((id, i) => {
              this.orWhere('products.subject_ids', 'like', `%[${id}]%`).orWhere('products.subject_ids', 'like', `%,${id}]%`).orWhere('products.subject_ids', 'like', `%[${id},%`).orWhere('products.subject_ids', 'like', `%,${id},%`)
            })
          })
      }

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
  let statusCode = user.data ? 200 : 422;
  let response = {
    success: user.data ? true : false,
    user: user.data,
    error: user
  };



  // Send Response
  res.status(statusCode).json(response);
}