import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

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

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Update update from database
    var update = await knexConnection.transaction(async trx => {
        return trx(label).where('id', params.data.id)
            .update({ approved: params.data.approved, rejected_on: params.data.rejected_on });
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

    var title;
    var status;


    if (update.id) {

        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        // Update user in database
        var model = await knexConnection.transaction(async trx => {
            return trx(label).where('id', params.data.id).first();
        })

        // Destrory process (to clean pool)
        knexConnection.destroy();

        status = 'Pending'

        if (params.data.approved == -1) {
            status = 'Rejected'
        }
        if (params.data.approved == 1) {
            status = 'Accepted'
        }

        title = model.name != undefined ? model.name : model.title;

        let message = `Your ${label.replace('_', '').charAt(0).toUpperCase() + label.slice(1)} -> ${title} are ${status}`
        let link = `/dashbaord/notifications`

        var notice = {
            user_id: user.id,
            reciever_id: model.created_by,
            notification: message,
            redirect_url: link,
            icon: '<i className="fas fa-file-alt"></i>'
        };

        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        // Insert notification into database
        let notification = await knexConnection.transaction(async trx => {
            return trx.insert(notice).into('admin_notifications');
        }).then(res => {
            return {
                id: res[0],
                error: null
            };
        }).catch(err => {
            return {
                id: null,
                error: err
            };
        });


        // Destrory process (to clean pool)
        knexConnection.destroy();


        let timeZone = 'Asia/Kolkata';
        var CronJob = require('cron').CronJob;

        // Logger
        const logOptions = {
            timeZone: timeZone,
            folderPath: './logs/',
            dateBasedFileNaming: true,
            fileNamePrefix: 'logs_',
            fileNameSuffix: '',
            fileNameExtension: '.log',
            dateFormat: 'YYYY-MM-DD',
            timeFormat: 'HH:mm:ss.SSS',
            logLevel: 'debug',
            onlyFileLogging: true,
        };

        const log = require('node-file-logger');
        log.SetUserOptions(logOptions);


        let date = new Date();
        date.setHours(date.getHours() + 24);

        // Job #3 : Chapter Delete Job
        // var job = new CronJob('*/1 * * * *', function() {
        var Job = new CronJob(date, async function () {

            log.Info(label + ' Job ran.');

            // Create db process (get into pool)
            var knexConnection = require('knex')(knexConnectionConfig);

            // Delete chapter from database
            let data = await knexConnection.transaction(async trx => {
                return trx(label).where('approved', -1).where('id', params.data.id).update('is_active', 0);
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
            });


            // Destrory process (to clean pool)
            knexConnection.destroy();

            if (data.id) {
                log.Info('Job executed successfully.', label + ' Job', 'Delete', title);
            } else {
                log.Error('Job failed.', label + ' Job', null);
            }


        }, null, true, timeZone);

        Job.start();
    }

    //
    let statusCode = update.id ? 200 : 422;
    let response = {
        success: update.id ? true : false,
        message: update.id ? `${label.replace('_', '').charAt(0).toUpperCase() + label.slice(1)} -> ${title} are ${status}` : update.error,
    };


    // Send response
    res.status(statusCode).json(response);
}
