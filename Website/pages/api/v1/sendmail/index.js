import Joi from '@hapi/joi';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, invalidFormData, sendmail } from 'helpers/api';
import { getSettings } from 'helpers/apiService';

// Function to Get Subject By ID
export default async function base(req, res) {

  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Validate request with rules
  let schema = Joi.object({
    name: Joi.required(),
    email: Joi.required(),
    subject: Joi.required(),
    message: Joi.required()
  })

  // If everything fine: params object would contain data
  let params = validateRequestParams(req.body, schema, res);

  // If Data Not Valid 
  if (params.status == false) { invalidFormData(res, params.error); return false; }
  else { params = params.value; }

  let config = getSettings('mailAuth')

  let options = {
    from: params.email, // sender address
    to: config.auth.user, // list of receivers
    subject: params.subject, // Subject line
    html: '<p> Name : ' + params.name + '</p></br><p> Email : ' + params.email + '</p></br><p>Message : ' + params.message + '</p>'// plain text body
  }

  let mail = sendmail(options);

  let statusCode = 200
  let response = {
    success: true,
    error: null
  };


  // Send Response 
  res.status(statusCode).json(response);
}