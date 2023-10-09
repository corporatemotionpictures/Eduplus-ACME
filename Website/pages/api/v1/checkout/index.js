import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { fetchAll } from 'helpers/apiService';
import { getSettings } from 'helpers/apiService';

import Razorpay from 'razorpay';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import { getOnly, createLog, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed, checkCoupon } from 'helpers/api';

// Function to Fetch product
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert product
  if (!user) { restrictedAccess(res); return false; }


  let method = await getSettings('PaymentGatwayType');
  let keys = await getSettings('paymentGatway')
  let metaDetails = await getSettings('metaDetails')
  let currency = keys.currency

  let query = { noLog: true }
  if (req.query.type == 'cartPayment' && req.query.cart_id && req.query.cart_id != 'null') {
    query = {
      cartID: req.query.cart_id
    }
  }

  let params = {}
  let carts = {}

  if (!req.query.paymentType || req.query.paymentType != 'MEMBERSHIP') {
    carts = await fetchAll('carts', query, req.headers['x-auth-token'])
  } else {
    carts = await fetchAll('membership-carts', query, req.headers['x-auth-token'])
  }

  let prefix = await getSettings('orderNumberPrefix')

  if (carts.success == true) {


    params.user_id = user.id
    params.amount = carts.amount ? carts.amount : 0
    params.shipping_charges = carts.shippingCharges ? carts.shippingCharges : 0
    params.final_price = carts.finalPrice ? carts.finalPrice : 0
    params.coupon = carts.totalCouponDiscount ? carts.totalCouponDiscount : 0
    params.referral = carts.totalReferralDiscount ? carts.totalReferralDiscount : 0
    params.total_discount = carts.totalDiscount ? carts.totalDiscount : 0
    params.referrar_discount = carts.totalReferrarDiscount ? carts.totalReferrarDiscount : 0
    params.total_tax = carts.totalTax ? carts.totalTax : 0
    params.status = 'PENDING',
      params.type = req.query.paymentType && req.query.paymentType == 'MEMBERSHIP' ? 'MEMBERSHIP' : 'PRODUCT',
      params.uuid = uuidv4()

    if (carts.is_upgraded) {
      params.order_type == 'UPGRADE'
    }
  }



  if (req.query.addressID) {

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Insert attribute into database
    let address = await knexConnection.transaction(async trx => {
      return trx('addresses').where('id', req.query.addressID).first();
    })


    // Destrory process (to clean pool)
    knexConnection.destroy();


    if (address) {
      params.address = address.address
      params.city = address.city
      params.state = address.state
      params.zip_code = address.zip_code
      params.country = address.country
    }
  } else {

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Insert attribute into database
    let address = await knexConnection.transaction(async trx => {
      return trx('addresses').where('user_id', user.id).first();
    })


    // Destrory process (to clean pool)
    knexConnection.destroy();

    if (address) {
      params.address = address.address
      params.city = address.city
      params.state = address.state
      params.zip_code = address.zip_code
      params.country = address.country
    }

  }


  let country_code = ''

  if (params.country) {
    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Insert attribute into database
    let country = await knexConnection.transaction(async trx => {
      return trx('countries').where('country', 'like', `${params.country}`).first();
    })


    // Destrory process (to clean pool)
    knexConnection.destroy();

    country_code = country ? country.iso2 : ''

  }


  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Insert attribute into database
  let order = await knexConnection.transaction(async trx => {
    return trx.insert(params).into('orders');
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

  let order_id = order.id;

  let OdrNumber = ''

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fatch order From Database
  let orderData = await knexConnection.transaction(async trx => {
    return trx.select().table('orders').where('id', order_id).first();
  })

  // Destrory process (to clean pool)
  knexConnection.destroy();


  let order_uuid = orderData.uuid;

  let products = null
  let productIds = []
  let itemList = []

  let productName = ''
  let membershipIds = []
  if (order.id) {


    if (prefix && prefix != '') {
      OdrNumber = prefix
    }

    let year = moment().format('YY')
    OdrNumber = OdrNumber.concat(year)
    OdrNumber = OdrNumber.concat(order_id)

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Update course in database
    let orderUpdate = await knexConnection.transaction(async trx => {
      return trx('orders').where('id', order.id).update({ order_number: OdrNumber });
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();


    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fatch order From Database
    orderData = await knexConnection.transaction(async trx => {
      return trx.select().table('orders').where('id', order_id).first();
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    if (orderData.type == 'MEMBERSHIP') {

      for (let i = 0; i < carts.carts.length; i++) {

        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        // Update course in database
        let cart = await knexConnection.transaction(async trx => {
          return trx('membership_carts').where('id', carts.carts[i].id).update({ order_id: order.id });
        }).then(res => {
          return {
            id: res,
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

        membershipIds.push(carts.carts[i].membership_id)

        itemList.push({
          "name": carts.carts[i].membership.title,
          "sku": carts.carts[i].membership.title,
          "price": carts.carts[i].amount,
          "currency": currency,
          "quantity": 1
        })
      }

    } else {
      for (let i = 0; i < carts.carts.length; i++) {

        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        // Update course in database
        let cart = await knexConnection.transaction(async trx => {
          return trx('carts').where('id', carts.carts[i].id).update({ order_id: order.id });
        }).then(res => {
          return {
            id: res,
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

        itemList.push({
          "name": carts.carts[i].product.name,
          "sku": carts.carts[i].product.name,
          "price": carts.carts[i].amount,
          "currency": currency,
          "quantity": 1
        })

        if (carts.carts[i].upgraded_cart_id) {
          // Create db process (get into pool)
          var knexConnection = require('knex')(knexConnectionConfig);

          // Update course in database
          cart = await knexConnection.transaction(async trx => {
            return trx('carts').where('id', carts.carts[i].upgraded_cart_id).update({ is_upgraded: 1 });
          })

          // Destrory process (to clean pool)
          knexConnection.destroy();

        }

        productIds.push(carts.carts[i].product_id)
      }

      if (carts.referrerIDs && carts.referrerIDs.length) {

        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        // Update course in database
        let referrar = await knexConnection.transaction(async trx => {
          return trx('user_referrals').whereIn('id', carts.referrerIDs).update({ referrar_order_id: order.id });
        })

        // Destrory process (to clean pool)
        knexConnection.destroy();
      }
    }

    if (orderData.type == 'MEMBERSHIP') {
      var knexConnection = require('knex')(knexConnectionConfig);

      // Update course in database
      products = await knexConnection.transaction(async trx => {
        return trx('memberships').whereIn('id', productIds).pluck('title');
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();
    }


    else {
      var knexConnection = require('knex')(knexConnectionConfig);

      // Update course in database
      products = await knexConnection.transaction(async trx => {
        return trx('products').whereIn('id', productIds).pluck('name');
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();
    }


    products.map((product, i) => {
      productName = i == 0 ? product : `${productName} + ${product}`
    })

  }

  if (order.id && params.final_price != 0) {

    var options = {
      amount: params.final_price * 100,  // amount in the smallest currency unit
      currency: currency,
      receipt: user.id
    };

    let url = process.env.NEXT_PUBLIC_DOMAIN_URL

    console.log(user)

    if (method == 'Razorpay' || !user.country_prefix || user.country_prefix == '91') {

      method = 'Razorpay';

      var instance = new Razorpay({
        key_id: keys.key_id,
        key_secret: keys.key_secret,
      });



      await instance.orders.create(options, function (err, order) {

        options = {
          "key_id": keys.key_id, // Enter the Key ID generated from the Dashboard
          "key_secret": keys.key_secret, // Enter the Key ID generated from the Dashboard
          "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
          "currency": order.currency,
          "name": metaDetails.baseTitle,
          "description": productName,
          "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
          "handler": function (response) {
            alert(response.razorpay_payment_id);
            alert(response.razorpay_order_id);
            alert(response.razorpay_signature)
          },
          "prefill": {
            "name": user.first_name.concat(' ', user.last_name),
            "email": user.email,
            "contact": user.mobile_number,
          },
          "notes": {
            "shopping_order_id": orderData.order_number,
            // "orderID": orderData.order_number,
            "orderUuid": order_uuid,
            "name": user.first_name.concat(' ', user.last_name),
            "email": user.email,
            "state": orderData.state,
            "contact": user.mobile_number,
          },
          // "theme": {
          //   "color": "#3399cc"
          // }
          callback_url: `${url}/payment-response?order_id=${order.id}&&token=${req.headers['x-auth-token']}`,
          redirect: true
        };

      });



      console.log(options)


      let statusCode = order ? 200 : 422;
      let response = {
        success: order ? true : false,
        options: order ? options : null,
        order_id: order ? order_id : null,
        order_number: order ? orderData.order_number : null,
        payment_id: order ? order.id : null,
        products: products,
        amount: params.final_price,
        method: method
      };

      res.status(statusCode).json(response);
    }


    else if (method == 'Paypal') {

      var paypal = require('paypal-rest-sdk');

      await paypal.configure({
        'mode': keys.paypalClientMode, //sandbox or live
        'client_id': keys.paypalClientId,
        'client_secret': keys.paypalClientSecret
      });




      var create_payment_json = {
        "intent": "Sale",
        "payer": {
          "payment_method": "paypal",
          "payer_info": {
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "billing_address": {
              line1: params.address,
              line2: '',
              city: params.city,
              state: params.state,
              country_code: country_code,
              postal_code: params.zip_code,
            },
          }
        },
        "redirect_urls": {
          "return_url": "http://return.url",
          "cancel_url": "http://cancel.url"
        },
        "transactions": [{
          "item_list": {
            "items": itemList
          },
          "amount": {
            "currency": currency,
            "total": params.final_price
          },
          "description": orderData.order_number,
        }]
      };

      console.log("Create Payment Response");

      await paypal.payment.create(create_payment_json, async function (error, payment) {
        if (error) {
          let statusCode = order ? 200 : 422;
          let response = {
            products: error,
            amount: params.final_price
          };

          res.status(statusCode).json(response);
        } else {
          console.log("Create Payment Response");
          console.log(payment);

          options = payment


          let statusCode = order ? 200 : 422;
          let response = {
            success: order ? true : false,
            options: order ? options : null,
            order_id: order ? order_id : null,
            order_number: order ? orderData.order_number : null,
            products: products,
            amount: params.final_price,
            method: method
          };

          res.status(statusCode).json(response);
        }
      });

    }

  }

}
