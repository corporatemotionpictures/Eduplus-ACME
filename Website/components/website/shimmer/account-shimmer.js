import React, { useState, useEffect } from 'react';

export default function accountShimmer(props) {


    return (
        <div className="row container mt-5 ml-5 transitions ">
            <div className="col-lg-5 mt-3 md-border-right">
                <div className="comment br animateShimmer   mt-3 w-25"></div>
                <div className="comment br animateShimmer  mt-3 w-50"></div>
                <div className="comment br animateShimmer   mt-3 w-75"></div>
                <div className="comment br animateShimmer mt-3 w80"></div>
            </div>
            <div className="col-lg-5 acc-spacing">
                <div className="row  border-bottom display p-2 col-12 col-lg-10 mb-3">
                    <div className="p-4  rounded-sh h10 animateShimmer col-1 mt-2"></div>
                    <div className="col-9 ">
                    <div className="comment br animateShimmer mt-2 w-100"></div>
                    <div className="comment br animateShimmer mt-2 w-100  col-12 "></div>
                    <div className="comment br animateShimmer mt-2 w-100 col-lg-8 col-12 mr-2 mb-3"></div>
                    </div>
                </div>
                <div className="row border-bottom display p2 col-12 col-lg-10  mb3">
                    <div className="p-4  rounded-sh h10 animateShimmer col-1 mt2"></div>
                    <div className="col-9">
                    <div className="comment br animateShimmer mt-2 w-100"></div>
                    <div className="comment br animateShimmer mt-2 w-100 col-12 "></div>
                    <div className="comment br animateShimmer mt-2 w-100 col-lg-8 col-12 mr-2 mb-3"></div>
                    </div>
                </div>
                <div className="row  display p-2 col-12 col-lg-10  mb-3">
                    <div className="p-4  rounded-sh h10 animateShimmer  col-1 mt-2"></div>
                    <div className="col-9 ">
                    <div className="comment br animateShimmer mt-2 w-100"></div>
                    <div className="comment br animateShimmer mt-2 w-100  col-12 "></div>
                    <div className="comment br animateShimmer mt-2 w-100 col-lg-8 col-12  mr-2 mb-3"></div>
                    </div>
                </div>
            </div>
        </div>
    )

}
