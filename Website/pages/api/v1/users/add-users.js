import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { postOnly, createLog, replaceUploads, injectMethodNotAllowed, validateRequestParams, invalidFormData, sendVarCode } from 'helpers/api';
import bcrypt from 'bcryptjs';

// Register user
export default async function base(req, res) {


    let array = [

    ]

    let mobile_numbers = []
    let repeat = []
    for (let i = 0; i < array.length; i++) {


        let data = array[i]
        // console.log(data)

        if (mobile_numbers.includes(data[5])) {
            repeat.push(data[5])
        } else {
            mobile_numbers.push(data[5])
        }



        // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        let userMobule = await knexConnection.transaction(async trx => {
            return trx.select().table('users').where('mobile_number', data[5]).first();
        })

        // Destrory process (to clean pool)
        knexConnection.destroy();

        console.log(userMobule)

        if (!userMobule) {

            let params = {
                // id: data[0],
                first_name: data[1],
                last_name: data[2],
                email: data[3],
                password: data[4],
                mobile_number: data[5],
                country_prefix: data[6],
                gender: data[7],
                category: data[8],
            }

            params.is_active = data[30];
            params.image = "/images/default-profile.jpg";

            let user_guardians = [{
                guardian_relation: 'FATHER',
                guardian_name: data[9],
                guardian_mobile_number: data[10],
            }]

            let addresses = [{
                address: data[11],
                city: data[12],
                state: data[13],
                zip_code: data[15],
                country: data[16],
            }]

            let academic_details = []

            if (data[9]) {
                academic_details.push({
                    degree: 'BE',
                    institute: data[17],
                    passing_year: data[18],
                    marks: data[19],
                },
                    {
                        degree: 'ME',
                        institute: data[20],
                        passing_year: data[21],
                        marks: data[22],
                    })
            }

            // Create db process (get into pool)
            knexConnection = require('knex')(knexConnectionConfig);

            // Register user into database
            let user = await knexConnection.transaction(async trx => {
                return trx.insert(params).into('users');
            }).then(res => {
                return {
                    id: res[0],
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
            console.log(user)

            if (user.id) {

                if (user_guardians) {

                    user_guardians = user_guardians.filter(guardian => guardian.user_id = user.id)

                    // Create db process (get into pool)
                    var knexConnection = require('knex')(knexConnectionConfig);

                    // Update user in database
                    let guardian = await knexConnection.transaction(async trx => {
                        return trx('user_guardians').insert(user_guardians);
                    }).then(async res => {
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

                if (academic_details) {

                    academic_details = academic_details.filter(academic => academic.user_id = user.id)

                    // Create db process (get into pool)
                    var knexConnection = require('knex')(knexConnectionConfig);

                    // Update user in database
                    let academic = await knexConnection.transaction(async trx => {
                        return trx('academic_details').insert(academic_details);
                    }).then(async res => {
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

                if (addresses) {

                    addresses = addresses.filter(address => address.user_id = user.id)

                    // Create db process (get into pool)
                    var knexConnection = require('knex')(knexConnectionConfig);

                    // Update user in database
                    let address = await knexConnection.transaction(async trx => {
                        return trx('addresses').insert(addresses);
                    }).then(async res => {
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
        }

    }

    console.log(repeat.length)
    console.log('repeat')
    console.log(mobile_numbers.length)

    //
    let statusCode = 200;
    let response = {
        success: true,
    };

    // Send response
    res.status(statusCode).json(response);
}
