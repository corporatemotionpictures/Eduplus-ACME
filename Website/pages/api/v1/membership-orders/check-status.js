import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { fetchByID } from 'helpers/apiService';
import Joi from '@hapi/joi';
import moment from 'moment'
import  { postOnly, createLog, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed, checkCoupon, validateRequestParams, moneyfy } from 'helpers/api';

// Function to Fetch product
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert product
  if (!user) { restrictedAccess(res); return false; }


  // Validate request with rules
  let schema = Joi.object({
    uuid: Joi.string().required()
  });

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }


  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fatch order From Database
  let order = await knexConnection.transaction(async trx => {
    return trx.select().table('orders').where('uuid', params.uuid).first();
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


  //
  let statusCode = order.data ? 200 : 422;
  let response = {
    success: order.data ? true : false,
    order_status: order.data ? order.data.status : null,
  };

  res.status(statusCode).json(response);
}


const intersect = (arrayA, arrayB) => {
  return arrayA.filter(elem => arrayB.includes(elem));
};