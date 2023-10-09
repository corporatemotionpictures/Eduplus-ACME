import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, moneyfy, verifyToken, restrictedAccess, injectMethodNotAllowed } from 'helpers/api';
import { fetchAll } from 'helpers/apiService';

// Function to Fetch product_type
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert product_type
  if (!user) { restrictedAccess(res); return false; }

  // Filter
  let orderBy = req.query.order_by ? req.query.order_by : 'ASC';
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;
  let type = req.query.type ? req.query.type : null;
  let subjectID = req.query.subjectID ? req.query.subjectID.split(',') : null;



  let moduleID = null
  let attribute = null

  if (req.query.module) {
    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    let module = await knexConnection.transaction(async trx => {
      var query;
      query = trx.select('app_modules.*').table('app_modules').where('referance', req.query.module).first()
      return query;

    })

    // Destrory process (to clean pool)
    knexConnection.destroy();


    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    attribute = await knexConnection.transaction(async trx => {
      var query;
      query = trx.select('attributes.*').table('attributes').where('slug', 'languages').first()
      return query;

    })

    // Destrory process (to clean pool)
    knexConnection.destroy();


    if (module) {
      moduleID = module.id
    }

  }

  let packageType

  if (moduleID) {

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    packageType = await knexConnection.transaction(async trx => {
      var query;
      query = trx.select('course_types.*').table('course_types').where(function () {
        if (moduleID) {
          this.orWhere('include_ids', 'like', `%[${moduleID}]%`).orWhere('include_ids', 'like', `%,${moduleID}]%`).orWhere('include_ids', 'like', `%[${moduleID},%`).orWhere('include_ids', 'like', `%,${moduleID},%`)
        }
      }).pluck('id')
      return query;

    })

    // Destrory process (to clean pool)
    knexConnection.destroy();
  }

  let productID = []
  let values = []
  if (req.query.module) {

    let products = await fetchAll('products', { subjectID: req.query.subjectID, packageType: packageType, onlyList: true, noLog: true }, req.headers['x-auth-token'])

    if (products.totalCount > 0) {
      products = products.products

      for (let i = 0; i < products.length; i++) {
        productID.push(products[i].id)
      }
    }

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    values = await knexConnection.transaction(async trx => {
      var query;
      query = trx.select().table('product_attributes').whereIn('product_id', productID).where('attribute_id', attribute.id).pluck('value_id')
      return query;

    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

  }



  let totalCount = 0

  // Create db process (get into pool)
  var knexConnection = require('knex')(knexConnectionConfig);

  let languages = await knexConnection.transaction(async trx => {
    var query;
    query = trx.select('languages.*').table('languages').orderBy('languages.position', orderBy);
    if ((!req.query.forList || req.query.listOnly)) {
      query.where('languages.is_active', 1)
    }
    if (req.query.module) {
      query.whereIn('languages.id', values)
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

  //
  let statusCode = languages.data ? 200 : 422;
  let response = {
    success: languages.data ? true : false,
    languages: languages.data,
    totalCount: totalCount,
    error: languages.error
  };

  res.status(statusCode).json(response);
}
