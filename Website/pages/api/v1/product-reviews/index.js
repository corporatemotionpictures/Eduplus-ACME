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
  // if (!user) { restrictedAccess(res); return false; }

  // Filter
  let type = req.query.type ? req.query.type : null;
  let orderBy = req.query.order_by ? req.query.order_by : 'ASC';
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let productID = req.query.productID ? req.query.productID.split(',') : null;
  let userID = req.query.userID ? req.query.userID.split(',') : null;

  let attributes;


  var totalCount = 0

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let reviews = await knexConnection.transaction(async trx => {
    var query;

    query = trx.select(attributes).table('product_reviews').orderBy('product_reviews.id', orderBy);

    if (productID) {
      query.whereIn('product_reviews.product_id', productID)
    }
    if (userID) {
      query.whereIn('product_reviews.user_id', userID)
    }

    totalCount = await query.clone().count();
    totalCount = totalCount[0]['count(*)'];

    if (!req.query.offLimit || req.query.offLimit == false) {
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

  if (reviews.data) {
    for (let i = 0; i < reviews.data.length; i++) {


      knexConnection = require('knex')(knexConnectionConfig);

      reviews.data[i].user = await knexConnection.transaction(async trx => {
        return trx.select().table('users').where('id', reviews.data[i].user_id).first();
      })


      // Destrory process (to clean pool)
      knexConnection.destroy();

      knexConnection = require('knex')(knexConnectionConfig);

      reviews.data[i].product = await knexConnection.transaction(async trx => {
        return trx.select().table('products').where('id', reviews.data[i].product_id).first();
      })


      // Destrory process (to clean pool)
      knexConnection.destroy();
    }
  }

  //
  let statusCode = reviews.data ? 200 : 422;
  let response = {
    success: reviews.data ? true : false,
    totalCount: totalCount,
    reviews: reviews.data,
    error: reviews.error
  };

  res.status(statusCode).json(response);
}