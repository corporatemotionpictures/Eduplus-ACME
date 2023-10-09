import Link from 'next/link';
import Head from 'next/head';
import { getSettings } from 'helpers/apiService';
import React, { useState, useEffect } from 'react';
import { getToken, logout } from 'helpers/auth';
import define from 'src/json/worddefination.json'
import { FiSettings, FiMenu, FiMoreVertical } from 'react-icons/fi'

export default function Shimmer(props) {


    return (

        <div className="bodySHimmer">
            <div data-layout='dashboard'
                data-collapsed={false}
                data-background='light'
                data-navbar='light'
                data-left-sidebar='light'
                data-right-sidebar='light' className="font-sans antialiased text-sm disable-scrollbars">
                <div className="wrapper">
                    <div className="left-sidebar left-sidebar-1 h-screen overflow-scroll" >
                        <div className="mx-4 w-3/4 rounded h-10 animateShimmer din mt-8"></div>
                        <div className="comment br animateShimmer mx-4 mt-10 w-2/4"></div>
                        <div className="comment br animateShimmer mx-4 mt-8 w-3/4"></div>
                        <div className="comment br animateShimmer mx-4 mt-8 w-2/4"></div>
                    </div>
                    <div className="main w-full ">
                        <div className="navbar navbar-1 border-b">
                            <div className="navbar-inner w-full flex items-center justify-start">
                                <button className="mx-4">
                                    <FiMenu size={20} />
                                </button>
                                <div className="w-full max-w-xs mr-2 navbar-search">
                                    <div className="relative">
                                        <h5 className="pl-2 text-bold"><b>{window.localStorage.getItem('baseTitle')}</b></h5>
                                    </div>
                                </div>
                                <div className="profilePicIcon animateShimmer din float-right"></div>
                            </div>
                        </div>
                        <div className="cardShimmer br">
                            <div className="wrapperShimmer flex">
                                <div className="profilePic animateShimmer din"></div>
                                <div className="w-1/2">
                                    <div className="comment br animateShimmer mt-4 w80"></div>
                                    <div className="comment br animateShimmer mt-4"></div>
                                    <div className="comment br animateShimmer mt-4"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )

}
