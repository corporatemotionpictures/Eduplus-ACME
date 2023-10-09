import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, checkPackage, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch Previous Year Question Papers
export default async function base(req, res) {

    // Only allowed GET only methods
    if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

    // Later parse User from JWT-header token 
    let user = await verifyToken(req);

    // Only ADMIN type of User allowed to insert course
    // if (!user) { restrictedAccess(res); return false; }

    // Filter
    let orderBy = req.query.order_by ? req.query.order_by : 'DESC';
    let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
    let examID = req.query.examID ? req.query.examID : null;
    let courseID = req.query.courseID ? req.query.courseID.split(',') : null;

    var subjectIDs = null;
    if (user && user.type == 'FACULTY' && user.subject_ids) {
        subjectIDs = user.subject_ids;
    }

    var totalCount = 0

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    let exams = await knexConnection.transaction(async trx => {
        return trx.table('exams').where('id', examID).first();
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();



    if (exams) {

        // Create db process (get into pool)
        knexConnection = require('knex')(knexConnectionConfig);

        exams.courses = await knexConnection.transaction(async trx => {
            return trx.table('courses').where(function () {
                this.where(function () {
                    this.orWhere('exam_ids', 'like', `%[${examID}]%`).orWhere('exam_ids', 'like', `%,${examID}%`).orWhere('exam_ids', 'like', `%${examID},%`)
                }).where('is_active', 1).orderBy('position', 'ASC');
            })
        })

        // Destrory process (to clean pool)
        knexConnection.destroy();

        for (let j = 0; j < exams.courses.length; j++) {
            // Create db process (get into pool)
            knexConnection = require('knex')(knexConnectionConfig);

            exams.courses[j].subjects = await knexConnection.transaction(async trx => {
                return trx.table('subjects').where(function () {
                    this.where(function () {
                        this.orWhere('course_ids', 'like', `%[${exams.courses[j].id}]%`).orWhere('course_ids', 'like', `%,${exams.courses[j].id}%`).orWhere('course_ids', 'like', `%${exams.courses[j].id},%`)
                    });
                }).where('is_active', 1).orderBy('position', 'ASC');
            })

            // Destrory process (to clean pool)
            knexConnection.destroy();

            for (let i = 0; i < exams.courses[j].subjects.length; i++) {
                // Create db process (get into pool)
                knexConnection = require('knex')(knexConnectionConfig);

                exams.courses[j].subjects[i].chapters = await knexConnection.transaction(async trx => {
                    return trx.table('chapters').where(function () {
                        this.where(function () {
                            this.orWhere('subject_ids', 'like', `%[${exams.courses[j].subjects[i].id}]%`).orWhere('subject_ids', 'like', `%,${exams.courses[j].subjects[i].id}%`).orWhere('subject_ids', 'like', `%${exams.courses[j].subjects[i].id},%`)
                        });
                    }).where('is_active', 1);
                })

                // Destrory process (to clean pool)
                knexConnection.destroy();

                let count = 0

                for (let k = 0; k < exams.courses[j].subjects[i].chapters.length; k++) {


                    // Create db process (get into pool)
                    knexConnection = require('knex')(knexConnectionConfig);

                    let topics = await knexConnection.transaction(async trx => {
                        return trx.table('syllabus').where(function () {
                            this.where(function () {
                                this.orWhere('chapter_ids', 'like', `%[${exams.courses[j].subjects[i].chapters[k].id}]%`).orWhere('chapter_ids', 'like', `%,${exams.courses[j].subjects[i].chapters[k].id}%`).orWhere('chapter_ids', 'like', `%${exams.courses[j].subjects[i].chapters[k].id},%`)
                            });
                        }).where('is_active', 1).pluck('topics').orderBy('position', 'ASC');
                    })

                    // Destrory process (to clean pool)
                    knexConnection.destroy();

                    exams.courses[j].subjects[i].chapters[k].topics = topics

                    if (topics.length > 0) {
                        count++
                    }

                }

                if (count == 0) {
                    exams.courses[j].subjects[i].chapters = []
                }


            }

        }

    }


    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    // Fetch Previous Year Question Papers from database
    let syllabus = await knexConnection.transaction(async trx => {

        let query = trx.select('syllabus.*').table('syllabus')
            .orderBy('syllabus.position', orderBy);

        if ((!req.query.forList || req.query.listOnly)) {
            query = query.where('syllabus.approved', true)
        }

        if ((!req.query.forList || req.query.listOnly)) {
            query.where('syllabus.is_active', 1)
        }

        query.modify(function (queryBuilder) {
            queryBuilder.where(function () {
                this.where(function () {
                    if (examID) {
                        examID.map((id, i) => {
                            this.orWhere('exam_ids', 'like', `%[${id}]%`).orWhere('exam_ids', 'like', `%,${id}]%`).orWhere('exam_ids', 'like', `%[${id},%`).orWhere('exam_ids', 'like', `%,${id},%`)
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
                this.where(function () {
                    if (subjectID) {
                        subjectID.map((id, i) => {
                            this.orWhere('subject_ids', 'like', `%[${id}]%`).orWhere('subject_ids', 'like', `%,${id}]%`).orWhere('subject_ids', 'like', `%[${id},%`).orWhere('subject_ids', 'like', `%,${id},%`)
                        })
                    }
                })
                this.where(function () {
                    if (subjectIDs) {
                        subjectIDs.map((id, i) => {
                            this.orWhere('subject_ids', 'like', `%[${id}]%`).orWhere('subject_ids', 'like', `%,${id}]%`).orWhere('subject_ids', 'like', `%[${id},%`)
                        })
                    }
                })
                this.where(function () {
                    if (chapterID) {
                        chapterID.map((id, i) => {
                            this.orWhere('chapter_ids', 'like', `%[${id}]%`).orWhere('chapter_ids', 'like', `%,${id}]%`).orWhere('chapter_ids', 'like', `%[${id},%`)
                        })
                    }
                })
            })
        })


        totalCount = await query.clone().count();
        totalCount = totalCount[0]['count(*)'];

        if ((!req.query.offLimit || req.query.offLimit == false)) {
            query = query.clone().offset(offset).limit(limit)
        }

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

    if (syllabus.data) {


        for (let i = 0; i < syllabus.data.length; i++) {

            // Create db process (get into pool)
            var knexConnection = require('knex')(knexConnectionConfig);

            syllabus.data[i].exams = await knexConnection.transaction(async trx => {
                return trx.table('exams').whereIn('id', JSON.parse(syllabus.data[i].exam_ids));
            })

            // Destrory process (to clean pool)
            knexConnection.destroy();

            // Create db process (get into pool)
            var knexConnection = require('knex')(knexConnectionConfig);

            syllabus.data[i].courses = await knexConnection.transaction(async trx => {
                return trx.table('courses').whereIn('id', JSON.parse(syllabus.data[i].course_ids));
            })

            // Destrory process (to clean pool)
            knexConnection.destroy();

            // Create db process (get into pool)
            var knexConnection = require('knex')(knexConnectionConfig);

            syllabus.data[i].subjects = await knexConnection.transaction(async trx => {
                return trx.table('subjects').whereIn('id', JSON.parse(syllabus.data[i].subject_ids));
            })

            // Destrory process (to clean pool)
            knexConnection.destroy();

            // Create db process (get into pool)
            var knexConnection = require('knex')(knexConnectionConfig);

            syllabus.data[i].chapters = await knexConnection.transaction(async trx => {
                return trx.table('chapters').whereIn('id', JSON.parse(syllabus.data[i].chapter_ids));
            })

            // Destrory process (to clean pool)
            knexConnection.destroy();

            knexConnection = require('knex')(knexConnectionConfig);

            let createdUser = await knexConnection.transaction(async trx => {
                return trx.select().table('users').where('id', syllabus.data[i].created_by).first();
            })

            syllabus.data[i].created_user = createdUser ? createdUser.first_name.concat(' ' + createdUser.last_name) : null;

            // Destrory process (to clean pool)
            knexConnection.destroy();
        }
    }



    //
    let statusCode = exams ? 200 : 422;
    let response = {
        success: exams ? true : false,
        syllabus: exams,
        totalCount: totalCount,
        error: exams.error
    };


    // Send response
    res.status(statusCode).json(response);
}