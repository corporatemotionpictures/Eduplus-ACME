import fetch from 'isomorphic-unfetch';
import { getToken } from 'helpers/auth';
import FormData from 'isomorphic-form-data';
import Router from 'next/router';
import Cookies from 'cookies'



// Assign API Url const 
var domainUrlName = process.env.NEXT_PUBLIC_DOMAIN_URL;

if (typeof window !== 'undefined' && window.location.hostname && window.location.hostname.includes('www.')) {
  domainUrlName = domainUrlName.replace('http://', 'http://www.')
  domainUrlName = domainUrlName.replace('https://', 'https://www.')
}

export const domainUrl = domainUrlName;

export const apiUrl = domainUrl.concat("/api/v1");

//Get Url 
export function getUrl(ctx) {
  return apiUrl.concat(ctx);
}

// Function for Fetch All Data
export async function get(apiUrl, params) {
  apiUrl = getUrl('/' + apiUrl);
  let token = getToken();

  if (params instanceof Object && params && params != undefined && params != {}) {

    let query = Object.keys(params)
      .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
      .join('&');
    apiUrl = apiUrl.concat(`?${query}`)
    // apiUrl = apiUrl
  }

  let data = await fetch(apiUrl, {
    headers: {
      'x-auth-token': token
    },
  });

   let dataJson = {}
  if (data.status != 502) {
    dataJson = await data.json();
  }

  // Check If API status true Or not
  if (data.status === 200 && dataJson.error == null) {
    var updated = true;
  }

  // Set Updation Status 
  dataJson.updated = updated;
  return dataJson;
}


// Function for Add Data
export async function post(apiUrl, body, token = null) {

  let apiAddUrl = getUrl('/' + apiUrl);
  token = token ? token : getToken();


  body = JSON.stringify(body)

  // 
  let data = await fetch(apiAddUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token
    },
    body: body
  });

  // Get Json value 
   let dataJson = {}
  if (data.status != 502) {
    dataJson = await data.json();
  }

  if (dataJson.setCookies) {

    let label = dataJson.setCookies.label
    let value = dataJson.setCookies.value

    // Create a cookies instance
    const cookies = new Cookies(req, res)

    // Set a cookie
    cookies.set(label, value, {
      httpOnly: true // true by default
    })

  }

  return dataJson;
}

// Function for Fetch All Data
export async function fetchAll(apiUrl, params = null, token = null) {
  apiUrl = getUrl('/' + apiUrl);

  if (params instanceof Object && params && params != undefined && params != {}) {

    let query = Object.keys(params)
      .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
      .join('&');
    apiUrl = apiUrl.concat(`?${query}`)
    // apiUrl = apiUrl
  }

  token = token ? token : getToken();
  let data = await fetch(apiUrl, {
    headers: {
      'x-auth-token': token
    },
  });

   let dataJson = {}
  if (data.status != 502) {
    dataJson = await data.json();
  }
  return dataJson;
}

// Function for Fetch All Data
export async function fetchAllFcmtoken(params, token = null) {

  let apiUrl = getUrl('/users/get-by-fcm-token');

  if (params instanceof Object && params && params != undefined && params != {}) {

    let query = Object.keys(params)
      .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
      .join('&');
    apiUrl = apiUrl.concat(`?${query}`)
    // apiUrl = apiUrl
  }

  token = token ? token : getToken();
  let data = await fetch(apiUrl, {
    headers: {
      'x-auth-token': token
    },
  });
   let dataJson = {}
  if (data.status != 502) {
    dataJson = await data.json();
  }

  return dataJson;
}

// Function for Fetch Data By Id
export async function fetchByID(apiUrl, id, params = null, token = null) {
  apiUrl = getUrl('/' + apiUrl + '/' + id);

  if (params instanceof Object && params && params != undefined && params != {}) {

    let query = Object.keys(params)
      .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
      .join('&');
    apiUrl = apiUrl.concat(`?${query}`)
    // apiUrl = apiUrl
  }

  token = token ? token : getToken();
  let data = await fetch(apiUrl, {
    headers: {
      'x-auth-token': token
    },
  });
   let dataJson = {}
  if (data.status != 502) {
    dataJson = await data.json();
  }
  return dataJson;
}

// Function for Fetch blogs By Id for app
export async function fetchForApp(apiUrl, slug, token) {
  apiUrl = getUrl('/' + apiUrl + '/slug/' + slug);
  let data = await fetch(apiUrl, {
    headers: {
      'x-auth-token': token
    },
  });
   let dataJson = {}
  if (data.status != 502) {
    dataJson = await data.json();
  }
  return dataJson;
}

