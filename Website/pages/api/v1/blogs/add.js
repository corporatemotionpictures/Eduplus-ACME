import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import slugify from 'slugify';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Function to insert blog
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert blog
  if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }

  // Validate request with rules
  let schema = Joi.object({
    title: Joi.string().required(),
    exam_ids: Joi.string().allow(null),
    course_ids: Joi.string().allow(null).allow(null),
    subject_ids: Joi.string().allow(null),
    chapter_ids: Joi.string().allow(null),
    body: Joi.required(),
    image: Joi.string()
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  // Add slug
  params.slug = slugify(params.title, {
    replacement: '-',
    remove: /[*+~.()'"!:@/]/g,
    lower: true,
  })


  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch subject from database
  let blogBySlug = await knexConnection.transaction(async trx => {
    return trx.select().table('blogs').where('slug', params.slug).first();

  })

  // Destrory process (to clean pool)
  knexConnection.destroy();

  if (blogBySlug) {

    let response = {
      success: false,
      error: 'Blog Title Already Exist'
    };

    // Send response
    res.status(422).json(response);

  } else {

    params.created_by = user.id;
    if ((user.type == 'MANAGEMENT' || user.type == 'FACULTY')) {
      params.approved = false
    }

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Insert blog into database
    let blog = await knexConnection.transaction(async trx => {
      return trx.insert(params).into('blogs');
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
    });

    // Destrory process (to clean pool)
    knexConnection.destroy();

    if (blog.id && (user.type == 'MANAGEMENT' || user.type == 'FACULTY')) {


      // Create db process (get into pool)
      var knexConnection = require('knex')(knexConnectionConfig);

      // Update user in database
      var reciever = await knexConnection.transaction(async trx => {
        return trx('users').where('type', "ADMIN").first();
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      var notice = {
        user_id: user.id,
        reciever_id: reciever.id,
        notification: `New Blog-${params.title} Added`,
        redirect_url: `/dashboard/blogs/view/${blog.id}`,
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

    }

    //
    let statusCode = blog.id ? 200 : 422;
    let response = {
      success: blog.id ? true : false,
      blog: blog,
      id: blog.id
    };



    // Send response
    res.status(statusCode).json(response);
  }
}
