// / export default function registerAbout() {
  //   return (
  //     <section className="register_area mt-20">
  //       <div className="container">
  //         <div className="row">
  //           <div className="col-12 col-sm-12 col-md-6 col-lg-6 form-content">
  //             <div className="col-12 col-sm-12 col-md-12 col-lg-12">
  //             <h2 className="pb-1">All study opportunities<br />in one single place</h2>
  //             <h5>Every Faculty is having an experience of 3-15 years, focusing more on solving problem in an easiest way.<br></br> All the latest updates by GATE are also kept in mind while selecting the questions.</h5>
  //             <h6>James Lee, <span className="text">Student</span></h6>
  //             </div>
  //             <div className="col-12 col-sm-12 col-md-11 col-lg-9">
  //             <div className="count_student register_wrapper swiper-container-pointer-events">
  //               <div className="single_count item ">
  //               <img className="img_size" src="/website/assets/images/banner/testi-2.jpg" alt=""></img>
  //                 {/* <span className="counter">10000+</span>
  //                 <span className="department_name">Students</span> */}
  //               </div>
  //               <div className="single_count item">
  //                 {/* <span className="counter">1000+</span>
  //                 <span className="department_name">Top Rankers</span> */}
  //                 <img className="img_size" src="/website/assets/images/banner/testi-3.jpg" alt=""></img>
  //               </div>
  //               <div className="single_count item">
  //                 {/* <span className="counter">15+</span>
  //                 <span className="department_name">Courses</span> */}
  //                 <img className="img_size" src="/website/assets/images/banner/testi-2.jpg" alt=""></img>
  //               </div>
  //               <div className="single_count item">
  //               <img className="img_size" src="/website/assets/images/banner/testi-3.jpg" alt=""></img>
  //                 {/* <span className="counter">10000+</span>
  //                 <span className="department_name">Students</span> */}
  //               </div>
  //               <div className="single_count item">
  //                 {/* <span className="counter">1000+</span>
  //                 <span className="department_name">Top Rankers</span> */}
  //                 <img className="img_size" src="/website/assets/images/banner/testi-2.jpg" alt=""></img>
  //               </div>
  //               <div className="single_count item">
  //                 {/* <span className="counter">15+</span>
  //                 <span className="department_name">Courses</span> */}
  //                 <img className="img_size" src="/website/assets/images/banner/testi-3.jpg" alt=""></img>
  //               </div>
  //             </div>
  //             </div>
  //           </div>
  //           <div className="col-12 col-sm-12 col-md-5 col-lg-4 form-content-2">
  //             <div className="row">
  //             <div className="video_about">
  //             <iframe src="https://www.youtube.com/embed/Rr0uFzAOQus" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
  //             <div className=" display_register ">
  //             <div className="col-md-3 col-lg-2">
  //             <img className="img_size_2" src="/website/assets/images/banner/brand-3.png" alt=""></img>
  //             </div>
  //             <div className="col-md-9 col-lg-10">
  //               <h2>Course Outcome</h2>
  //             <p>Every Faculty is having an experience of 3-15 years, focusing more on solving problem in an easiest way. All the latest updates by GATE are also kept in mind while selecting the questions.</p>
  //               </div>
  //             </div>
  //             </div>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </section>
  //   )
  // }
  import React, { useState, useEffect } from 'react';
  import { fetchAll } from 'helpers/apiService';
  import define from 'src/json/worddefination.json'
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
        }
      }
      getInnerdata()
      setFirst(false)
      return
    }, [first])
    return (
    <>
      {testimonials && testimonials.length > 0 && <div className="rs-subject style1 md-pt-70 md-pb-0 mt-md-5">
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
                              
                              <p className="pb-1 test"><b>{testimonial.designation}</b></p>
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
              
            </div>
  }
            </>
    )
  }