// Function for Fetch Data By Id
export async function fetchBySlug(apiUrl, slug) {
  apiUrl = getUrl('/' + apiUrl + '/slug/' + slug);
  let token = getToken();
  let data = await fetch(apiUrl, {
    headers: {
      'x-auth-token': token
    },
  });
   let dataJson = {}
  if (data.status != 502) {
    dataJson = await data.json();
  }
  return dataJson;
}

// Function for Fetch Data By Id
export async function updateAdditional(apiUrl, label, body) {
  apiUrl = getUrl('/additional-fetures/' + apiUrl);
  let token = getToken();

  body = {
    label: label,
    data: body
  }
  // 
  let data = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token
    },
    body: JSON.stringify(body),
  });

  // Get Json value 
   let dataJson = {}
  if (data.status != 502) {
    dataJson = await data.json();
  }
  return dataJson;
}


// Function for Edit Data
export async function edit(apiUrl, body, file = null, token = null) {

  let apiEditUrl = getUrl('/' + apiUrl + '/update');
  token = token ? token : getToken();
  let id = body.id;

  let updated = false;
  var fileType = 'image'
  var uploadFile = null



  if (file) {
    if (Array.isArray(file)) {
      var uploadFile = [];
      var fileType = [];
      file.map((f, i) => {

        if (body[f] && body[f][0]) {
          fileType[i] = f;
          uploadFile[i] = body[f][0];
          delete body[f];
        }

        if (body[f]) {
          delete body[f];
        }

      })
    } else {
      var uploadFile = null;
      var fileType = '';
      fileType = file;
      if (body[fileType]) {
        file = body[fileType][0];
        delete body[fileType];

        uploadFile = file
      }
    }

  }

  body = JSON.stringify(body)

  // 
  let data = await fetch(apiEditUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token
    },
    body: body,
  });

  // Get Json value 
   let dataJson = {}
  if (data.status != 502) {
    dataJson = await data.json();
  }

  // Check If API status true Or not
  if (data.status === 200 && dataJson.error == null) {

    updated = true;

    if (file !== null) {

      if (Array.isArray(file)) {

        fileType.map(async (f, i) => {

          if (apiUrl == 'settings') {
            id = f;
            f = "value";
          }
          // Upload File using fileUpload function
          let file = await fileUpload(apiUrl, id, uploadFile[i], f);
          updated = file.uploded;
        })

      } else {
        if (uploadFile) {
          // Upload File using fileUpload function
          let file = await fileUpload(apiUrl, id, uploadFile, fileType);
          updated = file.uploded;
        }

      }

    }
  }

  // Set Updation Status 
  dataJson.updated = updated;
  return dataJson;
}


// Function for Add Data
export async function add(apiUrl, body, file = null, token = null) {

  let apiAddUrl = getUrl('/' + apiUrl + '/add');
  token = token ? token : getToken();
  let updated = false;
  var fileType = 'image'
  var uploadFile = null


  if (file) {

    if (Array.isArray(file)) {
      var uploadFile = [];
      var fileType = [];
      file.map((f, i) => {
        if (body[f] && body[f][0]) {
          fileType[i] = f;
          uploadFile[i] = body[f][0];
          delete body[f];
        }
      })
    } else {
      var uploadFile = null;
      var fileType = '';
      fileType = file;
      if (body[fileType] && body[fileType][0]) {
        file = body[fileType][0];
        uploadFile = file
      }
      delete body[fileType];

    }

  }

  let headers = {
    'Content-Type': 'application/json',
  }

  if (token != undefined) {
    headers['x-auth-token'] = token
  }

  body = JSON.stringify(body)

  // 
  let data = await fetch(apiAddUrl, {
    method: 'POST',
    headers: headers,
    body: body
  });

  // Get Json value 
   let dataJson = {}
  if (data.status != 502) {
    dataJson = await data.json();
  }
  let id = dataJson.id;

  // Check If API status true Or not
  if (data.status === 200 && dataJson.error == null) {
    updated = true;

    // If file exist then upload 
    if (file !== null) {

      if (Array.isArray(file)) {

        fileType.map(async (f, i) => {
          // Upload File using fileUpload function
          let file = await fileUpload(apiUrl, id, uploadFile[i], f);
          updated = file.uploded;
        })

      } else {

        if (uploadFile) {
          // Upload File using fileUpload function
          let file = await fileUpload(apiUrl, id, uploadFile, fileType);
          updated = file.uploded;
        }

      }

    }
  }

  // Set Updation Status 
  dataJson.updated = updated;

  return dataJson;
}


