import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { fetchByID } from 'helpers/apiService';
import moment from 'moment';
import { getOnly, createLog, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed, checkCoupon } from 'helpers/api';

// Function to Fetch product
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert product
  if (!user) { restrictedAccess(res); return false; }

  // Filter
  let orderBy = req.query.order_by ? req.query.order_by : 'DESC';
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;
  let productID = req.query.productID ? req.query.productID.split(',') : null;
  let cartID = req.query.cartID ? req.query.cartID.split(',') : null;
  let userID = req.query.userID ? req.query.userID.split(',') : null;
  let status = req.query.status ? req.query.status : null;
  let date = req.query.date ? req.query.date : null;

  let totalCount = 0;


  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let orders = await knexConnection.transaction(async trx => {
    var query;

    query = trx.select('orders.*').table('orders')
      .where('orders.status', '!=', 'PENDING')
      .where('orders.type', 'PRODUCT')
      .modify(function (queryBuilder) {
        if ((!req.query.forList || req.query.listOnly)) {
          queryBuilder.where('orders.user_id', user.id)
        }
        if (cartID) {
          queryBuilder.join('carts', 'carts.order_id', 'orders.id').whereIn('carts.id', cartID)
        }
        if (productID) {
          if (cartID) {
            queryBuilder.whereIn('carts.product_id', productID)
          } else {
            queryBuilder.join('carts', 'carts.order_id', 'orders.id').whereIn('carts.product_id', productID)
          }
        }

        if (status) {
          queryBuilder.where('orders.status', '=', status)
        }
        if (req.query.orderType && req.query.orderType != '') {
          if (productID || cartID) {
            queryBuilder.where('carts.order_type', '=', req.query.orderType)
          } else {
            queryBuilder.join('carts', 'carts.order_id', 'orders.id').where('carts.order_type', '=', req.query.orderType)
          }
        }
        if (req.query.start_date && req.query.start_date != '') {

          let startDate = moment(req.query.start_date).format('YYYY-MM-DDTHH:mm:ssZ')
          queryBuilder.where('orders.created_at', '>=', startDate.toString())
        }
        if (req.query.end_date && req.query.end_date != '') {
          let endDate = moment(req.query.end_date).format('YYYY-MM-DDTHH:mm:ssZ')
          queryBuilder.where('orders.created_at', '<=', endDate.toString())
        }
        if (userID) {
          queryBuilder.whereIn('orders.user_id', userID)
        }
        if (req.query.search && req.query.search != '') {
          queryBuilder.join('users', 'users.id', 'orders.user_id').
            where('users.first_name', 'like', '%'.concat(req.query.search).concat('%'))
            .orWhere('orders.order_number', 'like', '%'.concat(req.query.search).concat('%'))
            .orWhere('users.last_name', 'like', '%'.concat(req.query.search).concat('%'))
            .orWhere('users.mobile_number', 'like', '%'.concat(req.query.search).concat('%'))
            .orWhere('users.email', 'like', '%'.concat(req.query.search).concat('%'))
            
        }
      })
      .orderBy('orders.id', orderBy);



    totalCount = await query.clone().count();
    totalCount = totalCount[0]['count(*)'];

    if (user.type != 'USER' && (!req.query.offLimit || req.query.offLimit == false)) {
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


  if (orders.data) {
    for (let i = 0; i < orders.data.length; i++) {

      let carts = []
      orders.data[i].carts = []

      var knexConnection = require('knex')(knexConnectionConfig);

      carts = await knexConnection.transaction(async trx => {
        var query;

        query = trx.select('carts.*').table('carts')
          .modify(function (queryBuilder) {
            if ((!req.query.forList || req.query.listOnly)) {
              queryBuilder.where('user_id', user.id)
            }
          })
          .where('carts.order_id', orders.data[i].id)
          .orderBy('carts.id', orderBy);
        return query;

      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      if (carts) {
        for (let j = 0; j < carts.length; j++) {



          let product = await fetchByID('products', carts[j].product_id, { 'forWeb': true, cartID: carts[j].id, userID: orders.data[i].user_id, noLog: true, forActive: true }, req.headers['x-auth-token'])

          product = product.product

          if (product && product.attributes && product.attributes.validity && product.attributes.validity.values && product.attributes.validity.values.length > 0) {

            let expDate = null
            if (product.attributes.validity.values[0].type == 'DAYS') {
              let validity = product.attributes.validity.values[0].duration
              let type = 'days'
              if (product.attributes.validity.values[0].duration_type == 'MONTH') {
                type = 'months'
              } else if (product.attributes.validity.values[0].duration_type == 'YEAR') {
                type = 'years'
              }

              if (carts[j].validity_start_from) {
                expDate = moment(carts[j].validity_start_from).add(validity, type)
              }
              else {
                expDate = moment(orders.data[i].created_at).add(validity, type)
              }
            } else {
              expDate = moment(product.attributes.validity.values[0].date).format()
            }

            carts[j].activated = false
            if (moment().isSameOrBefore(expDate, 'day')) {
              carts[j].activated = true
            }

            if (carts[j].validity_start_from && !moment().isSameOrAfter(carts[j].validity_start_from, 'day')) {
              carts[j].notStarted = true
            }
            carts[j].expDate = expDate
            carts[j].leftDays = moment(expDate).diff(moment(), 'days')



            if (carts[j].upgraded_cart_id) {

              // Create db process (get into pool)
              knexConnection = require('knex')(knexConnectionConfig);

              carts[j].old_order = await knexConnection.transaction(async trx => {
                return trx.table('carts').select('orders.*').where('carts.id', carts[j].upgraded_cart_id).join('orders', 'orders.id', 'carts.order_id').first();
              })


              // Destrory process (to clean pool)
              knexConnection.destroy();
            }

          }

          if (product) {
            carts[j].product = product
            orders.data[i].carts.push(carts[j])
          }
        }
      }

      var knexConnection = require('knex')(knexConnectionConfig);

      orders.data[i].user = await knexConnection.transaction(async trx => {
        var query;

        query = trx.select('users.*').table('users')
          .where('users.id', orders.data[i].user_id)
          .first();
        return query;

      })

      // Destrory process (to clean pool)
      knexConnection.destroy();
    }
  }


  //
  let statusCode = orders.data ? 200 : 422;
  let response = {
    success: orders.data ? true : false,
    orders: orders.data,
    totalCount: totalCount,
  };

  res.status(statusCode).json(response);
}


const intersect = (arrayA, arrayB) => {
  return arrayA.filter(elem => arrayB.includes(elem));
};