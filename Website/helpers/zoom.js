import jwt from 'jsonwebtoken';
import { knexConnectionConfig } from 'db/knexConnection';
import { getSettings } from 'helpers/apiService';
import axios from 'axios';
import fetch from 'isomorphic-unfetch';
import rn from 'random-number';
import Fuse from "fuse.js"
import FormData from 'isomorphic-form-data';
// import nodemailer from 'nodemailer'
import { Vimeo } from 'vimeo';
import twilio from 'twilio';
import { isEmptyArray } from 'formik';
import moment from 'moment'
import crypto from 'crypto'
import { add, fetchAllFcmtoken, getUrl, fetchAll } from "helpers/apiService";


let baseUrl = 'https://api.zoom.us/v2';
let userID = 'jwNKwceqQIWX8xp70OGGXQ';

// Generate the Token 
export async function genrateToken() {

  let zoomAuth = await getSettings('zoomAuth');

  let apiKey = zoomAuth.apiKey;
  let apiSecret = zoomAuth.apiSecret;

  const payload = {
    iss: apiKey,
    exp: ((new Date()).getTime() + 5000)
  };

  const jwtSecret = apiSecret;

  var token = null
  
  token = jwt.sign(payload, jwtSecret);
  return token;
}

// Genrate SDK Signature
export async function generateSignature(meetingNumber, role) {

  let zoomAuth = await getSettings('zoomAuth');

  let apiKey = zoomAuth.apiKey;
  let apiSecret = zoomAuth.apiSecret;

  // Prevent time sync issue between client signature generation and zoom 
  const timestamp = new Date().getTime() - 30000
  const msg = Buffer.from(apiKey + meetingNumber + timestamp + role).toString('base64')
  const hash = crypto.createHmac('sha256', apiSecret).update(msg).digest('base64')
  const signature = Buffer.from(`${apiKey}.${meetingNumber}.${timestamp}.${role}.${hash}`).toString('base64')

  return signature
}

export async function users() {

  let apiUrl = baseUrl.concat('/users/me')
  let token = await genrateToken()

  let data = await fetch(apiUrl, {
    headers: {
      'authorization': `Bearer ${token}`
    },
  });


  let dataJson = await data.json();
  return dataJson

}

export async function list() {

  let apiUrl = baseUrl.concat('/users/me/meetings')
  let token = await genrateToken()

  let data = await fetch(apiUrl, {
    headers: {
      'authorization': `Bearer ${token}`
    },
  });


  let dataJson = await data.json();
  return dataJson

}

export async function getOne(meetingId, type, zoom_uuid) {
  type = type ? type : 'meetings'

  let apiUrl = baseUrl.concat(`/${type}/${meetingId}`)
  let token = await genrateToken()

  let data = await fetch(apiUrl, {
    headers: {
      'authorization': `Bearer ${token}`
    },
  });


  let dataJson = await data.json();



  if (zoom_uuid) {

    apiUrl = baseUrl.concat(`/${type}/${zoom_uuid}/recordings`)
    token = await genrateToken()

    data = await fetch(apiUrl, {
      headers: {
        'authorization': `Bearer ${token}`
      },
    });


    dataJson.recording = await data.json();
  }

  return dataJson

}

export async function create(zoomAttributes, type) {
  type = type ? type : 'meetings'

  let apiUrl = baseUrl.concat(`/users/me/${type}`)
  let token = await genrateToken()

  if (zoomAttributes.recurrence && Object.keys(zoomAttributes.recurrence).length === 0) {
    delete zoomAttributes.recurrence
  }

  let data = zoomAttributes

  data = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (data) {
    let dataJson = await data.json();
    return dataJson
  }

}

export async function update(zoomAttributes, meetingId, type) {
  type = type ? type : 'meetings'

  let apiUrl = baseUrl.concat(`/${type}/${meetingId}`)
  let token = await genrateToken()

  let data = zoomAttributes

  data = await fetch(apiUrl, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });


  if (data.status == 204) {
    data = true
  } else {
    data = false
  }
  return data

}

export async function updateStatus(status, meetingId, type) {
  type = type ? type : 'meetings'

  let apiUrl = baseUrl.concat(`/${type}/${meetingId}/status`)
  let token = await genrateToken()

  let data = {
    action: status
  }

  data = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (data.status == 204) {
    data = true
  } else {
    data = false
  }
  return data

}

export async function deleteData(meetingId, type) {
  type = type ? type : 'meetings'

  let apiUrl = baseUrl.concat(`/${type}/${meetingId}`)
  let token = await genrateToken()


  let data = await fetch(apiUrl, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'authorization': `Bearer ${token}`
    }
  });

  if (data.status == 204) {
    data = true
  } else {
    data = false
  }
  return data

}

