import React, { useState, useEffect } from 'react';

export default function GraphShimmer(props) {


    return (
        <div className="flex">
            <div className="lg:mr-20 mr-10">
                <div className="border-shimmer br animateShimmer mt-4 p-2 "></div>
                <div className="border-shimmer br animateShimmer mt-4 p-2 "></div>
                <div className="border-shimmer br animateShimmer mt-4 p-2 "></div>
                <div className="border-shimmer br animateShimmer mt-4 p-2 "></div>
                <div className="border-shimmer br animateShimmer mt-4 p-2 "></div>
                <div className="border-shimmer br animateShimmer mt-4 p-2 "></div>

            </div>
            {((screen.width > 767) && <div className=" br flex">
                <div className="lg:mr-10 mr-4">
                    <div className="flex">
                        <div className="comment-2 br animateShimmer mt-auto h-10 "></div>
                        <div className="comment-2 br animateShimmer mt-4 h-48 "></div>
                    </div>
                    <div className="border-shimmer br animateShimmer mt-4 p-2 "></div>
                </div>
                <div className="lg:mr-10 mr-4">
                    <div className="flex">
                        <div className="comment-2 br animateShimmer mt-auto h-10 "></div>
                        <div className="comment-2 br animateShimmer mt-4 h-48 "></div>
                    </div>
                    <div className="border-shimmer br animateShimmer mt-4 p-2 "></div>
                </div>
                <div className="lg:mr-10 mr-4">
                    <div className="flex">
                        <div className="comment-2 br animateShimmer mt-auto h-10 "></div>
                        <div className="comment-2 br animateShimmer mt-4 h-48 "></div>
                    </div>
                    <div className="border-shimmer br animateShimmer mt-4 p-2 "></div>
                </div>
                <div className="lg:mr-10 mr-4">
                    <div className="flex">
                        <div className="comment-2 br animateShimmer mt-auto h-10 "></div>
                        <div className="comment-2 br animateShimmer mt-4 h-48 "></div>
                    </div>
                    <div className="border-shimmer br animateShimmer mt-4 p-2 "></div>
                </div>
                <div className="lg:mr-10 mr-4">
                    <div className="flex">
                        <div className="comment-2 br animateShimmer mt-auto h-10 "></div>
                        <div className="comment-2 br animateShimmer mt-4 h-48 "></div>
                    </div>
                    <div className="border-shimmer br animateShimmer mt-4 p-2 "></div>
                </div>
                <div className="lg:mr-10 mr-4">
                    <div className="flex">
                        <div className="comment-2 br animateShimmer mt-auto h-10 "></div>
                        <div className="comment-2 br animateShimmer mt-4 h-48 "></div>
                    </div>
                    <div className="border-shimmer br animateShimmer mt-4 p-2 "></div>
                </div>
                <div className="lg:mr-10 mr-4">
                    <div className="flex">
                        <div className="comment-2 br animateShimmer mt-auto h-10 "></div>
                        <div className="comment-2 br animateShimmer mt-4 h-48 "></div>
                    </div>
                    <div className="border-shimmer br animateShimmer mt-4 p-2 "></div>
                </div>
                <div className="lg:mr-10 mr-4">
                    <div className="flex">
                        <div className="comment-2 br animateShimmer mt-auto h-10 "></div>
                        <div className="comment-2 br animateShimmer mt-4 h-48 "></div>
                    </div>
                    <div className="border-shimmer br animateShimmer mt-4 p-2 "></div>
                </div>
                <div className="lg:mr-10 mr-4">
                    <div className="flex">
                        <div className="comment-2 br animateShimmer mt-auto h-10 "></div>
                        <div className="comment-2 br animateShimmer mt-4 h-48 "></div>
                    </div>
                    <div className="border-shimmer br animateShimmer mt-4 p-2 "></div>
                </div>
            </div>)
                ||
                ((screen.width < 768) && <div className=" br flex">
                    <div className="lg:mr-10 mr-4">
                        <div className="flex">
                            <div className="comment-2 br animateShimmer mt-auto h-10 "></div>
                            <div className="comment-2 br animateShimmer mt-4 h-48 "></div>
                        </div>
                        <div className="border-shimmer br animateShimmer mt-4 p-2 "></div>
                    </div>
                    <div className="lg:mr-10 mr-4">
                        <div className="flex">
                            <div className="comment-2 br animateShimmer mt-auto h-10 "></div>
                            <div className="comment-2 br animateShimmer mt-4 h-48 "></div>
                        </div>
                        <div className="border-shimmer br animateShimmer mt-4 p-2 "></div>
                    </div>
                    <div className="lg:mr-10 mr-4">
                        <div className="flex">
                            <div className="comment-2 br animateShimmer mt-auto h-10 "></div>
                            <div className="comment-2 br animateShimmer mt-4 h-48 "></div>
                        </div>
                        <div className="border-shimmer br animateShimmer mt-4 p-2 "></div>
                    </div>
                    <div className="lg:mr-10 mr-4">
                        <div className="flex">
                            <div className="comment-2 br animateShimmer mt-auto h-10 "></div>
                            <div className="comment-2 br animateShimmer mt-4 h-48 "></div>
                        </div>
                        <div className="border-shimmer br animateShimmer mt-4 p-2 "></div>
                    </div>
                </div>)
            }

        </div>
    )

}
