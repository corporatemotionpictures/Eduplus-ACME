import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Add new faq
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert faq
  if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }

  // Validate request with rules
  let schema = Joi.object({
    product_type_ids: Joi.allow(null),
    question: Joi.string().required(),
    answer: Joi.string().required(),
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }



  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch chapter from database
  let position = await knexConnection.transaction(async trx => {
    return trx.select().table('faqs').orderBy('position', 'DESC').first();

  })

  // Destrory process (to clean pool)
  knexConnection.destroy();

  params.position = position ? parseInt(position.position) + 1 : 1;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Insert faq into database
  let faq = await knexConnection.transaction(async trx => {
    return trx.insert(params).into('faqs');
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


  //
  let statusCode = faq.id ? 200 : 422;
  let response = {
    success: faq.id ? true : false,
    faq: faq,
    id: faq.id
  };

  // Destrory process (to clean pool)
  knexConnection.destroy();

  // Send response
  res.status(statusCode).json(response);

}
