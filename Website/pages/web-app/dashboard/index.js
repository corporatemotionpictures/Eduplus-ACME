import Link from "next/link";
import React, { useState, useEffect } from 'react';
import { get, getSettings } from 'helpers/apiService';
import Filter from 'components/classical-ui/filters'
import Slider from "react-slick";
import define from 'src/json/worddefination.json';

export default function MyCourses() {

  const [products, setProducts] = useState({})
  const [contacts, setcontacts] = useState({})
  const [banners, setBanners] = useState([])
  const [first, setFirst] = useState(true)
  const [totalIndex, setTotalIndex] = useState(0)
  const [settings, setSettings] = useState({
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false,
    adaptiveHeight: true,
    autoplay: true
  })

  // Call first time when component rander
  useEffect(() => {
    async function getInnerdata() {
      if (first == true) {
        let filters = { access: true }

        var productList = await get('users/active-products', filters)
        setProducts(productList.userProducts)

        var banners = await get('banners')
        setBanners(banners.banners)

        let contacts = await getSettings('contacts')
        setcontacts(contacts)

      }
    }
    getInnerdata()

    return setFirst(false)
  }, [first])

  return (
    <>

      <section className="popular_courses webbgdashboard ">
        <div className="container pb-3">

        </div>
        <div className="container">


          <Slider {...settings}>
            {
              banners && banners.map(banner => {
                return <div className=" mb-4">
                  <img className="rounded w-90" src={banner.image} alt={window.localStorage.getItem('defaultImageAlt')} />
                </div>
              })
            }
          </Slider>
          <div className="row">
            {/* {
              banners && banners.map(banner => {
                return <div className="col-4 mb-4">
                  <img className="rounded" src={banner.image} alt={window.localStorage.getItem('defaultImageAlt')} />
                </div>
              })
            } */}
            <div className="rs-subject style1 md-pb-0">
              <div className="container">

                <div className="row">
                  {/* <div className={`col-lg-3 col-md-3 col-3 col-sm-3`}>
                    <Link href="/courses">
                      <a target="_blank" >
                        <div className="subject-wrap bgc1 mb-5 subject-box">
                          <div className="row">
                            <div className="col-lg-4 col-12 text-left pr-0">
                              <img src="/website/assets/images/web-icons/1.jpg" alt={window.localStorage.getItem('defaultImageAlt')} />
                            </div>
                            <div className="col-lg-8 col-12 text-left m-auto pl-0">
                              <h4 className="title"><b>Buy Courses</b></h4>


                            </div>
                          </div>
                        </div>
                      </a>
                    </Link>
                  </div> */}

                  {/* <div className={`col-lg-3 col-md-3 col-3 col-sm-3`}>
                    <Link href="https://testseries.brainerygroup.com">
                      <a target="_blank" >
                        <div className="subject-wrap bgc1 mb-5 subject-box">
                          <div className="row">
                            <div className="col-lg-4 col-12 text-left pr-0">
                              <img src="/website/assets/images/web-icons/2.jpg" alt={window.localStorage.getItem('defaultImageAlt')} />
                            </div>
                            <div className="col-lg-8 col-12 text-left m-auto pl-0">
                              <h4 className="title"><b>Test Series</b></h4>

                            </div>
                          </div>
                        </div>
                      </a>
                    </Link>
                  </div> */}

                  {/* <div className={`col-lg-3 col-md-3 col-3 col-sm-3`}>
                    <Link href="/web-app/dashboard/webinars">
                      <a  >
                        <div className="subject-wrap bgc1 mb-5 subject-box">
                          <div className="row">
                            <div className="col-lg-4 col-12 text-left pr-0">
                              <img src="/website/assets/images/web-icons/3.jpg" alt={window.localStorage.getItem('defaultImageAlt')} />
                            </div>
                            <div className="col-lg-8 col-12 text-left m-auto pl-0">
                              <h4 className="title"><b>Webinars</b></h4>

                            </div>
                          </div>
                        </div>
                      </a>
                    </Link>
                  </div> */}

                  {/* <div className={`col-lg-3 col-md-3 col-3 col-sm-3`}>

                    {contacts && contacts.youtube && contacts.youtube != '' &&

                      JSON.parse(contacts.youtube).map(data => {
                        if (data.youtube != '') {
                          return <Link href={data.youtube}>
                            <a target="_blank" >
                              <div className="subject-wrap bgc1 mb-5 subject-box">
                                <div className="row">
                                  <div className="col-lg-4 col-12 text-left pr-0">
                                    <img src="/website/assets/images/web-icons/4.jpg" alt={window.localStorage.getItem('defaultImageAlt')} />
                                  </div>
                                  <div className="col-lg-8 col-12 text-left m-auto  ">
                                    <h4 className="title"><b>Free Videos</b></h4>

                                  </div>
                                </div>
                              </div>
                            </a>
                          </Link>
                        }
                      })
                    }

                  </div> */}
                </div>
              </div>
            </div>

            <div className={'col-sm-12'}>
              <h2 className="mb-4">Your Courses</h2>

              <div className="row">

                {
                  products && products.length > 0 &&
                  products.map(product => {
                    return (

                      <div className={`col-12 col-sm-3 col-md-6 col-lg-3`}>
                        <div className="single-courses">
                          <div className="courses_banner_wrapper">
                            <div className="courses_banner">
                              <Link href={`/web-app/dashboard/[productslug]`} as={`/web-app/dashboard/${product.slug}`}>
                                <a><img src={product.cover_image} alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid" /></a>
                              </Link>
                            </div>
                          </div>
                          <div className="courses_info_wrapper">
                            <div className="courses_title">
                              <h3 className="min-height-4">
                                <Link href={`/web-app/dashboard/[productslug]`} as={`/web-app/dashboard/${product.slug}`}>
                                  <a className="cart_btn mb-3 text-limit">{product.name}</a>
                                </Link>
                              </h3>
                              {/* <div className="branch_name mb-2">
                                {product.courses.map(course => {
                                  return (
                                    <Link href="/"><a title="" className="mr-1 mb-1 text-left">{course.name}</a></Link>
                                  )
                                })}

                              </div> */}
                              <p className="badge badge-success mb-1 p-2">{product.product_type.is_package == 1 && product.package_type ? product.package_type.title : product.product_type.title}</p>
                            </div>

                            <div className="courses_info">
                              <ul className="list-unstyled w-100">
                                <Link href={`/web-app/dashboard/[productslug]`} as={`/web-app/dashboard/${product.slug}`}><a className="cart_btn mt-3">Start Learning</a></Link>

                              </ul>

                            </div>
                          </div>
                        </div>

                      </div>
                    )
                  })

                  ||
                  <div className="empty_box">
                    <h2 className="text-center"><i className="fas fa-cart-plus"></i></h2>
                    <h5 className="text-center">Hey, <b className="font-saffron"><b></b></b> You have no active courses.</h5>
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