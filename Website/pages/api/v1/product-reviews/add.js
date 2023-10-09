import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Add new review
export default async function base(req, res) {

    // Only allowed POST only methods
    if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

    // Later parse User from JWT-header token 
    let user = await verifyToken(req);

    // Only ADMIN type of User allowed to insert review
    if (!user) { restrictedAccess(res); return false; }

    // Validate request with rules
    let schema = Joi.object({
        ratting: Joi.number().required(),
        product_id: Joi.number().allow(null),
        message: Joi.string().allow(null),
    });

    // If everything fine: params object would contain data
    let params = validateRequestParams(req.body, schema, res);

    // If Data Not Valid 
    if (params.status == false) { invalidFormData(res, params.error); return false; }
    else { params = params.value; }

    let currentUserCommnet = null

    if (user) {// Create db process (get into pool)
        knexConnection = require('knex')(knexConnectionConfig);

        currentUserCommnet = await knexConnection.transaction(async trx => {
            return trx.table('product_reviews').select().where('product_id', params.product_id).where('user_id', user.id).first();
        })

        // Destrory process (to clean pool)
        knexConnection.destroy();
    }


    params.user_id = user.id

    var review

    if (!currentUserCommnet) {
        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        // Insert review into database
        review = await knexConnection.transaction(async trx => {
            return trx.insert(params).into('product_reviews');
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

    //
    let statusCode = review && review.id ? 200 : 422;
    let response = {
        success: review && review.id ? true : false,
        review: review,
        id: review && review.id,
        error: currentUserCommnet ? "You can add review only once" : null,
    };


    // Send response
    res.status(statusCode).json(response);

}
