import Link from "next/link";
import moment from "moment";
import React, { useState, useEffect } from 'react';
import { fetchAll, updateAdditional } from 'helpers/apiService';
import define from 'src/json/worddefination.json'


export default function MidContent() {



  const [announcements, setAnnouncements] = useState([])
  const [first, setFirst] = useState(true)

  // Call first time when component rander
  useEffect(() => {
    async function getInnerdata() {
      if (first == true) {
        var announcementList = await fetchAll('announcements', { forWeb: true })
        setAnnouncements(announcementList.announcements)

      }
    }

    getInnerdata()

    setFirst(false)
    return
  }, [first])



  return (

    <section className="about_top_wrapper img_grid news-section " id="mid-content">
      <div className="container pb-lg-5 pr-lg-5 pl-lg-5">
        <div className="row spacing sign__wrapper-4 news_space white-bg align-center">
          <div className="col-12 col-sm-12 col-md-12 col-lg-6 pad-right  ">
            <div className="title">
              <h2 className="section__title ">Welcome to <span className="">{window.localStorage.getItem('baseTitle')}<img className="blink_img" src="/website/assets/images/banner/yellow-bg.png" alt=""></img> </span><span class="title_color"></span></h2>
              <p className="text-justify">Necessity is the Mother of Invention, and this proverb perfectly defines the inception of {window.localStorage.getItem('baseTitle')}. {window.localStorage.getItem('baseTitle')} is a pioneer academy for various MCA Entrance Examinations established by the Petrocrats to endeavor the young talents and make them achieve what they deserve. The advisory council at {window.localStorage.getItem('baseTitle')} comprises of eminent professors.</p>
              <Link href="/about-us">
                <a title="" className="read_space">Read More <i className="fas fa-arrow-circle-right"></i></a>
              </Link>
            </div>
          </div>
          <div className="col-lg-6  border-left max-height-17">
            {/* <h2 className="mb-2"><b>News And Announcements</b></h2> */}
            {announcements && <div direction="down" loop="2" className="marquee">
              {announcements.map(announcement => {
                return <div className="events-short mb-3 row px-0 pl-3">
                  <div className="date-part bgc2 col-lg-2 col-3 ">
                    <span className="month">{moment(announcement.created_at).format('MMMM')}</span>
                    <div className="date">{moment(announcement.created_at).format('DD')}</div>
                  </div>
                  <div className="content-part col-lg-10 col-9">
                    <Link href={announcement.link ? announcement.link : ''} >
                      <a >
                        <h5 className=" mb-0">
                          {announcement.title}
                        </h5>
                        <p className="categorie">
                          {announcement.description}
                        </p>
                      </a>
                    </Link>

                  </div>
                </div>
              }
              )}
            </div>
              ||
              <>
                <div className="row   display p-2 col-12  mb-3 ml-md-2">
                  <div className="p-4  rounded-sh h10 animateShimmer col-1 mt-2"></div>
                  <div className="col-9 ">
                    <div className="comment br animateShimmer mt-2 w-100"></div>
                    <div className="comment br animateShimmer mt-2 w-100  col-12 "></div>
                    <div className="comment br animateShimmer mt-2 w-100 col-lg-8 col-12 mr-2 mb-3"></div>

                  </div>
                </div>
                <div className="row  display p-2 col-12  ml-md-2  mb-3">
                  <div className="p-4  rounded-sh h10 animateShimmer col-1 mt-2"></div>
                  <div className="col-9">
                    <div className="comment br animateShimmer mt-2 w-100"></div>
                    <div className="comment br animateShimmer mt-2 w-100 col-12 "></div>
                    <div className="comment br animateShimmer mt-2 w-100 col-lg-8 col-12 mr-2 mb-3"></div>
                  </div>
                </div>
                <div className="row  display p-2 col-12   mb-3 ml-md-2">
                  <div className="p-4  rounded-sh h10 animateShimmer  col-1 mt-2"></div>
                  <div className="col-9 ">
                    <div className="comment br animateShimmer mt-2 w-100"></div>
                    <div className="comment br animateShimmer mt-2 w-100  col-12 "></div>
                    <div className="comment br animateShimmer mt-2 w-100 col-lg-8 col-12  mr-2 mb-3"></div>
                  </div>
                </div>
              </>}
          </div>
        </div>
      </div>
      <div className="items_shape "></div>
      <div className="story_about pb-lg-5 mb-lg-3">
        <div className="container">
          <div className="row">
            <div className="col-12 col-sm-6 col-md-4 col-lg-4">
              {/* <div className="story_banner">
                <img src="/website/assets/images/blog/details_2.png" alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid" />
              </div> */}
            </div>
            <div className="sliding">
              <div id="" class="" data-ride="" >
                <div class="carousel-inner">
                  <div class="">
                    <div className="col-12 col-sm-6 col-md-12 col-lg-8 separate">
                      <div className="about_story_title testi_adjust">
                        <h2 className="section__title ">Team<span className=""> Message<img className="" src="" alt=""></img> </span></h2>
                        <p className="text-justify">We welcome you to join us (ACME ACADEMY) today and ensure your grand success as a software Engineer of tomorrow. We endeavor to make the best out of even mediocre students who come to us with lot of hope and trust. We believe that every student appearing at MCA Entrance Examinations cannot be an MCA stuff, but, given time, proper guidance and practice, he can definitely crack MCA Entrance Examinations. At the same time, he can improve his performance and succeed with better ranks at various reputed MCA Entrance Examinations such as NIMCET, JNU MCA, DU MCA, HCU, IPU , Pune University MCA, BHU MCA, CG Pre MCA, MAH-MCA, VIT-MCA , BIT-MCA , LPU-MCA , ICET , TANCET etc.</p>
                        <p>With all the best wishes!</p>
                        <div className="section_titled">Kartikey Pandey</div>
                        <div className="section_adjust">Founder</div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}