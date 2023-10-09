import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch memberships By ID
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  // if (!user) { restrictedAccess(res); return false; }

  // Set attributes
  let id = req.query.id;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch membership from database
  let membership = await knexConnection.transaction(async trx => {
    return knexConnection.select('memberships.*').table('memberships')
      .where('memberships.id', id).where('memberships.is_active', 1).first();
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

  if (membership.data) {
    // Create db process (get into pool)

    knexConnection = require('knex')(knexConnectionConfig);

    membership.data.tax = await knexConnection.transaction(async trx => {
      return trx.table('taxes').where('id', membership.data.tax_id).first();
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    knexConnection = require('knex')(knexConnectionConfig);

    membership.data.validity = await knexConnection.transaction(async trx => {
      return trx.table('validities').where('id', membership.data.validity_id).first();
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();


    knexConnection = require('knex')(knexConnectionConfig);

    membership.data.freeProducts = await knexConnection.transaction(async trx => {
      return trx.table('membership_products').where('membership_id', membership.data.id);
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();


    if (user) {
      knexConnection = require('knex')(knexConnectionConfig);

      let cart = await knexConnection.transaction(async trx => {
        return trx.table('membership_carts').where('membership_id', membership.data.id).where('user_id', user.id).where('status', 'ADDED').first();
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      membership.data.AddedToCart = cart ? true : false
    }


    if (membership.data.tax) {
      let tax_amount = membership.data.tax.amount
      let tax_amount_type = membership.data.tax.amount_type

      let tax = tax_amount

      if (tax_amount_type == 'PERCENT') {
        tax = (membership.data.amount * tax) / 100
      }

      membership.data.finalAmount = membership.data.amount + tax;
    }
  }



  //
  let statusCode = membership.data ? 200 : 422;
  let response = {
    success: membership.data ? true : false,
    membership: membership.data,
    error: membership.error
  };

  // Send response
  res.status(statusCode).json(response);
}