import Link from "next/link";
import React, { useState, useEffect } from 'react';
import { get, fetchByID } from 'helpers/apiService';
import Filter from 'components/classical-ui/filters'
import { useRouter } from 'next/router'
import define from 'src/json/worddefination.json'

export default function MyCourses(params) {

  const [videos, setVideos] = useState({})
  const [chapter, setChapter] = useState({})
  const [first, setFirst] = useState(true)
  const [product, setProduct] = useState(true)
  const [totalIndex, setTotalIndex] = useState(0)
  const router = useRouter()

  // Call first time when component rander
  useEffect(() => {
    async function getInnerdata() {
      if (first == true) {

        var videos = await get('videos/watch-lists')

        setVideos(videos.videos)

      }
    }
    getInnerdata()
    return setFirst(false)
  }, [first])


  return (

    <>

      <section className="popular_courses">

        <div className="container pb-3">

        </div>

        <div className="container">
          <h3 className="font-bold"><i class="fa fa-play-circle mr-2" aria-hidden="true"></i>Your Watchlist</h3>
          <hr className="mt-1 mb-4"></hr>
          <div className="row">
            <div className={'col-sm-12'}>

              <div className="row">

                {
                  videos && videos.length > 0 &&
                  videos.map(video => {

                    var ms = video.duration,
                      min = Math.floor((ms / 60) << 0),
                      sec = Math.floor((ms) % 60);
                    let duration = min + ':' + sec
                    return (

                      <div className={`col-12 col-sm-3 col-md-6 col-lg-3`}>
                        <div className="single-courses">
                          <div className="courses_banner_wrapper">
                            <div className="courses_banner">
                              <Link href={`/web-app/dashboard/watch-lists/[slug]`} as={`/web-app/dashboard/watch-lists/${video.id}`}>
                                <a><img src={video.thumbnail} alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid" /></a>
                              </Link>
                            </div>
                            <div className="purchase_price">
                              <Link href={`/web-app/dashboard/watch-lists/[slug]`} as={`/web-app/dashboard/watch-lists/${video.id}`}>
                                <a className="read_more-btn"><i class="fa fa-clock"></i> {duration} min </a>
                              </Link>
                            </div>
                          </div>

                          <div className="courses_info_wrapper">
                            <div className="courses_title">
                              <h3 className="min-height-4">
                                <Link href={`/web-app/dashboard/watch-lists/[slug]`} as={`/web-app/dashboard/watch-lists/${video.id}`}>
                                  <a className="cart_btn mb-3 text-limit">{video.title}</a>
                                </Link>
                              </h3>

                            </div>


                          </div>
                        </div>

                      </div>
                    )
                  })
                  ||
                  <div className="empty_box">
                    <h2 className="text-center"><i className="fas fa-cart-plus"></i></h2>
                    <h5 className="text-center"> <b className="font-saffron"><b></b></b>No videos on Watchlist.</h5>
                  </div>
                }

              </div>
            </div>
          </div>
        </div>
      </section >
    </>
  )
}