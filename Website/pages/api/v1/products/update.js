import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import rn from 'random-number';
import slugify from 'slugify';
import { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, restrictedAccess, verifyToken, invalidFormData } from 'helpers/api';

// Function to Update product
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert product
  if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }


  // Validate request with rules
  let schema = Joi.object({
    id: Joi.number().required(),
    exam_ids: Joi.string().allow(null),
    course_ids: Joi.string().allow(null),
    subject_ids: Joi.string().allow(null),
    chapter_ids: Joi.string().allow(null),
    batch_ids: Joi.string().allow(null),
    course_type_id: Joi.number().allow(null),
    product_type_id: Joi.number().allow(null),
    name: Joi.string().allow(null),
    slug: Joi.string().allow(null),
    description: Joi.string().allow(null),
    amount: Joi.string().allow(null),
    product_url: Joi.string().allow(null),
    model: Joi.string().allow(null),
    is_upgradable: Joi.number().allow(null),
    // upgradable_amount: Joi.number().allow(null),
    // upgradable_duration: Joi.number().allow(null),
    upgradable_details: Joi.allow(null),
    details: Joi.allow(null),
    cover_image: Joi.allow(null),
    attributes: Joi.allow(null),
    tax_included: Joi.number().allow(null),
  });


  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }


  if (params.tax_included) {

    params.tax_included = params.tax_included ? params.tax_included : 0
  }
  // Set products
  let id = params.id;

  if (params.values) {
    var values = Object.values(params.values)
    delete params.values
  }


  var attributes = null
  if (params.attributes) {
    attributes = params.attributes

    if (params.batch_ids) {
      attributes.batches = {
        value_id: params.batch_ids
      }
    }
    delete params.batch_ids
    delete params.attributes
  }

  if (params.details) {
    params.details = JSON.stringify(Object.values(params.details))
  } else {
    params.details = null
  }

  if (params.tax_included == 1) {
    if (attributes.taxes) {

      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      // Fetch subject from database
      let taxes = await knexConnection.transaction(async trx => {
        return trx.select().table('taxes').where('id', attributes.taxes.value_id).first();

      })

      // Destrory process (to clean pool)
      knexConnection.destroy();



      if (taxes) {
        // tax = taxes.amount
        if (taxes.amount_type == "PERCENT") {
          // tax = (params.amount) / (taxes.amount / 100)
          params.amount = (params.amount * 100) / (100 + taxes.amount)
        } else {

          params.amount = params.amount - taxes.amount
        }
      }
    } else {
      params.amount = (params.amount * 100) / (100 + 18)
    }

  }


  if (params.name && !params.slug) {

    // Add slug
    params.slug = slugify(params.name, {
      replacement: '-',
      remove: /[*+~.()'"!:@/]/g,
      lower: true,
    })

    // Gernrate Random Numbers
    var options = {
      min: 1000,
      max: 9999,
      integer: true
    }

    let random = rn(options);

    // params.slug = params.slug.concat('-').concat(random)
  }


  let productBySlug = null

  if (params.slug) {
    params.slug = params.slug.replace(/[*+~.()'"!:@/]/g, '-')

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fetch subject from database
    productBySlug = await knexConnection.transaction(async trx => {
      return trx.select().table('products').where('slug', params.slug).whereNot('id', params.id).first();

    })

    // Destrory process (to clean pool)
    knexConnection.destroy();
  }

  if (productBySlug) {

    let response = {
      success: false,
      error: 'Product Slug Already Exist'
    };

    // Send response
    res.status(422).json(response);

  } else {

    let upgradable_details = null
    if (params.upgradable_details) {

      upgradable_details = params.upgradable_details
      delete params.upgradable_details
    }


    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Update product in database
    let product = await knexConnection.transaction(async trx => {
      return trx('products').select('products.*').where('id', id).update(params);
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


    if (upgradable_details) {

      upgradable_details = Object.values(upgradable_details)
      upgradable_details = upgradable_details.map(detail => {
        detail.product_id = id
        return detail
      })


      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      // Update product in database
      let deleteUpgrade = await knexConnection.transaction(async trx => {
        return trx('upgradable_products').where('product_id', id).del();
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();


      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      // Update product in database
      upgradable_details = await knexConnection.transaction(async trx => {
        return trx('upgradable_products').insert(upgradable_details);
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

    }


    if (product.id) {

      if (attributes) {


        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        // Fetch subject from database
        let remove = await knexConnection.transaction(async trx => {
          return trx.select().table('product_attributes').where('product_id', id).del();
        })

        // Destrory process (to clean pool)
        knexConnection.destroy();

        var productAttributes = []



        for (let j = 0; j < Object.keys(attributes).length; j++) {

          let slug = Object.keys(attributes)[j]
          let values = attributes[slug]

          // Create db process (get into pool)
          var knexConnection = require('knex')(knexConnectionConfig);

          // Fetch subject from database
          let attr = await knexConnection.transaction(async trx => {
            return trx.select().table('attributes').where('slug', slug).first();

          })

          // Destrory process (to clean pool)
          knexConnection.destroy();


          if (attr) {

            let id = attr.id

            let data = {}

            if (values['value']) {

              data = {
                attribute_id: id,
                product_id: params.id,
                value: values['value']
              }

              productAttributes.push(data)
            }
            else {
              if (values.value_id) {
                let valueIDs = values.value_id.includes('[') ? values.value_id.replace('[', '').replace(']', '') : values.value_id
                valueIDs = valueIDs.split(',')

                valueIDs.map(valueID => {


                  data = {
                    attribute_id: id,
                    product_id: params.id,
                    value_id: valueID && valueID != '' ? parseInt(valueID) : null
                  }

                  productAttributes.push(data)

                })
              } else {
                Object.values(values).map((label) => {
                  if (label.value) {

                    data = {
                      attribute_id: id,
                      product_id: params.id,
                      value: label.value
                    }

                    productAttributes.push(data)
                  }
                })
              }
            }
          }
        }

        // Create db process (get into pool)
        knexConnection = require('knex')(knexConnectionConfig);

        // Insert product into database
        let productValues = await knexConnection.transaction(async trx => {
          return trx.insert(productAttributes).into('product_attributes');
        }).then(res => {
          return {
            id: res[0],
            error: null
          };
        }).catch(err => {
          return {
            id: null,
            error: err
          };
        })

        // Destrory process (to clean pool)
        knexConnection.destroy();
      }
    }


    //
    let statusCode = product.id ? 200 : 422;
    let response = {
      success: product.id ? true : false,
      product: product
    };

    // Send response
    res.status(statusCode).json(response);
  }
}
