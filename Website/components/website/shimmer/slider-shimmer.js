import React, { useState, useEffect } from 'react';

export default function sliderShimmer(props) {


    return (
        <div className=" container-fluid  display align-items-center  mb-5 height-28 banner-sh transitions">
            <div className="container col-12 col-md-6 mb-3 md:mb-0 ml-md-5 margin-t-5">
                <div className="comment2 br animateShimmer2   p-3 w-2/4"></div>
                <div className="comment2 br animateShimmer2  mt-4 w-2/3"></div>
                <div className="comment2 br animateShimmer2  mt-4 w-3/4"></div>
                <div className="comment2 br animateShimmer2  mt-3 w-3/4"></div>
                <div className="comment2  animateShimmer2 mt-4 p-4 w-1/4 rounded-full"></div>
            </div>
            <div className="col-md-6">
                
            </div>
        </div>
    )

}
