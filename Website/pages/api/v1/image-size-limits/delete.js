import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Function to Delete exam
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert exam
  if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }


  // Validate request with rules
  let schema = Joi.object({
    id: Joi.number().required()
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  // Set attributes
  let id = params.id;
  params.is_active = false;

  var count = 0;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Delete course from database
  let courses = await knexConnection.transaction(async trx => {
    return trx('courses');
  });

  // Destrory process (to clean pool)
  knexConnection.destroy();

  count += courses ? parseInt(courses.filter(course =>JSON.parse(course.exam_ids) != undefined  && JSON.parse(course.exam_ids).includes(id)).length) : 0;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Delete subject from database
  let subjects = await knexConnection.transaction(async trx => {
    return trx('subjects');
  });

  // Destrory process (to clean pool)
  knexConnection.destroy();

  count += subjects ? parseInt(subjects.filter(subject => JSON.parse(subject.exam_ids) != undefined && JSON.parse(subject.exam_ids).includes(id)).length) : 0;

  // Create db process (get into pool)
  knexConnection = require('knex')(knexConnectionConfig);

  // Delete chapter from database
  let chapters = await knexConnection.transaction(async trx => {
    return trx('chapters');
  });

  // Destrory process (to clean pool)
  knexConnection.destroy();

  count += chapters ? parseInt(chapters.filter(chapter => JSON.parse(chapter.exam_ids) != undefined && JSON.parse(chapter.exam_ids).includes(id)).length) : 0;

  // Create db process (get into pool)
  knexConnection = require('knex')(knexConnectionConfig);

  // Delete chapter from database
  let videos = await knexConnection.transaction(async trx => {
    return trx('videos');
  });

  // Destrory process (to clean pool)
  knexConnection.destroy();


  count += videos ? parseInt(videos.filter(video => JSON.parse(video.exam_ids) != undefined && JSON.parse(video.exam_ids).includes(id)).length) : 0;

  // Create db process (get into pool)
  knexConnection = require('knex')(knexConnectionConfig);

  // Delete chapter from database
  let blogs = await knexConnection.transaction(async trx => {
    return trx('blogs');
  })

  // Destrory process (to clean pool)
  knexConnection.destroy();


  count += blogs ? parseInt(blogs.filter(blog => JSON.parse(blog.exam_ids) != undefined && JSON.parse(blog.exam_ids).includes(id)).length) : 0;

  // Create db process (get into pool)
  knexConnection = require('knex')(knexConnectionConfig);

  // Delete chapter from database
  let pyqs = await knexConnection.transaction(async trx => {
    return trx('previous_year_question_papers');
  })

  // Destrory process (to clean pool)
  knexConnection.destroy();

  count += pyqs ? parseInt(pyqs.filter(pyq => JSON.parse(pyq.exam_ids) != undefined && JSON.parse(pyq.exam_ids).includes(id)).length) : 0;

  // Create db process (get into pool)
  knexConnection = require('knex')(knexConnectionConfig);

  // Delete chapter from database
  let qbs = await knexConnection.transaction(async trx => {
    return trx('question_banks');
  })

  // Destrory process (to clean pool)
  knexConnection.destroy();

  count += qbs ? parseInt(qbs.filter(qb => JSON.parse(qb.exam_ids) != undefined && JSON.parse(qb.exam_ids).includes(id)).length) : 0;


  var exam = null;

  if (count <= 0) {

    

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    // Delete exam from database
    var exam = await knexConnection.transaction(async trx => {
      return trx('exams').where('id', id).update(params);
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

  //
  let statusCode = exam && exam.id ? 200 : 422;
  let response = {
    success: exam && exam.id ? true : false,
    exam: exam,
  };


  // Send Response
  res.status(statusCode).json(response);

}