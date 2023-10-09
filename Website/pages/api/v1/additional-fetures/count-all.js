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
    // if (!user || user.type != 'ADMIN' || user.type != 'MANAGEMENT') { restrictedAccess(res); return false; }

    // If everything fine: params object would contain data
    let params = req.body;

   
    // Set attributes
    let label = params.label;

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    let totalCount = await knexConnection.transaction(async trx => {
        var query = trx.select().table(`${params.label}`);

        if (params.data) {
            Object.keys(params.data).map(key => {
                if (key != 'sum') {
                    query.where(`${params.label}.${key}`, params.data[key])
                }
            })

            if (params.data.sum) {
                query.sum(`${params.data.sum} as total`)
            }
        }

        return query;
    });

    // Destrory process (to clean pool)
    knexConnection.destroy();

    let totalCountResponse = totalCount

    if (!params.data || !params.data.sum) {
        totalCountResponse = totalCount ? totalCount.length : 0
    } else if (params.data && params.data.sum) {
        totalCountResponse = totalCount && totalCount[0]  ? totalCount[0].total : 0
    }

    //
    let statusCode = totalCount ? 200 : 422;
    let response = {
        totalCount: totalCountResponse
    };


    // Send response
    res.status(statusCode).json(response);
}
