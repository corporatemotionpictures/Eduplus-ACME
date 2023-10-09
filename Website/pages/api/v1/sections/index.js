import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, checkPackage, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to fetch sections
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  // if (!user) { restrictedAccess(res); return false; }

  let orderBy = req.query.order_by ? req.query.order_by : 'ASC';
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let sectionID = req.query.sectionID ? Number.parseInt(req.query.sectionID) : null;


  var totalCount = 0
  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let sections = await knexConnection.transaction(async trx => {

    var query;

    query = knexConnection.select( 'sections.*').table('sections')
      .modify(function (queryBuilder) {
        if (sectionID) {
          queryBuilder.orWhereIn('sections.id', sectionID)
        }
      })
      .orderBy('sections.position', orderBy);

    totalCount = await query.clone().count();
    totalCount = totalCount[0]['count(*)'];
    
    if ((!req.query.forList || req.query.listOnly)) {
      query.where('sections.is_active', 1)
    }

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

  if (sections.data) {
    sections.data = await replaceUploadsArray(sections.data, 'image')
  }

  //
  let statusCode = sections.data ? 200 : 422;
  let response = {
    success: sections.data ? true : false,
    sections: sections.data,
    totalCount: totalCount,
    error: sections.error
  };

  res.status(statusCode).json(response);
}