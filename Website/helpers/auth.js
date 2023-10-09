import Router from 'next/router';
import toastr from 'toastr';
import { get } from 'helpers/apiService';

// Function for Fetch lacalstoragen data 
export async function getStorageData() {
  let response = JSON.parse(localStorage.getItem('login'));

  if (response && response.token) {
    let user = await get('users/check-token', { forWeb: true });


    if (response && (new Date().getTime() > response.expiryAt || user.success == false)) {
      // If the item is expired, delete the item from storage
      // and return null
      toastr.error(user.message)
      localStorage.removeItem('login')
      return null
    } else {
      response.user = user.user
    }
  }
  return response

}

// Check if user alrady logged IN
export async function authGaurd() {
  let storage = await getStorageData();
  let type = null;
  if (storage && storage.login) {
    if (storage.user.type == "ADMIN" || storage.user.type == "MANAGEMENT" || storage.user.type == "FACULTY") {
      type = "isAdmin";
    }
    else {
      type = "isUser";
    }
  }
  return type;
}

// Redirect
export async function redirect() {
  let type = await authGaurd();
  if (type == "isAdmin") {
    Router.push('/dashboard');
  }
  else if (type == "isUser") {
    Router.push('/');
  }
  else {
    Router.push('/auth/login');
  }
}

// Logout
export async function logout(path = null) {
  let storage = JSON.parse(localStorage.getItem('login'));
  if (storage && storage.login) {
    localStorage.clear();
    if (path) {
      Router.push(path);
    } else {

      Router.push('/auth/login');
    }
  }
}

// Get User
export async function getUser() {
  let storage = await getStorageData();
  if (storage && storage.login) {
    if (storage.user) {
      let user = storage.user;
      return user;
    }
  }
}

// Get Token
export function getToken() {
  let storage = JSON.parse(localStorage.getItem('login'));
  let token = null
  if (storage && storage.login) {
    token = storage.token;
  }

  return token;
}