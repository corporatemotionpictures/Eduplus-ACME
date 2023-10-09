import { Component } from 'react';
import Router from 'next/router';
import Link from 'next/link';
import { resetPassword, getSettings } from 'helpers/apiService';
import SocialMedia from 'components/functional-ui/login/social-media'
import Validation from 'components/functional-ui/forms/validationFront'
import AuthLayout from 'layouts/auth'
import Alert from 'components/functional-ui/alerts'
import { FiAlertCircle } from 'react-icons/fi'

import define from 'src/json/worddefination.json'

export default class Login extends Component {

  // Set state
  state = {
    isSubmitting: true,
    login: false,
    error: null,
    gourd: null,
  };

  // Function For Login
  handleSubmit = async (data) => {

    data.id = localStorage.getItem('UserId')
    let login = await resetPassword(data);

    console.log(login)
    if (login.values.success == false) {

      let error;
      if (login.values.error) {
        error = login.values.error.details ? login.values.error.details[0].message : login.values.error
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

      Router.push('/web-app/auth/login');
    }

  }

  // 
  componentDidMount() {

  }

  render() {

    let items = [
      {
        label: 'Verification Code',
        error: {
          required: 'Please enter Verification Code',
        },
        name: 'ver_code',
        type: 'text',
        placeholder: 'Enter OTP',
        className: 'col-12 col-sm-12 col-md-12'
      },
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
      },
      {
        label: 'Confirm Password',
        error: {
          required: 'Confirm Password is required',
          minLength: {
            value: 4,
            message: 'Your password should have at least 4 characters'
          },
        },
        name: 'confirm_password',
        type: 'password',
        placeholder: 'Enter your Confirm password',
        className: "col-12 col-sm-12 col-md-12",
      }
    ]

    return (

      <>

        <div className="defult-home">
          {/* Main content Start */}
          <div className="main-content">
            {/* My Account Section Start */}
            <section className="header-bg" />
            <div className="rs-login bgLogin pt-50 pb-100 md-pt-35 md-pb-35">
              <div className="container">
                {this.state.error && (
                  <div className="w-full mb-4">
                    <Alert
                      color="bg-red-500 text-white p-0"
                      icon={<FiAlertCircle className="mr-2 stroke-current h-4 w-4" />}>
                      {this.state.error}
                    </Alert>
                  </div>
                )}

                <div className="noticed">
                  <div className="main-part">
                    <div className="method-account">
                      <h2 className="login mb-0">Login to</h2>
                      <h3 className=""><b>Your Account</b></h3>


                      {this.state.error && (
                        <div className="w-full mb-4">
                          <Alert
                            color="bg-base text-white"
                            icon={<FiAlertCircle className="mr-2 stroke-current h-4 w-4" />}>
                            {this.state.error}
                          </Alert>
                        </div>
                      )}
                      <Validation items={items} onSubmit={this.handleSubmit} buttonText="Submit" />
                      <div className="last-password">
                        <p>Not registered? <Link href="/auth/register"><a>Create an account</a></Link></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* My Account Section End */}
        </div>

      </>

    )
  }

}