// Function for Add Data
export async function send(apiUrl, body = null, file = null) {

  let apiAddUrl = getUrl('/' + apiUrl);
  let token = getToken();
  let updated = false;
  var fileType = 'image'
  var uploadFile = null

  if (file) {

    if (Array.isArray(file)) {
      uploadFile = [];
      fileType = [];
      file.map((f, i) => {

        fileType[i] = f;
        uploadFile[i] = body[f][0];
        delete body[f];

      })
    } else {
      uploadFile = null;
      fileType = '';
      fileType = file;
      file = body[fileType][0];
      delete body[fileType];

      uploadFile = file
    }

  }

  body = JSON.stringify(body)

  // 
  let data = await fetch(apiAddUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token
    },
    body: body
  });

  // Get Json value 
   let dataJson = {}
  if (data.status != 502) {
    dataJson = await data.json();
  }
  let id = dataJson.id;

  // Check If API status true Or not
  if (data.status === 200 && dataJson.error == null) {
    updated = true;

    // If file exist then upload 
    if (file !== null) {

      if (Array.isArray(file)) {

        fileType.map(async (f, i) => {
          // Upload File using fileUpload function
          let file = await fileUpload(apiUrl, id, uploadFile[i], f);
          updated = file.uploded;
        })

      } else {
        // Upload File using fileUpload function
        let file = await fileUpload(apiUrl, id, uploadFile, fileType);
        updated = file.uploded;

      }

    }
  }

  // Set Updation Status 
  dataJson.updated = updated;
  return dataJson;
}


// Function For File Upload
export async function fileUpload(apiUrl, id, file, fileType, destination = null) {

  // Add file to form data
  var form = new FormData();
  form.append('file', file);
  form.append('fileType', fileType);
  form.append('id', id);

  // add URL for api
  let apiUploadUrl = getUrl(`/upload?field=${apiUrl}&&destination=${destination}`);

  let token = getToken();
  let uploded = false;
  let data = await fetch(apiUploadUrl, {
    method: 'POST',
    headers: {
      'x-auth-token': token
    },
    body: form
  });

  // Get Json value 
   let dataJson = {}
  if (data.status != 502) {
    dataJson = await data.json();
  }

  // Check If API status true Or not
  if (data.status === 200) {
    uploded = true;
  }

  // Set Updation Status 
  dataJson.uploded = uploded;
  return dataJson;
}

// Function for Delete Data
export async function deleteData(apiUrl, body) {

  let apiEditUrl = getUrl('/' + apiUrl + '/delete');
  let token = getToken();
  let deleted = false;

  // 
  let data = await fetch(apiEditUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token
    },
    body: body,
  });

  // Get Json value 
   let dataJson = {}
  if (data.status != 502) {
    dataJson = await data.json();
  }

  // Check If API status true Or not
  if (data.status === 200 && dataJson.error == null) {
    deleted = true
  }
  else {
    deleted = false;
  }

  // Set Updation Status 
  dataJson.deleted = deleted;
  return dataJson;

}

// Function for Bulk Delete Data
export async function bulkDelete(apiUrl, body) {

  let apiEditUrl = getUrl('/' + apiUrl + '/bulk-delete');
  let token = getToken();
  let deleted = false;

  // 
  let data = await fetch(apiEditUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token
    },
    body: body,
  });

  // Get Json value 
   let dataJson = {}
  if (data.status != 502) {
    dataJson = await data.json();
  }

  // Check If API status true Or not
  if (data.status === 200 && dataJson.error == null) {
    deleted = true
  }
  else {
    deleted = false;
  }

  // Set Updation Status 
  dataJson.deleted = deleted;
  return dataJson;

}

// Login
export async function loginAdmin(data) {
  const ttlMs = process.env.NEXT_PUBLIC_JWT_TTLMS;

  
  let login = await fetch(getUrl('/auth/admin-login'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS'
    },
    body: JSON.stringify(data)
  });

  let loginJson = await login.json();
  let response;

  if (login.status === 200) {
    if (!loginJson.token && loginJson.is2FAEnabled) {

      response = {
        loggedIn: true,
        is2FAEnabled: true,
        ...loginJson
      };

      localStorage.setItem('2faAuthentication', JSON.stringify({
        validateUser: true,
        userID: loginJson.userId,
      })
      )

    } else {
      response = {
        loggedIn: true,
        ...loginJson
      };
      localStorage.clear();


      localStorage.setItem('login', JSON.stringify({
        login: true,
        token: loginJson.token,
        expiryAt: (new Date().getTime() + ttlMs)
      })
      )
    }
  }
  else {
    response = {
      loggedIn: false,
      ...loginJson
    };
  }
  return response;
}

