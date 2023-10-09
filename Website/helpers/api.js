import jwt from 'jsonwebtoken';
import { knexConnectionConfig } from 'db/knexConnection';
import { getSettings } from 'helpers/apiService';
import axios from 'axios';
import fetch from 'isomorphic-unfetch';
import rn from 'random-number';
import Fuse from "fuse.js"
import FormData from 'isomorphic-form-data';
import nodemailer from 'nodemailer'
import { Vimeo } from 'vimeo';
import twilio from 'twilio';
import { isEmptyArray } from 'formik';
import moment from 'moment'
import { add, fetchAllFcmtoken, getUrl, fetchAll } from "helpers/apiService";
import { IpAccessControlListMappingList } from 'twilio/lib/rest/api/v2010/account/sip/domain/ipAccessControlListMapping';

let vimeoAuth = getSettings('vimeoAuth');

let CLIENT_ID = vimeoAuth.CLIENT_ID;
let CLIENT_SECRET = vimeoAuth.CLIENT_SECRET;
let ACCESS_TOKEN = vimeoAuth.ACCESS_TOKEN;

let client = new Vimeo(CLIENT_ID, CLIENT_SECRET, ACCESS_TOKEN);

// Allow only GET methods
export function getOnly(request) {
  return request.method === 'GET' ? request : null;
}

// Allow only POST methods
export function postOnly(request) {
  return request.method === 'POST' ? request : null;
}

// If method is not allowed for any particular context
export function injectMethodNotAllowed(res) {
  res.status(405).json({
    success: false,
    error: 'METHOD_NOT_ALLOWED'
  });
}

// To restrict the access
export function restrictedAccess(res) {
  res.status(401).json({
    success: false,
    error: 'RESTRICTED_ACCESS'
  });
}

// Validate the request parameters
export function validateRequestParams(body, schema, res) {
  const { error, value } = schema.validate(body);
  if (error) {
    return {
      status: false,
      error: error
    };
  }
  else {
    return {
      status: true,
      value: value
    };
  }
}

// To Send Error Invalid Form Data
export function invalidFormData(res, error) {

  res.status(400).json({
    success: false,
    error: error ? (error.details && error.details.length > 0 ? error.details[0].message : error) : error
  });
}

// Generate the Token 
export function genrateToken(payload) {
  const jwtSecret = process.env.JWT_SECRET;
  const ttlMs = process.env.JWT_SECRET;

  const token = jwt.sign({
    user: payload,
    expiryAt: (new Date().getTime() + ttlMs)
  }, jwtSecret);
  return token;
}

// Verify & parse object from Token 
export async function verifyToken(req, isUserId = true) {
  const token = req.headers['x-auth-token'];
  const jwtSecret = process.env.JWT_SECRET;
  const ttlMs = process.env.JWT_SECRET;

  // If time has been expired?
  return new Promise((resolve, reject) => {
    jwt.verify(token, jwtSecret, function (err, decoded) {
      if (err) {
        resolve(null)
      }
      else {
        resolve(user(decoded.user, isUserId));

      }
    });
  })

}

