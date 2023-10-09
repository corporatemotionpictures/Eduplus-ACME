import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed, jsonSafe } from 'helpers/api';

// Function to Get User By ID
export default async function base(req, res) {

    // Only allowed GET only methods
    if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

    // Later parse User from JWT-header token 
    let user = await verifyToken(req, false);

    // Only ADMIN type of User allowed to insert course
    if (!user) { restrictedAccess(res); return false; }


    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Fatch user From Database
    user = await knexConnection.transaction(async trx => {
        return trx.select().table('users').where('id', user.id).first();
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


    var error;

    if (user.data) {
        if (user.data.is_active == 0) {
            user = null;
            error = "Oops! User Account deactivated. It looks like Administrator has deactivated your account. Please contact Admin Department for more details.";
        }
        else if ((user.data.uuid == null || user.data.uuid == '') && !req.query.forWeb) {
            user = null;
            error = "Oops! Please Login Again  ";
        }
        else {
            user.data.image = await replaceUploads(user.data.image);

            user = user.data;
            error = null;
        }
    }
    else {
        user = null;
        error = "Oops! User Account removed. It looks like Administrator has removed your account. Please contact Admin Department for more details.";

    }

    if (user) {
        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        // Update user in database
        user.addresses = await knexConnection.transaction(async trx => {
            return trx('addresses').where('user_id', user.id);
        })

        // Destrory process (to clean pool)
        knexConnection.destroy();

        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        // Update user in database
        user.academic_details = await knexConnection.transaction(async trx => {
            return trx('academic_details').where('user_id', user.id);
        })

        // Destrory process (to clean pool)
        knexConnection.destroy();

        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        // Update user in database
        user.user_guardians = await knexConnection.transaction(async trx => {
            return trx('user_guardians').where('user_id', user.id);
        })

        // Destrory process (to clean pool)
        knexConnection.destroy();





        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        // Update user in database
        user.branchDetail = await knexConnection.transaction(async trx => {
            return trx('courses').where('id', user.branch).first();
        })

        // Destrory process (to clean pool)
        knexConnection.destroy();


        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        // Update user in database
        user.membership_documents = await knexConnection.transaction(async trx => {
            return trx('user_membership_doucuments').select('user_membership_doucuments.*', 'memberships.title').where('user_membership_doucuments.user_id', user.id)
                .join('memberships', 'user_membership_doucuments.membership_id', 'memberships.id');
        })

        // Destrory process (to clean pool)
        knexConnection.destroy();


        user.membership_documents = await replaceUploadsArray(user.membership_documents, 'document');

        user.image = await replaceUploads(user.image);

        if ((user.type == 'MANAGEMENT' || user.type == 'FACULTY')) {
            user.image = await replaceUploads(user.image);
            var knexConnection = require('knex')(knexConnectionConfig);

            // Fatch user From Database
            let permissions = await knexConnection.transaction(async trx => {
                return trx.select().table('user_permissions').where('user_id', user.id);
            })


            // Destrory process (to clean pool)
            knexConnection.destroy();

            user.module_ids = []
            permissions ? permissions.map((permission) => { user.module_ids.push(permission.module_id) }) : []

            // Create db process (get into pool)
            var knexConnection = require('knex')(knexConnectionConfig);

            // Fatch user From Database
            user.modules = await knexConnection.transaction(async trx => {
                return trx.select().table('modules').whereIn('id', user.module_ids);
            })


            // Destrory process (to clean pool)
            knexConnection.destroy();


            // For falcuties
            if (user.type == 'FACULTY') {

                // Create db process (get into pool)
                var knexConnection = require('knex')(knexConnectionConfig);

                // Fatch user From Database
                let subjects = await knexConnection.transaction(async trx => {
                    return trx.select().table('faculty_subjects').where('user_id', user.id);
                })


                // Destrory process (to clean pool)
                knexConnection.destroy();

                user.subject_ids = []
                subjects ? subjects.map((subject) => { user.subject_ids.push(subject.subject_id) }) : []

                // Create db process (get into pool)
                var knexConnection = require('knex')(knexConnectionConfig);

                // Fatch user From Database
                user.subjects = await knexConnection.transaction(async trx => {
                    return trx.select().table('subjects').whereIn('id', user.subject_ids);
                })


                // Destrory process (to clean pool)
                knexConnection.destroy();




            }
        }


        if (user.type == 'MANAGEMENT' || user.type == 'FACULTY' || user.type == 'ADMIN') {


            // Create db process (get into pool)
            var knexConnection = require('knex')(knexConnectionConfig);

            // Fatch user From Database
            user.authenticationDetails = await knexConnection.transaction(async trx => {
                return trx.select().table('2fa_details').where('user_id', user.id).first();
            })


            // Destrory process (to clean pool)
            knexConnection.destroy();

        }


    }


    //
    let statusCode = 200;
    let response = {
        success: user ? true : false,
        user: user ? jsonSafe(user) : null,
        message: error
    };

    // Send Response
    res.status(statusCode).json(response);
}