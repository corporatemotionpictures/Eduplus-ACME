import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { getSettings } from 'helpers/apiService';
import { isEmptyArray } from 'formik';
import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';
import rn from 'random-number';
import { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Add new attribute
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert attribute
  if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }


  // Validate request with rules
  let schema = Joi.object({
    exam_ids: Joi.string().required(),
    course_ids: Joi.string(),
    subject_ids: Joi.string().allow(null),
    chapter_ids: Joi.string().allow(null),
    course_type_id: Joi.number().allow(null),
    batch_ids: Joi.string().allow(null),
    product_type_id: Joi.number(),
    name: Joi.string().required(),
    slug: Joi.string().allow(null),
    description: Joi.string().required(),
    model: Joi.string().allow(null),
    details: Joi.allow(null),
    cover_image: Joi.allow(null),
    attributes: Joi.allow(null),
    // amount: Joi.string().required(),
    // is_upgradable: Joi.number().allow(null),
    // upgradable_amount: Joi.number().allow(null),
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  if (!params.slug) {
    // Add slug
    params.slug = slugify(params.name, {
      replacement: '-',
      remove: /[*+~.()'"!:@/]/g,
      lower: true,
    })
  } else {
    params.slug = params.slug.replace(/[*+~.()'"!:@/]/g, '-')
  }

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch subject from database
  let productBySlug = await knexConnection.transaction(async trx => {
    return trx.select().table('products').where('slug', params.slug).first();

  })

  // Destrory process (to clean pool)
  knexConnection.destroy();

  if (productBySlug) {

    let response = {
      success: false,
      error: 'Product Slug Already Exist'
    };

    // Send response
    res.status(422).json(response);

  } else {

    params.group_id = uuidv4()

    var allattributes = params.attributes

    delete params.attributes
    delete params.cover_image

    if (params.details) {
      params.details = JSON.stringify(Object.values(params.details))
    }

    let addCount = 0
    let batches = null
    let productIds = []

    if (params.batch_ids) {
      batches = params.batch_ids
      delete params.batch_ids
    }

    let slug = params.slug
    let name = params.name

    for (let index = 0; index < Object.values(allattributes).length; index++) {

      let attributes = Object.values(allattributes)[index]

      if (batches) {
        attributes.batches = {
          value_id: batches
        }
      }

      params.uuid = uuidv4()
      params.amount = parseFloat(attributes.amount)
      params.is_upgradable = attributes.is_upgradable
      params.tax_included = attributes.tax_included ? attributes.tax_included : 0

      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      // Fetch subject from database
      let validity = await knexConnection.transaction(async trx => {
        return trx.select().table('validities').where('id', attributes.validity.value_id).first();

      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      validity.slug = validity.title.replace(' ', "-")

      params.slug = slug.concat(`-${validity.slug}`)

      if(Object.values(allattributes).length > 1){
        params.name = name.concat(` ${validity.title}`)
      }
      
      // Gernrate Random Numbers
      var options = {
        min: 1000,
        max: 9999,
        integer: true
      }
      
      let random = rn(options);


      if(attributes.product_url){
        params.product_url = attributes.product_url
      }

      delete attributes.product_url

      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      // Fetch subject from database
      productBySlug = await knexConnection.transaction(async trx => {
        return trx.select().table('products').where('slug', params.slug).first();

      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      if (productBySlug) {
        params.slug = params.slug.concat('-').concat(random)
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
            if (taxes.amount_type == "PERCENT") {
              params.amount = (params.amount * 100) / (100 + taxes.amount)
            } else {
              params.amount = params.amount - taxes.amount
            }
          }
        } else {
          params.amount = (params.amount * 100) / (100 + 18)
        }

      }

      delete attributes.amount
      delete attributes.is_upgradable

      let upgradable_details = null
      if (attributes.upgradable_details) {

        upgradable_details = attributes.upgradable_details
        delete attributes.upgradable_details
      }

      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      // Fetch subject from database
      let position = await knexConnection.transaction(async trx => {
        return trx.select().table('products').orderBy('position', 'DESC').first();

      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      params.position = position ? parseInt(position.position) + 1 : 1;

      let productDefaultImage = await getSettings('productDefaultImage');

      params.cover_image = productDefaultImage;

      if(!params.amount || params.amount == ''){
        params.amount = 0
      }

      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      // Insert attribute into database
      let product = await knexConnection.transaction(async trx => {
        return trx.insert(params).into('products');
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


      if (product.id) {
        addCount++
        productIds.push(product.id)

        if (upgradable_details) {

          upgradable_details = Object.values(upgradable_details)
          upgradable_details = upgradable_details.map(detail => {
            detail.product_id = product.id
            return detail
          })

          // Create db process (get into pool)
          var knexConnection = require('knex')(knexConnectionConfig);

          // Update product in database
          upgradable_details = await knexConnection.transaction(async trx => {
            return trx('upgradable_products').insert(upgradable_details);
          })

          // Destrory process (to clean pool)
          knexConnection.destroy();

        }

      }

      if (product.id) {

        var productAttributes = []

        for (let j = 0; j < Object.keys(attributes).length; j++) {

          let key = Object.keys(attributes)[j]

          let values = attributes[key]
          let slug = key

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
                product_id: product.id,
                value: values['value']
              }

              productAttributes.push(data)
            }
            else {
              if (values.value_id && values.value_id != '') {

                if (values.value_id.includes('[')) {
                  values.value_id = values.value_id.replace('[', '');
                  values.value_id = values.value_id.replace(']', '')
                }

                let valueIDs = values.value_id.split(',')

                for (let k = 0; k < valueIDs.length; k++) {

                  let valueID = valueIDs[k]

                  data = {
                    attribute_id: id,
                    product_id: product.id,
                    value_id: valueID
                  }

                  productAttributes.push(data)
                }

              } else {
                for (let k = 0; k < Object.values(values).length; k++) {

                  let label = Object.values(values)[k]

                  if (label.value) {

                    data = {
                      attribute_id: id,
                      product_id: product.id,
                      value: label.value
                    }

                    productAttributes.push(data)

                  }
                }

              }
            }
          }
        }

        productAttributes = productAttributes.filter(attr => attr.value_id != '')


        // Create db process (get into pool)
        knexConnection = require('knex')(knexConnectionConfig);

        // Insert product into database
        let productValues = await knexConnection.transaction(async trx => {
          return trx.insert(productAttributes).into('product_attributes');
        }).then(res => {
          return {
            id: res,
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
    let statusCode = addCount > 0 ? 200 : 422;
    let response = {
      success: addCount > 0 ? true : false,
      id: productIds
    };


    // Send response
    res.status(statusCode).json(response);
  }

}
