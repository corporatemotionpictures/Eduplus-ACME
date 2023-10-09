import { getOnly, createLog, replaceUploads, replaceUploadsArray, injectMethodNotAllowed, restrictedAccess, verifyToken } from 'helpers/api';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import moment from 'moment';

// Login
export default async function (req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user) { restrictedAccess(res); return false; }

  let years = []

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fatch log From Database
  let yearsUser = await knexConnection.transaction(async trx => {
    return trx.select(trx.raw("Year(users.created_at) as year")).table('users')
      .groupBy(trx.raw("Year(users.created_at)"));
  })

  // Destrory process (to clean pool)
  knexConnection.destroy();

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fatch log From Database
  let yearsOrders = await knexConnection.transaction(async trx => {
    return trx.select(trx.raw("Year(orders.created_at) as year")).table('orders')
      .groupBy(trx.raw("Year(orders.created_at)"));
  })

  // Destrory process (to clean pool)
  knexConnection.destroy();

  yearsUser.map(year => {
    years.push(year.year)
  })

  yearsOrders.map(year => {
    if (!years.includes(year.year)) {
      years.push(year.year)
    }
  })

  let graphData = {}

  if (req.query.format == 'monthly') {
    let months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ]

    for (let i = 0; i < months.length; i++) {

      graphData[months[i]] = {
        user: 0,
        order: 0,
      }

      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      // Fatch log From Database
      let user = await knexConnection.transaction(async trx => {
        return trx.select().table('users')
          .where(trx.raw("Month(users.created_at)"), '=', i + 1).where(trx.raw("Year(users.created_at)"), '=', req.query.year).count('id', { as: 'count' }).where('users.is_active', 1);
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      if (user) {
        graphData[months[i]].user = user[0].count
      }

      // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);

      // Fatch log From Database
      let order = await knexConnection.transaction(async trx => {
        return trx.select().table('orders')
          .where(trx.raw("Month(orders.created_at)"), '=', i + 1).where(trx.raw("Year(orders.created_at)"), '=', req.query.year).where('orders.status', 'SUCCESS').where('orders.type', 'PRODUCT')
          .count('id', { as: 'count' });
      })


      // Destrory process (to clean pool)
      knexConnection.destroy();
      if (order) {
        graphData[months[i]].order = order[0].count
      }

    }


  } else if (req.query.format == 'yearly') {



    for (let i = 0; i < years.length; i++) {

      graphData[years[i]] = {
        user: 0,
        order: 0,
      }

      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      // Fatch log From Database
      let user = await knexConnection.transaction(async trx => {
        return trx.select().table('users')
          .where(trx.raw("Year(users.created_at)"), '=', i).count('id', { as: 'count' }).where('users.is_active', 1);
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      if (user) {
        graphData[years[i]].user = user[0].count
      }

      // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);

      // Fatch log From Database
      let order = await knexConnection.transaction(async trx => {
        return trx.select().table('orders')
          .where(trx.raw("Year(orders.created_at)"), '=', years[i]).where('orders.status', 'SUCCESS').where('orders.type', 'PRODUCT')
          .count('id', { as: 'count' });
      })


      // Destrory process (to clean pool)
      knexConnection.destroy();
      if (order) {
        graphData[years[i]].order = order[0].count
      }

    }
  }
  else if (req.query.format == 'daily') {



    for (let i = 0; i < 31; i++) {

      graphData[i] = {
        user: 0,
        order: 0,
      }

      let date = moment(`${req.query.month}-${i}`).format('YYYY-MM-DD')
      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      // Fatch log From Database
      let user = await knexConnection.transaction(async trx => {
        return trx.select().table('users')
          .count('id', { as: 'count' })
          .where('users.is_active', 1).where(trx.raw("Date(users.created_at)"), '=', date);
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      if (user) {
        graphData[i].user = user[0].count
      }

      // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);

      // Fatch log From Database
      let order = await knexConnection.transaction(async trx => {
        return trx.select().table('orders').where('orders.status', 'SUCCESS').where('orders.type', 'PRODUCT').where(trx.raw("Date(orders.created_at)"), '=', date)
          .count('id', { as: 'count' });
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();
      if (order) {
        graphData[i].order = order[0].count
      }

    }
  }

  // Set Response
  let response = {
    'success': graphData ? true : false,
    'graphData': graphData,
    'years': years,
  };

  let statusCode = graphData ? 200 : 400;

  // Send Response
  res.status(statusCode).json(response);
}