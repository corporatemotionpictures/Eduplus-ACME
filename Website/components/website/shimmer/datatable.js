import React, { useState, useEffect } from 'react';

export default function Shimmer(props) {


    return (
        <div>
            <div className=" flex justify-between">
                <div className="border-shimmer p-2  br animateShimmer mt-4 w80 mr-1"></div>
                <div className="border-shimmer p-2 ml-1 br animateShimmer mt-4 w80 mr-1"></div>
                <div className="border-shimmer p-2  br animateShimmer mt-4 w80 mr-1"></div>
                <div className="border-shimmer p-2 ml-1 br animateShimmer mt-4 w80 mr-1"></div>
            </div>
            <div className=" flex justify-between mt-4">
                <div className="border-shimmer p-2  br animateShimmer mt-4 w80 mr-1"></div>
                <div className="border-shimmer p-2 ml-1 br animateShimmer mt-4 w80 mr-1"></div>
                <div className="border-shimmer p-2  br animateShimmer mt-4 w80 mr-1"></div>
                <div className="border-shimmer p-2 ml-1 br animateShimmer mt-4 w80 mr-1"></div>
            </div>
            <div className=" flex justify-between mt-4">
                <div className="border-shimmer p-2  br animateShimmer mt-4 w80 mr-1"></div>
                <div className="border-shimmer p-2 ml-1 br animateShimmer mt-4 w80 mr-1"></div>
                <div className="border-shimmer p-2  br animateShimmer mt-4 w80 mr-1"></div>
                <div className="border-shimmer p-2 ml-1 br animateShimmer mt-4 w80 mr-1"></div>
            </div>
        </div>

    )

}
