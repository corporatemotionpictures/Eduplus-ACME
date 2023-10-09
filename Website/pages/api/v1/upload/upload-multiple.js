import multer from 'multer';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, restrictedAccess, verifyToken, invalidFormData } from 'helpers/api';

// Function to Upload File
export default async function base(req, res) {


  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user) { restrictedAccess(res); return false; }

  let destination;

  destination = '/uploads/products/';

  var storage;
  let fileExtension;

  if (req.query.field == 'splash') {
    storage = multer.diskStorage({
      destination: 'public' + destination,
      filename: function (req, file, cb) {
        fileExtension = file.originalname.split('.')[1]
        cb(null, 'splash-screen' + '.' + fileExtension)
      }
    })
  }
  else {
    storage = multer.diskStorage({
      destination: 'public' + destination,
      filename: function (req, file, cb) {
        fileExtension = file.originalname.split('.')[1]
        cb(null, Date.now() + '.' + fileExtension)
      }
    })
  }

  // Upload file Via multer
  var upload = multer({ storage: storage }).single('file')

  // Upload file
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err)
    } else if (err) {
      return res.status(500).json(err)
    }

    // Set Path
    let path = destination + req.file.filename

    let fileType = 'image'

    if (req.body.fileType) {
      fileType = req.body.fileType
    }

    // check update
    let params = {
      product_id: req.body.id,
      [`${fileType}`]: path
    }

    // Create db process (get into pool)
    var knexConnection = require('knex')(knexConnectionConfig);

    // Update course in database
    let field = await knexConnection.transaction(async trx => {
      return trx('product_images').insert(params);
    }).then(res => {
      return {
        id: res,
        error: null
      };
    }).catch(err => {
      return {
        id: null,
        error: err.sqlMessage
      };
    })

    // Destrory process (to clean pool)
    knexConnection.destroy();

    // Send Response
    let response = {
      success: true,
      path: path,
      [`${req.query.field}`]: field
    }

    // send response when file uploaded
    return res.status(200).json(response)

  })

};

// For file uploading
export const config = {
  api: {
    bodyParser: false,
  },
};