// Verify if user exist in db or not
export async function user(activeuser, isUserId = true) {


  if (activeuser != null) {
    // Create db process (get into pool)

    var knexConnection = require('knex')(knexConnectionConfig);

    // Fatch user From Database
    let user = await knexConnection.transaction(async trx => {
      return trx.select().table('users').where('id', activeuser.id).first();
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

    if (user.data) {

      if (isUserId == false) {
        return activeuser;
      }

      else if (user.data.is_active == 1) {
        return activeuser;
      }
      else {
        return null
      }


    }
    else {
      return null;
    }
  }
  else {
    return null;
  }
}

// Verify & parse object from Token 
export async function checkToken(req) {
  if (req.headers['x-auth-token']) {
    return true;
  };
}

// Verify & parse object from Token 
export async function checkPackage(token, ids, mode = 'PAID', field = null, type = null, language_id = null, activeproducts = null, chapterIds = []) {

  if (mode == 'FREE') {
    return false;
  }
  let query = { access: true, noLog: true }
  if (field) {
    query.field = field
  }

  activeproducts = activeproducts ? activeproducts : await fetchAll('users/active-products', query, token)

  if (activeproducts.subjectIDs && activeproducts.subjectIDs.length == 0) {
    return true
  }

  if (type == 'exam') {
    if (activeproducts && activeproducts.access && 
      activeproducts.access.examIDs &&
      activeproducts.access.examIDs.length > 0 &&
      !isEmptyArray(intersect(activeproducts.access.examIDs, ids))) {
      return false
    }
  }

  else if (type == 'course') {
    if (activeproducts && activeproducts.access && 
      activeproducts.access.courseIDs &&
      activeproducts.access.courseIDs.length > 0 &&
      !isEmptyArray(intersect(activeproducts.access.courseIDs, ids))) {
      return false
    }
  }
  else
    if (activeproducts && activeproducts.access && 
      activeproducts.access.chapterIDs &&
      activeproducts.access.chapterIDs.length > 0 &&
      !isEmptyArray(intersect(activeproducts.access.chapterIDs, chapterIds))) {

      if (activeproducts.access.languageIds.length > 0 && language_id) {

        if (type == 'previous-year-question-papers' && language_id.includes('[')) {

          if (!isEmptyArray(intersect(activeproducts.access.languageIds, JSON.parse(language_id)))) {
            return false
          } else { return true }

        } else {
          if (activeproducts.access.languageIds.includes(language_id)) {
            return false
          } else {
            return true
          }
        }
      } else {
        return false
      }

    }
    else if (activeproducts && activeproducts.access && 
      activeproducts.access.subjectIDs &&
      activeproducts.access.subjectIDs.length > 0 &&
      !isEmptyArray(intersect(activeproducts.access.subjectIDs, ids))) {

      if (activeproducts.access.languageIds.length > 0 && language_id) {

        if (type == 'previous-year-question-papers' && language_id.includes('[')) {

          if (!isEmptyArray(intersect(activeproducts.access.languageIds, JSON.parse(language_id)))) {
            return false
          } else { return true }

        } else {
          if (activeproducts.access.languageIds.includes(language_id)) {
            return false
          } else {
            return true
          }
        }
      } else {
        return false
      }

    }


  return true

}

// JSON-safe models
export function jsonSafe(modelEntity) {
  let notAllowedAttr = [
    'password',
    'confirm_password',
    'fcm_token'
  ];

  notAllowedAttr.forEach(attr => {
    delete modelEntity[attr];
  });

  return modelEntity;
}

// Send Varification code
export async function sendVarCode(data) {

  let userAuthBase = await getSettings('loginUserID');
  let metaDetails = await getSettings('metaDetails')

  // Gernrate Random Numbers
  var options = {
    min: 1000,
    max: 9999,
    integer: true
  }
  let sms_ver_code = rn(options);

  if (userAuthBase == 'Email') {

    let config = await getSettings('mailConfigrations');

    let options = {
      from: config.user, // sender address
      to: data.email, // list of receivers
      subject: 'Verification Code', // Subject line
      html: `Welcome to ${metaDetails.baseTitle}. Your Verification Code is ` + sms_ver_code// plain text body
    }

    let mail = sendmail(options);


  } else {


    let prefixMobile = data.country_prefix ? data.country_prefix : '91'

    let mobileNumber = data.mobile_number;

    // Fetch Auth Key
    let smsGatway = await getSettings('smsGatway')
    let params = await getSettings('smsAuth')
   

    if (smsGatway == 'Message91') {

      params = {
        authkey: params.msg91AuthKey,
        sender: params.msg91senderID,
        template_id: params.msg91templateID,
        hash: params.hash,
        route: params.route,
        invisible: 1,
      }

      params.otp = sms_ver_code;
      params.mobile = prefixMobile + mobileNumber;


      params.extra_param = JSON.stringify({ "COMPANY_NAME": metaDetails.baseTitle, "VAR": params.hash })
      // params.extra_param = JSON.stringify({ "var": params.hash })



      let url = "https://api.msg91.com/api/v5/otp"

      let query = Object.keys(params)
        .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
        .join('&');
      url = url.concat(`?${query}`)

      setTimeout(() => {

        console.log(url)

        let sms_ver = axios.get(url, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
            'authkey': params.authkey,
          },
          // params: params,
        })
          .then((res) => {

            console.log(res)
            return sms_ver_code;
          })
          .catch(err => { return null, console.log(err) });
      }, 10000);


      return sms_ver_code;
    }
    else {

      params.text = `Welcome to ${metaDetails.baseTitle}. Your Verification Code is ` + sms_ver_code + "\n" + params.hash;
      params.number = mobileNumber;

      let accountSid = params.twilioAccountId;
      let authToken = params.twilioAuthToken;
      let client = require('twilio')(accountSid, authToken);


      setTimeout(() => {
        client.messages
          .create({
            body: params.text,
            from: params.twilioNumber,
            to: `+${prefixMobile}` + params.number
          })
          .then(message => console.log(message));
      }, 10000);

    }


  }

  // return sms_ver;
  return sms_ver_code;

}


