import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { fetchByID, fetchAll } from 'helpers/apiService';
import moment from 'moment'
import { getOnly, createLog, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed, checkCoupon, parseAmount } from 'helpers/api';

// Function to Fetch product
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert product
  if (!user) { restrictedAccess(res); return false; }

  // Filter
  let orderBy = req.query.order_by ? req.query.order_by : 'ASC';
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;
  let orderID = req.query.orderID ? Number.parseInt(req.query.orderID) : null;
  let userID = req.query.userID ? Number.parseInt(req.query.userID) : null;
  let productID = req.query.productID ? req.query.productID.split(',') : null;
  let userIDs = req.query.userIDs ? req.query.userIDs.split(',') : null;


  
  var totalCount = 0

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let carts = await knexConnection.transaction(async trx => {
    var query;

    query = trx.select('carts.*').table('carts')
      .join('products', 'products.id', 'carts.product_id')
      .orderBy('carts.id', orderBy);


    if (orderID) {
      query.where('carts.order_id', orderID)
    }
    else if ((!req.query.forList || req.query.listOnly)) {
      query.where('carts.status', 'ADDED')
    }

    if (userID) {
      query.where('carts.user_id', userID)
    }
    else if ((!req.query.forList || req.query.listOnly)) {
      query.where('carts.user_id', user.id)
    }

    if (req.query.status) {
      query.where('carts.status', req.query.status)
    }


    if (req.query.cartID) {
      query.where('carts.id', req.query.cartID)
    }
    if (productID) {
      query.whereIn('carts.product_id', productID)
    }
    if (userIDs) {
      query.whereIn('carts.user_id', userIDs)
    }
    if (req.query.paymentIntiation && req.query.paymentIntiation == 'YES') {
      query.whereNotNull('carts.payment_initiated_on')
    }
    if (req.query.paymentIntiation && req.query.paymentIntiation == 'NO') {
      query.whereNull('carts.payment_initiated_on')
    }

    
    totalCount = await query.clone().count();
    totalCount = totalCount[0]['count(*)'];

    if (req.query.applyLimit) {
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


  let appliedCoupons = []
  let appliedReferrals = []


  var applied = 0;
  var amount = 0
  var totalDiscount = 0
  var totalAmountWithoutGst = 0
  var totalFixedDiscount = 0
  var totalMembershipDiscount = 0
  var totalCouponDiscount = 0
  var totalReferralDiscount = 0
  var totalReferrarDiscount = 0
  var totalTax = 0
  var finalPrice = 0
  var shippingCharges = 0
  var productIDS = []
  var referrerIDs = []
  var gstArray = []
  var examIDS = []
  var courseIDS = []
  var forUpgrade = true
  var shipping = false
  if (carts.data) {
    for (let i = 0; i < carts.data.length; i++) {


      knexConnection = require('knex')(knexConnectionConfig);

      carts.data[i].user = await knexConnection.transaction(async trx => {
        return trx.select().table('users').where('id', carts.data[i].user_id).first();
      })


      // Destrory process (to clean pool)
      knexConnection.destroy();


      if (carts.data[i].order_type != 'UPGRADE') {
        forUpgrade = false
      }


      let query = { forWeb: true, noLog: true }
      if (carts.data[i].upgradable_id) {
        query.forUpgarde = 'UPGRADE'
        query.upgradable_id = carts.data[i].upgradable_id
      }
      if (orderID) {
        query.cartID = carts.data[i].id
        query.forActive = true
      }

      query.cart_id = carts.data[i].id
      query.referral_id = carts.data[i].referral_id
      query.quantity = carts.data[i].quantity


      carts.data[i].product = await fetchByID('products', carts.data[i].product_id, query, req.headers['x-auth-token'])

      carts.data[i].product = carts.data[i].product.product ? carts.data[i].product.product : ''

      if (carts.data[i].product) {


        if (carts.data[i].product.product_type.is_package == 0) {
          shipping = true
        }
        productIDS.push(carts.data[i].product_id)

        JSON.parse(carts.data[i].product.course_ids).map(course_id => {
          courseIDS.push(course_id)
        })

        if (carts.data[i].product.exam_ids) {
          JSON.parse(carts.data[i].product.exam_ids).map(exam_id => {
            examIDS.push(exam_id)
          })
        }

        carts.data[i].finalDiscount = 0
        carts.data[i].discounttedPrice = carts.data[i].base_price
        let basePrice = carts.data[i].base_price


        if (carts.data[i].tax_included_in_base_price == 1) {
          if (carts.data[i].tax_amount && carts.data[i].tax_amount > 0) {

            if (carts.data[i].tax_amount_type == "PERCENT") {
              // tax = (params.amount) / (carts.data[i].tax_amount.amount / 100)
              carts.data[i].discounttedPrice = (carts.data[i].discounttedPrice * 100) / (100 + carts.data[i].tax_amount)
            } else {

              carts.data[i].discounttedPrice = carts.data[i].discounttedPrice - carts.data[i].tax_amount
            }
            carts.data[i].tax_amount = carts.data[i].tax_amount.toFixed(2)
          } else {
            carts.data[i].discounttedPrice = (carts.data[i].discounttedPrice * 100) / (100 + 18)
          }
        }


        // Create db process(get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        // Insert attribute into database
        let membershipDiscounts = await knexConnection.transaction(async trx => {
          return trx.select().from('cart_membership_discounts').where('cart_id', carts.data[i].id);
        })


        // Destrory process (to clean pool)
        knexConnection.destroy();

        carts.data[i].finalmembershipDiscount = 0

        if (membershipDiscounts && membershipDiscounts.length > 0) {

          for (let i = 0; i < membershipDiscounts.length; i++) {
            let membership_discount_amount = membershipDiscounts[i].discount
            if (membershipDiscounts[i].discount_type == 'PERCENT') {
              membership_discount_amount = carts.data[i].discounttedPrice * membership_discount_amount / 100
            }

            carts.data[i].finalmembershipDiscount = carts.data[i].finalmembershipDiscount + membership_discount_amount

          }
          carts.data[i].finalDiscount = carts.data[i].finalDiscount + carts.data[i].finalmembershipDiscount
          carts.data[i].discounttedPrice = carts.data[i].discounttedPrice - carts.data[i].finalmembershipDiscount
        }


        carts.data[i].finalFixedDiscount = 0

        if (carts.data[i].fixed_discount_amount && carts.data[i].fixed_discount_amount > 0) {
          let fixed_discount_amount = carts.data[i].fixed_discount_amount
          if (carts.data[i].fixed_discount_type == 'PERCENT') {
            fixed_discount_amount = carts.data[i].discounttedPrice * fixed_discount_amount / 100
          }

          carts.data[i].finalFixedDiscount = fixed_discount_amount
          carts.data[i].finalDiscount = carts.data[i].finalDiscount + fixed_discount_amount
          carts.data[i].discounttedPrice = carts.data[i].discounttedPrice - fixed_discount_amount
        }


        carts.data[i].finalCouponDiscount = 0
        if (carts.data[i].discount_amount && carts.data[i].discount_amount > 0) {
          let discount_amount = carts.data[i].discount_amount
          if (carts.data[i].discount_type == 'PERCENT') {
            discount_amount = carts.data[i].discounttedPrice * discount_amount / 100
          }

          if (carts.data[i].discount_amount_upto && discount_amount > carts.data[i].discount_amount_upto) {
            discount_amount = carts.data[i].discount_amount_upto
          }

          carts.data[i].finalCouponDiscount = discount_amount
          carts.data[i].finalDiscount = carts.data[i].finalDiscount + discount_amount
          carts.data[i].discounttedPrice = carts.data[i].discounttedPrice - discount_amount
        }

        carts.data[i].finalReferralDiscount = 0
        if (carts.data[i].referral_amount && carts.data[i].referral_amount > 0) {
          let referral_amount = carts.data[i].referral_amount
          if (carts.data[i].referral_discount_type == 'PERCENT') {
            referral_amount = carts.data[i].discounttedPrice * referral_amount / 100
          }

          if (carts.data[i].referral_discount_amount_upto && referral_amount > carts.data[i].referral_discount_amount_upto) {
            referral_amount = carts.data[i].referral_discount_amount_upto
          }

          carts.data[i].finalReferralDiscount = referral_amount
          carts.data[i].finalDiscount = carts.data[i].finalDiscount + referral_amount
          carts.data[i].discounttedPrice = carts.data[i].discounttedPrice - referral_amount
        }


        // carts.data[i].finalReferrarDiscount = 0
        // if (carts.data[i].referrar_discount && carts.data[i].referrar_discount > 0) {
        //   let referrar_discount = carts.data[i].referrar_discount
        //   if (carts.data[i].referrar_discount_type == 'PERCENT') {
        //     referrar_discount = carts.data[i].discounttedPrice * referrar_discount / 100
        //   }

        //   if (carts.data[i].referrar_discount_amount_upto && referrar_discount > carts.data[i].referrar_discount_amount_upto) {
        //     referrar_discount = carts.data[i].referrar_discount_amount_upto
        //   }

        //   carts.data[i].finalReferrarDiscount = referrar_discount
        //   carts.data[i].finalDiscount = carts.data[i].finalDiscount + referrar_discount
        //   carts.data[i].discounttedPrice = carts.data[i].discounttedPrice - referrar_discount
        // }

        totalMembershipDiscount += carts.data[i].finalmembershipDiscount
        totalDiscount += carts.data[i].finalDiscount
        totalFixedDiscount += carts.data[i].finalFixedDiscount
        totalCouponDiscount += carts.data[i].finalCouponDiscount
        totalReferralDiscount += carts.data[i].finalReferralDiscount
        // totalReferrarDiscount += carts.data[i].finalReferrarDiscount
        carts.data[i].discounttedPrice = carts.data[i].discounttedPrice + carts.data[i].shipping_charge
        totalAmountWithoutGst += carts.data[i].discounttedPrice

        carts.data[i].finalTax = 0


        if (carts.data[i].tax_amount && carts.data[i].tax_amount > 0) {
          let tax_amount = carts.data[i].tax_amount
          if (carts.data[i].tax_amount_type == 'PERCENT') {
            tax_amount = carts.data[i].discounttedPrice * tax_amount / 100
            gstArray.push(carts.data[i].tax_amount)
          }

          carts.data[i].finalTax = tax_amount
        }

        totalTax += carts.data[i].finalTax


        carts.data[i].finalDiscount = carts.data[i].finalDiscount.toFixed(2)
        carts.data[i].finalFixedDiscount = carts.data[i].finalFixedDiscount.toFixed(2)
        carts.data[i].finalCouponDiscount = carts.data[i].finalCouponDiscount.toFixed(2)
        carts.data[i].finalReferralDiscount = carts.data[i].finalReferralDiscount.toFixed(2)
        carts.data[i].discounttedPrice = carts.data[i].discounttedPrice.toFixed(2)
        carts.data[i].finalTax = carts.data[i].finalTax.toFixed(2)
        carts.data[i].finalmembershipDiscount = carts.data[i].finalmembershipDiscount.toFixed(2)

        amount += carts.data[i].base_price
        finalPrice += carts.data[i].amount

        if (carts.data[i].product) {

          if (carts.data[i].shipping_charge && (carts.data[i].shipping_charge > shippingCharges)) {
            shippingCharges = carts.data[i].shipping_charge + shippingCharges
          }
        }

        if (carts.data[i].coupon_code && !appliedCoupons.includes(carts.data[i].coupon_code)) {
          appliedCoupons.push(carts.data[i].coupon_code)
        }
        if (carts.data[i].referral_code && !appliedReferrals.includes(carts.data[i].referral_code)) {
          appliedReferrals.push(carts.data[i].referral_code)
        }


      }
    }

    carts.data = carts.data.filter(cart => cart.product != '')
  }



  let suggestedCoupons = []
  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let coupons = await knexConnection.transaction(async trx => {

    var query;
    query = trx.select('coupons.*').table('coupons')
      .where(function () {
        this.where('coupons.start_date', '<=', moment().format()).orWhereNull('coupons.start_date')
      })
      .where(function () {
        this.where('coupons.expiry_date', '>=', moment().format()).orWhereNull('coupons.expiry_date')
      })
      .where('coupons.suggested', 1).orderBy('coupons.id', "ASC").where('coupons.is_active', 1)
    return query;

  })

  // Destrory process (to clean pool)
  knexConnection.destroy();

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let orders = await knexConnection.transaction(async trx => {

    var query;
    query = trx.select('orders.*').table('orders')
      .where('user_id', user.id).where('status', 'SUCCESS').where('type', 'PRODUCT')
    query.orderBy('orders.id', "ASC")
    return query;

  })

  // Destrory process (to clean pool)
  knexConnection.destroy();


  if (coupons) {
    coupons.map(coupon => {

      if ((coupon.first_order == 0 || (!orders || orders.length == 0)) &&
        (!user || !coupon.email_restrictions || !coupon.email_restrictions.includes(user.id)) &&
        (!user || !coupon.restricted_user_types || !coupon.restricted_user_types.includes(user.type)) &&
        (coupon.usage_count < coupon.usage_limit || !coupon.usage_limit)) {
        if (coupon.referance_type == 'product' && !isEmptyArray(intersect(JSON.parse(coupon.referance_ids), productIDS))) {
          suggestedCoupons.push(coupon)
        }
        else if (coupon.referance_type == 'course' && !isEmptyArray(intersect(JSON.parse(coupon.referance_ids), courseIDS))) {
          suggestedCoupons.push(coupon)
        }
        else if (coupon.referance_type == 'exam' && !isEmptyArray(intersect(JSON.parse(coupon.referance_ids), examIDS))) {
          suggestedCoupons.push(coupon)
        }
      }
    })
  }


  // if (shippingCharges) {
  //   finalPrice = finalPrice + shippingCharges;
  // }

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let referralDiscount = await knexConnection.transaction(async trx => {

    var query;
    query = trx.select('user_referrals.*').table('user_referrals')
      .where('user_referrals.user_id', user.id).where('user_referrals.applied', 0);
    return query;

  })

  // Destrory process (to clean pool)
  knexConnection.destroy();



  if (referralDiscount && referralDiscount.length > 0) {

    for (let i = 0; i < referralDiscount.length; i++) {


      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      let order = await knexConnection.transaction(async trx => {

        var query;
        query = trx.select('orders.*').table('orders')
          .where('orders.id', referralDiscount[i].order_id).first();
        return query;

      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      let amount = order.amount
      let maxAmount = null

      let referrarDiscount = referralDiscount[i].discount
      if (referralDiscount[i].discount_type == 'PERCENT') {
        referrarDiscount = ((amount * referralDiscount[i].discount) / 100)
      }

      if (referralDiscount[i].referrar_order_amount_usage) {
        maxAmount = (totalAmountWithoutGst * referralDiscount[i].referrar_order_amount_usage) / 100
      }

      if (maxAmount && maxAmount < totalReferrarDiscount) {

      } else {
        totalReferrarDiscount += referrarDiscount
        referrerIDs.push(referralDiscount[i].id)
      }

    }

    totalDiscount += totalReferrarDiscount
    totalAmountWithoutGst = totalAmountWithoutGst - totalReferrarDiscount

    let totalReferralGst = 0
    if (gstArray.length > 0) {
      let calculated = totalReferrarDiscount / gstArray.length

      for (let j = 0; j < gstArray.length; j++) {
        let gst = (calculated * gstArray[j]) / 100
        totalReferralGst += gst
      }

    }
    totalTax = totalTax - totalReferralGst

    finalPrice = ((finalPrice - totalTax) - totalReferrarDiscount) + totalTax

  }

  //
  let statusCode = carts.data ? 200 : 422;
  let response = {
    success: carts.data ? true : false,
    carts: carts.data,
    amount: parseAmount(amount),
    shippingCharges: parseAmount(shippingCharges),
    finalPrice: parseAmount(finalPrice),
    totalTax: parseAmount(totalTax),
    appliedCoupons: appliedCoupons,
    referrerIDs: referrerIDs,
    appliedReferrals: appliedReferrals,
    suggestedCoupons: suggestedCoupons,
    totalMembershipDiscount: parseAmount(totalMembershipDiscount),
    totalDiscount: parseAmount(totalDiscount),
    totalFixedDiscount: parseAmount(totalFixedDiscount),
    totalAmountWithoutGst: parseAmount(totalAmountWithoutGst),
    totalCouponDiscount: parseAmount(totalCouponDiscount),
    totalReferralDiscount: parseAmount(totalReferralDiscount),
    totalReferrarDiscount: parseAmount(totalReferrarDiscount),
    shipping: shipping,
    forUpgrade: forUpgrade,
    totalCount: totalCount,
  };

  res.status(statusCode).json(response);
}


const intersect = (arrayA, arrayB) => {
  return arrayA.filter(elem => arrayB.includes(elem));
};