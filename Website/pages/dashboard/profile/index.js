import { Component } from 'react';
import { fetchAll, deleteData, updateAdditional, splashUpload, edit, post } from 'helpers/apiService';
import React from 'react'
import SectionTitle from 'components/functional-ui/section-title'
import Widget from 'components/functional-ui/widget'
import toastr from 'toastr';
import define from 'src/json/worddefination.json'
import { getUser } from 'helpers/auth';
import Validation from 'components/functional-ui/forms/validation'
import { generateSecret, generateQRCode, verify } from 'helpers/2fa';
import { UnderlinedTabs } from 'components/functional-ui/tabs'

//

export default class extends Component {
    state = {
        values: {},
        search: '',
        id: null,
        fetching: true,
        imageLimits: {},
        baseTitle: 'Profile',
        modelTitle: 'users',
        queryTitle: 'users',
        activated2fa: false,
        recoveryCodes: [],
        secret: null
    }

    static getInitialProps({ query }) {
        return query;
    }
    // Function for fetch data
    fetchList = async () => {

        var imageLimits = await fetchAll('image-size-limits', { 'label': this.state.queryTitle });
        imageLimits = imageLimits.success = true ? imageLimits.sizes : {}
        this.setState({ fetching: false, imageLimits: imageLimits })

        let user = await getUser()
        this.setState({ user: user })

        if (user && user.authenticationDetails && user.authenticationDetails.secret) {
            this.setState({ authenticationDetails: true, secret: user.authenticationDetails.secret })
        }
        if (user && user.authenticationDetails && user.authenticationDetails.is_active) {
            this.setState({ activated2fa: true, authenticationDetails: true, recoveryCodes: user.authenticationDetails.recovery_keys })
        }
    }


    onStoreSubmit = async (data) => {

        let user = await edit(this.state.modelTitle, data, 'image');
        let message = `${this.state.baseTitle} Updated Successfully`

        // check Response
        if (user.updated) {
            toastr.success(message)
            this.fetchList()

            this.setState({
                showModel: false
            })
        }
        else {
            let error;
            if (user.user) {
                error = user.user.error
            }
            else if (user.error) {
                error = user.error.details ? user.error.details[0].message : user.error
            }
            toastr.error(error)
        }
    }



    generateQR = async () => {
        const user = this.state.user;

        if (user.authenticationDetails && user.authenticationDetails.secret) {
            user.secret = user.authenticationDetails.secret

            const imageUrl = generateQRCode(user.email, user.secret);

            this.setState({
                twofaqr: imageUrl,
                authenticationDetails: true
            })

        } else {
            user.secret = generateSecret();

            let data = {
                user_id: this.state.user.id,
                secret: user.secret,
            }

            let postdata = await post('managements/2fa', data)

            if (postdata.success == true) {

                const imageUrl = generateQRCode(user.email, user.secret);

                this.setState({
                    twofaqr: imageUrl,
                    authenticationDetails: true,
                    secret: user.secret
                })
            }
        }
    }


    // Function for delete data
    change2FaStatus = async (status) => {

        let data = {
            user_id: this.state.user.id,
            is_active: status,
        }


        if (status == false) {
            data.recovery_keys = null
        }

        let postdata = await post('managements/2fa', data)

        if (postdata.success == true) {
            toastr.success('2FA Status change Successfull')

            this.setState({
                activated2fa: status
            })
        }
    }

    // Function for delete data
    varifyCode = async (value) => {

        // e.preventDefault()

        this.setState({
            error: null
        })

        let otpToken = value.code
        let user = this.state.user


        const isOTPTokenValid = verify(otpToken, this.state.secret);

        if (isOTPTokenValid) {

            let recoveryCodes = []
            var randomstring = require("randomstring");
            for (let i = 0; i < 16; i++) {

                let random = randomstring.generate({
                    length: 10,
                    charset: 'numeric'
                });

                recoveryCodes.push(random)
            }

            let data = {
                user_id: this.state.user.id,
                is_active: true,
                recovery_keys: JSON.stringify(recoveryCodes)
            }

            let postdata = await post('managements/2fa', data)

            if (postdata.success == true) {
                toastr.success('2FA Status change Successfull')

                this.setState({
                    activated2fa: true,
                    recoveryCodes: JSON.stringify(recoveryCodes)
                })

            }

        } else {

            toastr.success('2FA Status change Successfull')

            this.setState({
                error: 'Invalid Token'
            })
        }

    }

