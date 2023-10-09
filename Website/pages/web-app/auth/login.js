import { Component } from 'react';
import Head from "next/head";
import Router from 'next/router';
import Link from 'next/link';
import { loginUser, getSettings } from 'helpers/apiService';
import SocialMedia from 'components/functional-ui/login/social-media'
import Validation from 'components/functional-ui/forms/validationFront'
import AuthLayout from 'layouts/auth'
import Alert from 'components/functional-ui/alerts'
import { FiAlertCircle } from 'react-icons/fi'
import toastr from 'toastr'


import define from 'src/json/worddefination.json'

export default class Login extends Component {
   // Set state
   state = {
      isSubmitting: true,
      login: false,
      error: null,
      gourd: null,
      macineId: null,
      redirectUrl: null,
   };

   // Function For Login
   handleSubmit = async (data) => {
      data.gourd = 'webLogin'
      data.machine_id = this.state.macineId
      let login = await loginUser(data);
      if (login.success == false) {
         let error;
         if (login.user) {
            error = login.user.error
         }
         else if (login.error) {
            error = login.error.details ? login.error.details[0].message : login.error
         }
         toastr.error(error)
         this.setState({
            login: false,
            isSubmitting: false,
            error: error
         })
      }
      else {
         this.setState({
            login: true,
         })
         if (this.state.gourd == 'PASSWORD') {
            console.log(this.state.redirectUrl)
            if (this.state.redirectUrl) {
               let url = this.state.redirectUrl;
               Router.push(url);
            } else {
               Router.push('/web-app/dashboard');
            }
         } else {
            Router.push('/web-app/auth/verify-otp/');
         }
      }
   }

   fetch = async () => {
      this.setState({
         redirectUrl: localStorage.getItem('redirectUrl')
      }, () => localStorage.removeItem('redirectUrl'))
      let gourd = await getSettings('webLogin')
      console.log(gourd)

      const biri = require('biri')
      const macineId = await biri()
      console.log(macineId)
      this.setState({
         gourd: gourd,
         macineId: macineId
      })

   }
   // 
   componentDidMount() {
      this.fetch()
   }
   render() {
      let items = [
         {
            label: 'Mobile Number',
            error: {
               required: 'Please enter mobile number',
            },
            name: 'mobile_number',
            type: 'number',
            placeholder: 'Enter your Registered Mobile Number',
            className: 'col-12 col-sm-12 col-md-12'
         },
      ]

      if (this.state.gourd == 'PASSWORD') {
         items.push(
            {
               label: 'Password',
               error: {
                  required: 'Password is required',
                  minLength: {
                     value: 4,
                     message: 'Your password should have at least 4 characters'
                  },
               },
               name: 'password',
               type: 'password',
               placeholder: 'Enter your password',
               className: "col-12 col-sm-12 col-md-12",
            })
      }
      return (
         <>
            <section className="about_us gate_syllabus weblogin-bg">
               <div className="container">

                  <div className="col-md-4 offset-md-6 float-right mt-5">

                     <div className="text-center mb-3">
                        <h5>Login to</h5>
                        <h3 className="font-saffron"><b>Your Account</b></h3>
                     </div>

                     <hr className="mb-2"></hr>

                     {this.state.error && (
                        <div className="w-full mb-4">
                           <Alert
                              color="bg-red-500 text-white p-0"
                              icon={<FiAlertCircle className="mr-2 stroke-current h-4 w-4" />}>
                              {this.state.error}
                           </Alert>
                        </div>
                     )}

                     <Validation items={items} onSubmit={this.handleSubmit} buttonText="Login Account" />

                     {
                        this.state.gourd == 'PASSWORD' && false && <Link href="/web-app/auth/forgot-password">
                           <a className="w-100 d-block text-center mt-5">Forgot Password? <span className="font-saffron">Reset Password</span></a>
                        </Link>
                     }

                  </div>

               </div>
            </section>
         </>
      )
   }
}