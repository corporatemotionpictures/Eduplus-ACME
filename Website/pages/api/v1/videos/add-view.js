import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, getComments, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Get video By ID
export default async function base(req, res) {

    // Only allowed GET only methods
    if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

    // Later parse User from JWT-header token 
    let user = await verifyToken(req);

    // Only ADMIN type of User allowed to insert course
    if (!user) { restrictedAccess(res); return false; }

    // set attributes
    let videoID = req.query.videoID;

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fatch video From Database
    let video = await knexConnection.transaction(async trx => {
        return trx.select().table('videos')
            .where('id', videoID).first();
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

    if (video.data && user.type != 'ADMIN') {

        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        // Update user in database
        user = await knexConnection.transaction(async trx => {
            return trx('users').increment("video_count", 1).where('id', user.id);
        })

        // Destrory process (to clean pool)
        knexConnection.destroy();

    }

    //
    let statusCode = video.data ? 200 : 422;
    let response = {
        success: video.data ? true : false,
    };

    // Send Response
    res.status(statusCode).json(response);
}