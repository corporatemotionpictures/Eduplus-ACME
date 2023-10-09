import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, restrictedAccess, verifyToken, invalidFormData } from 'helpers/api';

// Function to Update page
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert page
  if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }

  // Validate request with rules
  let schema = Joi.object({
    id: Joi.number().required(),
    parent_id: Joi.number().allow(null),
    is_leader: Joi.number().allow(null),
    title: Joi.string().required(),
    slug: Joi.string().allow(null),
    visibility: Joi.string().allow(null),
    banner: Joi.string().allow(null),
    image: Joi.string().allow(null),
    keyword: Joi.string().allow(null),
    description: Joi.string().allow(null),
    short_description: Joi.string().allow(null),
    pageSections: Joi.allow(null),
    target_blank: Joi.allow(null),
    login_required: Joi.allow(null),
    is_parent: Joi.allow(null),
    page_url: Joi.allow(null),

  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  // Set attributes
  let id = params.id;


  params.login_required = params.login_required ? params.login_required : 0
  params.target_blank = params.target_blank ? params.target_blank : 0
  params.is_parent = params.is_parent ? params.is_parent : 0

  let pageSections = params.pageSections
  delete params.pageSections

  // Add slug
  params.slug = params.slug ? params.slug : slugify(params.title, {
    replacement: '-',
    remove: /[*+~.()'"!:@/]/g,
    lower: true,
  })

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch subject from database
  let pageBySlug = await knexConnection.transaction(async trx => {
    return trx.select().table('pages').where('slug', params.slug).whereNot('id', id).first();

  })

  // Destrory process (to clean pool)
  knexConnection.destroy();

  if (pageBySlug) {

    let response = {
      success: false,
      error: 'Page Already Exist'
    };

    // Send response
    res.status(422).json(response);
  } else {

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Update page in database
    let page = await knexConnection.transaction(async trx => {
      return trx('pages').where('id', id).update(params);
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



    if (page.id) {

      if (pageSections) {  // Create db process (get into pool)
        var knexConnection = require('knex')(knexConnectionConfig);

        // Update user in database
        var pageSection = await knexConnection.transaction(async trx => {
          return trx('page_sections').where('page_id', id).del();
        })

        // Destrory process (to clean pool)
        knexConnection.destroy();


        for (let i = 0; i < pageSections.length; i++) {



          let params = {
            page_id: id,
            section_id: pageSections[i].section_id,
            is_active: pageSections[i].is_active,
            position: pageSections[i].position,
            style: pageSections[i].style,
          }


          console.log(params)

          // Create db process (get into pool)
          var knexConnection = require('knex')(knexConnectionConfig);

          // Insert page into database
          pageSection = await knexConnection.transaction(async trx => {
            return trx.insert(params).into('page_sections');
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


          if (pageSection.id) {


            // Create db process (get into pool)
            var knexConnection = require('knex')(knexConnectionConfig);

            // Update user in database
            var pageSectionData = await knexConnection.transaction(async trx => {
              return trx('section_values').where('page_section_id', pageSection.id).del();
            })

            // Destrory process (to clean pool)
            knexConnection.destroy();

            let sectionData = pageSections[i].sectionData
            sectionData.filter(data => data.page_section_id = pageSection.id)
            // sectionData.filter(data => data.style = data.style)


            // Create db process (get into pool)
            var knexConnection = require('knex')(knexConnectionConfig);

            // Insert page into database
            pageSectionData = await knexConnection.transaction(async trx => {
              return trx.insert(sectionData).into('section_values');
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
          }
        }
      }

    }


    //
    let statusCode = page.id ? 200 : 422;
    let response = {
      success: page.id ? true : false,
      page: page
    };

    // Send response
    res.status(statusCode).json(response);
  }
}
