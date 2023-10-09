import Link from "next/link";
import { getSettings } from 'helpers/apiService';
import React, { useState, useEffect } from 'react';
import define from 'src/json/worddefination.json'

export default function Footer(props) {

  const [appData, setAppdata] = useState({})
  const [contactData, setContactdata] = useState({})
  const [first, setFirst] = useState(true)

  useEffect(() => {
    async function getInnerdata() {
      if (first == true) {
        let data = await getSettings('metaDetails')
        setAppdata(data)
        data = await getSettings('contacts')
        setContactdata(data)
      }
    }

    getInnerdata()

    setFirst(false)
    return
  }, [first])

  return (
    <div className="">
      <div className="container">
        <div className="footer_top">
          <div className="row">
            <div className="col-12 col-md-12 col-lg-4">
              <div className="footer_single_col footer_intro">
                <Link href="/">
                  <a className="">
                  <img src={appData.logoLight} alt={window.localStorage.getItem('defaultImageAlt')} className="f_logo" />
                  </a>
                </Link>
                <p>As an academy with our constant effort to provide the MCA aspirants with best inline study materials and guidance.</p>
                <div className="footer__social pt-1">
                  <ul className="row col-12 col-sm-12 col-md-12 col-lg-12">
                    <div className="col-2 col-sm-2 col-md-2 col-lg-3 mb-3 mr-negative">
                      {
                        contactData && contactData.facebook && contactData.facebook != '' &&
                        JSON.parse(contactData.facebook).map(data => {
                          if (data.facebook != '') {
                            return <li ><Link href={data.facebook}><a target="_blank"className="social_hover"><i className="fab fa-facebook-f fb-icon "></i></a></Link></li>
                          }
                        })
                      }

                    </div>

                    {/* <div className="col-2 col-sm-2 col-md-2 col-lg-3 mb-3 mr-negative">
                      {
                        contactData && contactData.twitter && contactData.twitter != '' &&
                        JSON.parse(contactData.twitter).map(data => {
                          if (data.twitter != '') {
                            return <li ><Link href={data.twitter}><a className="tw social_hover" target="_blank"><i className="fab fa-twitter link-icon"></i></a></Link></li>
                          }
                        })
                      }

                    </div> */}
                    <div className="col-2 col-sm-2 col-md-2 col-lg-3 mb-3 mr-negative">
                      {
                        contactData && contactData.youtube && contactData.youtube != '' &&
                        JSON.parse(contactData.youtube).map(data => {
                          if (data.youtube != '') {
                            return <li ><Link href={data.youtube}><a className="pin social_hover" target="_blank"><i className="fab fa-youtube yt-icon "></i></a></Link></li>
                          }
                        })
                      }

                    </div>
                    {/* <div className="col-2 col-sm-2 col-md-2 col-lg-3 mb-3 mr-negative">
                      {
                        contactData && contactData.linkedin && contactData.linkedin != '' &&
                        JSON.parse(contactData.linkedin).map(data => {
                          if (data.linkedin != '') {
                            return <li ><Link href={data.linkedin}><a target="_blank"className="social_hover"><i className="fab fa-linkedin-in link-icon"></i></a></Link></li>
                          }
                        })
                      }

                    </div> */}
                    <div className="col-2 col-sm-2 col-md-2 col-lg-3 mb-3 mr-negative">
                      {
                        contactData && contactData.instagram && contactData.instagram != '' &&
                        JSON.parse(contactData.instagram).map(data => {
                          if (data.instagram != '') {
                            return <li ><Link href={data.instagram}><a className="insta social_hover" target="_blank"><i className="fab fa-instagram link-icon"></i></a></Link></li>
                          }
                        })
                      }

                    </div>
                    <div className="col-2 col-sm-2 col-md-2 col-lg-3 mb-3 mr-negative">
                      {
                        contactData && contactData.telegram && contactData.telegram != '' &&
                        JSON.parse(contactData.telegram).map(data => {
                          if (data.telegram != '') {
                            return <li><Link href={data.telegram}><a className="telegram social_hover" target="_blank"><i className="fab fa-telegram link-icon"></i></a></Link></li>
                          }
                        })
                      }

                    </div>
                    {/* <div className="col-2 col-sm-2 col-md-2 col-lg-3 mb-3 mr-negative">
                        {
                    contactData && contactData.playStore && contactData.playStore != '' &&
                    JSON.parse(contactData.playStore).map(data => {
                      if (data.playStore != '') {
                        return <li ><Link href={data.playStore}><a target="_blank"><i className="fab fa-google-play ins-icon"></i></a></Link></li>
                      }
                    })
                  } 
                          
                        </div> */}
















                  </ul>



                </div>

              </div>
            </div>
            {
              props.pages && props.pages.map(page => {
                if (page.slug == 'usefulLinks') {
                  return <div className="col-6 col-md-4 col-lg-2">
                    <div className="footer_single_col">
                      <h3>Useful Links</h3>
                      <ul className="location_info quick_inf0">

                        {
                          page.items && page.items.map(item => {
                            return <li ><Link href={item.page_url ? item.page_url : `/${item.slug}`}><a target={item.target_blank == 1 ? "_blank" : '_self'}>{item.title}</a></Link></li>
                          })
                        }
                      </ul>
                    </div>
                  </div>
                }
              })
            }
            {
              props.pages && props.pages.map(page => {
                if (page.slug == 'information') {
                  return <div className="col-6 col-md-4 col-lg-2">
                    <div className="footer_single_col">
                      <h3>Information</h3>
                      <ul className="location_info quick_inf0">

                        {
                          page.items && page.items.map(item => {
                            return <li ><Link href={item.page_url ? item.page_url : `/${item.slug}`}><a target={item.target_blank == 1 ? "_blank" : '_self'}>{item.title}</a></Link></li>
                          })
                        }
                      </ul>
                    </div>
                  </div>
                }
              })
            }
            <div className="col-12 col-md-4 col-lg-4 text-sm-center">
              <div className="footer_singling_col contact">
                <h3>Contact Us</h3>
                {/* <p>Fell free to get in touch us via Phone or send us a message.</p> */}
                <div className="contact_info">
                  <ul>
                    {contactData && contactData.mapAddress && <li>
                      <a target="_blank" href={contactData.mapAddress}>
                        <span className="email"><i class="fas fa-map-marker-alt mr-1"></i> <u>Find us on Google Map</u></span>
                      </a>
                    </li>
                    }
                    {contactData && contactData.addresses && <li>
                      <a>
                        <span><i className="fas fa-map-marker-alt mr-1"></i> {contactData.addresses}</span>
                      </a>
                    </li>
                    }
                    {contactData && contactData.contact_numbers && contactData.contact_numbers != '' &&
                      JSON.parse(contactData.contact_numbers).map(data => {
                        return <li>
                          <a href={`tel: +91-${data.contact_numbers}`}>
                            <span><i className="fa fa-mobile-alt mr-1"></i> {data.contact_numbers} (Call)</span>
                          </a>
                        </li>
                      })
                    }
                    {contactData && contactData.whatsapp_numbers && contactData.whatsapp_numbers != '' &&
                      JSON.parse(contactData.whatsapp_numbers).map(data => {
                        return <li>
                          <a href={`tel: +91-${data.whatsapp_numbers}`}>
                            <span><i className="fa fa-mobile-alt mr-1"></i> {data.whatsapp_numbers} (WhatsApp)</span>
                          </a>
                        </li>
                      })
                    }
                    {contactData && contactData.email && contactData.email != '' &&
                      JSON.parse(contactData.email).map(data => {
                        return <li>
                          <a href={`mailto: ${data.email}`}>
                            <span><i className="fa fa-envelope mr-1"></i> {data.email} </span>
                          </a>
                        </li>
                      })
                    }

                  </ul>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="round_shape">
        <span className="shape_1"></span>
        <span className="shape_2"></span>
        <span className="shape_3"></span>
        <span className="shape_4"></span>
        <span className="shape_5"></span>
        <span className="shape_6"></span>
      </div>
      <div class="footer-bottom-area foot">
        <div class="container">
          <div class="row">
            <div class="col-sm-8 col-lg-6 col-xs-12 footer_bottom ">© ACME ACADEMY { new Date().getFullYear()}. All Rights Reserved.</div>
            <div class="col-sm-8 col-lg-6 text-right col-xs-12 footer_spacing">Powered by <a rel="nofollow" target="_blank" href="https://www.etherealcorporate.com/"> Ethereal Corporate Network Private Limited </a></div>

          </div>
        </div>
      </div>
      <img src="/website/assets/images/shapes/footer_bg_shpe_1.png" alt={window.localStorage.getItem('defaultImageAlt')} className="shapes1_footer" />
    </div>
  )
}