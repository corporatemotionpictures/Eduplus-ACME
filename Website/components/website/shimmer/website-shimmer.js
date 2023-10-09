import Link from 'next/link';
import Head from 'next/head';
import { getSettings } from 'helpers/apiService';
import React, { useState, useEffect } from 'react';
import { getToken, logout } from 'helpers/auth';
import define from 'src/json/worddefination.json'
import { FiSettings, FiMenu, FiMoreVertical } from 'react-icons/fi'

export default function website_Shimmer(props) {


    return (


        <div className="w-full">

            <div className="container  br">
                {(screen.width > 767) && <div className="flex justify-between shimm mb-10 items-center">
                    <div className="col-3 p-3 w-52 h-16 rounded animateShimmer mr-3"></div>
                    <div className="flex col-8 justify-end mr-3 ">
                        <div className="comment br animateShimmer mt-4 p-3 col-2  mr-2"></div>
                        <div className="comment br animateShimmer mt-4 p-3 col-2 mr-2"></div>
                        <div className="comment br animateShimmer mt-4 p-3 col-2  mr-2"></div>
                        <div className="comment br animateShimmer mt-4 p-3 col-2 mr-2"></div>
                        <div className="comment br animateShimmer mt-4 p-3 col-2"></div>
                    </div>
                </div>}
                <div className="row display items-center mt-5 ">
                    <div className="col-lg-6 mb-3 md:mb-0">
                        <div className="comment br animateShimmer   p-3 w-2/4"></div>
                        <div className="comment br animateShimmer  mt-4 w-2/3"></div>
                        <div className="comment br animateShimmer  mt-4 w-3/4"></div>
                        <div className="comment br animateShimmer  mt-3 w-3/4"></div>
                        <div className="comment  animateShimmer  mt-4 p-4 w-1/4 rounded-full"></div>
                    </div>
                    <div className="col-lg-6">
                        <div className="p-20 w-75 rounded h-18 animateShimmer justify-end"></div>
                    </div>
                </div>
                <div className="w-1280 display shimm2">
                    <div className=" width-28 blocks animateShimmer"></div>
                    <div className=" width-28  blocks animateShimmer"></div>
                    <div className=" width-28  blocks animateShimmer "></div>
                </div>
            </div>
        </div>

    )

}
