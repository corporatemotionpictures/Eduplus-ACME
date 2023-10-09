import { Component } from 'react';
import Router from 'next/router';
import Link from 'next/link';
import { verifyOtp, fetchByID } from 'helpers/apiService';
import Validation from 'components/functional-ui/forms/validationFront'
import { redirect } from 'helpers/auth'
import Alert from 'components/functional-ui/alerts'
import { FiAlertCircle } from 'react-icons/fi'
// import { redirect } from 'next/dist/next-server/server/api-utils';

export default class Login extends Component {

    // Set state
    state = {
        isSubmitting: true,
        login: false,
        error: null,
        user: {},
        redirectUrl: null,
    };

    // Function For Login
    handleSubmit = async (data) => {

        let login = await verifyOtp(data);
        if (login.loggedIn == false) {
            this.setState({
                login: false,
                isSubmitting: false,
                error: login.error
            })
        }
        else {
            this.setState({
                login: true,
            })

            if (this.state.redirectUrl) {
                let url = this.state.redirectUrl;
                Router.push(url);
            } else {
                Router.push('/accounts/account-info');
            }
        }

    }

    // 
    componentDidMount() {


        this.setState({
            redirectUrl: localStorage.getItem('redirectUrl')
        }, () => localStorage.removeItem('redirectUrl'))

        var storage = JSON.parse(localStorage.getItem('register'))
        var user;

        if (storage && storage.user) {
            user = storage.user
            this.setState({
                user: user,
                items: [
                    {
                        label: '',
                        name: 'id',
                        type: 'hidden',
                        placeholder: 'Enter your Mobile Number',
                        className: 'w-full',
                        defaultValue: user.id,
                    },
                    {
                        label: '',
                        name: 'mobile_number',
                        type: 'hidden',
                        placeholder: 'Enter your Mobile Number',
                        className: 'w-full',
                        defaultValue: user.mobile_number,
                    },
                    {
                        label: '',
                        name: 'uuid',
                        type: 'hidden',
                        placeholder: 'Enter your Mobile Number',
                        className: 'w-full',
                        defaultValue: user.uuid,
                    },
                    {
                        label: 'Enter OTP',
                        error: {
                            required: 'Please enter OTP',
                        },
                        name: 'ver_code',
                        type: 'number',
                        placeholder: 'Enter OTP',
                        className: 'w-full',
                    },

                ]
            })
        } else {
            redirect()
        }

    }

    render() {

        return (
            <>
                {
                    this.state.user && this.state.items &&

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

                                <Validation items={this.state.items} onSubmit={this.handleSubmit} buttonText="Submit" />

                            </div>

                        </div>
                    </section>
                }
            </>
        )
    }

}