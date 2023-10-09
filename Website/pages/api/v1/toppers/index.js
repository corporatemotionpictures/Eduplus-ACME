import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, moneyfy, verifyToken, restrictedAccess, injectMethodNotAllowed, replaceUploadsArray } from 'helpers/api';
import { fetchAll } from 'helpers/apiService';

// Function to Fetch product_type
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert product_type
  // if (!user) { restrictedAccess(res); return false; }

  // Filter
  let orderBy = req.query.order_by ? req.query.order_by : 'ASC';
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;

  let totalCount = 0

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let toppers = await knexConnection.transaction(async trx => {
    var query;
    query = trx.select('toppers.*').table('toppers').orderBy('toppers.position', orderBy);
    if ((!req.query.forList || req.query.listOnly)) {
      query.where('toppers.is_active', 1)
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

  let toppersAll = {}
  if (toppers.data) {
    toppers.data = await replaceUploadsArray(toppers.data, 'image');
  
      for (let i = 0; i < toppers.data.length; i++) {

  
        if (req.query.dateWise) {
          let date = toppers.data[i].year
          if (toppersAll[date]) {
            toppersAll[date].push(toppers.data[i])
          } else {
            toppersAll[date] = [toppers.data[i]]
          }
        }
        else {
          toppersAll = toppers.data
        }

      }
  

  
  }

  //
  let statusCode = toppers.data ? 200 : 422;
  let response = {
    success: toppers.data ? true : false,
    toppers: toppers.data ? toppersAll : [],
    totalCount: totalCount,
    error: toppers.error
  };

  res.status(statusCode).json(response);
}
