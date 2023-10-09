import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { fetchByID, fetchAll } from 'helpers/apiService';
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
  let orderBy = req.query.order_by ? req.query.order_by : 'ASC';
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;
  let membershipID = req.query.membershipID ? Number.parseInt(req.query.membershipID) : null;

  // Create db process (get into pool)


  let query = { 'status': 'SUCCESS', noLog: true }
  if (membershipID) {
    query.membershipID = membershipID
  }




  let orders = await fetchAll('membership-orders', query, req.headers['x-auth-token'])


  let usermemberships = []
  let usermembershipIDs = []
  let membershipRef = {}
  let fieldID = null


  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let membershipOrders = await knexConnection.transaction(async trx => {
    var query;

    query = trx.select('user_membership_doucuments.*').table('user_membership_doucuments').where('user_id', user.id).where('approved', 1)
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


  if (membershipOrders && membershipOrders.data) {
    for (let j = 0; j < membershipOrders.data.length; j++) {


      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      // Fetch membership from database
      membershipOrders.data[j].membership = await knexConnection.transaction(async trx => {
        return knexConnection.select('memberships.*').table('memberships')
          .where('memberships.id', membershipOrders.data[j].membership_id).where('memberships.is_active', 1).first();
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      if (membershipOrders.data[j].approved && membershipOrders.data[j].approved == true) {
        usermemberships.push(membershipOrders.data[j].membership)
        usermembershipIDs.push(membershipOrders.data[j].membership_id)

        if (membershipID && membershipOrders.data[j].membership.id == membershipID) {
          membershipRef = {
            activated: true,
          }
        }
      }

    }
  }


  if (orders.success) {
    if (orders.membershipOrders.length > 0) {

      for (let i = 0; i < orders.membershipOrders.length; i++) {


        for (let j = 0; j < orders.membershipOrders[i].carts.length; j++) {

          if (orders.membershipOrders[i].carts[j].activated && orders.membershipOrders[i].carts[j].activated == true) {
            usermemberships.push(orders.membershipOrders[i].carts[j].membership)
            usermembershipIDs.push(orders.membershipOrders[i].carts[j].membership.id)

            if (membershipID && orders.membershipOrders[i].carts[j].membership.id == membershipID) {
              membershipRef = {
                activated: true,
                expDate: orders.membershipOrders[i].carts[j].expDate,
                leftDays: orders.membershipOrders[i].carts[j].leftDays
              }
            }
          }

        }
      }

    }
  }







  //
  let statusCode = 200;
  let response = {
    success: true,
    usermembershipIDs: usermembershipIDs,
    usermemberships: usermemberships,
    membershipRef: membershipID ? membershipRef : null,
  };

  res.status(statusCode).json(response);
}

