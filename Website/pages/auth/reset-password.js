import { Component } from 'react';
import Router from 'next/router';
import Link from 'next/link';
import { resetPassword, getSettings } from 'helpers/apiService';
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

            Router.push('/auth/login');
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
                <section className=" gate_syllabus login-bg verify_space">
                    <div className="container">

                        <div className="col-md-4 offset-md-4 ">

                            <div className="text-center mb-3">
                                <h5>Login to</h5>
                                <h3 className="font-saffron"><b>Your Account</b></h3>
                            </div>

                            <hr />

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

                        </div>

                    </div>
                </section>

            </>

        )
    }

}