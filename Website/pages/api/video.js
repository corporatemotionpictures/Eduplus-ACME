import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { fetchAll } from 'helpers/apiService';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, CourseID, checkPackage, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';
import fetch from 'isomorphic-unfetch';
// Function to Fetch Users
export default async function base(req, res) {
    // Only allowed GET only methods
    if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }
    // Later parse User from JWT-header token 
    let user = await verifyToken(req);
    let orderBy = req.query.order_by ? req.query.order_by : 'ASC';
    let quality = req.query.quality ? Number.parseInt(req.query.quality) : null;
    var knexConnection = require('knex')(knexConnectionConfig);
    // Fetch video from database
    let videos = await knexConnection.transaction(async trx => {
        let query;
        // 
        query = trx.select('videos.*').table('videos').whereNull('thumbnail')
            .orderBy('videos.position', orderBy);
        return query;
    }).then(res => {
        return {
            data: res,
            error: null
        };
    }).catch(err => {
        return {
            data: null,
            error: err
        };
    })
    // Destrory process (to clean pool)
    knexConnection.destroy();
    var completeDuration = 0;
    if (videos.data) {
        for (let i = 0; i < videos.data.length; i++) {
            let params = {}
            videos.data[i].video_id = videos.data[i].video_id.replace('/videos/', "");
            let url = `https://player.vimeo.com/video/${videos.data[i].video_id}/config`;
            if (quality != null) {
                url = url + '?quality=' + quality;
            }
            let vimeoData = await fetch(url)
                .then(res => res.json())
                .then(res => {
                    if (res.video) {
                        let vimeo = {
                            thumbnailUrl: res.video ? res.video.thumbs['640'] : null,
                            videoUrl: res.request ? res.request.files.hls.cdns[res.request.files.hls.default_cdn].url : null,
                            embed: res.video ? res.video.embed_code : null,
                            timestamp: res.request ? res.request.timestamp : null,
                            duration: res.video ? res.video.duration : null
                        }
                        params.thumbnail = vimeo.thumbnailUrl;
                        params.duration = vimeo.duration;
                        // videos.data[i].res = res;
                    }
                });
            // Create db process (get into pool)
            var knexConnection = require('knex')(knexConnectionConfig);
            // Update data in database
            let video = await knexConnection.transaction(async trx => {
                return trx('videos').where('id', videos.data[i].id).update(params);
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
        }
    }
    //
    let statusCode = videos.data ? 200 : 422;
    let response = {
        success: true
    };
    res.status(statusCode).json(response);
}