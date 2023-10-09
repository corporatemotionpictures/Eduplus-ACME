import { Component } from 'react';
import Router from 'next/router';
import Link from 'next/link';
import { loginUser, getSettings } from 'helpers/apiService';
import ValidationFront from 'components/functional-ui/forms/validationFront'
import Alert from 'components/functional-ui/alerts'
import { FiAlertCircle } from 'react-icons/fi'

export default class Login extends Component {

    // Set state
    state = {
        isSubmitting: true,
        login: false,
        error: null,
        gourd: null,
        redirectUrl: null,
    };

    // Function For Login
    handleSubmit = async (data) => {

        data.gourd = 'webLogin'

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
                    Router.push('/accounts/board');
                }
            } else {
                Router.push('/auth/verify-otp/');
            }
        }

    }

    fetch = async () => {

        this.setState({
            redirectUrl: localStorage.getItem('redirectUrl')
        }, () => localStorage.removeItem('redirectUrl'))
        
        let gourd = await getSettings('webLogin')

        console.log(gourd)
        this.setState({
            gourd: gourd
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
                <section className="about_us gate_syllabus">
                <div class="sign__shape">
               <img class="man-1" src="/images/background-images/man-1.png" alt=""></img>
               <img class="man-2 man-22" src="/images/background-images/man-2.png" alt=""></img>
               <img class="circle" src="/images/background-images/circle.png" alt=""></img>
               <img class="zigzag" src="/images/background-images/zigzag.png" alt=""></img>
               <img class="dot" src="/images/background-images/dot.png" alt=""></img>
               <img class="bg" src="/images/background-images/sign-up.png" alt=""></img>
               <img class="flower" src="/images/background-images/flower.png" alt=""></img>
            </div>
            <header className="header_inner courses_page">
        <div className="intro_wrapper product_head_2 ">
          <div className="container">
            <div className="row">
              <div className="col-sm-12 col-md-8 col-lg-8">

              </div>
            </div>
          </div>
        </div>

      </header>
                    <div className="container">

                        <div className="col-sm-10 col-md-6 col-lg-5 size mt-lg-5 mb-lg-3 sm-mt-4">

                            <div className="about_title_2 mb-4 pt-md-5">
                                <h5>Login to</h5>
                                <h3 className="font-saffron"><b>Your Account</b></h3>
                            </div>

                            <hr className="mb-5"></hr>

                            {this.state.error && (
                                <div className="w-full mb-4">
                                    <Alert
                                        color="bg-red-500 text-white p-0"
                                        icon={<FiAlertCircle className="mr-2 stroke-current h-4 w-4" />}>
                                        {this.state.error}
                                    </Alert>
                                </div>
                            )}

                            <ValidationFront items={items} onSubmit={this.handleSubmit} buttonText="Login Account" />

                            {
                                this.state.gourd == 'PASSWORD' && <Link href="/auth/forgot-password">
                                    <a className="w-100 d-block text-center mt-5 reset_hover">Forgot Password? <span className="font-saffron">Reset</span></a>
                                </Link>
                            }

                        </div>

                    </div>
                </section>

            </>

        )
    }

}