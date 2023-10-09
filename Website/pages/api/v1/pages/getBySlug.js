import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Get page By ID
export default async function base(req, res) {

    // Only allowed GET only methods
    if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

    // Later parse User from JWT-header token 
    let user = await verifyToken(req);

    // Only ADMIN type of User allowed to insert page
    // if (!user) { restrictedAccess(res); return false; }

    // set attributes
    let slug = req.query.slug;

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fatch page From Database
    let page = await knexConnection.transaction(async trx => {
        let query = trx.select('pages.*').table('pages').where('pages.slug', slug.replace('/', '')).orWhere('page_url', slug)
            .first();
        if (!req.query.forEdit) {
            query.where('pages.is_active', 1)
        }

        return query
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


    if (page.data) {
        // Create db process (get into pool)
        knexConnection = require('knex')(knexConnectionConfig);

        page.data.sections = await knexConnection.transaction(async trx => {

            let query
            query = trx.table('page_sections').where('page_id', page.data.id).orderBy('page_sections.position', 'ASC');

            if (!req.query.forEdit) {
                query.where('page_sections.is_active', 1)
            }

            return query
        })

        // Destrory process (to clean pool)
        knexConnection.destroy();

        if (page.data.sections) {

            console.log(page.data.sections)
            for (let j = 0; j < page.data.sections.length; j++) {


                // Create db process (get into pool)
                knexConnection = require('knex')(knexConnectionConfig);

                page.data.sections[j].sectionData = await knexConnection.transaction(async trx => {
                    return trx.table('section_values').where('page_section_id', page.data.sections[j].id);
                })


                // Destrory process (to clean pool)
                knexConnection.destroy();

                // Create db process (get into pool)
                knexConnection = require('knex')(knexConnectionConfig);

                page.data.sections[j].section = await knexConnection.transaction(async trx => {
                    return trx.table('sections').where('id', page.data.sections[j].section_id).first();
                })


                // Destrory process (to clean pool)
                knexConnection.destroy();
            }
        }

    }

    //
    let statusCode = page.data ? 200 : 422;
    let response = {
        success: page.data ? true : false,
        page: page.data,
        error: page.error
    };

    // Send Response
    res.status(statusCode).json(response);
}