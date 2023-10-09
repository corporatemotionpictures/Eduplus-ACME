import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import moment from 'moment';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Get banner By ID
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user) { restrictedAccess(res); return false; }

  // set attributes
  let id = req.query.id;

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  // Fatch banner From Database
  let ticket = await knexConnection.transaction(async trx => {
    return trx.select().table('tickets')
      .where('id', id).first();
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

  if (ticket.data) {

    // Create db process (get into pool)
    knexConnection = require('knex')(knexConnectionConfig);

    // Fatch banner From Database
    var raiseTicket = await knexConnection.transaction(async trx => {
      return trx.select().table('raise_tickets')
        .where('ticket_id', id);
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
  }


  let raiseTicketsAll = {}

  if (ticket.data && raiseTicket.data) {

    for (let i = 0; i < raiseTicket.data.length; i++) {

      if (raiseTicket.data[i].response_by != null) {
        // Create db process (get into pool)
        knexConnection = require('knex')(knexConnectionConfig);

        // Fatch banner From Database
        user = await knexConnection.transaction(async trx => {
          return trx.select().table('users')
            .where('id', raiseTicket.data[i].response_by).first();
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

        raiseTicket.data[i].user_image = user.data ? user.data.image : '';
        raiseTicket.data[i].user_name = `${user.data.first_name} ${user.data.last_name} `

      }


      else if (ticket.data.user_id != null) {
        // Create db process (get into pool)
        knexConnection = require('knex')(knexConnectionConfig);

        // Fatch banner From Database
        user = await knexConnection.transaction(async trx => {
          return trx.select().table('users')
            .where('id', ticket.data.user_id).first();
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

        raiseTicket.data[i].user_image = user.data ? user.data.image : '';
        raiseTicket.data[i].user_name = `${user.data.first_name} ${user.data.last_name}`

      }

      raiseTicket.data[i].image = await replaceUploads(raiseTicket.data[i].image);
      raiseTicket.data[i].user_image = await replaceUploads(raiseTicket.data[i].user_image);

      if (req.query.dateWise) {
        let date = moment(raiseTicket.data[i].created_at).format('MMMM DD, YYYY')
        if (raiseTicketsAll[date]) {
          raiseTicketsAll[date].push(raiseTicket.data[i])
        } else {
          raiseTicketsAll[date] = [raiseTicket.data[i]]
        }

      }
      else {
        raiseTicketsAll = raiseTicket.data
      }

    }


    if (ticket.data.is_user) {
      // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);

      // Fatch banner From Database
      let ticketuser = await knexConnection.transaction(async trx => {
        return trx.select().table('users')
          .where('id', ticket.data.user_id).first();
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();

      ticket.data.user_image = ticketuser ? ticketuser.image : '/images/default-profile.jpg';
    }else{
      ticket.data.user_image = '/images/default-profile.jpg'
    }

  }

  //
  let statusCode = ticket.data && raiseTicket.data ? 200 : 422;
  let response = {
    success: ticket.data && raiseTicket.data ? true : false,
    ticket: ticket.data ? ticket.data : null,
    raiseTicket: raiseTicket && raiseTicket.data ? raiseTicketsAll : null,
    error: raiseTicket ? raiseTicket.error : null
  };

  // Send Response
  res.status(statusCode).json(response);
}