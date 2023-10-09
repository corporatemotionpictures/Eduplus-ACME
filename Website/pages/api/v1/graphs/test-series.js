import { getOnly, createLog,  replaceUploads, replaceUploadsArray, injectMethodNotAllowed, restrictedAccess, verifyToken} from 'helpers/api';
import FormData from 'isomorphic-form-data';


// Login
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);

  // Only ADMIN type of User allowed to insert course
  if (!user) { restrictedAccess(res); return false; }

  
  // Add file to form data
  var form = new FormData();
  form.append('userId', user.id);

  // let apiUrl = process.env.NEXT_PUBLIC_TEST_SERIES_URL;
  // apiUrl = apiUrl.concat('/api/get_exam_count');
  // let updated = false;

  // // // 
  // let data = await fetch(apiUrl, {
  //   method: 'POST',
  //   body : form
  // });

  // let jsonData = await data.json();
  // jsonData = JSON.parse(jsonData);

  // Set Response
  let response = {
    'success': false ? true : false,
    'student_exam_count': false ? 0 : 0,
    'exam_count': false ? 0 : 0,
  };

  let statusCode = false ? 200 : 400;

  // Send Response
  res.status(statusCode).json(response);
}