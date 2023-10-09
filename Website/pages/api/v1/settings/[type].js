import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploadsArray, replaceUploads, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch setting
export default async function base(req, res) {


    // Only allowed GET only methods
    if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

    // Later parse User from JWT-header token 
    let user = await verifyToken(req);

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    let settings = await knexConnection.transaction(async trx => {
        var query;
        query = trx.select().table('settings').where('key', req.query.type)
            .where(function () {
                if (!user && !req.query.tokenAccessable) {
                    this.where('is_api_accessable', true)
                }
            })
            .first();
        return query;

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



    if (settings.data && !settings.data.parent) {

        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        let values = await knexConnection.transaction(async trx => {
            var query;
            query = trx.select().table('settings').where('parent', settings.data.id).orderBy('position', 'ASC')
                .where(function () {
                    if (!user && !req.query.tokenAccessable) {
                        this.where('is_api_accessable', true)
                    }
                })
                ;
            return query;

        })

        // Destrory process (to clean pool)
        knexConnection.destroy();
        settings.data.value = {}


        for (let j = 0; j < values.length; j++) {

            let value = values[j]
            if (value.type == 'image') {
                value.value = await replaceUploads(value.value);
            }
            settings.data.value[value.key] = value.value
        }
    } else {
        if (req.query.onArray && settings.data.type == 'multiple-fields') {

            let ArrayVal = JSON.parse(settings.data.value)
            settings.data.value = []

            ArrayVal.map(val => {
                settings.data.value.push(val[settings.data.key])
            })


        }
    }

    //
    let statusCode = settings.data ? 200 : 422;
    let response = {
        success: settings.data ? true : false,
        value: settings.data ? settings.data.value : null,
        error: settings.error
    };

    res.status(statusCode).json(response);
}