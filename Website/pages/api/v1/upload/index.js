import multer from 'multer';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { edit } from 'helpers/apiService';

import { postOnly, createLog, injectMethodNotAllowed, validateRequestParams, restrictedAccess, verifyToken, invalidFormData } from 'helpers/api';

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

        if (req.query.destination != 'null') {
          cb(null, req.query.destination + '.' + fileExtension)
        } else {
          cb(null, Date.now() + '.' + fileExtension)
        }

      }
    })
  }
  var uploadFile = 'file'

  if (req.query.field == 'editor-images') {

    uploadFile = 'upload'
  }

  console.log(req.query)

  var upload = multer({ storage: storage }).single(uploadFile)

  // Upload file
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err)
    } else if (err) {
      return res.status(500).json(err)
    }

    var update = null

    // Set Path
    let path = destination + (req.upload ? req.query.destination : req.file.filename)

    req.body.id = req.body.id ? req.body.id : req.query.id

    console.log(req.body)

    if (req.body.id) {
      let fileType = 'image'

      if (req.body.fileType) {
        fileType = req.body.fileType
      }

      var field = req.query.field

      let update = null
      for (let i = 0; i < req.body.id.split(',').length; i++) {

        let id = req.body.id.split(',')[i]

        // check update
        let params = {
          id: id,
          [`${fileType}`]: path
        }


        // Update course in database
        update = await edit(req.query.field, params, null, req.headers['x-auth-token']);

      }



      if (update) {
        // Send Response
        let response = {
          success: true,
          path: path,
          [`${req.query.field}`]: req.query.field
        }

        // send response when file uploaded
        return res.status(200).json(response)
      } else {
        // Send Response
        let response = {
          success: true,
          path: path,
          uploaded: true,
          url: path ? path.replace('/uploads/', '/cdn/') : path,
          [`${req.query.field}`]: req.query.field
        }

        // send response when file uploaded
        return res.status(200).json(response)
      }

    }

    else {
      // Send Response
      let response = {
        success: true,
        path: path,
        uploaded: true,
        url: path ? path.replace('/uploads/', '/cdn/') : path,
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