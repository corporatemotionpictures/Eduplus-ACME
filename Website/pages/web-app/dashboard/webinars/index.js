import Link from "next/link";
import React, { useState, useEffect } from 'react';
import { fetchAll, updateAdditional } from 'helpers/apiService';
import moment from 'moment';
import Filter from 'components/classical-ui/filters';
import AppStoreFooter from "components/website/AppStoreFooter";

import define from 'src/json/worddefination.json'

export default function webinars({ filterable = false, divClass = '' }) {

  const [webinars, setwebinars] = useState(null)
  const [first, setFirst] = useState(true)
  const [firstAttr, setFirstAttr] = useState(true)
  const [totalIndex, setTotalIndex] = useState(0)

  // Call first time when component rander
  useEffect(() => {

    async function getInnerdata() {
      if (first == true) {


        let filters = {
          mode: 'FREE',
          offLimit: true
        }

        var webinarList = await fetchAll('live-events', filters)

        if (webinarList.events) {
          setwebinars(webinarList.events)
        } else {
          setwebinars([])
        }
      }
    }

    getInnerdata()
    setFirst(false)
    return
  }, [first])

  return (
    <>

      {webinars && <div >

        <div class="rs-subject style1 md-pt-70 md-pb-0 mb-3 mt-5">
          <div class="container">


            <div class="row curriculum-section">
              {
                webinars && webinars.length > 0 && webinars.map(event => {
                  return <div class="col-lg-6 col-md-6 mb-30 col-12 col-sm-6 ">
                    <div className=" card mb-2 p-2" style={{ 'opacity': event.event_status == 'ENDED' ? 0.5 : 1 }}>
                      <div className="row">
                        <div className="col-3">
                          <a><img src={event.thumbnail} alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid" /></a>
                        </div>
                        <div className="col-9 py-2">
                          <h5><b>{event.title}
                          </b>
                            <span className="pl-2">{event.event_status == 'NOT_STARTED' && <span className="btn btn-warning boder-radius-0"> SCHEDULED </span>}
                              {event.event_status == 'STARTED' && <span className="btn btn-danger boder-radius-0">STREAMING NOW </span>}
                            </span>

                          </h5>
                          <div className="breadcrumbs-text my-1">

                            <p className="text-white">
                              {
                                event && event.courses && event.courses.map(course => {
                                  return <span className="branch_name ">
                                    <a className=" mr-2 active text-sm">
                                      {course.name}
                                    </a>
                                  </span>
                                })
                              }
                              {
                                event && event.subjects && event.subjects.map(exam => {
                                  return <span className="branch_name "><a className=" mr-1 mb-1 text-sm ">
                                    {exam.name}
                                  </a>
                                  </span>
                                })
                              }
                              {
                                event && event.chapters && event.chapters.map(exam => {
                                  return <span className="branch_name"><a className=" mr-1 mb-1 text-sm ">
                                    {exam.name}
                                  </a>
                                  </span>
                                })
                              }
                            </p>
                          </div>
                          <hr></hr>
                          <div className="row mt-2 mb-0">
                            <div className="col-8 m-auto">
                              <a className="text-primary pt-1"><b>{moment(event.schedule_at).format('hh:mm A')} / {moment(event.schedule_at).format('dddd')} / {moment(event.schedule_at).format('MMMM Do YYYY')}</b></a>
                            </div>
                            <div className="col-4 float-right courses_info_wrapper">
                              <div className="courses_info">
                                <ul className="list-unstyled w-100 text-right">
                                  {(event.event_status == 'NOT_STARTED') && moment(event.schedule_at).isSame(moment().format('YYYY-MM-DD'), 'day') && <span className="">
                                    <Link href='/web-app/dashboard/webinars/[slug]' as={`/web-app/dashboard/webinars/${event.id}`} className="">
                                      <a className=" btn btn-success text-white"><i class="fa fa-play-circle" aria-hidden="true"></i> Join Class</a>
                                    </Link>
                                  </span>}
                                  {(event.event_status == 'STARTED') && <span className="">
                                    <Link href='/web-app/dashboard/webinars/[slug]' as={`/web-app/dashboard/webinars/${event.id}`} className="">
                                      <a className=" btn btn-success text-white "><i class="fa fa-play-circle" aria-hidden="true"></i>  Join Class</a>
                                    </Link>
                                  </span>}
                                  {event.event_status == 'ENDED' && <span className="">
                                    <a className=" btn btn-danger text-white"><i class="fa fa-stop-circle" aria-hidden="true"></i> {
                                      'Class Ended'
                                    }</a>
                                  </span>}
                                  {event.event_status == 'NOT_STARTED' && !moment(event.schedule_at).isSame(moment().format('YYYY-MM-DD'), 'day') && <span className="">
                                    <a className=" btn btn-light "><i class="fa fa-play-circle" aria-hidden="true"></i> Not started</a>
                                  </span>}
                                  {/* <Link ><a className="cart_btn mt-3 btn btn-danger text-white">Buy Now</a></Link> */}

                                </ul>

                              </div>


                            </div>

                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                })
              }
            </div>
          </div>
        </div>


        <div className="curriculum-section">
          <div className="panel-group accordion" id="accordion" >
          </div>

        </div>
      </div>}
      {!webinars && <>
        <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-screen z-50 overflow-hidden opacity-75 flex items-center justify-center">
          <img src="/images/loader.gif" />
        </div>
      </>}
      {webinars && webinars.length == 0 && <>
        <div
          data-layout="centered"
          className="container w-full p-4 flex items-center justify-left ">
          <div className="flex flex-col w-1/2 max-w-xl text-center">
            <img
              className="object-contain w-auto "
              src="/images/404.jpg"
              alt={window.localStorage.getItem('defaultImageAlt')}
            />
          </div>
          <div className=" pl-5">
            <h4 className="text-5xl text-base  font-bold text-bold">No Data Available</h4>
            {/* <p className="my-1 mb-4">The page you are looking for doesn't exist.</p> */}
            <Link href="/" className="mt-2 ">
              <a className="btn btn-md bg-base px-3 py-2 text-white rounded-0">
                Go Home
              </a>
            </Link>
          </div>
        </div>
      </>}
    </>
  )
}