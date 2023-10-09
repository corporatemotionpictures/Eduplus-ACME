import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { fetchByID } from 'helpers/apiService';
import Joi from '@hapi/joi';
import moment from 'moment'
import { postOnly, createLog, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed, checkCoupon, validateRequestParams, moneyfy } from 'helpers/api';

// Function to Fetch product
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert product
  if (!user) { restrictedAccess(res); return false; }


  // Validate request with rules
  let schema = Joi.object({
    coupon_code: Joi.string().required()
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }


  var currentDate = moment().format();

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let coupon = await knexConnection.transaction(async trx => {

    var query;
    query = trx.select('coupons.*').table('coupons')
      .where(function () {
        this.where('coupons.start_date', '<=', currentDate).orWhereNull('coupons.start_date')
      })
      .where(function () {
        this.where('coupons.expiry_date', '>=', currentDate).orWhereNull('coupons.expiry_date')
      })
      .where('coupons.code', params.coupon_code).where('coupons.applied_on', 'MANUAL').first();

    return query;

  })

  // Destrory process (to clean pool)
  knexConnection.destroy();


  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let carts = await knexConnection.transaction(async trx => {
    return trx.select('carts.*').table('carts').where('user_id', user.id).orderBy('carts.id', 'ASC').where('carts.status', 'ADDED');

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

  var applied = 0
  var finalCoupon = null
  var amount = 0
  var totalDiscount = 0
  var finalPrice = 0

  if (carts.data) {
    for (let i = 0; i < carts.data.length; i++) {

      let query = { forWeb: true, quantity: carts.data[i].quantity, noLog: true }
      if (carts.data[i].upgradable_id) {
        query.forUpgarde = 'UPGRADE'
        query.upgradable_id = carts.data[i].upgradable_id
      }

      if (carts.data[i].referral_code) {
        query.referralCode = carts.data[i].referral_code
      }
      query.couponCode = params.coupon_code
      query.cart_id = carts.data[i].id


      carts.data[i].product = await fetchByID('products', carts.data[i].product_id, query, req.headers['x-auth-token'])
      carts.data[i].product = carts.data[i].product.product


      let code = {};
      if (carts.data[i].product.coupon) {

        if (carts.data[i].product.coupon.code == params.coupon_code) {
          applied++;
        }

        code.coupon_id = carts.data[i].product.coupon.id
        code.coupon_code = carts.data[i].product.coupon.code
        code.discount_type = carts.data[i].product.coupon.discount_type
        code.discount_amount = carts.data[i].product.coupon.amount
        code.discount_amount_upto = carts.data[i].product.coupon.amount_upto
        code.coupon_type = carts.data[i].product.coupon.applied_on
        code.amount = carts.data[i].product.finalAmount
        code.base_price = carts.data[i].product.qtyAmount
        code.tax_included_in_base_price = carts.data[i].product.tax_included_in_base_price

        if (carts.data[i].product.shippingCharges) {
          code.shipping_charge = carts.data[i].product.shippingCharges
        }

        if (carts.data[i].product.fixedCoupon) {
          code.fixed_discount_type = carts.data[i].product.fixedCoupon.discount_type
          code.fixed_discount_amount = carts.data[i].product.fixedCoupon.amount
        }



        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        // Update carts.data[i].product.coupon in database
        let cartUpdate = await knexConnection.transaction(async trx => {
          return trx('carts').select('carts.*').where('id', carts.data[i].id).update(code);
        })

        // Destrory process (to clean pool)
        knexConnection.destroy();
        if (cartUpdate) {
          carts.data[i] = {
            ...carts.data[i],
            ...code
          }
        }

      }

    }
  }



  if (coupon && applied > 0 && user && user.type != 'ADMIN' && !req.query.listOnly && !req.query.noLog) {
    let logged_data = {
      user_id: user.id,
      action: `COUPON_APPLIED`,
      payload: JSON.stringify({
        field_name: finalCoupon,
        ...req.query
      })
    }


    let logs = await createLog(logged_data)
  }



  //
  let statusCode = (coupon && applied > 0) ? 200 : 422;
  let response = {
    success: (coupon && applied > 0) ? true : false,
    carts: carts.data,
    coupon: finalCoupon,
    amount: amount,
    finalPrice: finalPrice,
    totalDiscount: totalDiscount,
    error: (coupon && applied > 0) ? null : 'Invalid Coupon',
  };

  res.status(statusCode).json(response);
}


const intersect = (arrayA, arrayB) => {
  return arrayA.filter(elem => arrayB.includes(elem));
};