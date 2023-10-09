import Portal from 'components/functional-ui/portal'
import { FiLink, FiX, FiMail, FiPhone, FiArrowRight } from 'react-icons/fi'
import React, { useState, useEffect } from 'react';
import { Component } from 'react';


export default class extends Component {

    state = {


        width: window.innerWidth,
        position: { x: 750, y: 750 },
        updated: false,
        showModal: true

    }

    // , first_name, last_name, image, email, mobile_number 


    onHover = () => {
        if ($('#userportal')) {
            var isClickInsideElement = $('#userportal:hover').length > 0;
            var isClickInside = $('.userdata:hover').length > 0;

            if (!isClickInsideElement && !isClickInside) {
                this.props.closeModal()
            }
        }
    }


    // Tracks mouse position
    componentDidMount() {

        const setFromEvent = (e) => {
            this.onHover()

            if (!this.state.updated) {
                this.setState({ position: { x: e.clientX, y: e.clientY }, updated: true });
            }

        }

        window.addEventListener("mousemove", setFromEvent);

    }


    render() {
        return (
            <>
                {this.props.user && <Portal selector="#portal">
                    <div
                        className="absolute w-auto lg:my-4 mx-auto lg:max-w-lg max-w-xs top-1/2 left-1/3 z-50" style={{ top: this.state.position.y, left: this.state.position.x }} id="userportal">
                        <div className="bg-white text-gray-900 border-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-700 border-0 rounded-lg shadow-lg relative flex flex-col w-full outline-none">
                            <div className="relative p-4 flex-auto">
                                <div className="flex ">
                                    <div className="w-12 h-12">
                                        {this.props.user.image === "/images/default-profile.jpg" &&
                                            <div className="profile_image profile_image-0 w-12 h-12 flex text-lg items-center justify-center font-bold uppercase">
                                                {`${this.props.user.first_name.charAt(0)}`}
                                            </div>
                                            ||
                                            <img className="shadow rounded-full w-12 h-12 ring mb-2" src={this.props.user.image} alt={window.localStorage.getItem('defaultImageAlt')} />
                                        }
                                    </div>
                                    <div className="ml-4">
                                        <h6 className="font-bold whitespace-nowrap">{this.props.user.first_name} {this.props.user.last_name}</h6>
                                        <p className="flex pt-1 items-center"><FiMail className="mr-1 " size={16} />   {this.props.user.email}</p>
                                        <p className="flex pt-1 items-center"><FiPhone className="mr-1 " size={16} />{this.props.user.mobile_number}</p>
                                    </div>
                                </div>
                                <div className="mt-5 mb-1 float-right">
                                    <a className="flex font-semibold rounded bg-gray-200 hover:bg-blue-600 text-xs hover:text-white p-2 leading-4" href={`/dashboard/users/${this.props.user.id}`} target="_blank">
                                        View Complete Profile<FiArrowRight className="ml-1 mt-0.5" size={14} />
                                    </a>
                                </div>

                            </div>

                        </div>
                    </div>
                </Portal>}
            </>

        )

    }


}


