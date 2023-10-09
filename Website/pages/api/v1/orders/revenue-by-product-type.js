import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import moment from 'moment';
import { getOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Function to Update subject
export default async function base(req, res) {

    // Only allowed get only methods
    if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

    // Later parse User from JWT-header token 
    let user = await verifyToken(req);

    // Only ADMIN type of User allowed to insert course
    if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }

    // If everything fine: params object would contain data
    let params = req.body;

    // Set attributes
    let label = params.label;


    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    let productTypes = await knexConnection.transaction(async trx => {
        var query;
        query = trx.select('product_types.*').table('product_types').orderBy('product_types.position', 'ASC').where('product_types.is_active', 1)

        return query;

    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    let revenues = []

    if (productTypes) {
        for (let i = 0; i < productTypes.length; i++) {

            // Create db process (get into pool)
            var knexConnection = require('knex')(knexConnectionConfig);

            let products = await knexConnection.transaction(async trx => {
                var query;
                query = trx.select().table('products').orderBy('products.position', 'ASC')
                    .where('products.product_type_id', productTypes[i].id)
                    .where('products.is_active', 1).pluck('id')

                return query;

            })

            // Destrory process (to clean pool)
            knexConnection.destroy();


            let ids = products


            if (req.query.format == 'yearly') {

                // Create db process (get into pool)
                var knexConnection = require('knex')(knexConnectionConfig);

                productTypes[i].totalPrice = await knexConnection.transaction(async trx => {
                    var query = trx.select().table(`orders`)
                        .join('carts', 'carts.order_id', 'orders.id')
                        .join('products', 'products.id', 'carts.product_id')
                        .whereIn('products.id', ids)
                        .where('orders.status', 'SUCCESS')
                        .count(`orders.id as total`).where(trx.raw("Year(orders.created_at)"), '=', req.query.year);

                    return query;
                });

                // Destrory process (to clean pool)
                knexConnection.destroy();

            } else if (req.query.format == 'monthly') {

                // Create db process (get into pool)
                var knexConnection = require('knex')(knexConnectionConfig);

                productTypes[i].totalPrice = await knexConnection.transaction(async trx => {
                    var query = trx.select().table(`orders`)
                        .join('carts', 'carts.order_id', 'orders.id')
                        .join('products', 'products.id', 'carts.product_id')
                        .whereIn('products.id', ids)
                        .where('orders.status', 'SUCCESS')
                        .count(`orders.id as total`)
                        .where(trx.raw("Year(orders.created_at)"), '=', moment(req.query.month).format('YYYY'))
                        .where(trx.raw("Month(orders.created_at)"), '=', moment(req.query.month).format('MM'));

                    return query;
                });

                // Destrory process (to clean pool)
                knexConnection.destroy();

            } else {

                // Create db process (get into pool)
                var knexConnection = require('knex')(knexConnectionConfig);

                productTypes[i].totalPrice = await knexConnection.transaction(async trx => {
                    var query = trx.select().table(`orders`)
                        .join('carts', 'carts.order_id', 'orders.id')
                        .join('products', 'products.id', 'carts.product_id')
                        .whereIn('products.id', ids)
                        .where('orders.status', 'SUCCESS')
                        .count(`orders.id as total`);

                    return query;
                });

                // Destrory process (to clean pool)
                knexConnection.destroy();

            }

            let value = productTypes[i].totalPrice[0] ? productTypes[i].totalPrice[0].total : 0
            value = value ? value : 0


            if (value != 0) {
                revenues.push({
                    name: productTypes[i].title,
                    value: value
                })
            }

            // revenues[productTypes[i].title] = productTypes[i].totalPrice[0].total
        }
    }

    //
    let statusCode = productTypes ? 200 : 422;
    let response = {
        revenues: revenues
    };


    // Send response
    res.status(statusCode).json(response);
}
