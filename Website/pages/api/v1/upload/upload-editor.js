import multer from 'multer';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { edit } from 'helpers/apiService';

import  { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, restrictedAccess, verifyToken, invalidFormData } from 'helpers/api';

// Function to Upload File
export default async function base(req, res) {


  // Only allowed POST only methods
  if (!postOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  // if (!user) { restrictedAccess(res); return false; }

  let destination;

  destination = '/uploads/' + req.query.field + '/';


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

        if(req.query.destination != 'null'){
          cb(null, req.query.destination + '.' + fileExtension)
        }else{
          cb(null, Date.now() + '.' + fileExtension)
        }
       
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

    var update = null


    console.log(destination)
    console.log(req.file.filename)

    // Set Path
    let path = destination + req.file.filename

    req.body.id = req.body.id ? req.body.id : req.query.id

    if (req.body.id) {
      let fileType = 'image'

      if (req.body.fileType) {
        fileType = req.body.fileType
      }

      var field = req.query.field


      req.body.id.split(',').map(async (id) => {

        // check update
        let params = {
          id: id,
          [`${fileType}`]: path
        }


        // Update course in database
        let update = await edit(req.query.field, params, null, req.headers['x-auth-token']);


        if (update) {
          // Send Response
          let response = {
            success: true,
            path: path,
            [`${req.query.field}`]: req.query.field
          }

          // send response when file uploaded
          return res.status(200).json(response)
        }
      })

    }

    else {
      // Send Response
      let response = {
        success: true,
        path: path,
        [`${req.query.field}`]: req.query.field
      }

      // send response when file uploaded
      return res.status(200).json(response)
    }





  })

};

// For file uploading
export const config = {
  api: {
    bodyParser: false,
  },
};