    downloadCodes = (filename, array) => {

        let text = ''
        array = JSON.parse(array)
        array.map(code => {
            text = `${text} ${code} \n`

        })
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    // 
    componentDidMount() {
        this.fetchList();
        // this.fetchBase();
    }

    // 
    render() {
        const items = [

            {
                label: 'Image',
                name: 'image',
                error: {},
                ...this.state.imageLimits,
                fileTypes: ["jpg", "png", "jpeg"],
                type: 'image',
                className: "w-full profile_img ",
                defaultValue: this.state.user && this.state.user.image ? this.state.user.image : '',
                imagePrevClass: "lg:w-1/4 img-fluid ",
                imageprev: "before",
            },
            {
                label: '',
                error: { required: 'Please enter ID' },
                name: 'id',
                type: 'hidden',
                placeholder: 'Enter you ID',
                className: '',
                defaultValue: this.state.user && this.state.user.id ? this.state.user.id : ''
            },
            {
                label: 'First Name',
                error: { required: 'Please enter first name' },
                name: 'first_name',
                type: 'text',
                placeholder: 'Enter you first name',
                className: 'sm:w-1/3',
                defaultValue: this.state.user && this.state.user.first_name ? this.state.user.first_name : ''
            },
            {
                label: 'Last Name',
                error: { required: 'Please enter last name' },
                name: 'last_name',
                type: 'text',
                placeholder: 'Enter you last name',
                className: 'sm:w-1/3',
                defaultValue: this.state.user && this.state.user.last_name ? this.state.user.last_name : ''
            },
            {
                label: 'Mobile Number',
                error: {
                    required: 'Please enter mobile number',
                },
                name: 'mobile_number',
                disabled: false,
                type: 'number',
                placeholder: 'Enter Mobile Number',
                className: 'sm:w-1/3',
                defaultValue: this.state.user && this.state.user.mobile_number ? this.state.user.mobile_number : ''
            },

            {
                label: 'Email',
                error: { required: 'Please enter a valid email' },
                name: 'email',
                type: 'email',
                placeholder: 'Enter you email',
                className: 'sm:w-1/3',
                defaultValue: this.state.user && this.state.user.email ? this.state.user.email : ''
            },
            {
                label: 'Password',
                error: {
                    minLength: {
                        value: 4,
                        message: 'Your password should have at least 4 characters'
                    },
                },
                name: 'password',
                type: 'password',
                placeholder: 'Enter your password',
                className: "sm:w-1/3  ",
            },
            {
                label: 'Confirm Password',
                error: {
                    minLength: {
                        value: 4,
                        message: 'Your password should have at least 4 characters'
                    },
                },
                name: 'confirm_password',
                type: 'password',
                placeholder: 'Enter your Confirm password',
                className: "sm:w-1/3",
            }
        ]

        const tabs = [
            {
                index: 0,
                title: 'Account settings',
                content: (
                    <div className="w-auto content-center">
                        <Validation items={items} onSubmit={this.onStoreSubmit} alerts={false} buttonText="Save profile" />
                    </div>
                )
            },
        ]

        {
            this.state.user && this.state.user.type == 'ADMIN' && process.env.NEXT_PUBLIC_RECOVERY_AUTH == 'true' && tabs.push(
                {
                    index: 1,
                    title: 'Two-factor authentication',
                    content: (
                        <div className="py-4 w-full">
                            {!this.state.activated2fa && <div className="py-4 w-full">
                                {!this.state.twofaqr && <div className="blankslate text-center">


                                    <h5 className="mb-4 font-bold">Two factor authentication is not enabled yet.</h5>
                                    <p className="mb-4 font-bold text-gray-500">Two-factor authentication adds an additional layer of security to your account by requiring more than just a password to sign in.</p>
                                    <button className="btn btn-default btn-rounded bg-base hover:bg-blue-600 text-white" onClick={() => this.generateQR()}>Enable two-factor authentication</button>

                                </div>}
                                {
                                    this.state.twofaqr &&
                                    <div >

                                        <h5 className="mb-1 font-bold">Authentication verification</h5>
                                        <p className="mb-4  text-gray-500">
                                            Scan the image below with the two-factor authentication app on your phone.

                                        </p>
                                        <img className="border p-2" src={this.state.twofaqr} />


                                        {this.state.authenticationDetails &&

                                            <div >
                                                <h5 className="mb-1 mt-4 font-bold">Enter the six-digit code from the application</h5>
                                                <p className="mb-4  text-gray-500">
                                                    After scanning the QR code image, the app will display a six-digit code that you can enter below.
                                                </p>
                                                <Validation items={
                                                    [
                                                        {
                                                            label: '',
                                                            error: { required: 'Please enter code' },
                                                            name: 'code',
                                                            type: 'text',
                                                            placeholder: 'Enter you code',
                                                            className: 'w-full',
                                                        },
                                                    ]
                                                } onSubmit={this.varifyCode} alerts={false} buttonText="Verify Code" />
                                            </div>
                                        }

                                    </div>

                                }
                            </div>}

                            {this.state.activated2fa && <div className="blankslate text-center">


                                <h5 className="mb-4 font-bold">Two factor authentication is enabled .</h5>
                                <p className="mb-4 font-bold text-gray-500">Two-factor authentication adds an additional layer of security to your account by requiring more than just a password to sign in.</p>
                                <button className="btn btn-default btn-rounded bg-base hover:bg-blue-600 text-white" onClick={() => this.change2FaStatus(false)}>Disable two-factor authentication</button>

                                <h3 className="mb-4 font-bold mt-4">Save Your recovery codes .</h3>

                                {this.state.recoveryCodes && <div className="">
                                    <div className="flex flex-col lg:flex-wrap lg:flex-row w-full  mb-2 lg:mb-4">
                                        {
                                            this.state.recoveryCodes && JSON.parse(this.state.recoveryCodes).map(code => {
                                                return <div className="w-1/4 mb-2 p-2 border rounded flex-shrink-0"><b>{code}</b></div>
                                            })
                                        }
                                    </div>
                                    <button className="btn btn-default btn-rounded  border hover:bg-blue-600 mb-4" onClick={() => this.downloadCodes('recovery-codes', this.state.recoveryCodes)}>Download Code</button>
                                    <br />
                                    <b>
                                        Why is saving you recovery codes important?
                                    </b>
                                    <p className="text-gray-500">
                                        If you lose access to your phone, you can authenticate to {window.localStorage.getItem('baseTitle')} using your recovery codes. We recommend saving them with a secure password manager.
                                    </p>
                                </div>
                                }



                            </div>}

                        </div>
                    )
                }
            )
        }

        return (
            <>
                <SectionTitle title={this.props.parentName ? this.props.parentName : 'Dashbaord'} subtitle={`${this.state.baseTitle}`} hideButton={true} />

                <Widget
                    title=""
                    description=''>
                    <div className="flex flex-wrap">
                        <div className="w-full md:p-4 tab-pad">
                            <UnderlinedTabs tabs={tabs} />
                        </div>
                    </div>


                </Widget>


            </>

        )
    }

}
