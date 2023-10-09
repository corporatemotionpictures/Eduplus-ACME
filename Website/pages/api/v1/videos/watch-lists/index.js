import { getOnly, createLog, replaceUploads, replaceUploadsArray, injectMethodNotAllowed, restrictedAccess, verifyToken, checkPackage } from 'helpers/api';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { fetchAll } from 'helpers/apiService';
import fetch from 'isomorphic-unfetch';


// Login
export default async function (req, res) {

    // Only allowed GET only methods
    if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

    // Later parse User from JWT-header token 
    let user = await verifyToken(req);

    // Only ADMIN type of User allowed to insert course
    if (!user) { restrictedAccess(res); return false; }

    let includeVimeo = req.query.includeVimeo ? req.query.includeVimeo : false;

    var activeproducts = null;
    var languagesAccess = null;
    var chapterAccess = null;
    var accessable = true;
    if (user && user.type != 'ADMIN' && !req.query.forList) {
        activeproducts = await fetchAll('users/active-products', { field: "videos", access: true, noLog: true }, req.headers['x-auth-token'])
        chapterAccess = activeproducts.access && activeproducts.access.chapterIDs.length > 0
        languagesAccess = activeproducts.access && activeproducts.access.languagesAccess
        accessable = activeproducts.access && activeproducts.access.subjectIDs.length != 0
    }


    let watchlists = {
        data: {},
        error: null
    }

    if (!languagesAccess || Object.keys(languagesAccess).length > 0) {

        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        // Fatch log From Database
        watchlists = await knexConnection.transaction(async trx => {
            return trx.select('video_watchlist.*').table('video_watchlist').innerJoin('videos', 'videos.id', 'video_watchlist.video_id').where('video_watchlist.user_id', user.id).where('videos.status', 'active').orderBy('video_watchlist.created_at', 'DESC');
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

    }
    var payload = '';
    var video = '';
    var videos = [];
    var array = [];

    if (watchlists.data) {

        for (let i = 0; i < watchlists.data.length; i++) {
            if (!array.includes(watchlists.data[i].video_id)) {
                array.push(watchlists.data[i].video_id)

                if (!languagesAccess || Object.keys(languagesAccess).length > 0) { // Create db process (get into pool)
                    knexConnection = require('knex')(knexConnectionConfig);

                    // Fatch video From Database
                    video = await knexConnection.transaction(async trx => {

                        let query;
                        query = trx.select().table('videos')
                            .where('id', watchlists.data[i].video_id).where('status', 'active').first();


                        query.where(function () {

                            if (languagesAccess && chapterAccess) {
                                Object.keys(languagesAccess).map((id, i) => {
                                    id = parseInt(id)
                                    this.orWhere(function () {
                                        this.where(function () {
                                            this.where('chapter_ids', 'like', `%[${id}]%`).orWhere('chapter_ids', 'like', `%,${id}]%`).orWhere('chapter_ids', 'like', `%[${id},%`).orWhere('chapter_ids', 'like', `%,${id},%`)
                                        }).whereIn('language_id', languagesAccess[id])
                                    })
                                })
                            }
                            else if (languagesAccess) {
                                Object.keys(languagesAccess).map((id, i) => {
                                    id = parseInt(id)
                                    this.orWhere(function () {
                                        this.where(function () {
                                            this.where('subject_ids', 'like', `%[${id}]%`).orWhere('subject_ids', 'like', `%,${id}]%`).orWhere('subject_ids', 'like', `%[${id},%`).orWhere('subject_ids', 'like', `%,${id},%`)
                                        }).whereIn('language_id', languagesAccess[id])
                                    })
                                })
                            }
                        })


                        return query
                    })

                    // Destrory process (to clean pool)
                    knexConnection.destroy();
                }

                if (video) {

                    let uri = video.video_id;
                    if (includeVimeo == true) {
                        video.video_id = video.video_id.replace('/videos/', "");

                        let vimeoData = await fetch(`https://player.vimeo.com/video/${video.video_id}/config`)
                            .then(res => res.json())
                            .then(res => {
                                let vimeo = {

                                    thumbnailUrl: res.video.thumbs['640'],
                                    videoUrl: res.request.files.hls.cdns[res.request.files.hls.default_cdn].url,
                                    embed: res.video.embed_code,
                                    timestamp: res.request.timestamp,
                                    duration: res.video.duration
                                }

                                video.thumbnailUrl = vimeo.thumbnailUrl;
                                video.videoUrl = vimeo.videoUrl;
                                video.embed = vimeo.embed;
                                video.timestamp = vimeo.timestamp;
                                video.duration = vimeo.duration;
                            });

                    }

                    video.watchDate = watchlists.data[i].created_at;


                    if (video) {
                        knexConnection = require('knex')(knexConnectionConfig);


                        // Combine course with course id
                        video.courses = await knexConnection.transaction(async trx => {
                            return trx.select().table('courses').whereIn('courses.id', JSON.parse(video.course_ids));
                        });

                        // Destrory process (to clean pool)
                        knexConnection.destroy();

                        // Create db process (get into pool)
                        knexConnection = require('knex')(knexConnectionConfig);


                        // Combine subject with subject id
                        video.subjects = await knexConnection.transaction(async trx => {
                            return trx.select().table('subjects').whereIn('subjects.id', JSON.parse(video.subject_ids));
                        });

                        // Destrory process (to clean pool)
                        knexConnection.destroy();

                        // Create db process (get into pool)
                        knexConnection = require('knex')(knexConnectionConfig);


                        // Combine chapter with chapter id
                        video.chapters = await knexConnection.transaction(async trx => {
                            return trx.select().table('chapters').whereIn('chapters.id', JSON.parse(video.chapter_ids));
                        })

                        // Destrory process (to clean pool)
                        knexConnection.destroy();

                        // Create db process (get into pool)
                        var knexConnection = require('knex')(knexConnectionConfig);

                        // Fatch user From Database
                        let userData = await knexConnection.transaction(async trx => {
                            return trx.select('video_view_limit', 'video_count').table('users').where('id', user.id).first();
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

                        video.locked = (userData.data.video_view_limit <= userData.data.video_count) ? true : false;

                        if (video.locked != true) {
                            video.locked = await checkPackage(req.headers['x-auth-token'], video.subject_ids, video.mode, 'videos', null, video.language_id, activeproducts, video.chapter_ids)
                        }


                    }

                }

                videos[i] = video;
            }
        }

    }


    if (videos) {
        videos = videos.filter(data => data.locked == false)
    }

    // Set Response
    let response = {
        'success': videos ? true : false,
        'videos': videos ? videos : null
    };

    let statusCode = videos ? 200 : 400;

    // Send Response
    res.status(statusCode).json(response);
}