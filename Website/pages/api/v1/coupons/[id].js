import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Get Course By ID
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user) { restrictedAccess(res); return false; }

  // set attributes
  let id = req.query.id;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fatch Course From Database
  let coupon = await knexConnection.transaction(async trx => {
    return trx.select('coupons.*').table('coupons').where('coupons.id', id)
      .where('coupons.is_active', 1).first();
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

  if(coupon.data){

    knexConnection = require('knex')(knexConnectionConfig);

    coupon.data.discout_types = await knexConnection.transaction(async trx => {
      return trx.table('discount_types').whereIn('id', JSON.parse(coupon.data.automatic_discount_type_id));
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();
  }

  //
  let statusCode = coupon.data ? 200 : 422;
  let response = {
    success: coupon.data ? true : false,
    coupon: coupon.data,
    error: coupon.error
  };

  // Send Response
  res.status(statusCode).json(response);
}