import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { fetchByID, fetchAll } from 'helpers/apiService';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed, checkCoupon } from 'helpers/api';

// Function to Get order By ID
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert order
  if (!user) { restrictedAccess(res); return false; }

  // set orders
  let id = req.query.id;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fatch order From Database
  let order = await knexConnection.transaction(async trx => {
    return trx.select().table('orders').where('order_number', id).first();
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


  if (order.data) {

    var knexConnection = require('knex')(knexConnectionConfig);

    order.data.user = await knexConnection.transaction(async trx => {
      var query;

      query = trx.select('users.*').table('users').where('id', order.data.user_id).first();
      return query;

    })

    // Destrory process (to clean pool)
    knexConnection.destroy();
    if (order.data.user) {

      var knexConnection = require('knex')(knexConnectionConfig);
      order.data.user.address = await knexConnection.transaction(async trx => {
        var query;

        query = trx.select('addresses.*').table('addresses').where('user_id', order.data.user_id).first();
        return query;

      })

      // Destrory process (to clean pool)
      knexConnection.destroy();
    }
    var knexConnection = require('knex')(knexConnectionConfig);

    order.data.transaction = await knexConnection.transaction(async trx => {
      var query;

      query = trx.select('transactions.*').table('transactions').where('id', order.data.transaction_id).first();
      return query;

    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    order.data.carts = await fetchAll('carts', { orderID: order.data.id, userID: order.data.user_id, noLog: true }, req.headers['x-auth-token'])
    order.data.carts = order.data.carts.carts



    var knexConnection = require('knex')(knexConnectionConfig);

    order.data.user = await knexConnection.transaction(async trx => {
      var query;

      query = trx.select('users.*').table('users')
        .where('users.id', order.data.user_id)
        .first();
      return query;

    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

  }

  //
  let statusCode = order.data ? 200 : 422;
  let response = {
    success: order.data ? true : false,
    order: order.data,
    error: order.error
  };

  // Send Response
  res.status(statusCode).json(response);
}