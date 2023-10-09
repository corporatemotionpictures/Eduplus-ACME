// import Preloader from "components/Preloader";
import Link from "next/link";
import TopBar from "components/website/TopBar";
import PopularCourses from "components/website/PopularCourses";
import FeaturedCourses from "components/website/FeaturedCourses";
import MidContent from "components/website/MidContent";
import HeadAbout from "components/website/about-us/HeadAbout";
// import UpcomingEvents from "components/website/Upcoming_Events";
import Blog from "components/website/Blog";
import Slider from "components/website/Slider";
import AppStoreFooter from "components/website/AppStoreFooter";
// import MeanMenu from "components/website/MeanMenu";
import { fetchAll } from 'helpers/apiService';
import React, { useState, useEffect } from 'react';
import { add, getSettings } from 'helpers/apiService';


import define from 'src/json/worddefination.json';
import WebsiteShimmer from "components/website/shimmer/websiteShimmer";

export default function Home() {


  const [testimonials, setTestimonial] = useState([])
  const [webSliders, setWebSliders] = useState([])
  const [first, setFirst] = useState(true)
  const [contactData, setContactdata] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getInnerdata() {
      if (first == true) {
        let data = await fetchAll('testimonials')
        setTestimonial(data.testimonials)
        let webSliders = await fetchAll('web-sliders')
        setWebSliders(webSliders.webSliders)
        data = await getSettings('contacts')
        setContactdata(data)
        setLoading(false)
      }
    }
    getInnerdata()
    setFirst(false)
    return
  }, [first])



  return (
    <>
      {loading == true && <div className="">
        {/* <img src="/images/loader.gif" /> */}
        <WebsiteShimmer />
      </div> ||
        <div>

          <Slider sliders={webSliders} contacts ={contactData}/>
          {/* <MeanMenu /> */}
          <PopularCourses />

          <div className="col-12 col-sm-12 col-md-12 col-lg-12 mt-md-5">
            
            {/* <!-- ends: .section-header --> */}
          </div>
          <HeadAbout />
          <FeaturedCourses divClass="w-20 " preFilter={{  }} />
          <MidContent />

          {/* Testimonials Sections */}


          {testimonials && testimonials.length > 0 && <div className="rs-subject style1 md-pt-70 md-pb-0 mt-md-5 spaced">
              <div className="container">
                <div className="sec-title mb-30 text-center md-mb-30">
                  <div className="sub-title primary">Pride of {window.localStorage.getItem('baseTitle')}</div>
                  <h2 className="section__title about_us_title title mb-5 font-bold">Students <span className=" ">  sharing <img className="blink_img" src="/website/assets/images/banner/yellow-bg.png" alt=""></img> </span> their Experience</h2>
                </div>
                <div className="testi-slider">
                  {testimonials && testimonials.map(testimonial => {
                    return <div className={` mb-30 `}>
                      <a data-toggle="modal">
                      <h4 className="title fonting"><b>{testimonial.name}</b></h4>
                        <div className="course-box sm-mt-2 mt-md-5 testi-items z-depth-2 white-background mr-3">
                          <div className="">
                            <div className=" text-left display">
                    
                                <div className="col-9">
    
                              <p className="pb-1 test color_name"><b>{testimonial.designation}</b></p>
                              <span className="course-qnty">{testimonial.testimonial}</span>
                              </div>
                              <div className="col-3">
                              {<img src={testimonial.image} alt={window.localStorage.getItem('defaultImageAlt')} className="img-10" />}</div>
                            </div>
                          </div>
                        </div>
                      </a>
                    </div>
                  })
                  }
                </div>
              </div>
              <div class="rtin-btn"><a href="">BECOME AN INSTRUCTOR</a></div>
            </div>
  }


          <div className="container">
          <AppStoreFooter />
          </div>
          

        </div>
      }
    </>
  )
}