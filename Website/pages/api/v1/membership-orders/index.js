import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { fetchByID } from 'helpers/apiService';
import moment from 'moment';
import { getOnly, createLog, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed, checkCoupon } from 'helpers/api';

// Function to Fetch membership
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert membership
  if (!user) { restrictedAccess(res); return false; }

  // Filter
  let orderBy = req.query.order_by ? req.query.order_by : 'DESC';
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;
  let membershipID = req.query.membershipID ? req.query.membershipID.split(',') : null;
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
      .where('orders.type', 'MEMBERSHIP')
      .modify(function (queryBuilder) {
        if ((!req.query.forList || req.query.listOnly)) {
          queryBuilder.where('orders.user_id', user.id)
        }
        if (membershipID) {
          queryBuilder.join('membership_carts', 'membership_carts.order_id', 'orders.id')
          .whereIn('membership_carts.membership_id', membershipID)
        }
        if (status) {
          queryBuilder.where('orders.status', '=', status)
        }
        if (userID) {
          queryBuilder.whereIn('orders.user_id', userID)
        }
      })
      .orderBy('orders.id', orderBy);



    totalCount = await query.clone().count();
    totalCount = totalCount[0]['count(*)'];

    if (user.type != 'USER') {
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

      var knexConnection = require('knex')(knexConnectionConfig);

      orders.data[i].carts = await knexConnection.transaction(async trx => {
        var query;

        query = trx.select('membership_carts.*').table('membership_carts')
          .modify(function (queryBuilder) {
            if ((!req.query.forList || req.query.listOnly)) {
              queryBuilder.where('user_id', user.id)
            }
          })
          .where('membership_carts.order_id', orders.data[i].id)
          .orderBy('membership_carts.id', orderBy);
        return query;

      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      

      if (orders.data[i].carts) {
        for (let j = 0; j < orders.data[i].carts.length; j++) {

          let membership = await fetchByID('memberships', orders.data[i].carts[j].membership_id, { 'forWeb': true, cartID: orders.data[i].carts[j].id, userID: orders.data[i].user_id, noLog: true }, req.headers['x-auth-token'])

          membership = membership.membership

          if (membership && membership.validity) {

            let expDate = null
            if (membership.validity.type == 'DAYS') {
              let validity = membership.validity.duration
              let type = 'days'
              if (membership.validity.duration_type == 'MONTH') {
                type = 'months'
              } else if (membership.validity.duration_type == 'YEAR') {
                type = 'years'
              }

              expDate = moment(orders.data[i].created_at).add(validity, type)
            } else {
              expDate = moment(membership.validity.date).format()
            }
            orders.data[i].carts[j].activated = false
            if (moment().isSameOrBefore(expDate, 'day')) {
              orders.data[i].carts[j].activated = true
            }
            orders.data[i].carts[j].expDate = expDate
            orders.data[i].carts[j].leftDays = moment(expDate).diff(moment(), 'days')
          }

          orders.data[i].carts[j].membership = membership
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
    membershipOrders: orders.data,
    totalCount: totalCount,
  };

  res.status(statusCode).json(response);
}


const intersect = (arrayA, arrayB) => {
  return arrayA.filter(elem => arrayB.includes(elem));
};