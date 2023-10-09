import { Component } from 'react';
import Router from 'next/router';
import Link from 'next/link';
import { verify2fa, fetchByID } from 'helpers/apiService';
import Validation from 'components/functional-ui/forms/validation'
import { redirect, getUser } from 'helpers/auth'
import Alert from 'components/functional-ui/alerts'
import { FiAlertCircle } from 'react-icons/fi'
import AuthLayout from 'layouts/auth'
// import { redirect } from 'next/dist/next-server/server/api-utils';

import define from 'src/json/worddefination.json'

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

        let login = await verify2fa(data);
        if (login.loggedIn == false) {
            this.setState({
                login: false,
                isSubmitting: false,
                error: login.error
            })

            // toastr.error(login.error)
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


        this.setState({
            redirectUrl: localStorage.getItem('redirectUrl')
        }, () => localStorage.removeItem('redirectUrl'))

        var storage = JSON.parse(localStorage.getItem('2faAuthentication'))
        var user;


        console.log(storage)

        if (storage && storage.userID) {
            this.setState({
                // user: user,
                items: [
                    {
                        label: '',
                        name: 'id',
                        type: 'hidden',
                        placeholder: 'Enter your Mobile Number',
                        className: 'w-full',
                        defaultValue: storage.userID,
                    },
                    {
                        label: 'Two factor authentication Code',
                        error: {
                            required: 'Please Enter Two factor authentication COde',
                        },
                        name: 'code',
                        type: 'number',
                        placeholder: 'Enter Two factor authentication Code',
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
                    this.state.items &&
                    <AuthLayout title="Login to your" mainTitle="Admin Account" error={this.state.error} >
                    <>
                    <Validation items={this.state.items} onSubmit={this.handleSubmit} buttonText="Verify Code" />
                        {/* <SocialMedia /> */}
                        <div className="flex flex-row w-full content-center pt-5 ml-auto text-center px-5 justify-center">
                            <span className="text-secondary mr-1 text-gray-500">Unable to access your account?</span>
                            <span>
                                <Link href="https://www.etherealcorporate.com/contact">
                                    <a className="link">Contact Us</a>
                                </Link>
                            </span>
                        </div>
    
    
                        <div className="flex flex-row w-full content-center text-center pb-2 mt-auto mb-0 justify-center">
                            <span className="text-secondary mr-1 text-gray-500">Powered By </span>
                            <span>
                                <Link href="https://www.etherealcorporate.com">
                                    <a className="link">Ethereal Corporate Network Private Limited</a>
                                </Link>
                            </span>
                        </div>
    
    
                    </>
                </AuthLayout>

                }
            </>
        )
    }

}