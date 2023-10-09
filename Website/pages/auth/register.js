import { Component } from 'react';
import Router from 'next/router';
import Link from 'next/link';
import { registerUser } from 'helpers/apiService';
import ValidationFront from 'components/functional-ui/forms/validationFront'
import Alert from 'components/functional-ui/alerts'
import { FiAlertCircle } from 'react-icons/fi'
import { getSettings, fileUpload, fetchAll } from 'helpers/apiService'

import define from 'src/json/worddefination.json'

export default class Login extends Component {

    // Set state
    state = {
        isSubmitting: true,
        login: false,
        error: null,
        gourd: null
    };

    // Function For Login
    handleSubmit = async (data) => {
        data.membership_documents = {}

        if (data.membership_id) {
            data.membership_documents.membership_id = data.membership_id
        }

        delete data.membership_id
        if (data.url && data.url[0]) {
            let file = await fileUpload('users', null, data.url[0], 'document')

            if (file.success == true) {
                data.membership_documents.document = file.path
            }
            console.log(file)
        }
        delete data.url


        data.gourd = 'webLogin'
        let register = await registerUser(data);
        if (register.success == false) {

            let error;
            if (register.user) {
                error = register.user.error
            }
            else if (register.error) {
                error = register.error.details ? register.error.details[0].message : register.error
            }
            toastr.error(error)


            this.setState({
                register: false,
                isSubmitting: false,
                error: error
            })
        }
        else {
            this.setState({
                register: true,
            })
            Router.push('/auth/verify-otp/');
        }

    }

    fetch = async () => {
        let gourd = await getSettings('webLogin')

        let memberships = await fetchAll('memberships', { type: 'APPROVEABLE' })

        this.setState({
            gourd: gourd,
            memberships: memberships && memberships.memberships ? memberships.memberships : []
        })

    }

    // 
    componentDidMount() {
        this.fetch()
    }

    render() {

        let items = [
            {
                label: 'First Name',
                error: { required: 'Please enter first name' },
                name: 'first_name',
                type: 'text',
                placeholder: 'Enter First Name',
                className: 'col-12 col-sm-12 col-md-6'
            },
            {
                label: 'Last Name',
                error: { required: 'Please enter last name' },
                name: 'last_name',
                type: 'text',
                placeholder: 'Enter Last Name',
                className: 'col-12 col-sm-12 col-md-6'
            },
            {
                label: 'Mobile Number',
                error: {
                    required: 'Please enter mobile number',
                },
                name: 'mobile_number',
                type: 'tel',
                placeholder: 'Mobile Number',
                className: 'col-12 col-sm-12 col-md-12'
            },
            {
                label: 'Email',
                error: { required: 'Please enter a valid email' },
                name: 'email',
                type: 'email',
                placeholder: 'Enter your E-Mail Address',
                className: 'col-12 col-sm-12 col-md-12'
            },
            // {
            //     label: 'Date Of Birth',
            //     error: { required: 'Please enter Date Of Birth' },
            //     name: 'dob',
            //     type: 'date',
            //     placeholder: 'Enter you Date Of Birth',
            //     className: 'col-12 col-sm-12 col-md-6'
            // },
            // {
            //     datalabel: 'courses',
            //     dataname: 'courseID',
            //     label: 'Courses',
            //     error: { required: 'Please enter a valid Branch Name' },
            //     name: 'branch',
            //     idSelector: 'id',
            //     view: 'name',
            //     type: 'select',
            //     className: "col-12 col-sm-12 col-md-6",
            //     placeholder: 'Enter Branch Name',
            //     isMultiple: false,
            //     effectedRows: [],
            //     onTab: 1
            // },
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
                    placeholder: 'Create Password',
                    className: "col-12 col-sm-12 col-md-6",
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
                    placeholder: 'Confirm Password',
                    className: "col-12 col-sm-12 col-md-6",
                })
        }

        if (this.state.memberships && this.state.memberships.length > 0) {
            items.push(
                {
                    datalabel: 'memberships',
                    dataname: 'membershipID',
                    name: 'membership_id',
                    idSelector: 'id',
                    view: 'title',
                    type: 'select',
                    className: "col-12 col-sm-12 col-md-12",
                    placeholder: 'Select one of the group to avail discount',
                    isMultiple: false,
                    effectedRows: [],
                    preFilters: {
                        type: 'APPROVEABLE'
                    },
                    onTab: 1
                },
                {
                    // label: 'File',
                    name: 'url',
                    fileTypes: ["pdf"],
                    maxfilesize: 1024,
                    error: {},
                    type: 'file',
                    labelWorn: "Make sure that size is with in range of 1mb",
                    className: "col-12 col-sm-12 col-md-12 mt-1",
                    watchBy: 'membership_id',
                    watchValuesLength: 1
                },
            )
        }

        return (
            <>
                <section className="about_us gate_syllabus pb-3">
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
                    <div className="container">

                        <div className="col-md-8 offset-md-2 col-lg-6 offset-lg-3  sm-mt-4 mb-md-4 mb-3">

                            <div className="about_title_2 mt-lg-5">
                                <h5>Register</h5>
                                <h3 className="font-saffron"><b>Registration Form</b></h3>
                            </div>
                            <hr className=" mt-2 mb-5"></hr>
                            {this.state.error && (
                                <div className="w-full mb-4">
                                    <Alert
                                        color="bg-base text-white"
                                        icon={<FiAlertCircle className="mr-2 stroke-current h-4 w-4" />}>
                                        {this.state.error}
                                    </Alert>
                                </div>
                            )}
                            <ValidationFront items={items} onSubmit={this.handleSubmit} buttonText="Submit & Send Verification Code" />

                        </div>
                    </div>
                </section>
                {/* Mid Content Ends */}

            </>
        )
    }

}