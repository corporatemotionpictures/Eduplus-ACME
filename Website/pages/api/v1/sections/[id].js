import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog,  replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Get Subject By ID
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user) { restrictedAccess(res); return false; }

  // Set attributes 
  let id = req.query.id;
  // let attributes = {
  //   section_name: 'landing_page_sections.title',
  // };

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fetch subject from database
  let sectionDetail = await knexConnection.transaction(async trx => {
    return knexConnection.select( 'sections.*').table('sections')
      .where('sections.id', id)
      
      .where('sections.is_active', 1)
      
      .first();

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

  if(sectionDetail){
    sectionDetail.data.image = await replaceUploads(sectionDetail.data.image);
  }


  //
  let statusCode = sectionDetail.data ? 200 : 422;
  let response = {
    success: sectionDetail.data ? true : false,
    sectionDetail: sectionDetail.data,
    error: sectionDetail.error
  };

  // Send Response 
  res.status(statusCode).json(response);
}