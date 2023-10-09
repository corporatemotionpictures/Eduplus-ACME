import Link from "next/link";
import define from 'src/json/worddefination.json'
import { fetchAll } from 'helpers/apiService';
import moment from 'moment';
import React, { useState, useEffect } from 'react';

export default function courses() {

  const [gallery, setGallery] = useState([])
  const [first, setFirst] = useState(true)

  useEffect(() => {
    async function getInnerdata() {
      if (first == true) {
        let data = await fetchAll('gallery')
        setGallery(data.gallery)

      }
    }
    getInnerdata()
    setFirst(false)
    return
  }, [first])


  return (
    <>
      <header className="header_inner courses_page">

        <div className="intro_wrapper gallery_head">
          <div className="container">
            <div className="row">
              <div className="col-sm-12 col-md-8 col-lg-8">
                <div className="intro_text">
                  <h1>Gallery</h1>

                </div>
              </div>
            </div>
          </div>
        </div>

      </header>
      {/* Mid Content Starts */}
      <div className="container page-top">

        <div className="photo-gallery">
          <div className="container">
            <div className="intro">

            </div>
            <div className="row photos">

              {
                gallery && gallery.map(group => {
                  return <div className="col-sm-6 col-md-4 item mb-2">
                    <div className="article-image">
                      <a href={group.cover_image} rel={`lightbox[${group.id}]`}>
                        <img className="img-fluid gallery_img" src={group.cover_image} />
                      </a>
                      <div class="itemBlogContent clearfix ">
                        <div class="blog-content">
                          <div class="article-title font-title text-uppercase">
                            <h6><a href="#" class=" galleryheader">{group.name}</a></h6>
                          </div>
                          <p class="article-description mt-1">
                            {group.description}
                          </p>
                        </div>
                      </div>
                      {
                        group.images && JSON.parse(group.images).map(image => {
                          return <a href={image} rel={`lightbox[${group.id}]`}></a>
                        })
                      }

                      <div class="article-date">
                        <div class="date"> <span class="article-date">
                          <b>{moment(group.date).format('DD MMM')}</b>
                        </span>
                        </div>
                      </div>
                    </div>
                  </div>
                })
              }

              {
                gallery && gallery.length == 0 && <div
                  data-layout="centered"
                  className="container w-full p-4 flex items-center justify-left ">
                  <div className="flex flex-col w-1/2 max-w-xl text-center">
                    <img
                      className="object-contain w-auto "
                      src="/images/404.jpg"
                      alt={window.localStorage.getItem('defaultImageAlt')}
                    />

                    {/* 
                <div className="mb-8 text-center text-gray-900">
                  We're sorry. The page you requested could not be found. Please go back
                  to the homepage or contact us
              </div> */}
                  </div>
                  <div className=" pl-5">
                    <h4 className="text-5xl text-base  font-bold text-bold mb-1">No Data Available</h4>

                    {/* <p className="my-1 mb-4">The page you are looking for doesn't exist.</p> */}
                    <Link href="/" className="mt-2 ">
                      <a className="btn btn-md bg-base px-3 py-2 text-white rounded-0">
                        Go Home
                      </a>
                    </Link>
                  </div>
                </div>
              }


            </div>
          </div>
        </div>

      </div>
      {/* Mid Content Ends */}
    </>
  )
}