import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed, moneyfy } from 'helpers/api';

// Function to Fetch package_type
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert package_type
  if (!user) { restrictedAccess(res); return false; }

  // Filter
  let orderBy = req.query.order_by ? req.query.order_by : 'ASC';
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;
  let discountTypeID = req.query.discountTypeID ? req.query.discountTypeID : null;
  let type = req.query.type ? req.query.type : null;


  let totalCount = 0
  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let referrals = await knexConnection.transaction(async trx => {

    var query;
    query = trx.select('referrals.*').table('referrals').orderBy('referrals.position', orderBy);
    if ((!req.query.forList || req.query.listOnly)) {
      query.where('referrals.is_active', 1)
    }
    
    totalCount = await query.clone().count();
    totalCount = totalCount[0]['count(*)'];

    if ((!req.query.offLimit || req.query.offLimit == false) && (!user || user.type == 'ADMIN')) {
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
      error: err.sqlMessage
    };
  })

  // Destrory process (to clean pool)
  knexConnection.destroy();



  if (referrals.data) {
    for (let i = 0; i < referrals.data.length; i++) {

      if (referrals.data[i].referance_ids) {

        let label = `${referrals.data[i].referance_type}s`;

        // Create db process (get into pool)
        knexConnection = require('knex')(knexConnectionConfig);

        referrals.data[i].referances = await knexConnection.transaction(async trx => {
          return trx.table(label).whereIn('id', JSON.parse(referrals.data[i].referance_ids));
        })

        // Destrory process (to clean pool)
        knexConnection.destroy();

        referrals.data[i][`${referrals.data[i].referance_type}_ids`]  = referrals.data[i].referance_ids
        referrals.data[i].userMonyfiedAmount = await moneyfy(referrals.data[i].user_amount, referrals.data[i].user_discount_type)
        referrals.data[i].referrarMonyfiedAmount = await moneyfy(referrals.data[i].referrar_amount, referrals.data[i].referrar_discount_type)
      }

    }
  }

  //
  let statusCode = referrals.data ? 200 : 422;
  let response = {
    success: referrals.data ? true : false,
    totalCount: totalCount,
    referrals: referrals.data,
    error: referrals.error
  };

  res.status(statusCode).json(response);
}


const intersect = (arrayA, arrayB) => {
  return arrayA.filter(elem => arrayB.includes(String(elem)));
};