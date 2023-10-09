import React, { useState, useEffect } from 'react';

export default function ProfileShimmer(props) {


    return (
        <div>
            <div className=" flex">
                <div className="profilePicIcon animateShimmer  "></div>
                <div className="w-1/2">
                    <div className="comment br animateShimmer mt-4 w-40"></div>
                    <div className="comment br animateShimmer mt-4"></div>
                </div>
            </div>
            <div className=" flex">
                <div className="profilePicIcon animateShimmer  "></div>
                <div className="w-1/2">
                    <div className="comment br animateShimmer mt-4 w-40"></div>
                    <div className="comment br animateShimmer mt-4"></div>
                </div>
            </div>
            <div className=" flex">
                <div className="profilePicIcon animateShimmer  "></div>
                <div className="w-1/2">
                    <div className="comment br animateShimmer mt-4 w-40"></div>
                    <div className="comment br animateShimmer mt-4"></div>
                </div>
            </div>

        </div>
    )

}
