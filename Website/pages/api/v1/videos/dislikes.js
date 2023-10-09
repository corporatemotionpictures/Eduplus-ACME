import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch likes
export default async function base(req, res) {

    // Only allowed GET only methods
    if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

    // Later parse User from JWT-header token 
    let user = await verifyToken(req);

    // Only ADMIN type of User allowed to insert user
    if (!user) { restrictedAccess(res); return false; }

    // Filters
    let orderBy = req.query.order_by ? req.query.order_by : 'ASC';

    let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
    let userID = req.query.userID ? Number.parseInt(req.query.userID) : null;
    let videoID = req.query.videoID ? Number.parseInt(req.query.videoID) : null;

    // Set attributes
    let attributes = {
        user_first_name: 'users.first_name',
        user_last_name: 'users.last_name',
        user_image: 'users.image'
    };

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fetch likes from database
    let dislikes = await knexConnection.transaction(async trx => {
        if (userID) {
            return trx.select('video_likes.*', attributes).table('video_likes')
                .innerJoin('users', 'video_likes.user_id', 'users.id')
                .where('video_likes.user_id', userID)
                .where('video_likes.type', 'DISLIKE')
                .orderBy('video_likes.id', orderBy).offset(offset);
        }
        else if (videoID) {
            return trx.select('video_likes.*', attributes).table('video_likes')
                .innerJoin('users', 'video_likes.user_id', 'users.id')
                .innerJoin('videos', 'video_likes.video_id', 'videos.id')
                .where('video_likes.video_id', videoID)
                .where('video_likes.type', 'DISLIKE')
                .orderBy('video_likes.id', orderBy).offset(offset);
        }
        else {
            return trx.select('video_likes.*', attributes).table('video_likes')
                .innerJoin('users', 'video_likes.user_id', 'users.id')
                .innerJoin('videos', 'video_likes.video_id', 'videos.id')
                .where('video_likes.type', 'DISLIKE')
                .orderBy('video_likes.id', orderBy).offset(offset);
        }
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

    if (dislikes.data) {

        dislikes.data = await replaceUploadsArray(dislikes.data, 'user_image');

    }


    //
    let statusCode = dislikes.data ? 200 : 422;
    let response = {
        success: dislikes.data ? true : false,
        dislikes: dislikes.data,
        error: dislikes.error
    };

    // Send response
    res.status(statusCode).json(response);
}