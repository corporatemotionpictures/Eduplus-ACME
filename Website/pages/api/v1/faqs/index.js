import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';

// Function to Fetch validitie
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert validitie
  // if (!user) { restrictedAccess(res); return false; }

  // Filter
  let type = req.query.type ? req.query.type : null;
  let orderBy = req.query.order_by ? req.query.order_by : 'ASC';
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let prodyctTypeID = req.query.prodyctTypeID ? req.query.prodyctTypeID.split(',') : null;
  let attributes;


  var totalCount = 0

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let faqs = await knexConnection.transaction(async trx => {
    var query;

    query = trx.select(attributes).table('faqs').orderBy('faqs.position', orderBy);

    if ((!req.query.forList || req.query.listOnly)) {
      query.where('faqs.is_active', 1)
    }

    query.where(function () {
      if (prodyctTypeID) {
        prodyctTypeID.map((id, i) => {
          this.orWhere('faqs.product_type_ids', 'like', `%[${id}]%`).orWhere('faqs.product_type_ids', 'like', `%,${id}]%`).orWhere('faqs.product_type_ids', 'like', `%[${id},%`).orWhere('faqs.product_type_ids', 'like', `%,${id},%`)
        })
      }
    })

    totalCount = await query.clone().count();
    totalCount = totalCount[0]['count(*)'];

    if (!req.query.offLimit || req.query.offLimit == false) {
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


  if (faqs.data) {
    for (let i = 0; i < faqs.data.length; i++) {


      if(faqs.data[i].product_type_ids){

      // Create db process (get into pool)
      knexConnection = require('knex')(knexConnectionConfig);

      faqs.data[i].product_types = await knexConnection.transaction(async trx => {
        return trx.table('product_types').whereIn('id', JSON.parse(faqs.data[i].product_type_ids));
      })

      // Destrory process (to clean pool)
      knexConnection.destroy();
      }
    }
  }


  if (faqs.data && user && user.type != 'ADMIN' && !req.query.listOnly && !req.query.noLog) {
    let logged_data = {
      user_id: user.id,
      action: `VIEW_ALL_FAQS`,
      payload: JSON.stringify({
        field_name: 'faqs',
        ...req.query
      })
    }


    let logs = await createLog(logged_data)
  }

  //
  let statusCode = faqs.data ? 200 : 422;
  let response = {
    success: faqs.data ? true : false,
    totalCount: totalCount,
    faqs: faqs.data,
    error: faqs.error
  };

  res.status(statusCode).json(response);
}