// Function for search using Fuse.js
export function search(searchOptions, data, searchKey) {
  var options = {
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 50,
    minMatchCharLength: 1
  }
  options.keys = searchOptions

  var fuse = new Fuse(data, options)

  let values = fuse.search(searchKey)

  return values;
}

// Function for search using Fuse.js
export function searchPerfect(searchOptions, data, searchKey) {
  var options = {
    shouldSort: true,
    threshold: 1,
    location: 0,
    distance: 100,
    maxPatternLength: 50,
    minMatchCharLength: 1
  }
  options.keys = searchOptions

  var fuse = new Fuse(data, options)

  let values = fuse.search(searchKey)

  return values;
}

// Send mail
export async function sendmail(params) {

  // Fetch Auth Key
  let config = await getSettings('mailConfigrations')

  config = {
    'service': config.services,
    'auth': {
      'user': config.user, //  Put sender's email Id
      'pass': config.pass // Put sender's email password
    }
  };

  var transporter = nodemailer.createTransport(config);

  const mailOptions = params;

  console.log(mailOptions)
  console.log(config)

  let mail = transporter.sendMail(mailOptions, function (err, info) {
    if (err) {

      console.log(err)
      return {
        success: false,
        error: err
      }
    }

    else {
      return {
        success: true,
        error: null,
        info: info
      }
    }

  });

  console.log(mail)
  return mail;
}



// Send Varification code
export async function sendSMS(data) {

  let mobileNumber = data.mobile_number;

  // Fetch Auth Key
  let smsGatway = await getSettings('smsGatway')
  let params = await getSettings('smsAuth')

  // params.extra_param.HASH = Uri.EscapeUriString(params.extra_param.HASH)


  if (smsGatway == 'Message91') {

    let client = require("msg91")(params.msg91AuthKey, params.msg91senderID, params.route)

    var mobileNo = "91" + mobileNumber

    client.send(mobileNo, data.message, function (err, response) {
      console.log(err);
      console.log(response);
    });

    return true;
  }
  else {

    let accountSid = params.twilioAccountId;
    let authToken = params.twilioAuthToken;

    mobileNumber = "+91" + mobileNumber;

    let client = twilio(accountSid, authToken);
    client.messages
      .create({
        body: data.message,
        from: params.twilioNumber,
        to: mobileNumber
      })
      .then(message => console.log(message))
      .catch(err => console.log(err));
  }

  return true;

}


// Edit User Detail in test Series
export async function updateTestUser(user) {
  let data = user.data;
  // Add file to form data
  var form = new FormData();
  form.append('auth_id', data.id);
  form.append('userId', data.id);
  form.append('roleId', (data.type == 'ADMIN') ? 1 : 3);
  form.append('name', data.first_name);
  form.append('profilepic', (data.image == null ? '' : data.image));
  form.append('package_type', 4);
  form.append('email', (data.email == null ? '' : data.email));
  form.append('mobile', data.mobile_number);
  form.append('status', data.is_active == 1 ? 0 : 1);


  let apiUrl = process.env.NEXT_PUBLIC_TEST_SERIES_URL;
  apiUrl = apiUrl.concat('/api/editUser');
  let updated = false;

  // 
  data = await fetch(apiUrl, {
    method: 'POST',
    body: form
  });

  let jsonData = await data.json();

  return jsonData;
}

// Replace URL /Uploads
export async function replaceUploads(data, field = false) {
  let server = process.env.DEVELOPMENT_TYPE;

  if (server == 'PRODUCTION') {
    if (data != null && data.includes('/uploads') && !field) {
      data = data.replaceAll(/uploads/g, "cdn");
    }
    else if (data != null && field && data.includes(`/uploads/${field}`)) {
      data = data.replaceAll(`/uploads/${field}`, `/cdn/${field}`);
    }
  }

  return data;
}

