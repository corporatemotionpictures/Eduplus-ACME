import Link from 'next/link';
import { getToken, logout } from 'helpers/auth';
import { getSettings } from 'helpers/apiService';
import React, { useState, useEffect } from 'react';

export default function TopBar(props) {

  const [contactData, setContactdata] = useState(props.contactData)

  return (
    <div className="header_top">
      <div className="container">
        <div className="row">
          <div className="col-12 col-sm-12 col-lg-12">
            <div className="info_wrapper">
              <div className="contact_info">
                <ul className="list-unstyled">
                  <li><i className="flaticon-phone-receiver"></i>
                    {contactData && contactData.contact_numbers && contactData.contact_numbers != '' &&
                      JSON.parse(contactData.contact_numbers).map((data, i) => {
                        if (i < 2) {
                          return i == 0 ? `${data.contact_numbers}` : ` / ${data.contact_numbers}`
                        }
                      })
                    }
                  </li>
                  {/* <li><i className="flaticon-mail-black-envelope-symbol"></i>
                    {contactData && contactData.email && contactData.email != '' &&
                      JSON.parse(contactData.email)[0].email
                    }
                  </li> */}
                </ul>
              </div>


              <div className="login_info">
                {
                  props.pages && props.pages.length > 0 && props.pages.map((page, i) => {
                    if (page.is_parent == 1 && page.items) {
                      return <ul>

                        <li className="nav-item dropdown">
                          <a className="nav-link dropdown-toggle" href="#" id={`navitemDropdown${i}`} role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            {page.title}
                          </a>
                          <div className="dropdown-menu" aria-labelledby={`navitemDropdown${i}`}>
                            {
                              page.items && page.items.map(item => {
                                return <Link href={item.page_url ? item.page_url : `/${item.slug}`}>
                                  <a className="dropdown-item" target={item.target_blank == 1 ? "_blank" : '_self'}>{item.title}</a>
                                </Link>
                              })
                            }
                          </div>
                        </li>
                      </ul>

                    } else {

                      return <ul>
                        <li className="nav-item">
                          <Link href={page.page_url ? page.page_url : `/${page.slug}`}>
                            <a className="nav-link" target={page.target_blank == 1 ? "_blank" : '_self'}>{page.title}</a>
                          </Link>
                        </li>
                      </ul>
                    }
                  })
                }
                {getToken() == undefined && <ul className="d-flex">
                  <li className="nav-item">

                    <Link href="/auth/register">
                      <a className="nav-link sign-in js-modal-show"><i className="flaticon-user-male-black-shape-with-plus-sign"></i>Sign Up</a>
                    </Link>
                  </li>

                </ul> || <ul className="d-flex">
                    <li className="nav-item">
                      <Link href="/accounts/cart">
                        <a className="nav-link sign-in js-modal-show"><i className="fa fa-cart-arrow-down"></i>My Cart</a>
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link href="/accounts/board">
                        <a className="nav-link sign-in js-modal-show"><i className="fa fa-user"></i>My Account</a>
                      </Link>
                    </li>
                  </ul>}


                {getToken() == undefined && <Link href="/auth/login">
                  <a title="" className="apply_btn"><i className="fa fa-sign-in-alt"></i> User Login</a>
                </Link> ||
                  <a className="apply_btn" onClick={function () {
                    logout();
                  }}>Logout</a>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}