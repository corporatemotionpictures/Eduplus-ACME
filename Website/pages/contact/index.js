import { Component } from 'react';
import Router from 'next/router';
import Link from 'next/link';
import { add } from 'helpers/apiService';
import { getToken } from 'helpers/auth';
import { getSettings } from 'helpers/apiService';
import ValidationFront from 'components/functional-ui/forms/validationFront'
import define from 'src/json/worddefination.json'

export default class Contact extends Component {

  // Set state
  state = {
    isSubmitting: true,
    login: false,
    error: null,
    contacts: {},
  };

  // Function For Login
  handleSubmit = async (data) => {

    let enquiries = await add('raise-tickets', data);
    if (enquiries.success == false) {

      let error;
      if (enquiries.user) {
        error = enquiries.user.error
      }
      else if (enquiries.error) {
        error = enquiries.error.details ? enquiries.error.details[0].message : enquiries.error
      }

      toastr.error(error)
    }
    else {
      toastr.success('Enquiry send successfully ')
    }

  }


  fetchdata = async () => {
    let contacts = await getSettings('contacts')

    console.log(contacts)

    this.setState({
      contacts: contacts
    })
  }



  // 
  componentDidMount() {
    this.fetchdata()
  }

  render() {

    let contacts = this.state.contacts

    console.log(contacts.addresses)

    let items = [
      {
        label: 'Message',
        error: { required: 'Please enter a valid message' },
        name: 'message',
        type: 'textarea',
        className: "col-12 col-sm-12 col-md-12 form-group",
        placeholder: 'Your Comment Write Here'
      }
    ]

    if (!getToken()) {
      items = [
        {
          label: 'Name',
          error: { required: 'Please enter a valid Name' },
          name: 'name',
          type: 'text',
          className: "col-12 col-sm-12 col-md-12 form-group",
          placeholder: 'Enter Name',
        },
        {
          label: 'Mobile Number',
          error: {
            required: 'Please enter mobile number',
          },
          name: 'mobile_number',
          type: 'number',
          placeholder: 'Enter your Registered Mobile Number',
          className: 'col-12 col-sm-6 col-md-6'
        },
        {
          label: 'City',
          error: { required: 'Please enter a valid City' },
          name: 'city',
          type: 'text',
          className: "col-12 col-sm-6 col-md-6 form-group",
          placeholder: 'Enter City'
        },
        ...items
      ]
    }

    return (
      <>
        <header className="header_inner courses_page">
          <div className="intro_wrapper contact_head">
            <div className="container">
              <div className="row">
                <div className="col-sm-12 col-md-8 col-lg-8">
                  <div className="intro_text">
                    <h1>Contact Us</h1>
                    <span>
                  <Link href="/">
                    <a title="Get Started Now" className="">Home </a>
                    </Link>
                  </span>
                  <span> /  </span>
                  <span>Contact</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </header>

        { console.log(contacts)}

        {/* Contact page content starts */}
        <section className="contact_info_wrapper">
        <div class="contact__shape">
               <img class="contact-shape-8" src="/uploads/settings/contact-shape-5.png" alt=""></img>
               <img class="contact-shape-9" src="/uploads/settings/contact-shape-4.png" alt=""></img>
            </div>
          <div className="container">
            <div className="row">
              
              <div className="col-12 col-sm-12 col-md-7 col-lg-7 ">
                <div className="contact_form_wrapper mt-3">
                <h2 className="section__title about_us_title mb-4">Get<span className=" "> In Touch <img className="blink_img" src="/website/assets/images/banner/yellow-bg.png" alt=""></img> </span></h2>
                  <div className="leave_comment">
                    <div className="contact_form ">
                      <ValidationFront items={items} onSubmit={this.handleSubmit} buttonText="Send" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-sm-12 col-md-5 col-lg-4 spacing sm-mt-4 mt-lg-4">
              <div class="contact__shape">
                           <img class="contact-shape-1" src="/uploads/settings/contact-shape-1.png.png" alt=""></img>
                           <img class="contact-shape-2" src="/uploads/settings/contact-shape-2.png" alt=""></img>
                           <img class="contact-shape-3" src="/uploads/settings/contact-shape-3.png" alt=""></img>
                        </div>
                <div className="contact_info contact__info-inner">
                  <h3 className="title">Contact Details</h3>
                  <hr className="rowed " />
                  {/* <p>You need to be sure there isn't anything embarrassing hidden in the repeat predefined chunks as nessing hidden in the repeat predefined chunks as necessary, making this the first true generator on the Internet.</p> */}
                  <div className="event_location_info">
                    <ul className="list-unstyled ">
                     { console.log("aa",contacts)}
                      {contacts !== {} && contacts.addresses && <li >
                        <i class="fas fa-map-marker-alt info_title" aria-hidden="true"></i>
                        <h4 className="address_font">Address</h4>
                        <ul className="list-unstyled ">
                          <li>{contacts.addresses}</li>
                        </ul>
                      </li>
                      ||
                      <div>
                        <div className="comment br animateShimmer mt-2 p-3 w-75"></div>
                        <div className="comment br animateShimmer mt-2 p-3 w-75"></div>
                      </div>
                      }

                      {contacts !== {} && (contacts.whatsapp_numbers && contacts.whatsapp_numbers != '' || contacts.contact_numbers && contacts.contact_numbers != '') && <li>
                      <i class="fas fa-phone-volume info_title" aria-hidden="true"></i>
                        <h4 className="address_font">Phone Numbers</h4>
                        <ul className="list-unstyled">
                          {contacts.whatsapp_numbers && contacts.whatsapp_numbers != '' &&
                            JSON.parse(contacts.whatsapp_numbers).map(data => {
                              return <li>
                                <a href={`tel: +91-${data.whatsapp_numbers}`}>
                                  {data.whatsapp_numbers} (WhatsApp)
                                </a>
                              </li>
                            })
                          }
                          {contacts.contact_numbers && contacts.contact_numbers != '' &&
                            JSON.parse(contacts.contact_numbers).map(data => {
                              return <li>
                                <a href={`tel: +91-${data.contact_numbers}`}>
                                  {data.contact_numbers} (Call)
                                </a>
                              </li>
                            })
                            
                          }
                        </ul>
                      </li>
                      ||
                      <div>
                        <div className="comment br animateShimmer mt-2 p-3 w-75"></div>
                        <div className="comment br animateShimmer mt-2 p-3 w-75"></div>
                      </div>}

                      {contacts !== {} && contacts.email && contacts.email != '' && <li>
                      <i class="far fa-envelope info_title" aria-hidden="true"></i>
                        <h4 className="address_font">Our E-mails</h4>
                        <ul className="list-unstyled">
                          {
                            JSON.parse(contacts.email).map(data => {
                              return <li>
                                <a href={`mailto: ${data.email}`}>
                                  {data.email}
                                </a>
                              </li>
                            })
                          }
                        </ul>
                      </li>
                      ||
                      <div>
                        <div className="comment br animateShimmer mt-2 p-3 w-75"></div>
                        <div className="comment br animateShimmer mt-2 p-3 w-75"></div>
                      </div>}
                      <li>
                      <i class="fas fa-users info_title" aria-hidden="true"></i>
                        <h4 className="address_font">Social Media</h4>
                        <ul className="list-unstyled">
                        <li>
                            <ul className="social_items d-flex">
                              {contacts && contacts.youtube && contacts.youtube != '' &&

                                JSON.parse(contacts.youtube).map(data => {
                                  if(data.youtube != ''){
                                    return <li><Link href={data.youtube}><a target="_blank"><i className="fab fa-youtube yt-icon icon_social list_contact"></i></a></Link></li>
                                  }
                                })
                              }
                              {contacts && contacts.facebook && contacts.facebook != '' &&

                                JSON.parse(contacts.facebook).map(data => {
                                  if(data.facebook != ''){
                                    return <li><Link href={data.facebook}><a target="_blank"><i className="fab fa-facebook-f fb-icon ml-3 icon_social list_contact"></i></a></Link></li>
                                  }
                                })
                              }
                              
                              {contacts && contacts.telegram && contacts.telegram != '' &&

                                JSON.parse(contacts.telegram).map(data => {
                                  if(data.telegram != ''){
                                    return <li><Link href={data.telegram}><a target="_blank"><i className="fab fa-telegram ins-icon ml-3 icon_social list_contact"></i></a></Link></li>
                                  }
                                })
                              }
                              {contacts && contacts.twitter && contacts.twitter != '' &&

                                JSON.parse(contacts.twitter).map(data => {
                                  if(data.twitter != ''){
                                    return <li><Link href={data.twitter}><a target="_blank"><i className="fab fa-twitter ins-icon ml-3 icon_social list_contact"></i></a></Link></li>
                                  }
                                })
                              }
                              {contacts && contacts.instagram && contacts.instagram != '' &&

                                JSON.parse(contacts.instagram).map(data => {
                                  if(data.instagram != ''){
                                    return <li><Link href={data.instagram}><a target="_blank"><i className="fab fa-instagram ins-icon ml-3 icon_social list_contact"></i></a></Link></li>
                                  }
                                })
                              }
                            </ul>
                          </li>

                        </ul>
                      </li>
                    </ul>
                    <img src="/website/assets/images/banner/map_shape.png" alt={window.localStorage.getItem('defaultImageAlt')} className="contact__info_shpae" />
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </section>

        {contacts && contacts.mapUrl && <section className="contact_map">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12 col-sm-12 col-md-12 col-lg-12 mr-auto p-0">
                <h2 className="disabled">Google Map</h2>
                <div className="google_map">
                  <div className="gmap">
                    <div id="map">
                      <iframe src={contacts.mapUrl} width="100%" height="400" frameborder="0" style={{ border: '0' }} allowfullscreen="" aria-hidden="false" tabindex="0"></iframe>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>}
        {/* Contact page content ends */}

      </>
    )
  }

}