// Replace URL /Uploads
export async function replaceUploadsArray(data, key) {
  let server = process.env.DEVELOPMENT_TYPE;


  if (server == 'PRODUCTION' && data && data.length > 0) {
    data = data.map(d => {
      if (d[key] != null && d[key].includes('/uploads')) {
        d[key] = d[key].replaceAll('/uploads', "/cdn");
      }

      return d;
    });
  }

  return data;
}

// For vimeo

export async function getComments(uri) {

  var response = '';

  client.request({
    method: "GET",
    path: `${uri}/comments`,
  },
    function (error, body) {
      if (error) {
        response = error;
      } else {
        response = body;
      }

    })
  return response;
}

export async function addComments(uri, comments) {

  var response = '';
  client.request({
    method: "POST",
    path: `${uri}/comments`,
    query: {
      "text": "comments"
    }
  },
    function (error, body) {
      if (error) {
        response = error;
      } else {
        response = body;
      }

    })

  return response;
}



// To restrict the access
export function moneyfy(amount, amount_type) {

  if (amount_type == 'PERCENT') {
    amount = `${amount} %`
  }
  else {
    amount = `Rs. ${amount}`
  }
  return amount
}



const intersect = (arrayA, arrayB) => {
  return arrayA.filter(elem => arrayB.includes(elem));
};

export function parseAmount(amount) {
  return Math.round(amount);
};



