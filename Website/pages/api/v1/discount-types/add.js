import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import slugify from 'slugify';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Add new course
export default async function base(req, res) {
 
  
  
  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user && user.type != 'ADMIN' && user.type != 'MANAGEMENT' && user.type != 'FACULTY') { restrictedAccess(res); return false; }

  // Validate request with rules
  let schema = Joi.object({
    title: Joi.string().required(),
    is_display: Joi.number(),
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

  // Insert course into database
  let discountType = await knexConnection.transaction(async trx => {
    return trx.insert(params).into('discount_types');
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
  let statusCode = discountType.id ? 200 : 422;
  let response = {
    success: discountType.id ? true : false,
    discountType: discountType,
    id: discountType.id
  };

  // Destrory process (to clean pool)
  knexConnection.destroy();

  // Send response
  res.status(statusCode).json(response);

} 
