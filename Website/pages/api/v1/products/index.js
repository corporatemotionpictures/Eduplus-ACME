import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getSettings } from 'helpers/apiService';
import { getOnly, createLog, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed, checkCoupon, parseAmount } from 'helpers/api';

// Function to Fetch product
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert product
  // if (!user) { restrictedAccess(res); return false; }

  // Filter
  let orderBy = req.query.order_by ? req.query.order_by : 'ASC';
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;
  let examID = req.query.examID ? req.query.examID.split(',') : null;
  let courseID = req.query.courseID ? req.query.courseID.split(',') : null;
  let subjectID = req.query.subjectID ? req.query.subjectID.split(',') : null;
  let chapterID = req.query.chapterID ? req.query.chapterID.split(',') : null;
  let productType = req.query.productType && req.query.productType != '' ? req.query.productType.split(',') : null;
  let packageType = req.query.packageType && req.query.packageType != '' ? req.query.packageType.split(',') : null;
  productType = productType || (!req.query.productTypeID && req.query.productTypeID != '') ? productType : req.query.productTypeID.split(',');
  let batchIds = req.query.batchIDs ? req.query.batchIDs : null;
  let search = req.query.search ? req.query.search : null;

  var subjectIDs = null;
  if (user && user.type == 'FACULTY' && user.subject_ids) {
    subjectIDs = user.subject_ids;
  }

  let productDetailWithGst = await getSettings('product_detail_including_gst')

  var totalCount = 0

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let attributesFilters = await knexConnection.transaction(async trx => {
    var query = trx.select('attributes.*').table('attributes')

    if ((!req.query.forList || req.query.listOnly)) {
      query.where('attributes.is_active', 1).where('attributes.filterable', 1);
    }

    return query;
  });

  // Destrory process (to clean pool)
  knexConnection.destroy();


  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let products = await knexConnection.transaction(async trx => {
    var query;

    query = trx.select('products.*').table('products')

      .orderBy('products.position', orderBy);


    if (req.query.search && req.query.search != '') {
      query.where('products.name', 'like', '%'.concat(req.query.search).concat('%'))
    }

    if (req.query.forPackage) {
      query.whereNotNull('products.course_type_id')
    }
    if (req.query.notforPackage) {
      query.whereNull('products.course_type_id')
    }

    if (productType) {
      query.whereIn('products.product_type_id', productType)
    }

    if (packageType) {
      query.whereIn('products.course_type_id', packageType)
    }
    if (req.query.forPackage) {
      query.whereNotNull('products.course_type_id')
    }
    if (req.query.notforPackage) {
      query.whereNull('products.course_type_id')
    }

    if ((!req.query.forList || req.query.listOnly)) {
      query.where('products.is_active', 1)
      query.join('product_types', 'product_types.id', 'products.product_type_id').where('product_types.is_active', 1)
      // query.join('course_types', 'course_types.id', 'products.course_type_id').orWhere('course_types.is_active', 1)
    }


    let count = 0
    attributesFilters.map(attribute => {
      if (req.query[attribute.slug] && req.query[attribute.slug] != '') {
        count++
      }
    })

    if (count > 0) {
      query.join('product_attributes', 'product_attributes.product_id', 'products.id')
    }

    attributesFilters.map((attribute, i) => {
      if (req.query[attribute.slug] && req.query[attribute.slug] != '') {
        if (i == 0) {
          query.where(function () {
            this.where('product_attributes.attribute_id', attribute.id)
              .whereIn('product_attributes.value_id', req.query[attribute.slug].split(','))
          })
        } else {
          query.orWhere(function () {
            this.where('product_attributes.attribute_id', attribute.id)
              .whereIn('product_attributes.value_id', req.query[attribute.slug].split(','))
          })
        }
      }
    })

    query.modify(function (queryBuilder) {
      queryBuilder.where(function () {
        this.where(function () {
          if (examID) {
            examID.map((id, i) => {
              this.orWhere('products.exam_ids', 'like', `%[${id}]%`).orWhere('products.exam_ids', 'like', `%,${id}]%`).orWhere('products.exam_ids', 'like', `%[${id},%`).orWhere('products.exam_ids', 'like', `%,${id},%`)
            })
          }
        })
        this.where(function () {
          if (courseID) {
            courseID.map((id, i) => {
              this.orWhere('products.course_ids', 'like', `%[${id}]%`).orWhere('products.course_ids', 'like', `%,${id}]%`).orWhere('products.course_ids', 'like', `%[${id},%`).orWhere('products.course_ids', 'like', `%,${id},%`)
            })
          }
        })
        this.where(function () {
          if (subjectID) {
            subjectID.map((id, i) => {
              this.orWhere('products.subject_ids', 'like', `%[${id}]%`).orWhere('products.subject_ids', 'like', `%,${id}]%`).orWhere('products.subject_ids', 'like', `%[${id},%`).orWhere('products.subject_ids', 'like', `%,${id},%`)
            })
          }
        })
        this.where(function () {
          if (chapterID) {
            chapterID.map((id, i) => {
              this.orWhere('products.chapter_ids', 'like', `%[${id}]%`).orWhere('products.chapter_ids', 'like', `%,${id}]%`).orWhere('products.chapter_ids', 'like', `%[${id},%`).orWhere('products.chapter_ids', 'like', `%,${id},%`)
            })
          }
        })
        this.where(function () {
          if (subjectIDs) {
            subjectIDs.map((id, i) => {
              this.orWhere('products.subject_ids', 'like', `%[${id}]%`).orWhere('products.subject_ids', 'like', `%,${id}]%`).orWhere('products.subject_ids', 'like', `%[${id},%`).orWhere('products.subject_ids', 'like', `%,${id},%`)
            })
          }
        })
      })
    })


    totalCount = await query.clone().count();
    totalCount = totalCount[0]['count(*)'];

    query.groupBy('products.id')

    if ((!req.query.offLimit || req.query.offLimit == false)) {
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
      error: err
    };
  })

  // Destrory process (to clean pool)
  knexConnection.destroy();



  if (products.data) {


    for (let i = 0; i < products.data.length; i++) {



      // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);

      products.data[i].upgradable_details = await knexConnection.transaction(async trx => {
        return trx.table('upgradable_products').where('product_id', products.data[i].id);
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      // Create db process (get into pool)this.state.product.reviews
      knexConnection = require('knex')(knexConnectionConfig);

      let orders = await knexConnection.transaction(async trx => {
        return trx.table('carts').select('carts.*').where('product_id', products.data[i].id).where('status', 'PURCHESED');
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      products.data[i].orders = orders ? orders.length : 0


      // products.data[i].details = products.data[i].details ? JSON.parse(products.data[i].details) : null
      // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);

      products.data[i].exams = await knexConnection.transaction(async trx => {
        return trx.table('exams').whereIn('id', JSON.parse(products.data[i].exam_ids)).orderBy('position', 'ASC');
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);

      products.data[i].courses = await knexConnection.transaction(async trx => {
        return trx.table('courses').whereIn('id', JSON.parse(products.data[i].course_ids)).orderBy('position', 'ASC');
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      if (products.data[i].subject_ids) {
        // Create db process (get into pool)
        knexConnection = require('knex')(knexConnectionConfig);

        products.data[i].subjects = await knexConnection.transaction(async trx => {
          return trx.table('subjects').whereIn('id', JSON.parse(products.data[i].subject_ids)).orderBy('position', 'ASC');
        })

        // Destrory process (to clean pool)
        knexConnection.destroy();
      }

      if (products.data[i].chapter_ids) {
        // Create db process (get into pool)
        knexConnection = require('knex')(knexConnectionConfig);

        products.data[i].chapters = await knexConnection.transaction(async trx => {
          return trx.table('chapters').whereIn('id', JSON.parse(products.data[i].chapter_ids)).orderBy('position', 'ASC');
        })

        // Destrory process (to clean pool)
        knexConnection.destroy();
      }

      // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);

      products.data[i].product_type = await knexConnection.transaction(async trx => {
        return trx.table('product_types').where('id', products.data[i].product_type_id).first();
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);

      products.data[i].package_type = await knexConnection.transaction(async trx => {
        return trx.table('course_types').where('id', products.data[i].course_type_id).first();
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      
      // Create db process (get into pool)this.state.product.reviews
      knexConnection = require('knex')(knexConnectionConfig);

      products.data[i].reviews = await knexConnection.transaction(async trx => {
        return trx.table('product_reviews').select('product_reviews.*', 'users.first_name', 'users.last_name').where('product_id', products.data[i].id).join('users', 'users.id', 'product_reviews.user_id');
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      let total = 0
      products.data[i].reviews.map(review => {
        return total += review.ratting
      })

      products.data[i].average_review = parseInt(total / products.data[i].reviews.length)

      

      products.data[i] = await checkCoupon(user, products.data[i], 'AUTOMATIC', null, req.headers['x-auth-token'])



      // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);

      let attributes = await knexConnection.transaction(async trx => {
        return trx.table('product_attributes').select('product_attributes.attribute_id', 'product_attributes.value', 'product_attributes.value_id', 'attributes.slug', 'attributes.title', 'attributes.applied_as', 'attributes.referance')
          .join('attributes', 'product_attributes.attribute_id', 'attributes.id')
          .where('product_attributes.product_id', products.data[i].id)
          .where(function () {
            this.whereNotNull('product_attributes.value').orWhereNotNull('product_attributes.value_id')
          })
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

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

        if (user && !req.query.forList) {
          products.data[i][attribute.slug] = testattributes[slug]
        }

        products.data[i][slug] = ''
        if (attribute.value_id == null) {
          products.data[i][slug] = attribute.value
        } else {

          attribute.value_id = testattributes[slug]

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

            let values = await knexConnection.transaction(async trx => {
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

            values.map(value => {

              let refe = ''
              referances.fetcher.map(ref => {
                refe = refe ? refe + ' ' + value[ref] : value[ref]
              })

              products.data[i][slug] = products.data[i][slug] ? products.data[i][slug] + ' ,' + refe : refe
            })
            attributes[slug] = {}
            attributes[slug].values = values

          } else {
            // Create db process (get into pool)
            knexConnection = require('knex')(knexConnectionConfig);

            let values = await knexConnection.transaction(async trx => {
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

            values.map(value => {
              products.data[i][slug] = products.data[i][slug] ? products.data[i][slug] + ' ,' + value["title"] : value["title"]
            })
            attributes[slug] = {}
            attributes[slug].values = values
          }
        }
      }

      products.data[i].finalAmountWithoutGst = parseAmount(products.data[i].finalAmount)
      products.data[i].amountWithoutGst = parseAmount(products.data[i].amount)


      if ((!req.query.forList || req.query.listOnly) || products.data[i].tax_included == 1) {

        products.data[i].taxIncluded = false
        products.data[i].shippingCharges = 0


        if (attributes) {
          if (attributes.taxes && attributes.taxes.values && attributes.taxes.values.length > 0 && (productDetailWithGst != 'NO' || (user && req.query.forList))) {

            let tax = attributes.taxes.values[0].amount
            let amountTax = attributes.taxes.values[0].amount
            products.data[i].tax_amount = tax
            products.data[i].tax_type = attributes.taxes.values[0].amount_type
            if (attributes.taxes.values[0].amount_type == 'PERCENT') {
              tax = products.data[i].finalAmount * (attributes.taxes.values[0].amount / 100)
              if (products.data[i].tax_included == 1) {
                amountTax = products.data[i].amount * (attributes.taxes.values[0].amount / 100)
              } else {
                amountTax = tax
              }
            }

            products.data[i].taxAmount = tax ? tax.toFixed(2) : 0
            products.data[i].finalAmount = (products.data[i].finalAmount + tax).toFixed(2)
            products.data[i].amount = (products.data[i].amount + amountTax).toFixed(2)
            products.data[i].finalAmountDisplay = `₹ ${products.data[i].finalAmount}`
            products.data[i].taxIncluded = true

          }

        }
      }

      products.data[i].amount = parseAmount(products.data[i].amount)
      products.data[i].finalAmount = parseAmount(products.data[i].finalAmount)

    }

    products.data = await replaceUploadsArray(products.data, 'cover_image');
  }


  if (products.data && user && user.type != 'ADMIN' && !req.query.listOnly && !req.query.noLog) {
    let logged_data = {
      user_id: user.id,
      action: 'VIEW_ALL_PRODUCTS',
      payload: JSON.stringify({
        field_name: 'products',
        ...req.query
      })
    }


    let logs = await createLog(logged_data)
  }


  //
  let statusCode = products.data ? 200 : 422;
  let response = {
    success: products.data ? true : false,
    products: products.data,
    error: products.error,
    totalCount: totalCount
  };

  res.status(statusCode).json(response);
}


const intersect = (arrayA, arrayB) => {
  return arrayA.filter(elem => arrayB.includes(elem));
};