export async function checkCoupon(user, product, type, code = null, token = null) {

  var currentDate = moment().format('YYYY-MM-DD');

  product.finalAmount = product.finalAmount ? product.finalAmount : product.amount
  product.showAmount = product.showAmount ? product.showAmount : product.amount

  if (token) {

    let activeMembetship = await fetchAll('users/active-membership', {}, token)

    if (activeMembetship.usermembershipIDs && activeMembetship.usermembershipIDs.length > 0) {

      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      let couponMembership = await knexConnection.transaction(async trx => {

        var query;
        query = trx.select('coupons.*').table('coupons')
          .where(function () {
            this.where('coupons.start_date', '<=', currentDate).orWhereNull('coupons.start_date')
          })
          .where(function () {
            this.where('coupons.expiry_date', '>=', currentDate).orWhereNull('coupons.expiry_date')
          }).where('coupons.applied_on', 'AUTOMATIC').where('coupons.type', 'MEMBERSHIP')
          .whereIn('coupons.membership_id', activeMembetship.usermembershipIDs).where('coupons.is_active', 1);
        return query;

      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      product.membershipCoupon = []

      couponMembership.map(couponFixed => {

        let membershipCoupon = null
        if (couponFixed) {
          if (couponFixed.referance_type == 'product') {
            if (couponFixed.referance_ids.includes(`[${product.id}]`) || couponFixed.referance_ids.includes(`,${product.id}]`) || couponFixed.referance_ids.includes(`[${product.id},`) || couponFixed.referance_ids.includes(`,${product.id},`)) {
              membershipCoupon = couponFixed
              product.membershipCoupon.push(couponFixed)
            }
          }
          else if (couponFixed.referance_type == 'product_type') {
            if (couponFixed.referance_ids.includes(`[${product.product_type_id}]`) || couponFixed.referance_ids.includes(`,${product.product_type_id}]`) || couponFixed.referance_ids.includes(`[${product.product_type_id},`) || couponFixed.referance_ids.includes(`,${product.product_type_id},`)) {
              membershipCoupon = couponFixed
              product.membershipCoupon.push(couponFixed)
            }
          }

          else {
            if (!isEmptyArray(intersect(JSON.parse(couponFixed.referance_ids), JSON.parse(product[`${couponFixed.referance_type}_ids`])))) {
              membershipCoupon = couponFixed
              product.membershipCoupon.push(couponFixed)
            }
          }
        }

        if (membershipCoupon) {
          if (membershipCoupon.discount_type == 'PERCENT') {

            let membershipCouponAmount = (product.finalAmount * (membershipCoupon.amount / 100));

            // membershipCoupon.amount = membershipCouponAmount
            product.finalAmount = product.finalAmount - membershipCouponAmount
            product.showAmount = product.finalAmount - membershipCouponAmount
          } else {
            let membershipCouponAmount = membershipCoupon.amount;

            // membershipCoupon.amount = membershipCouponAmount
            product.showAmount = product.finalAmount - membershipCouponAmount
            product.finalAmount = product.finalAmount - membershipCouponAmount
          }
        }
      })




    }

  }


  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let couponFixeds = await knexConnection.transaction(async trx => {

    var query;
    query = trx.select('coupons.*').table('coupons')
      .where(function () {
        this.where('coupons.start_date', '<=', currentDate).orWhereNull('coupons.start_date')
      })
      .where(function () {
        this.where('coupons.expiry_date', '>=', currentDate).orWhereNull('coupons.expiry_date')
      }).where('coupons.applied_on', 'AUTOMATIC').where('coupons.type', 'DISCOUNT').where('coupons.is_active', 1);
    return query;

  })

  // Destrory process (to clean pool)
  knexConnection.destroy();


  couponFixeds.map(couponFixed => {
    if (couponFixed) {
      if (couponFixed.referance_type == 'product') {
        if (couponFixed.referance_ids.includes(`[${product.id}]`) || couponFixed.referance_ids.includes(`,${product.id}]`) || couponFixed.referance_ids.includes(`[${product.id},`) || couponFixed.referance_ids.includes(`,${product.id},`)) {
          product.fixedCoupon = couponFixed
        }
      }
      else if (couponFixed.referance_type == 'product_type') {
        if (couponFixed.referance_ids.includes(`[${product.product_type_id}]`) || couponFixed.referance_ids.includes(`,${product.product_type_id}]`) || couponFixed.referance_ids.includes(`[${product.product_type_id},`) || couponFixed.referance_ids.includes(`,${product.product_type_id},`)) {
          product.fixedCoupon = couponFixed
        }
      }

      else {
        if (!isEmptyArray(intersect(JSON.parse(couponFixed.referance_ids), JSON.parse(product[`${couponFixed.referance_type}_ids`])))) {
          product.fixedCoupon = couponFixed
        }
      }
    }
  })

  if (product.fixedCoupon) {
    if (product.fixedCoupon.discount_type == 'PERCENT') {

      let fixedCouponAmount = (product.finalAmount * (product.fixedCoupon.amount / 100));

      // product.fixedCoupon.amount = fixedCouponAmount
      product.finalAmount = product.finalAmount - fixedCouponAmount
      product.showAmount = product.showAmount - fixedCouponAmount
    } else {
      let fixedCouponAmount = product.fixedCoupon.amount;

      // product.fixedCoupon.amount = fixedCouponAmount
      product.showAmount = product.showAmount - fixedCouponAmount
      product.finalAmount = product.finalAmount - fixedCouponAmount
    }
  }



  if (type != 'NONE') {  // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    let coupons = await knexConnection.transaction(async trx => {

      var query;
      query = trx.select('coupons.*').table('coupons').where('coupons.type', 'COUPON')
        .where(function () {
          this.where('coupons.start_date', '<=', currentDate).orWhereNull('coupons.start_date')
        })
        .where(function () {
          this.where('coupons.expiry_date', '>=', currentDate).orWhereNull('coupons.expiry_date')
        })
        .where(function () {
          this.where('coupons.minimum_amount', '<=', product.amount).orWhereNull('coupons.minimum_amount')
        })
        .where(function () {
          this.where('coupons.maximum_amount', '>=', product.amount).orWhereNull('coupons.maximum_amount')
        }).whereNotNull('coupons.code').whereNot('coupons.code', '').where('coupons.is_active', 1);

      if (code) {
        query.where('coupons.code', code)
      }
      if (type) {
        query.where('coupons.applied_on', type)
      }
      query.orderBy('coupons.id', "ASC")
      return query;

    })

    // Destrory process (to clean pool)
    knexConnection.destroy();


    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    var orders = []
    if (user) {
      orders = await knexConnection.transaction(async trx => {

        var query;
        query = trx.select('orders.*').table('orders')
          .where('user_id', user.id).where('status', 'SUCCESS').where('type', 'PRODUCT')
        query.orderBy('orders.id', "ASC")
        return query;

      })
    }

    // Destrory process (to clean pool)
    knexConnection.destroy();

    if (coupons) {

      coupons.map(coupon => {

        if ((coupon.first_order != 1 || (!orders || orders.length == 0)) && (!user || !coupon.email_restrictions || !JSON.parse(coupon.email_restrictions).includes(user.id)) &&
          (!user || !coupon.restricted_user_types || !coupon.restricted_user_types.includes(user.type)) &&
          (coupon.usage_count < coupon.usage_limit || !coupon.usage_limit)
          && (product.amount >= coupon.minimum_amount || !coupon.minimum_amount)
          && (product.amount <= coupon.maximum_amount || !coupon.maximum_amount)) {
          if (coupon.referance_type == 'product') {
            if (coupon.referance_ids.includes(`[${product.id}]`) || coupon.referance_ids.includes(`[${product.id},`) || coupon.referance_ids.includes(`,${product.id}]`) || coupon.referance_ids.includes(`,${product.id},`)) {
              return product.coupon = coupon
            }
          }
          else if (coupon.referance_type == 'product_type') {
            if (coupon.referance_ids.includes(`[${product.product_type_id}]`) || coupon.referance_ids.includes(`[${product.product_type_id},`) || coupon.referance_ids.includes(`,${product.product_type_id}]`) || coupon.referance_ids.includes(`,${product.product_type_id},`)) {
              return product.coupon = coupon
            }
          }

          else {
            if (!isEmptyArray(intersect(JSON.parse(coupon.referance_ids), JSON.parse(product[`${coupon.referance_type}_ids`])))) {
              return product.coupon = coupon
            }
          }
        }

      })

    }

    if (product.coupon) {


      if (product.coupon.discount_type == 'PERCENT') {

        let couponAmount = (product.finalAmount * (product.coupon.amount / 100));

        if (product.coupon.amount_upto && (product.coupon.amount_upto < (product.finalAmount * (product.coupon.amount / 100)))) {
          couponAmount = product.coupon.amount_upto
        }




        // product.coupon.amount = couponAmount
        product.finalAmount = product.finalAmount - couponAmount
      } else {
        let couponAmount = product.coupon.amount;
        if (product.coupon.amount_upto && (product.coupon.amount_upto < product.coupon.amount)) {
          couponAmount = product.coupon.amount_upto
        }

        // product.coupon.amount = couponAmount
        product.finalAmount = product.finalAmount - couponAmount
      }
    }
  }

  if (product.finalAmount < 0) {
    product.finalAmount = 0
  }

  product.finalAmountDisplay = moneyfy(product.finalAmount, 'AMOUNT')

  return product;
}


