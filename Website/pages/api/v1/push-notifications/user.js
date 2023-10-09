import { knexConnectionConfig } from 'db/knexConnection';
import moment from 'moment';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch push Notification
export default async function base(req, res) {

    // Only allowed GET only methods
    if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

    let courseID = req.query.courseID ? req.query.courseID.split(',') : null;
    let productID = req.query.productID ? req.query.productID.split(',') : null;

    // Later parse User from JWT-header token 
    let user = await verifyToken(req);

    // Only ADMIN type of User allowed to insert push Notification
    if (!user) { restrictedAccess(res); return false; }


    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    let pushNotifications = await knexConnection.transaction(async trx => {
        let query = trx.select().table('push_notifications')
            .where('user_id', user.id).orderBy('created_at', 'DESC');

        query.modify(function (queryBuilder) {
            queryBuilder.where(function () {
                this.where(function () {
                    if (productID) {
                        productID.map((id, i) => {
                            this.orWhere('product_ids', 'like', `%[${id}]%`).orWhere('product_ids', 'like', `%,${id}]%`).orWhere('product_ids', 'like', `%[${id},%`).orWhere('product_ids', 'like', `%,${id},%`)
                        })
                    }
                })
                this.where(function () {
                    if (courseID) {
                        courseID.map((id, i) => {
                            this.orWhere('course_ids', 'like', `%[${id}]%`).orWhere('course_ids', 'like', `%,${id}]%`).orWhere('course_ids', 'like', `%[${id},%`).orWhere('course_ids', 'like', `%,${id},%`)
                        })
                    }
                })

            })
        })

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
    });

    let notifications = {}
    if (req.query.dateWise && pushNotifications.data) {
        for (let i = 0; i < pushNotifications.data.length; i++) {
            let date = moment(pushNotifications.data[i].created_at).format('DD-MM-YYYY')
            if (notifications[date]) {
                notifications[date].push(pushNotifications.data[i])
            } else {
                notifications[date] = [pushNotifications.data[i]]
            }
        }
    }else{
        notifications = pushNotifications.data
    }

    //
    let statusCode = notifications ? 200 : 422;
    let response = {
        success: notifications ? true : false,
        pushNotifications: notifications,
        error: pushNotifications.error
    };

    // Destrory process (to clean pool)
    knexConnection.destroy();

    res.status(statusCode).json(response);
}