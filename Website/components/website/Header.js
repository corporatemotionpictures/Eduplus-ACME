import Link from 'next/link';
import Head from 'next/head';
import { getSettings } from 'helpers/apiService';
import { getToken, logout } from 'helpers/auth';
import React, { useState, useEffect } from 'react';
import router, { useRouter } from 'next/router'
import define from 'src/json/worddefination.json'

export default function Header(props) {
  const [loading, setLoading] = useState(false)


  return (
    <>
      {loading == true && <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-screen z-50 overflow-hidden opacity-75 flex items-center justify-center">
        {/* <img src="/images/loader.gif" /> */}
      </div> ||

        <div className="edu_nav ">
          <div className="container " >

            <nav className="navbar navbar-expand-lg navbar-light main-menu">
              <Link href="/website" as="/">
                <a className="navbar-brand" >
                  <img src={props.metaData.logoDark} alt={window.localStorage.getItem('defaultImageAlt')} />
                </a>
              </Link>
              <button
                className="navbar-toggler"
                id="navbar-toggler"
                type="button"
                data-toggle="collapse"
                data-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent"
                aria-expanded="false"
                aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
              </button>



              <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <ul className="navbar-nav nav lavalamp ml-auto menu">

                  {
                    props.pages && props.pages.length > 0 && props.pages.map((page, i) => {
                      if (page.is_parent == 1 && page.items) {
                        return <li className="nav-item">
                          <a className="nav-link dropdown-toggle" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            {page.title}
                          </a>
                          <ul className="navbar-nav nav mx-auto">
                            {
                              page.items && page.items.map(item => {
                                return <Link href={item.login_required == 1 && getToken() == undefined ? '/auth/login' : (item.page_url ? item.page_url : `/${item.slug}`)}><li className={`nav-link ${router.pathname == (page.page_url ? page.page_url : `/${page.slug}`) ? 'active' : ''} `}>
                                  <a className={`nav-link  nav_colour`} target={item.target_blank == 1 ? "_blank" : '_self'}>{item.title}</a>
                                </li></Link>
                              })
                            }
                          </ul>
                        </li>

                      } else {

                        return <Link href={page.login_required == 1 && getToken() == undefined ? '/auth/login' : (page.page_url ? page.page_url : `/${page.slug}`)}>
                          <li className={`nav-item ${router.pathname == (page.page_url ? page.page_url : `/${page.slug}`) ? 'active' : ''} `}>

                            <a className={`nav-link`} target={page.target_blank == 1 ? "_blank" : '_self'}>{page.title}</a>
                          </li>
                        </Link>
                      }
                    })
                  }
                  {
                    props.pagesTopbar && props.pagesTopbar.length > 0 && props.pagesTopbar.map((page, i) => {
                      if (page.is_parent == 1 && page.items) {
                        return <li className="nav-item d-md-none">
                          <a className="nav-link dropdown-toggle" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            {page.title}
                          </a>
                          <ul className="navbar-nav nav mx-auto">
                            {
                              page.items && page.items.map(item => {
                                return <Link href={item.login_required == 1 && getToken() == undefined ? '/auth/login' : (item.page_url ? item.page_url : `/${item.slug}`)}><li className={`nav-link head_color ${router.pathname == (page.page_url ? page.page_url : `/${page.slug}`) ? 'active' : ''} `}>
                                  <a className={`nav-link nav_colour`} target={item.target_blank == 1 ? "_blank" : '_self'}>{item.title}</a>
                                </li></Link>
                              })
                            }
                          </ul>
                        </li>

                      } else {

                        return <Link href={page.login_required == 1 && getToken() == undefined ? '/auth/login' : (page.page_url ? page.page_url : `/${page.slug}`)}>
                          <li className={`nav-item d-md-none ${router.pathname == (page.page_url ? page.page_url : `/${page.slug}`) ? 'active' : ''} `}>

                            <a className={`nav-link`} target={page.target_blank == 1 ? "_blank" : '_self'}>{page.title}</a>
                          </li>
                        </Link>
                      }
                    })
                  }




                  {
                    props.contactData && props.contactData.playStore && props.contactData.playStore != '' &&
                    JSON.parse(props.contactData.playStore).map(data => {
                      if (data.playStore != '') {
                        return <Link href={data.playStore}>
                          <a className="mt-3 d-md-block d-none" target="_blank">
                            <img src="/website/assets/images/download/play.png" style={{ width: '150px' }} alt={window.localStorage.getItem('defaultImageAlt')} />
                          </a>
                        </Link>

                      }
                    })
                  }




                  {getToken() == undefined && <li className="nav-item d-md-none">
                    <Link href="/auth/register" as="/register">
                      <a className="nav-link">Register</a>
                    </Link>
                  </li>}

                  {getToken() == undefined && <li className="nav-item d-md-none">
                    <Link href="/auth/login">
                      <a className="nav-link">Login</a>
                    </Link>
                  </li>}

                  {getToken() && <li className="nav-item d-md-none">
                    <Link href="/accounts/cart" as="/accounts/cart">
                      <a className="nav-link">My Cart</a>
                    </Link>
                  </li>}

                  {getToken() && <li className="nav-item d-md-none">
                    <Link href="/accounts/board">
                      <a className="nav-link">My Account</a>
                    </Link>
                  </li>}
                  {getToken() && <li className="nav-item d-md-none">
                    <a className="nav-link" onClick={function () {
                      logout();
                    }}>Logout</a>
                  </li>}

                </ul>
              </div>



            </nav>

          </div>


        </div>

      }</>
  )

}