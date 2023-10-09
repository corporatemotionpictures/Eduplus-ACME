import { Component } from 'react';
import Router from 'next/router';
import Link from 'next/link';
import { loginAdmin } from 'helpers/apiService';
import Validation from 'components/functional-ui/forms/validation'
import AuthLayout from 'layouts/auth'
import { getUser } from 'helpers/auth';

import define from 'src/json/worddefination.json'

export default class Login extends Component {

    // Set state
    state = {
        isSubmitting: true,
        login: false,
        error: null,
    };

    // Function For Login
    handleSubmit = async (data) => {

        let login = await loginAdmin(data);
        if (login.loggedIn == true && login.is2FAEnabled) {
            Router.push('/auth/admin/verify-2fa');
        }
        else if (login.loggedIn == false) {
            this.setState({
                login: false,
                isSubmitting: false,
                error: "Invalid Email Or password"
            })
        }
        else {
            this.setState({
                login: true,
            })

            let user = await getUser()

            if (user.type != 'ADMIN') {
                let urls = []
                user.modules.map(module => { urls.push(module.url) })
                if (!urls.includes('/dashboard')) {
                    Router.push('/dashboard/tutorials');
                } else {
                    Router.push('/dashboard');
                }

            } else {
                Router.push('/dashboard');
            }

        }

    }

    // 
    componentDidMount() {

    }

    render() {

        let items = [
            {
                label: 'Email',
                error: { required: 'Please enter a valid email' },
                name: 'email',
                type: 'email',
                placeholder: 'Enter you email',
                className: 'w-full'
            },
            {
                label: 'Password',
                error: {
                    required: 'Password is required',
                    minLength: {
                        value: 4,
                        message: 'Your password should have at least 4 characters'
                    }
                },
                name: 'password',
                type: 'password',
                placeholder: 'Enter your password',
                className: 'w-full'
            },
        ]

        return (
            <AuthLayout title="Login to your" mainTitle="Admin Account" error={this.state.error} >
                <>
                    <Validation items={items} onSubmit={this.handleSubmit} buttonText="Login" />
                    {/* <SocialMedia /> */}
                    <div className="flex flex-row w-full content-center lg:pt-5 pt-2 ml-auto text-center lg:px-5 justify-center">
                        <span className="text-secondary mr-1 text-gray-500">Unable to access your account?</span>
                        <span>
                            <Link href="https://www.etherealcorporate.com/contact">
                                <a className="link">Contact Us</a>
                            </Link>
                        </span>
                    </div>


                    <div className=" hidden lg:flex lg:flex-row w-full content-center text-center pb-2 mt-auto mb-0 justify-center">
                        <span className="text-secondary mr-1 text-gray-500">Powered By </span>
                        <span>
                            <Link href="https://www.etherealcorporate.com">
                                <a className="link">Ethereal Corporate Network Private Limited</a>
                            </Link>
                        </span>
                    </div>


                </>
            </AuthLayout>
        )
    }

}