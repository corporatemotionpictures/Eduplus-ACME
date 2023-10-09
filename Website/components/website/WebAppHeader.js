import Link from 'next/link';
import Head from 'next/head';
import { getSettings } from 'helpers/apiService';
import React, { useState, useEffect } from 'react';
import { getToken, logout } from 'helpers/auth';
import { useRouter } from 'next/router'

import define from 'src/json/worddefination.json'

export default function WebAppHeader(props) {

  const [appData, setAppdata] = useState({})
 
  const [first, setFirst] = useState(true)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function getInnerdata() {
      if (first == true) {
        let data = await getSettings('metaDetails')
        setAppdata(data)
        setLoading(false)
      }
    }

    getInnerdata()


    setFirst(false)
    return
  }, [first])

  return (
    <div>

      <div className="header_top header_top_web d-flex">
        {
          router.pathname != '/web-app/dashboard' && !router.pathname.startsWith('/web-app/auth') &&
          <a className="back-btn my-1 " onClick={() => router.back()}><i class="fas fa-arrow-left"></i></a>
        }

        {/* <span className="back-btn"><i class="fas fa-arrow-left"></i></span> */}
        <div className="container">
          {/* <span className=""><i class="fas fa-arrow-left"></i></span> */}
          <div className="row">
            <div className="col-12 col-sm-12 col-lg-12">
              <div className="info_wrapper">

                <div className="contact_info w-25">
                  <div className="logo-cat-wrap py-2 flex d-flex">


                    <div className="logo-part zoom">
                      <Link href="/web-app/dashboard">
                        <a title="eliveclass | Homepage">
                          <img src={appData.logoLight} alt={window.localStorage.getItem('defaultImageAlt')} />
                        </a>
                      </Link>
                    </div>
                  </div>
                </div>


                <div className="login_info">

                  {getToken() && <ul>
                    <li className="nav-item">
                      <Link href="/web-app/dashboard">
                        <a className="nav-link"><i className="fa fa-cart-arrow-down"></i>Dashboard</a>
                      </Link>
                    </li>
                  </ul>}

                  

                  {getToken() && <ul>
                    <li className="nav-item">
                      <Link href="/web-app/dashboard/watch-lists">
                        <a className="nav-link"><i className="fa fa-list-ul"></i>Watchlist</a>
                      </Link>
                    </li>
                  </ul>}
                  {getToken() && <ul>
                    <li className="nav-item">
                      <Link href="/web-app/dashboard/webinars">
                        <a className="nav-link"><i className="fa fa-list-ul"></i>Webinars</a>
                      </Link>
                    </li>
                  </ul>}
                  {getToken() && <ul>
                    <li className="nav-item">
                      <Link href="/web-app/dashboard/recently-played">
                        <a className="nav-link"><i className="fa fa-play-circle"></i>Recently Played</a>
                      </Link>
                    </li>
                  </ul>}
{/* 
                  {getToken() && <ul>
                    <li className="nav-item">
                      <Link href="/accounts/board/">
                        <a target="_blank" className="nav-link"><i className="fa fa-user"></i>My Account</a>
                      </Link>
                    </li>
                  </ul>} */}



                  {getToken() == undefined && <Link href="/auth/login">
                    <a title="" className="nav-link text-white"></a>
                  </Link> ||
                    <a className="nav-link text-white" onClick={function () {
                      logout('/web-app/auth/login');
                    }}><i class="fa fa-user-circle" aria-hidden="true"></i> Logout</a>
                  }

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  )

}
