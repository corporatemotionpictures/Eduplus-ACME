import { Component } from 'react';
import Router from 'next/router';
import Link from 'next/link';
import { forgotPassword, getSettings } from 'helpers/apiService';
import Validation from 'components/functional-ui/forms/validationFront'
import Alert from 'components/functional-ui/alerts'
import { FiAlertCircle } from 'react-icons/fi'

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

            Router.push('/auth/reset-password');
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
                className: 'col-12 col-sm-12 col-md-12'
            },
        ]

        return (

            <>
                <section className="about_us gate_syllabus login-bg">
                    <div className="container">
                        <div class="sign__shape">
                            <img class="man-1" src="/images/background-images/man-3.png" alt=""></img>
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

                        <div className="col-md-6 offset-md-3 col-lg-4 offset-lg-4  ">

                            <div className="about_title_2 sm-mt-4 mt-lg-5 pt-lg-5">
                                <h5>Reset your</h5>
                                <h3 className="font-saffron"><b>Account Password</b></h3>
                            </div>

                            <hr className="mb-5"></hr>

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

                        </div>

                    </div>
                </section>

            </>

        )
    }

}