// Login
export async function loginUser(data) {
  const ttlMs = process.env.NEXT_PUBLIC_JWT_TTLMS;
  
  let login = await fetch(getUrl('/auth/login'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS'
    },
    body: JSON.stringify(data)
  });

  let loginJson = await login.json();
  if (login.status === 200) {
    loginJson.loggedIn = true

    if (loginJson.token) {
      localStorage.clear();

      localStorage.setItem('login', JSON.stringify({
        login: true,
        token: loginJson.token,
        expiryAt: (new Date().getTime() + ttlMs)
      })
      )
    }
    else {

      localStorage.clear();

      localStorage.setItem('register', JSON.stringify({
        register: true,
        user: loginJson.user
      })

      )
    }
  }


  return loginJson;
}

// Register
export async function registerUser(data) {


  let register = await fetch(getUrl('/auth/register'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  let registerJson = await register.json();

  if (register.status === 200) {
    registerJson.loggedIn = true

    localStorage.clear();

    localStorage.setItem('register', JSON.stringify({
      register: true,
      user: registerJson.user.data
    })

    )
  }

  return registerJson;
}

// Register
export async function verifyOtp(data) {
  const ttlMs = process.env.NEXT_PUBLIC_JWT_TTLMS;

  let verify = await fetch(getUrl('/auth/varify-otp'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  let verifyJson = await verify.json();

  let response;

  if (verify.status === 200) {
    response = {
      loggedIn: true,
      ...verifyJson
    };

    localStorage.clear();

    localStorage.setItem('login', JSON.stringify({
      login: true,
      token: verifyJson.token,
      expiryAt: (new Date().getTime() + ttlMs)
    })
    )
  }
  else {
    response = {
      loggedIn: false,
      ...verifyJson
    };
  }
  return response;
}


// Forgot Passoword
export async function forgotPassword(data) {
  let forgotPassword = await fetch(getUrl('/auth/forgot-password'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  let forgotPasswordJson = await forgotPassword.json();
  let response;

  if (forgotPassword.status === 200) {
    response = forgotPasswordJson;

    localStorage.clear();
    localStorage.setItem('UserId', forgotPasswordJson.user.id)
  }
  else {
    response = forgotPasswordJson;
  }

  return response;
}

// Reset Passoword
export async function resetPassword(data) {
  let resetPassword = await fetch(getUrl('/auth/reset-password'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  let resetPasswordJson = await resetPassword.json();
  let response;

  if (resetPassword.status === 200) {
    response = {
      resetPassword: true,
      values: resetPasswordJson
    };

    localStorage.clear();
  }
  else {
    response = {
      resetPassword: false,
      values: resetPasswordJson
    };
  }

  return response;
}


// Send Mail
export async function sendMail(data) {
  let mail = await fetch(getUrl('/sendmail'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: data
  });

  let mailJson = await mail.json();
  let response;

  if (mail.status === 200) {
    response = {
      mailed: true,
      values: mailJson
    };
  }
  else {
    response = {
      mailed: false,
      values: mailJson
    };
  }

  return response;
}

export async function splashUpload(apiUrl, file) {

  // Add file to form data


  var form = new FormData();
  form.append('file', file[0]);

  // add URL for api

  let apiUploadUrl = getUrl(`/upload?field=${apiUrl}`);
  let token = getToken();
  let uploded = false;
  let data = await fetch(apiUploadUrl, {
    method: 'POST',
    headers: {
      'x-auth-token': token
    },
    body: form
  });

  // Get Json value 

   let dataJson = {}
  if (data.status != 502) {
    dataJson = await data.json();
  }
  let path = dataJson.path;

  // Check If API status true Or not

  if (data.status === 200) {
    uploded = true;
  }

  // Set Updation Status 

  dataJson.uploded = uploded;
  return dataJson;

}

// Function for Fetch All Data
export async function getSettings(apiUrl) {

  apiUrl = getUrl('/settings/' + apiUrl);
  let data = await fetch(`${apiUrl}?tokenAccessable=true`);


  let dataJson = data.status === 200 ? await data.json() : null;

  // Check If API status true Or not
  if (data.status === 200 && dataJson.error == null) {
    return dataJson.value
  }

  else {
    return null
  }
}



// Register
export async function verify2fa(data) {
  const ttlMs = process.env.NEXT_PUBLIC_JWT_TTLMS;

  let verify = await fetch(getUrl('/auth/varify-2fa'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  let verifyJson = await verify.json();

  let response;

  if (verify.status === 200) {
    response = {
      loggedIn: true,
      ...verifyJson
    };

    localStorage.clear();

    localStorage.setItem('login', JSON.stringify({
      login: true,
      token: verifyJson.token,
      expiryAt: (new Date().getTime() + ttlMs)
    })
    )
  }
  else {
    response = {
      loggedIn: false,
      ...verifyJson
    };
  }
  return response;
}




