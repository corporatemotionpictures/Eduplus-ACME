import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { fetchByID, fetchAll } from 'helpers/apiService';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Add new attribute
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert product_type
  if (!user) { restrictedAccess(res); return false; }


  // Validate request with rules
  let schema = Joi.object({
    product_id: Joi.number().required(),
    upgradable_id: Joi.number().allow(null),
    upgraded_cart_id: Joi.number().allow(null),
    quantity: Joi.number().allow(null),
    attributes: Joi.allow(null),
    type: Joi.allow(null),
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  let query = { noLog: true, productID: params.product_id }


  // if(params.upgraded_cart_id){
  //   query.cartID = params.upgraded_cart_id
  // }

  let activeProducts = await fetchAll('users/active-products', query, req.headers['x-auth-token'])
  let validityFrom = null


  if (activeProducts && activeProducts.productRef) {
    validityFrom = activeProducts.productRef.expDate
  }


  if ((!params.type || params.type != 'UPGRADE') && activeProducts.userProductIDs.includes(params.product_id)) {

    res.status(422).json({
      success: false,
      error: 'Product Already Activated'
    });
  } else {
    params.quantity = params.quantity ? params.quantity : 1

    let product = await fetchByID('products', params.product_id, { forUpgarde: params.type, quantity: params.quantity, forWeb: true, noLog: true, addTocart: true, upgradable_id: params.upgradable_id }, req.headers['x-auth-token']);


    if (product.success == true) {
      if (product.product.AddedToCart) {
        res.status(422).json({
          success: false,
          error: 'Product Already Added in cart'
        });
      } else {
        product = product.product

        params.user_id = user.id
        params.amount_per_quantity = product.per_amount
        params.base_price = product.qtyAmount
        params.tax_included_in_base_price = product.tax_included_in_base_price


        if (product.coupon) {
          params.coupon_id = product.coupon.id
          params.coupon_code = product.coupon.code
          params.discount_type = product.coupon.discount_type
          params.discount_amount = product.coupon.amount
          params.coupon_type = product.coupon.applied_on
          params.discount_amount_upto = product.coupon.amount_upto

        }

        // if (product.referrar) {
        //   params.referrar_discount = product.referrar.referrar_amount
        //   params.referrar_discount_type = product.referrar.referrar_discount_type
        //   params.referrar_discount_amount_upto = product.referrar.referrar_amount_upto
        //   params.referrar_id = product.referrar.referrar_id
        // }

        if (product.fixedCoupon) {
          params.fixed_discount_type = product.fixedCoupon.discount_type
          params.fixed_discount_amount = product.fixedCoupon.amount
        }
        if (product.taxIncluded) {
          params.tax_amount = product.tax_amount
          params.tax_amount_type = product.tax_type
        }
        if (product.shippingCharges) {
          params.shipping_charge = product.shippingCharges
        }


        params.status = 'ADDED'
        params.amount = product.finalAmount

        if (params.type) {
          // params.is_upgraded = 1
          params.order_type = 'UPGRADE'
          params.validity_start_from = validityFrom
        }


        var attributes;

        if (params.attributes) {
          attributes = params.attributes
          delete params.attributes
        }

        if (params.type) {
          delete params.type
        }

        params.uuid = uuidv4()

        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        // Insert attribute into database
        let cart = await knexConnection.transaction(async trx => {
          return trx.insert(params).into('carts');
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

        if (cart.id) {


          if (product.membershipCoupon && product.membershipCoupon.length > 0) {



            for (let i = 0; i < product.membershipCoupon.length; i++) {

              let membershipDiscount = {
                cart_id: cart.id,
                membership_id: product.membershipCoupon[i].membership_id,
                discount: product.membershipCoupon[i].amount,
                discount_type: product.membershipCoupon[i].discount_type,
              }

              // Create db process(get into pool)
              var knexConnection = require('knex')(knexConnectionConfig);

              // Insert attribute into database
              let membership = await knexConnection.transaction(async trx => {
                return trx.insert(membershipDiscount).into('cart_membership_discounts');
              })


              // Destrory process (to clean pool)
              knexConnection.destroy();
            }

          }



          let attrIDS = []
          var productAttributes = [];

          if (attributes) {
            attributes.map(attr => {
              if (attr) {
                attr.cart_id = cart.id
                attr.product_id = product.id
                attrIDS.push(attr.attribute_id)
                productAttributes.push(attr)
              }
            })
          }

          Object.values(product.attributes).map(attr => {

            if (!attrIDS.includes(attr.attribute_id)) {
              var array = {
                cart_id: cart.id,
                product_id: product.id,
                attribute_id: attr.attribute_id,
                value: attr.value,
                value_id: Array.isArray(attr.value_id) ? attr.value_id[0] : attr.value_id,
              };
              productAttributes.push(array)
            }
          })

          // Create db process (get into pool)
          var knexConnection = require('knex')(knexConnectionConfig);

          // Insert attribute into database
          let cartAttr = await knexConnection.transaction(async trx => {
            return trx.insert(productAttributes).into('user_product_attributes');
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
        }

        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        let carts = await knexConnection.transaction(async trx => {
          var query;

          query = trx.select('carts.*').table('carts').where('user_id', user.id)
          return query;

        })

        // Destrory process (to clean pool)
        knexConnection.destroy();

        if (cart.id && user && user.type != 'ADMIN' && !req.query.listOnly && !req.query.noLog) {
          let logged_data = {
            user_id: user.id,
            action: 'ADD_TO_CART',
            payload: JSON.stringify({
              field_name: 'products',
              field_id: params.product_id,
              ...req.query
            })
          }


          let logs = await createLog(logged_data)
        }

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
    }
    else {
      res.status(422).json({
        success: false,
        error: 'Product Not Found'
      });
    }

  }




}
