import React, { useState, useEffect } from 'react';

export default function accountformShimmer(props) {


    return (
        <div className="container transitions">
        <div className="p20 accounts rounded-sh h10 animateShimmer mt10 mb-3 mx-auto"></div>
        <div className="products pt-4 mx-auto">
           <div className="md-w-33 mr-3 comment p-3 animateShimmer mb-3"></div>
           <div className="md-w-33 mr-3 comment p-3 animateShimmer mb-3"></div>
           <div className="md-w-33 comment p-3 animateShimmer mb-3"></div>
        </div>
        <div className="products">
           <div className="md-w-33 mr-3 comment p-3 animateShimmer mb-3"></div>
           <div className="md-w-33 mr-3  comment p-3 animateShimmer mb-3"></div>
           <div className="md-w-33 comment p-3 animateShimmer mb-3 "></div>
        </div>
        <div className="products">
           <div className="md-w-33 mr-3 comment p-3 animateShimmer mb-3"></div>
           <div className="md-w-33 mr-3 comment p-3 animateShimmer mb-3"></div>
           <div className="md-w-33 comment p-3 animateShimmer mb-3 "></div>
        </div>
     </div>
    )

}
