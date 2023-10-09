import Link from 'next/link';
import Head from 'next/head';
import { getSettings } from 'helpers/apiService';
import React, { useState, useEffect } from 'react';
import { getToken, logout } from 'helpers/auth';
import define from 'src/json/worddefination.json'
import { FiSettings, FiMenu, FiMoreVertical } from 'react-icons/fi'

export default function websiteShimmer(props) {


    return (

        
                    <div className="w-full">
                        
                        <div className="  br">
                            { (screen.width > 767) && <div className="container flex justify-between shimm mb-3 items-center">
                                <div className="col-3 p-4 w-52 h10 rounded animateShimmer mr-3 mt-3"></div>
                                <div className="flex col-8 justify-end mr-3 ">
                                    <div className="comment br animateShimmer mt-2 p-3 col-2  mr-2"></div>
                                    <div className="comment br animateShimmer mt-2 p-3 col-2 mr-2"></div>
                                    <div className="comment br animateShimmer mt-2 p-3 col-2  mr-2"></div>
                                    <div className="comment br animateShimmer mt-2 p-3 col-2 mr-2"></div>
                                    <div className="comment br animateShimmer mt-2 p-3 col-2"></div>
                                </div>
                            </div>}
                            <div className="row container-fluid  display items-center  mb-5 height-28 banner-sh">
                                <div className="container col-lg-6 mb-3 md:mb-0 ml-md-5 mt-5">
                                    <div className="comment2 br animateShimmer2 bann_title w-2/4">
                                    <div className="comment2 br animateShimmer2 sub_bann w-2/3"></div>
                                    <div className="comment2 br animateShimmer2 para_banner  mt-4 w-3/4"></div>
                                    </div>
                                </div>
                                <div className="col-lg-6">
                                    
                                </div>
                            </div>
                            <div className="container w-1280 display shimm2">
                                <div className=" width-25 blocks animateShimmer"></div>
                                <div className=" width-25  blocks animateShimmer"></div>
                                <div className=" width-25  blocks animateShimmer "></div>
                                <div className=" width-25  blocks animateShimmer "></div>
                            </div>
                        </div>
                    </div>
                
    )

}

{/* <div className="w-full max-w-xs mr-2 navbar-search">
<div className="relative">
    <h5 className="pl-2 text-bold"><b>{window.localStorage.getItem('baseTitle')}</b></h5>
</div>
</div> */}