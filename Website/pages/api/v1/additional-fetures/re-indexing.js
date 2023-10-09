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

    // If everything fine: params object would contain data
    let params = req.body;


    // Set attributes
    let label = params.label;

    var update = true;
    params.data.map(async (param) => {
        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        // Update update from database
        update = await knexConnection.transaction(async trx => {
            return knexConnection(label).where('id', param.id).update('position', param.position);
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
    })
    
    //
    let statusCode = update ? 200 : 422;
    let response = {
        success: update ? true : false,
    };


    // Send response
    res.status(statusCode).json(response);
}
