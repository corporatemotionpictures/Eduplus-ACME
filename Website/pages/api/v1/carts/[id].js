import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed, checkCoupon } from 'helpers/api';

// Function to Get product By ID
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert product
  if (!user) { restrictedAccess(res); return false; }

  // set products
  let id = req.query.id;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fatch product From Database
  let product = await knexConnection.transaction(async trx => {
    return trx.select().table('products').where('id', id).first();
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

  if (product.data) {

    product.data = await checkCoupon(user, product.data, 'AUTOMATIC', null , req.headers['x-auth-token'])

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    product.data.exams = await knexConnection.transaction(async trx => {
      return trx.table('exams').whereIn('id', JSON.parse(product.data.exam_ids)).orderBy('position', 'ASC');
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    product.data.courses = await knexConnection.transaction(async trx => {
      return trx.table('courses').whereIn('id', JSON.parse(product.data.course_ids)).orderBy('position', 'ASC');
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    if (product.data.subject_ids) {
      // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);

      product.data.subjects = await knexConnection.transaction(async trx => {
        return trx.table('subjects').whereIn('id', JSON.parse(product.data.subject_ids)).orderBy('position', 'ASC');
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();
    }

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    product.data.product_type = await knexConnection.transaction(async trx => {
      return trx.table('product_types').where('id', product.data.product_type_id);
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    product.data.package_type = await knexConnection.transaction(async trx => {
      return trx.table('course_types').where('id', product.data.course_type_id);
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    let attributes = await knexConnection.transaction(async trx => {
      return trx.table('product_attributes').select('product_attributes.*', 'attributes.slug', 'attributes.title', 'attributes.applied_as', 'attributes.referance')
        .join('attributes', 'product_attributes.attribute_id', 'attributes.id')
        .where('product_attributes.product_id', product.data.id)
        .where(function(){
          this.whereNotNull('product_attributes.value').orWhereNotNull('product_attributes.value_id')

        })
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    product.data['attributes'] = {}
    var testattributes = {}

    for (let j = 0; j < attributes.length; j++) {
      let attribute = attributes[j]
      let value = attribute.value_id == null ? attribute.value : attribute.value_id
      let label = attribute.value_id == null ? 'value' : 'value_id'
      let slug = `${attribute.slug}-${attribute.attribute_id}`

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
        product.data[attribute.slug] = testattributes[slug]
      }

      product.data['attributes'][slug] = attribute
      if (attribute.value_id == null) {
        product.data['attributes'][slug].values = testattributes[slug]
      } else {

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
                }
                else {
                  queryBuilder.where('id', testattributes[slug])
                }
              }).orderBy('position', 'ASC');
          })

          // Destrory process (to clean pool)
          knexConnection.destroy();
        }
        else {
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
        }


      }



    }


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