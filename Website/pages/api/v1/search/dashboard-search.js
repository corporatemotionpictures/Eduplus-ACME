import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { getOnly, createLog, replaceUploads, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed, search, searchPerfect } from 'helpers/api';
import { getUrl } from 'helpers/apiService';
import fetch from 'isomorphic-unfetch';


// Function to Fetch Course
export default async function base(req, res) {

  // Only allowed GET only methods
  if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

  // Later parse User from JWT-header token 
  let user = await verifyToken(req);
  let token = req.headers['x-auth-token'];

  // Only ADMIN type of User allowed to insert course
  if (!user) { restrictedAccess(res); return false; }

  // Filter
  let orderBy = req.query.order_by ? req.query.order_by : 'DESC';
  let offset = req.query.offset ? Number.parseInt(req.query.offset) : 0;
  let limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;
  let searchKey = req.query.searchKey ? req.query.searchKey : null;
  let field = req.query.field ? req.query.field : null;

  var subjectIDs = null;
  if (user && user.type == 'FACULTY' && user.subject_ids) {
    subjectIDs = user.subject_ids;
  }

  // Fetch All
  let values;

  let apiUrl = field;

  if (apiUrl == 'management') {
    apiUrl = 'users?type=MANAGEMENT';
  }
  else if (apiUrl == 'users') {
    apiUrl = apiUrl + '?type=USER';
  }
  else if (apiUrl == 'pyq-papers') {
    apiUrl = apiUrl + '/kb';
  }
  else if (apiUrl == 'videos') {
    apiUrl = 'subjects?forDashboard=true';
  }

  apiUrl = getUrl('/' + apiUrl);


  let data = await fetch(apiUrl, {
    headers: {
      'x-auth-token': token
    },
  });
  let dataJson = await data.json();



  var response = {};

  // Check If search key exist
  if (searchKey) {

    var options;

    switch (field) {
      case 'exams': values = dataJson.exams; options = ['name']; break;
      case 'courses': values = dataJson.courses; options = ['name']; break;
      case 'subjects': values = dataJson.subjects; options = ['name']; break;
      case 'chapters': values = dataJson.chapters; options = ['name']; break;
      case 'blogs': values = dataJson.blogs; options = ['title']; break;
      case 'pyq-papers': values = dataJson.previousYearQuestions; options = ['title']; break;
      case 'one_line_questions': values = dataJson.oneLineQuestions; options = ['question']; break;
      case 'videos': values = dataJson.subjects; options = ['name']; break;
      case 'users': values = dataJson.users; options = ['first_name', 'last_name']; break;
      case 'management': values = dataJson.users; options = ['first_name', 'last_name', 'mobile_number']; break;
      case 'logs': values = dataJson.logs; options = ['action']; break;
      case 'question-banks': values = dataJson.questionBanks; options = ['name']; break;
      case 'enquiries': values = dataJson.enquiries; options = ['message']; break;
    }

    // Call Function for Search
    values = search(options, values, searchKey)
  }

  switch (field) {
    case 'exams': response.exams = values; break;
    case 'courses': response.courses = values; break;
    case 'subjects': response.subjects = values; break;
    case 'chapters': response.chapters = values; break;
    case 'blogs': response.blogs = values; break;
    case 'pyq-papers': response.previousYearQuestions = values; break;
    case 'one_line_questions': response.oneLineQuestions = values; break;
    case 'videos': response.subjects = values; break;
    case 'users': response.users = values; break;
    case 'management': response.users = values; break;
    case 'logs': response.logs = values; break;
    case 'question-banks': response.questionBanks = values; break;
    case 'enquiries': response.enquiries = values; break;
  }

  // switch (field) {
  //   case 'courses': response.courses.data = await replaceUploadsArray(response.courses.data , 'thumbnail'); break;
  //   case 'subjects': response.subjects.data = subjects.data.map(data => replaceUploads(data.thumbnail)); break;
  //   case 'blogs': response.blogs.data = courses.data.map(data => replaceUploads(data.image)); break;
  //   case 'pyq-papers': response.previousYearQuestions.data = courses.data.map(data => replaceUploads(data.url)); break;
  //   case 'videos': response.videos.data = await replaceUploadsArray(response.videos.data, 'thumbnail'); break;
  //   case 'users': response.users.data = courses.data.map(data => replaceUploads(data.image)); break;
  //   case 'enquiries': response.enquiries.data = courses.data.map(data => replaceUploads(data.image)); break;
  // }


  //
  let statusCode = values ? 200 : 422;
  response.success = values ? true : false;


  res.status(statusCode).json(response);
}