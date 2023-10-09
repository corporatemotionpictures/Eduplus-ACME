import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, checkToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Get posts By ID
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  let user = null;
  let mobile_number = null;

 
  // check for is token exist
  let checkUser = await checkToken(req);

  if (req.query.mobile_number) {

    // set attributes
    mobile_number = req.query.mobile_number;
  }
  else if (checkUser) {

    // Later parse User from JWT-header token 
    user = await verifyToken(req);

    // Only ADMIN type of User allowed to insert posts
    if (!user) { restrictedAccess(res); return false; }

    mobile_number = user.mobile_number;

  }

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fatch raiseTicket From Database
  let raiseTicket = await knexConnection.transaction(async trx => {

    // if user is new user
    return trx.select().table('tickets')
      .where('mobile_number', mobile_number).orderBy('created_at', 'ASC');

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

  if (raiseTicket.data) {
    raiseTicket.data.image = await replaceUploads(raiseTicket.data.image);

  }

  
  if (raiseTicket.data && user && user.type != 'ADMIN' && !req.query.listOnly && !req.query.noLog) {
    let logged_data = {
      user_id: user.id,
      action: `VIEW_ALL_RAISE_TICKETS`,
      payload: JSON.stringify({
        field_name: 'raise_tickets',
        ...req.query
      })
    }


    let logs = await createLog(logged_data)
  }

  //
  let statusCode = raiseTicket.data ? 200 : 422;
  let response = {
    success: raiseTicket.data ? true : false,
    raiseTicket: raiseTicket.data,
    error: raiseTicket.error
  };

  // Send Response
  res.status(statusCode).json(response);
}