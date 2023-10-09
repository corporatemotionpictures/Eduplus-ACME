import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { fetchByID, fetchAll } from 'helpers/apiService';
import moment from 'moment'
import { getOnly, createLog, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed, checkCoupon, parseAmount } from 'helpers/api';

// Function to Fetch membership
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert membership
  if (!user) { restrictedAccess(res); return false; }

  // Filter
  let orderBy = req.query.order_by ? req.query.order_by : 'ASC';
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;
  let orderID = req.query.orderID ? Number.parseInt(req.query.orderID) : null;
  let userID = req.query.userID ? Number.parseInt(req.query.userID) : null;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let carts = await knexConnection.transaction(async trx => {
    var query;

    query = trx.select('membership_carts.*').table('membership_carts')

      .orderBy('membership_carts.id', orderBy);


    if (orderID) {
      query.where('membership_carts.order_id', orderID)
    }
    else if ((!req.query.forList || req.query.listOnly)) {
      query.where('membership_carts.status', 'ADDED')
    }

    if (userID) {
      query.where('membership_carts.user_id', userID)
    }
    else if ((!req.query.forList || req.query.listOnly)) {
      query.where('membership_carts.user_id', user.id)
    }

    if (req.query.status) {
      query.where('membership_carts.status', req.query.status)
    }


    if (req.query.cartID) {
      query.where('membership_carts.id', req.query.cartID)
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

  var applied = 0;
  var amount = 0
  var totalDiscount = 0
  var totalAmountWithoutGst = 0
  var totalTax = 0
  var finalPrice = 0
  var membershipIDS = []
  if (carts.data) {
    for (let i = 0; i < carts.data.length; i++) {


      let query = { forWeb: true, noLog: true }
      if (orderID) {
        query.cartID = carts.data[i].id
      }

      query.cart_id = carts.data[i].id

      carts.data[i].membership = await fetchByID('memberships', carts.data[i].membership_id, query, req.headers['x-auth-token'])
      carts.data[i].membership = carts.data[i].membership.membership


      membershipIDS.push(carts.data[i].membership_id)

      carts.data[i].finalDiscount = 0
      carts.data[i].discounttedPrice = carts.data[i].base_price
      let basePrice = carts.data[i].base_price

      totalAmountWithoutGst += carts.data[i].discounttedPrice

      carts.data[i].finalTax = 0


      if (carts.data[i].tax_amount && carts.data[i].tax_amount > 0) {
        let tax_amount = carts.data[i].tax_amount
        if (carts.data[i].tax_amount_type == 'PERCENT') {
          tax_amount = carts.data[i].discounttedPrice * tax_amount / 100
        }

        carts.data[i].finalTax = tax_amount
      }

      totalTax += carts.data[i].finalTax

      carts.data[i].finalTax = carts.data[i].finalTax.toFixed(2)

      amount += carts.data[i].base_price
      finalPrice += carts.data[i].amount

    }
  }



  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let orders = await knexConnection.transaction(async trx => {

    var query;
    query = trx.select('orders.*').table('orders')
      .where('user_id', user.id).where('status', 'SUCCESS').where('type', 'membership')
    query.orderBy('orders.id', "ASC")
    return query;

  })

  // Destrory process (to clean pool)
  knexConnection.destroy();

  //
  let statusCode = carts.data ? 200 : 422;
  let response = {
    success: carts.data ? true : false,
    carts: carts.data,
    amount: parseAmount(amount),
    finalPrice: parseAmount(finalPrice),
    totalTax: parseAmount(totalTax),
    totalAmountWithoutGst: parseAmount(totalAmountWithoutGst),
  };

  res.status(statusCode).json(response);
}


const intersect = (arrayA, arrayB) => {
  return arrayA.filter(elem => arrayB.includes(elem));
};