import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { fetchByID, fetchAll } from 'helpers/apiService';
import moment from 'moment';
import { getOnly, createLog, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed, checkCoupon } from 'helpers/api';

// Function to Fetch product
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert product
  if (!user) { restrictedAccess(res); return false; }

  // Filter
  let orderBy = req.query.order_by ? req.query.order_by : 'ASC';
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;
  let productID = req.query.productID ? Number.parseInt(req.query.productID) : null;
  let cartID = req.query.cartID ? Number.parseInt(req.query.cartID) : null;

  // Create db process (get into pool)


  let query = { 'status': 'SUCCESS', noLog: true }
  if (productID) {
    query.productID = productID
  }
  if (cartID) {
    query.cartID = cartID
  }

  let orders = await fetchAll('orders', query, req.headers['x-auth-token'])


  
  let userProducts = []
  let userProductIDs = []
  let productRef = {}
  let fieldID = null


  if (req.query.access && req.query.field && req.query.field != null) {
    // Create db process (get into pool)
    let knexConnection = require('knex')(knexConnectionConfig);

    let modules = await knexConnection.transaction(async trx => {
      return trx.table('app_modules').where('referance', req.query.field).first();
    })


    // Destrory process (to clean pool)
    knexConnection.destroy();

    fieldID = modules ? modules.id : null
  }
  let access = {
    examIDs: [],
    courseIDs: [],
    subjectIDs: [],
    chapterIDs: [],
    languageIds: [],
    batchIds: null,
  }


  if (orders.success) {
    if (orders.orders.length > 0) {

      let languagesAccess = {}
      for (let i = 0; i < orders.orders.length; i++) {


        for (let j = 0; j < orders.orders[i].carts.length; j++) {

          if (orders.orders[i].carts[j].activated && orders.orders[i].carts[j].activated == true) {
            userProducts.push(orders.orders[i].carts[j].product)
            userProductIDs.push(orders.orders[i].carts[j].product.id)

            if (productID && orders.orders[i].carts[j].product.id == productID && !productRef.activated) {
              productRef = {
                activated: true,
                expDate: orders.orders[i].carts[j].expDate,
                leftDays: orders.orders[i].carts[j].leftDays
              }
            }

            if (req.query.access && orders.orders[i].carts[j].product.product_type.is_package == 1) {


              if (!req.query.field || (fieldID && JSON.parse(orders.orders[i].carts[j].product.package_type.include_ids.includes(fieldID)))) {

                JSON.parse(orders.orders[i].carts[j].product.exam_ids).map(exam_id => {
                  if (!access.examIDs.includes(exam_id)) {
                    access.examIDs.push(exam_id)
                  }
                })
                JSON.parse(orders.orders[i].carts[j].product.course_ids).map(course_id => {
                  if (!access.courseIDs.includes(course_id)) {
                    access.courseIDs.push(course_id)
                  }
                })


                if (orders.orders[i].carts[j].product.attributes.batches && orders.orders[i].carts[j].product.attributes.batches.values) {
                  access.batchIds = []
                  orders.orders[i].carts[j].product.attributes.batches.values.map(batch => {
                    access.batchIds.push(batch.id)
                  })
                }

                if (orders.orders[i].carts[j].product.chapter_ids) {

                  JSON.parse(orders.orders[i].carts[j].product.chapter_ids).map(chapter_id => {
                    if (!access.chapterIDs.includes(chapter_id)) {
                      access.chapterIDs.push(chapter_id)
                    }

                    if (orders.orders[i].carts[j].product.attributes.languages && orders.orders[i].carts[j].product.attributes.languages.values) {
                      orders.orders[i].carts[j].product.attributes.languages.values.map(language => {

                        if (chapter_id in languagesAccess) {
                          languagesAccess[chapter_id].push(language.id)
                        }
                        else {
                          languagesAccess[chapter_id] = [language.id]
                        }
                      })
                    }
                  })
                }

                else if (orders.orders[i].carts[j].product.subject_ids) {

                  JSON.parse(orders.orders[i].carts[j].product.subject_ids).map(subject_id => {
                    if (!access.subjectIDs.includes(subject_id)) {
                      access.subjectIDs.push(subject_id)
                    }

                    if (orders.orders[i].carts[j].product.attributes.languages && orders.orders[i].carts[j].product.attributes.languages.values) {
                      orders.orders[i].carts[j].product.attributes.languages.values.map(language => {

                        if (subject_id in languagesAccess) {
                          languagesAccess[subject_id].push(language.id)
                        }
                        else {
                          languagesAccess[subject_id] = [language.id]
                        }
                      })
                    }
                  })
                }


              }

              access.languagesAccess = languagesAccess

            }
          }

        }
      }

    }
  }


  if (userProducts && user && user.type != 'ADMIN' && !req.query.listOnly && !req.query.noLog) {
    let logged_data = {
      user_id: user.id,
      action: 'VIEW_MY_COURSES',
      payload: JSON.stringify({
        field_name: 'my_courses',
        ...req.query
      })
    }


    let logs = await createLog(logged_data)
  }

  //
  let statusCode = 200;
  let response = {
    success: true,
    userProductIDs: userProductIDs,
    userProducts: userProducts,
    productRef: productID || cartID ? productRef : null,
    access: req.query.access ? access : {},
  };

  res.status(statusCode).json(response);
}

