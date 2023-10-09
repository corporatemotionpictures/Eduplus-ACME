import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, checkToken, restrictedAccess, verifyToken, invalidFormData } from 'helpers/api';

// Function to Update posts
export default async function base(req, res) {

    // Only allowed POST only methods
    if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

    let schemaVaribles = {
        id: Joi.number().required(),
        status: Joi.string().required()
    };

    // Validate request with rules
    let schema = Joi.object(schemaVaribles);

    // If everything fine: params object would contain data
    let params = validateRequestParams(req.body, schema, res);

    // If Data Not Valid 
    if (params.status == false) { invalidFormData(res, params.error); return false; }
    else { params = params.value; }

    // Later parse User from JWT-header token 
    let user = await verifyToken(req);

    // Only ADMIN type of User allowed to insert posts
    if (!user && user.type != 'ADMIN') { restrictedAccess(res); return false; }

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Update raiseTicket in database
    let raiseTicket = await knexConnection.transaction(async trx => {
        return trx('tickets').where('id', params.id).update(params);
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

    //
    let statusCode = raiseTicket.id ? 200 : 422;
    let response = {
        success: raiseTicket.id ? true : false,
        raiseTicket: raiseTicket
    };

    // Destrory process (to clean pool)
    knexConnection.destroy();

    // Send response
    res.status(statusCode).json(response);
}