export async function checkReferral(user, product, type = null, referral_id = null) {


  if (type != 'NONE') {

    var currentDate = moment().format('YYYY-MM-DD');


    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    let referralFixeds = await knexConnection.transaction(async trx => {

      var query;
      query = trx.select('referrals.*').table('referrals')
        .where(function () {
          this.where('referrals.start_date', '<=', currentDate).orWhereNull('referrals.start_date')
        })
        .where(function () {
          this.where('referrals.expiry_date', '>=', currentDate).orWhereNull('referrals.expiry_date')
        })
        .where(function () {
          this.where('referrals.user_minimum_amount', '<=', product.amount).orWhereNull('referrals.user_minimum_amount')
        })
        .where(function () {
          this.where('referrals.user_maximum_amount', '>=', product.amount).orWhereNull('referrals.user_maximum_amount')
        })

        .where('referrals.is_active', 1);

      if (referral_id) {
        query.where('referrals.id', referral_id)
      }

      return query;

    })

    // Destrory process (to clean pool)
    knexConnection.destroy();



    referralFixeds.map(referralFixed => {
      if (referralFixed) {
        if (referralFixed.referance_type == 'product') {
          if (referralFixed.referance_ids.includes(`[${product.id}]`) || referralFixed.referance_ids.includes(`[${product.id},`) || referralFixed.referance_ids.includes(`,${product.id}]`) || referralFixed.referance_ids.includes(`,${product.id},`)) {
            product.referral = referralFixed
          }
        }
        if (referralFixed.referance_type == 'product_type') {
          if (referralFixed.referance_ids.includes(`[${product.product_type_id}]`) || referralFixed.referance_ids.includes(`[${product.product_type_id},`) || referralFixed.referance_ids.includes(`,${product.product_type_id}]`) || referralFixed.referance_ids.includes(`,${product.product_type_id},`)) {
            product.referral = referralFixed
          }
        }

        else {
          if (!isEmptyArray(intersect(JSON.parse(referralFixed.referance_ids), JSON.parse(product[`${referralFixed.referance_type}_ids`])))) {
            product.referral = referralFixed
          }
        }
      }
    })

    if (product.referral) {


      if (product.referral.user_discount_type == 'PERCENT') {

        let referralAmount = (product.finalAmount * (product.referral.user_amount / 100));

        if (product.referral.user_amount_upto && (product.referral.user_amount_upto < (product.finalAmount * (product.referral.user_amount / 100)))) {
          referralAmount = product.referral.user_amount_upto
        }



        // product.referral.user_amount = referralAmount
        product.finalAmount = product.finalAmount - referralAmount


      } else {
        let referralAmount = product.referral.user_amount;
        if (product.referral.user_amount_upto && (product.referral.user_amount_upto < product.referral.user_amount)) {
          referralAmount = product.referral.user_amount_upto
        }

        // product.referral.user_amount = referralAmount
        product.finalAmount = product.finalAmount - referralAmount
      }
    }

    if (product.finalAmount < 0) {
      product.finalAmount = 0
    }

    product.finalAmountDisplay = moneyfy(product.finalAmount, 'AMOUNT')

  }

  return product;
}


