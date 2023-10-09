import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Function to Update subject
export default async function base(req, res) {

    // Only allowed POST only methods
    if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

    // Later parse User from JWT-header token 
    let user = await verifyToken(req);

    // Only ADMIN type of User allowed to insert course
    if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }



    // Validate request with rules
    let schema = Joi.object({
        id: Joi.number().required(),
        status: Joi.string().allow(null),
    });


    // If everything fine: params object would contain data
    let params = validateRequestParams(req.body, schema, res);

    // If Data Not Valid 
    if (params.status == false) { invalidFormData(res, params.error); return false; }
    else { params = params.value; }

    // Set carts
    let id = params.id;


    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Update update from database
    var update = await knexConnection.transaction(async trx => {
        return trx('orders').where('id', id)
            .update('status', params.status);
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

    //
    let statusCode = update ? 200 : 422;
    let response = {
        success: update ? true : false,
    };


    // Send response
    res.status(statusCode).json(response);
}
