import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { fetchByID, fetchAll } from 'helpers/apiService';
import { v4 as uuidv4 } from 'uuid';
import { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Add new attribute
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert membership_type
  if (!user) { restrictedAccess(res); return false; }


  // Validate request with rules
  let schema = Joi.object({
    membership_id: Joi.number().required(),
    type: Joi.allow(null),
  });


  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  let query = { noLog: true }

  let data = await fetchAll('users/active-membership', { membershipID: params.membership_id, noLog: true }, req.headers['x-auth-token'])

  if (data.membershipRef && data.membershipRef.activated) {
    res.status(422).json({
      success: false,
      error: 'Membership Already Activated'
    });F

  } else {

    let membership = await fetchByID('memberships', params.membership_id, { forWeb: true, noLog: true }, req.headers['x-auth-token']);

    if (membership.success == true) {
      membership = membership.membership

      params.user_id = user.id
      params.base_price = membership.amount
      membership.finalAmount = membership.amount

      if (membership.tax) {
        params.tax_amount = membership.tax.amount
        params.tax_amount_type = membership.tax.amount_type

        let tax = params.tax_amount

        if (params.tax_amount_type == 'PERCENT') {
          tax = (membership.finalAmount * tax) / 100
        }

        membership.finalAmount = membership.finalAmount + tax;
      }

      params.status = 'ADDED'
      params.amount = membership.finalAmount

      if (params.type) {
        params.is_upgraded = 1
      }

      params.uuid = uuidv4()

      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      // Insert attribute into database
      let cart = await knexConnection.transaction(async trx => {
        return trx.insert(params).into('membership_carts');
      }).then(res => {
        return {
          id: res[0],
          error: null
        };
      }).catch(err => {
        return {
          id: null,
          error: err.sqlMessage
        };
      })


      // Destrory process (to clean pool)
      knexConnection.destroy();

      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      let carts = await knexConnection.transaction(async trx => {
        var query;

        query = trx.select('membership_carts.*').table('membership_carts').where('user_id', user.id)
        return query;

      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      //
      let statusCode = cart.id ? 200 : 422;
      let response = {
        success: cart.id ? true : false,
        cart: cart,
        id: cart.id,
        count: carts.length,
      };


      // Send response
      res.status(statusCode).json(response);
    }
    else {
      res.status(422).json({
        success: false,
        error: 'membership Not Found'
      });
    }
  }





}
