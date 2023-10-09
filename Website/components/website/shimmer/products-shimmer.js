import React, { useState, useEffect } from 'react';

export default function productsShimmer(props) {


    return (
        <>
        <div className="col-12 col-md-4 mb-3">
          <div className="border2 ">
            <div className="prod_img_sh animateShimmer "></div>
            <div className="comment br animateShimmer mt-4 ml-2 mr-2"></div>
            <div className="comment br animateShimmer mt-2 w-75 ml-2 mr-2"></div>
            <div className="comment br animateShimmer mt-2 mb-3 w-50 ml-2 mr-2"></div>
          </div>
        </div>
        <div className="col-12 col-md-4 mb-3">
          <div className="border2 ">
              <div className="prod_img_sh animateShimmer "></div>
              <div className="comment br animateShimmer mt-4 ml-2 mr-2 "></div>
              <div className="comment br animateShimmer mt-2 w-75 ml-2 mr-2"></div>
              <div className="comment br animateShimmer mt-2 mb-3 w-50 ml-2 mr-2"></div>
          </div>
        </div>
        <div className="col-12 col-md-4 mb-3">
          <div className="border2 ">
              <div className="prod_img_sh animateShimmer "></div>
              <div className="comment br animateShimmer mt-4 ml-2 mr-2"></div>
              <div className="comment br animateShimmer mt-2 w-75 ml-2 mr-2"></div>
              <div className="comment br animateShimmer mt-2 mb-3 w-50 ml-2 mr-2"></div>
          </div>
        </div>
      </>
    )

}