export async function checkReferralUser(user, product, cart_id = null, referral_id = null) {


  product.finalAmount = product.finalAmount ? product.finalAmount : product.amount

  // Create db process(get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let preCarts = await knexConnection.transaction(async trx => {

    var query;
    query = trx.select('carts.*').table('carts')
      .where('carts.user_id', user.id).where('carts.status', 'ADDED');

    if (cart_id) {
      query.whereNot('carts.id', cart_id)
    }
    return query;

  })

  // Destrory process (to clean pool)
  knexConnection.destroy();


  if (preCarts && preCarts.length > 0) {

  } else {
    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    let referralDiscount = await knexConnection.transaction(async trx => {

      var query;
      query = trx.select('user_referrals.*').table('user_referrals')
        .where('user_referrals.user_id', user.id).where('user_referrals.applied', 0).first();
      return query;

    })

    // Destrory process (to clean pool)
    knexConnection.destroy();


    if (referralDiscount) {

      var currentDate = moment().format('YYYY-MM-DD');

      // Create db process(get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      let referralFixeds = await knexConnection.transaction(async trx => {

        var query;
        query = trx.select('referrals.*').table('referrals')
          .where(function () {
            this.where('referrals.start_date', '<=', currentDate).orWhereNull('referrals.start_date')
          })
          .where(function () {
            this.where('referrals.expiry_date', '>=', currentDate).orWhereNull('referrals.expiry_date')
          })
          .where(function () {
            this.where('referrals.referrar_minimum_amount', '<=', product.amount).orWhereNull('referrals.referrar_minimum_amount')
          })
          .where(function () {
            this.where('referrals.referrar_maximum_amount', '>=', product.amount).orWhereNull('referrals.referrar_maximum_amount')
          })

          .where('referrals.is_active', 1).where('referrals.id', referralDiscount.referral_id).first();

        return query;

      })

      // Destrory process (to clean pool)
      knexConnection.destroy();


      if (referralFixeds) {



        product.referrar = referralFixeds
        product.referrar.referrar_id = referralDiscount.id
        if (referralFixeds.referrar_discount_type == 'PERCENT') {

          let referralAmount = (product.finalAmount * (referralFixeds.referrar_amount / 100));

          if (referralFixeds.referrar_amount_upto && (referralFixeds.referrar_amount_upto < (product.finalAmount * (referralFixeds.referrar_amount / 100)))) {
            referralAmount = referralFixeds.referrar_amount_upto
          }

          // referralFixeds.referrar_amount = referralAmount
          product.finalAmount = product.finalAmount - referralAmount


        } else {
          let referralAmount = referralFixeds.referrar_amount;
          if (referralFixeds.referrar_amount_upto && (referralFixeds.referrar_amount_upto < referralFixeds.referrar_amount)) {
            referralAmount = referralFixeds.referrar_amount_upto
          }

          // params.referrar_amount = referralAmount
          product.finalAmount = product.finalAmount - referralAmount
        }
      }
    }
  }


  return product;
}

export async function googleApi() {

  const { google } = require('googleapis')
  const scopes = 'https://www.googleapis.com/auth/analytics.readonly'

  // configure a JWT auth client
  let jwtClient = new google.auth.JWT(
    process.env.CLIENT_EMAIL,
    null,
    process.env.PRIVATE_KEY,
    scopes);

  const response = await jwtClient.authorize()
  let access_token = response.access_token

  return { access_token: access_token }

}


export async function createLog(params) {


  // Create db process (get into pool)
  let knexConnection = require('knex')(knexConnectionConfig);

  // if  insert data
  var userLogs = await knexConnection.transaction(async trx => {
    return trx.insert(params).into('logs');
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


  return userLogs
}