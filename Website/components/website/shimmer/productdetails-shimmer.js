import React, { useState, useEffect } from 'react';

export default function productDetailShimmer(props) {


    return (
        <div className="h13 trans transitions">
            <div className="details">
                <div className="comment p-2 animateShimmer transparent w-25"></div>
                <div className="comment p-2 animateShimmer transparent w-25"></div>
            </div>
            <div className="details">
                <div className="comment p-2 animateShimmer transparent w-25"></div>
                <div className="comment p-2 animateShimmer transparent w-25"></div>
            </div>
            <div className="details">
                <div className="comment p-2 animateShimmer transparent w-25"></div>
                <div className="comment p-2 animateShimmer transparent w-25"></div>
            </div>
            <div className="comment  animateShimmer transparent mt-5 p-4 w-100 rounded-f">
            </div>
        </div>
    )

}
