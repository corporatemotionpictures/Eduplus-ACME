import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch exam
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert exam
  if (!user) { restrictedAccess(res); return false; }

  // Filter
  let label = req.query.label ? req.query.label : null;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let sizes = await knexConnection.transaction(async trx => {
    var query;

    query = trx.select('height','width','minHeight','minWidth','maxHeight','maxWidth', 'is_required').table('image_size_limits')

      .modify(function (queryBuilder) {
        if (label) {
          queryBuilder.where('label', label).first()
        }
      })

    return query;

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
  let statusCode = sizes.data ? 200 : 422;
  let response = {
    success: sizes.data ? true : false,
    sizes: sizes.data,
    error: sizes.error,
  };

  res.status(statusCode).json(response);
}