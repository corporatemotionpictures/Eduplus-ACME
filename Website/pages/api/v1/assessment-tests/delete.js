import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { fetchAll } from 'helpers/apiService';
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

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Delete assessment from database
  let assessment = await knexConnection.transaction(async trx => {
    return trx('assessment_tests').where('id', id).del();
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

  //
  let statusCode = assessment.id ? 200 : 422;
  let response = {
    success: assessment.id ? true : false,
    'assessment': assessment
  };



  // Send Response
  res.status(statusCode).json(response);

}