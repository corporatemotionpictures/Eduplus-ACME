import { Component } from 'react';
import Router from 'next/router';
import Link from 'next/link';
import { forgotPassword, getSettings } from 'helpers/apiService';
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

    let login = await forgotPassword(data);
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

      Router.push('/web-app/auth/reset-password');
    }

  }

  // 
  componentDidMount() {

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
        placeholder: 'Enter Your Registered Mobile Number',
        className: 'col-12 col-sm-12 col-md-12 mb-0'
      },
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
                      <h2 className="login mb-0">Reset your</h2>
                      <h3 className=""><b>Account Password</b></h3>

                      {this.state.error && (
                        <div className="w-full mb-4">
                          <Alert
                            color="bg-base text-white"
                            icon={<FiAlertCircle className="mr-2 stroke-current h-4 w-4" />}>
                            {this.state.error}
                          </Alert>
                        </div>
                      )}
                      <Validation items={items} onSubmit={this.handleSubmit} buttonText="Send Verification Code" />
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