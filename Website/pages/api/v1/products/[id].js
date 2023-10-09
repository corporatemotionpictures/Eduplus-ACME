import { knexConnectionConfig } from 'db/knexConnection';
import { fetchAll } from 'helpers/apiService';
import {getSettings } from 'helpers/apiService';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, checkReferralUser, injectMethodNotAllowed, checkCoupon, checkReferral, parseAmount } from 'helpers/api';

// Function to Get product By ID
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) {
    injectMethodNotAllowed(res);
    return false;
  }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert product
  // if (!user) { restrictedAccess(res); return false; }

  // set products
  let id = req.query.id;

  let productDetailWithGst = await getSettings('product_detail_including_gst')

  let activated = false
  if (user && !req.query.forActive) {
    let data = await fetchAll('users/active-products', { productID: id, noLog: true }, req.headers['x-auth-token'])
    activated = data.productRef && data.productRef.activated
  }

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fatch product From Database
  let product = await knexConnection.transaction(async trx => {
    let query = trx.select().table('products').where('id', id);

    if (!activated && !req.query.forActive) {
      query.where('is_active', 1)
    }

    query.first()

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


  let upgradable_details = null

  if (product.data) {

    if (req.query.forUpgarde && req.query.forUpgarde == 'UPGRADE' && product.data.is_upgradable == 1 && req.query.upgradable_id) {

      // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);

      upgradable_details = await knexConnection.transaction(async trx => {
        return trx.table('upgradable_products').select('upgradable_products.*', 'validities.title').where('upgradable_products.id', req.query.upgradable_id).join('validities', 'validities.id', 'upgradable_products.upgradable_duration').first();
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      if (upgradable_details) {
        product.data.amount = upgradable_details.upgradable_amount
      }

    }

    product.data.per_amount = product.data.amount

    if (req.query.quantity) {
      product.data.qtyAmount = product.data.amount * req.query.quantity
      product.data.amount = product.data.amount * req.query.quantity
    }


    product.data.details = product.data.details ? JSON.parse(product.data.details) : null

    let coupon = null

    if (!req.query.forUpgarde || req.query.forUpgarde != 'UPGRADE' || product.data.is_upgradable != 1 || !req.query.upgradable_id) {
      if (req.query.couponCode) {
        coupon = req.query.couponCode
        product.data = await checkCoupon(user, product.data, 'MANUAL', coupon, req.headers['x-auth-token'])

        if (product.data.coupon == undefined) {
          product.data = await checkCoupon(user, product.data, 'AUTOMATIC', null, req.headers['x-auth-token'])
        }
      }
      else if (req.query.noCoupon) {
        product.data = await checkCoupon(user, product.data, 'NONE', null, req.headers['x-auth-token'])
      }
      else {
        product.data = await checkCoupon(user, product.data, 'AUTOMATIC', null, req.headers['x-auth-token'])
      }

      if (req.query.referralCode) {
        let referral = req.query.referralCode
        product.data = await checkReferral(user, product.data)
      }
      else if (req.query.noReferral) {
        product.data = await checkReferral(user, product.data, 'NONE')
      }
      else if (req.query.referral_id && parseInt(req.query.referral_id)) {
        product.data = await checkReferral(user, product.data, null, parseInt(req.query.referral_id))
      }
    } else {
      product.data.finalAmount = product.data.amount
    }


    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    product.data.upgradable_details = await knexConnection.transaction(async trx => {
      return trx.table('upgradable_products').select('upgradable_products.*', 'validities.title',).where('product_id', product.data.id).join('validities', 'validities.id', 'upgradable_products.upgradable_duration');
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();


    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    product.data.exams = await knexConnection.transaction(async trx => {
      return trx.table('exams').whereIn('id', JSON.parse(product.data.exam_ids)).where('is_active', 1).orderBy('position', 'ASC');
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    product.data.courses = await knexConnection.transaction(async trx => {
      return trx.table('courses').whereIn('id', JSON.parse(product.data.course_ids)).where('is_active', 1).orderBy('position', 'ASC');
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    if (product.data.subject_ids) {
      // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);

      product.data.subjects = await knexConnection.transaction(async trx => {
        return trx.table('subjects').whereIn('id', JSON.parse(product.data.subject_ids)).where('is_active', 1).orderBy('position', 'ASC');
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();
    }

    if (product.data.chapter_ids) {
      // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);

      product.data.chapters = await knexConnection.transaction(async trx => {
        return trx.table('chapters').whereIn('id', JSON.parse(product.data.chapter_ids)).where('is_active', 1).orderBy('position', 'ASC');
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();
    }

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    product.data.product_type = await knexConnection.transaction(async trx => {
      return trx.table('product_types').where('id', product.data.product_type_id).first();
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    // Create db process (get into pool)this.state.product.reviews
    knexConnection = require('knex')(knexConnectionConfig);

    product.data.reviews = await knexConnection.transaction(async trx => {
      return trx.table('product_reviews').select('product_reviews.*', 'users.first_name', 'users.last_name').where('product_id', product.data.id).join('users', 'users.id', 'product_reviews.user_id');
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    product.data.fivestar = 0
    product.data.fourstar = 0
    product.data.threestar = 0
    product.data.twostar = 0
    product.data.onestar = 0

    let total = 0
    product.data.reviews.map(review => {

      if (review.ratting == 5) {
        product.data.fivestar++;
      }
      if (review.ratting == 4) {
        product.data.fourstar++;
      }
      if (review.ratting == 3) {
        product.data.threestar++;
      }
      if (review.ratting == 2) {
        product.data.twostar++;
      }
      if (review.ratting == 1) {
        product.data.onestar++;
      }
      return total += review.ratting
    })

    product.data.average_review = parseInt(total / product.data.reviews.length)

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    product.data.package_type = await knexConnection.transaction(async trx => {
      return trx.table('course_types').where('id', product.data.course_type_id).first();
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    if (product.data.package_type) {
      // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);

      product.data.modules = await knexConnection.transaction(async trx => {
        return trx.table('app_modules').whereIn('id', JSON.parse(product.data.package_type.include_ids)).where('is_active', 1);
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

    }

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    let attributes;
    if (req.query.cartID) {
      attributes = await knexConnection.transaction(async trx => {
        return trx.table('user_product_attributes').select('user_product_attributes.attribute_id', 'user_product_attributes.value', 'user_product_attributes.value_id', 'attributes.slug', 'attributes.title', 'attributes.hidden', 'attributes.applied_as', 'attributes.referance')
          .join('attributes', 'user_product_attributes.attribute_id', 'attributes.id')
          .where('user_product_attributes.product_id', product.data.id)
          .where('user_product_attributes.cart_id', req.query.cartID)
          .where(function () {
            this.whereNotNull('user_product_attributes.value').orWhereNotNull('user_product_attributes.value_id')
          })
      })
    } else {

      attributes = attributes = await knexConnection.transaction(async trx => {
        return trx.table('product_attributes').select('product_attributes.attribute_id', 'product_attributes.value', 'product_attributes.value_id', 'attributes.slug', 'attributes.title', 'attributes.hidden', 'attributes.applied_as', 'attributes.referance')
          .join('attributes', 'product_attributes.attribute_id', 'attributes.id')
          .where('product_attributes.product_id', product.data.id)
          .where(function () {
            this.whereNotNull('product_attributes.value').orWhereNotNull('product_attributes.value_id')
          })
      })
    }


    // Destrory process (to clean pool)
    knexConnection.destroy();

    product.data['attributes'] = {}
    var testattributes = {}

    for (let j = 0; j < attributes.length; j++) {
      let attribute = attributes[j]
      let value = attribute.value_id == null ? attribute.value : attribute.value_id
      let label = attribute.value_id == null ? 'value' : 'value_id'
      let slug = `${attribute.slug}`

      if (testattributes[slug]) {
        let prevValue = testattributes[slug]

        if (Array.isArray(prevValue)) {
          prevValue.push(value)
        } else {
          prevValue = [prevValue, value]
        }
        testattributes[slug] = prevValue
      } else {
        // testattributes[slug] = {}
        testattributes[slug] = attribute.is_multiple == 1 ? [value] : value
      }

      if (user && req.query.noLog) {
        product.data[attribute.slug] = JSON.stringify(testattributes[slug])
      }

      product.data['attributes'][slug] = attribute
      if (attribute.value_id == null) {
        product.data['attributes'][slug].values = testattributes[slug]
      } else {

        product.data['attributes'][slug].value_id = testattributes[slug]

        // Create db process (get into pool)
        knexConnection = require('knex')(knexConnectionConfig);

        let referances = await knexConnection.transaction(async trx => {
          return trx.table('attribute_referances').where('id', attribute.referance).first();
        })

        // Destrory process (to clean pool)
        knexConnection.destroy();

        if (attribute.referance && referances) {

          // Create db process (get into pool)
          knexConnection = require('knex')(knexConnectionConfig);

          product.data['attributes'][slug].values = await knexConnection.transaction(async trx => {
            return trx.table(referances.model).where('is_active', 1)
              .modify(function (queryBuilder) {
                if (Array.isArray(testattributes[slug])) {
                  queryBuilder.whereIn('id', testattributes[slug])
                } else {
                  queryBuilder.where('id', testattributes[slug])
                }
              }).orderBy('id', 'DESC');
          })

          // Destrory process (to clean pool)
          knexConnection.destroy();

          referances.fetcher = referances.fetcher.split(',')

          if (req.query.cartID) {
            product.data['attributes'][slug].value = ''
          }

          product.data['attributes'][slug].values.map(value => {

            let refe = ''
            referances.fetcher.map(ref => {
              refe = refe ? refe + ' ' + value[ref] : value[ref]
            })

            product.data['attributes'][slug].value = product.data['attributes'][slug].value ? product.data['attributes'][slug].value + ', ' + refe : refe
          })



        } else {
          // Create db process (get into pool)
          knexConnection = require('knex')(knexConnectionConfig);

          product.data['attributes'][slug].values = await knexConnection.transaction(async trx => {
            return trx.table('attribute_values').where('attribute_id', attribute.attribute_id)
              .modify(function (queryBuilder) {
                if (Array.isArray(testattributes[slug])) {
                  queryBuilder.whereIn('id', testattributes[slug])
                } else {
                  queryBuilder.where('id', testattributes[slug])
                }
              });
          })

          // Destrory process (to clean pool)
          knexConnection.destroy();

          if (req.query.cartID) {
            product.data['attributes'][slug].value = ''
          }

          product.data['attributes'][slug].values.map(value => {
            product.data['attributes'][slug].value = product.data['attributes'][slug].value ? product.data['attributes'][slug].value + ', ' + value["title"] : value["title"]
          })
        }

        if (req.query.cart_id && !req.query.cartID) {
          // Create db process (get into pool)
          knexConnection = require('knex')(knexConnectionConfig);

          attribute.selectedValue = await knexConnection.transaction(async trx => {
            return trx.table('user_product_attributes').select()
              .where('user_product_attributes.product_id', product.data.id)
              .where('user_product_attributes.cart_id', req.query.cart_id)
              .where('user_product_attributes.attribute_id', attribute.attribute_id).pluck('user_product_attributes.value_id')
          })


          // Destrory process (to clean pool)
          knexConnection.destroy();
        }


      }
    }

    if (upgradable_details && product.data.attributes && product.data.attributes.validity) {

      product.data.attributes.validity.value_id = upgradable_details.upgradable_duration
      product.data.attributes.validity.value = upgradable_details.title

    }


    if (user) { // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);

      let cart = await knexConnection.transaction(async trx => {
        return trx.table('carts').where('product_id', product.data.id).where('user_id', user.id).where('status', 'ADDED').first();
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      product.data.AddedToCart = cart ? true : false

      knexConnection = require('knex')(knexConnectionConfig);

      let demo = await knexConnection.transaction(async trx => {
        return trx.table('demo_classes').where('product_id', product.data.id).where('user_id', user.id).first();
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      product.data.demoApplied = demo ? true : false
    }

    product.data.taxIncluded = false
    product.data.shippingCharges = 0

    product.data.tax_included_in_base_price = 0

    if (product.data['attributes']) {

      if (product.data['attributes']['shipping-charges'] && product.data['attributes']['shipping-charges'].values && product.data['attributes']['shipping-charges'].values.length > 0 &&
        (!req.query.forUpgarde || req.query.forUpgarde != 'UPGRADE' || product.data.is_upgradable != 1 || !req.query.upgradable_id)) {

        product.data.shippingCharges = product.data['attributes']['shipping-charges'].values[0].amount
        if (product.data['attributes']['shipping-charges'].values[0].amount_type == 'PERCENT') {
          product.data.shippingCharges = (product.data.finalAmount * (product.data['attributes']['shipping-charges'].values[0].amount / 100)).toFixed(2)
        }
      }


      product.data.finalAmountWithoutGst = parseAmount(product.data.finalAmount)
      product.data.amountWithoutGst = parseAmount(product.data.amount)

      if (req.query.addTocart || req.query.cart_id) {
        product.data.finalAmount = product.data.finalAmount + product.data.shippingCharges
      }


      if (product.data['attributes'].taxes && product.data['attributes'].taxes.values && product.data['attributes'].taxes.values.length > 0 && (req.query.addTocart || req.query.cart_id || (productDetailWithGst != 'NO' || !req.query.forWeb)) &&
        (!req.query.forUpgarde || req.query.forUpgarde != 'UPGRADE' || product.data.is_upgradable != 1 || !req.query.upgradable_id)) {

        let tax = product.data['attributes'].taxes.values[0].amount
        let amountTax = product.data['attributes'].taxes.values[0].amount
        let perTax = product.data['attributes'].taxes.values[0].amount
        let qtyTax = product.data['attributes'].taxes.values[0].amount
        let showTax = product.data['attributes'].taxes.values[0].amount
        product.data.tax_amount = tax
        product.data.tax_type = product.data['attributes'].taxes.values[0].amount_type
        if (product.data['attributes'].taxes.values[0].amount_type == 'PERCENT') {
          tax = product.data.finalAmount * (product.data['attributes'].taxes.values[0].amount / 100)
          showTax = product.data.showAmount * (product.data['attributes'].taxes.values[0].amount / 100)
          if (product.data.tax_included == 1) {

            amountTax = product.data.per_amount * (product.data['attributes'].taxes.values[0].amount / 100)
            perTax = product.data.per_amount * (product.data['attributes'].taxes.values[0].amount / 100)
            qtyTax = product.data.qtyAmount * (product.data['attributes'].taxes.values[0].amount / 100)
          } else {
            amountTax = tax
          }
        }

        product.data.taxAmount = tax
        product.data.finalAmount = (product.data.finalAmount + tax).toFixed(2)
        if (product.data.tax_included == 1 && (productDetailWithGst != 'NO' || !req.query.forWeb)) {

          product.data.tax_included_in_base_price = 1
          product.data.amount = (product.data.amount + amountTax).toFixed(2)
          product.data.per_amount = (product.data.per_amount + perTax).toFixed(2)
          product.data.qtyAmount = (product.data.qtyAmount + qtyTax).toFixed(2)
        }
        product.data.finalAmountDisplay = `₹ ${product.data.finalAmount}`
        product.data.taxIncluded = true
      }

      if (product.data['attributes']['faculty'] && product.data['attributes']['faculty'].values && product.data['attributes']['faculty'].values.length > 0) {

        product.data['attributes']['faculty'].values.map(value => {
          value.image = value.image ? value.image : '/uploads/users/1582798193537.jpg'
        })

        product.data['attributes']['faculty'].values = await replaceUploadsArray(product.data['attributes']['faculty'].values, 'image');

      }


    }

    if (product.data.courses) {

      for (let i = 0; i < product.data.courses.length; i++) {
        // Create db process (get into pool)
        knexConnection = require('knex')(knexConnectionConfig);

        product.data.courses[i].subjects = await knexConnection.transaction(async trx => {
          return trx.table('subjects').where('subjects.is_active', 1)
            .modify(function (queryBuilder) {
              if (product.data.subject_ids) {
                queryBuilder.whereIn('id', JSON.parse(product.data.subject_ids))
              }
            }).modify(function (queryBuilder) {
              queryBuilder.where(function () {
                this.where(function () {
                  if (product.data.courses[i].id) {
                    this.orWhere('course_ids', 'like', `%[${product.data.courses[i].id}]%`).orWhere('course_ids', 'like', `%,${product.data.courses[i].id}]%`).orWhere('course_ids', 'like', `[%${product.data.courses[i].id},%`).orWhere('course_ids', 'like', `,%${product.data.courses[i].id},%`)
                  }
                })
              })
            }).orderBy('position', 'ASC')


        })

        // Destrory process (to clean pool)
        knexConnection.destroy();

        for (let j = 0; j < product.data.courses[i].subjects.length; j++) {

          // Create db process (get into pool)
          knexConnection = require('knex')(knexConnectionConfig);

          product.data.courses[i].subjects[j].chapters = await knexConnection.transaction(async trx => {
            return trx.table('chapters').where('chapters.is_active', 1).modify(function (queryBuilder) {
              queryBuilder.where(function () {
                this.where(function () {
                  if (product.data.courses[i].subjects[j].id) {
                    this.orWhere('subject_ids', 'like', `%[${product.data.courses[i].subjects[j].id}]%`).orWhere('subject_ids', 'like', `%,${product.data.courses[i].subjects[j].id}]%`).orWhere('subject_ids', 'like', `[%${product.data.courses[i].subjects[j].id},%`).orWhere('subject_ids', 'like', `,%${product.data.courses[i].subjects[j].id},%`)
                  }

                })
                  .where(function () {
                    if (product.data.chapter_ids && JSON.parse(product.data.chapter_ids).length > 0) {
                      this.whereIn('id', JSON.parse(product.data.chapter_ids))
                    }
                  })
                  .where(function () {
                    if (product.data.courses[i].id) {
                      this.orWhere('course_ids', 'like', `%[${product.data.courses[i].id}]%`).orWhere('course_ids', 'like', `%,${product.data.courses[i].id}]%`).orWhere('course_ids', 'like', `[%${product.data.courses[i].id},%`).orWhere('course_ids', 'like', `,%${product.data.courses[i].id},%`)
                    }
                  })
              }).orderBy('position', 'ASC')
            })
          })

          // Destrory process (to clean pool)
          knexConnection.destroy();
        }
      }
    }

    if (product.data.subjects) {
      // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);

      product.data.subjects = await knexConnection.transaction(async trx => {
        return trx.table('subjects').select('subjects.*').orderBy('position', 'ASC');
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();
    }

    if (user) {// Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);

      product.data.currentUserCommnet = await knexConnection.transaction(async trx => {
        return trx.table('product_reviews').select().where('product_id', product.data.id).where('user_id', user.id).first();
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();
    }
  }




  if (product.data && product.data['attributes'] && !req.query.forWeb) {
    product.data['attributes'] = Object.values(product.data['attributes'])
  }


  if (product.data && user && user.type != 'ADMIN') {

    let params = {
      viewed: product.data.viewed + 1
    }


    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    // Update Views in products
    let productUpdate = await knexConnection.transaction(async trx => {
      return trx('products').where('id', product.data.id).update(params);
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

  }



  if (product.data && user && user.type != 'ADMIN' && !req.query.noLog) {
    let logged_data = {
      user_id: user.id,
      action: 'VIEW_PRODUCT',
      payload: JSON.stringify({
        field_name: 'products',
        field_id: product.data.id,
        ...req.query
      })
    }


    let logs = await createLog(logged_data)
  }



  if (product.data) {
    // product.data.finalAmount = product.data.finalAmount.toFixed(2)
    product.data.amount = parseAmount(product.data.amount)
    product.data.qtyAmount = parseAmount(product.data.qtyAmount)
    product.data.per_amount = parseAmount(product.data.per_amount)
    product.data.finalAmount = parseAmount(product.data.finalAmount)
    product.data.showAmount = parseAmount(product.data.showAmount)
    product.data.cover_image = await replaceUploads(product.data.cover_image);
    product.data.description = await replaceUploads(product.data.description, 'editor-images');
  }


  //
  let statusCode = product.data ? 200 : 422;
  let response = {
    success: product.data ? true : false,
    product: product.data,
    error: product.error
  };

  // Send Response
  res.status(statusCode).json(response);
}


const intersect = (arrayA, arrayB) => {
  return arrayA.filter(elem => arrayB.includes(elem));
};