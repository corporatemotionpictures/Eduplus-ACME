import Link from "next/link";
import { Component } from 'react';
import { fetchByID, add, get, fetchAll } from 'helpers/apiService';
import toastr from 'toastr';
import { UnderlinedTabs } from 'components/functional-ui/tabs';
import moment from 'moment';
import { getToken, getUser } from 'helpers/auth';
import Router from 'next/router';


import define from 'src/json/worddefination.json'

export default class Layouts extends Component {

  state = {
    product: {},
    addedToCart: false,
    error: null,
    productID: null,
    videoCourses: null,
    liveEvents: null,
    productRef: null
  }

  static getInitialProps({ query }) {
    return query;
  }

  fetchData = async (slug) => {

    let data = await get(`products/slug?slug=${slug}`)
    let id = data.product ? data.product.id : null

    data = await fetchByID('products', id, { 'forWeb': true })
    this.setState({
      product: data.product,
      productID: data.product.id
    })

    data = await fetchAll('users/active-products', { productID: id, access: true })
    this.setState({
      productRef: data.productRef,
    })

    data = await fetchAll('users/active-products', { productID: id, access: true, field: 'videos' })

    this.setState({
      productRef: data.productRef,
      videoCourses: data.userProducts && data.userProducts.length > 0 && data.userProducts[0].courses,
    })

    data = await fetchAll('users/active-products', { productID: id, access: true, field: 'live-events' })
    this.setState({
      productRef: data.productRef,
      liveEventCourses: data.userProducts && data.userProducts.length > 0 && data.userProducts[0].courses,
    })

    data = await fetchAll('users/active-products', { productID: id, access: true, field: 'one-liner-questions' })
    this.setState({
      productRef: data.productRef,
      oneLinerCourses: data.userProducts && data.userProducts.length > 0 && data.userProducts[0].courses,
    })

    data = await fetchAll('users/active-products', { productID: id, access: true, field: 'previous-year-question-papers' })
    this.setState({
      productRef: data.productRef,
      pyqCourses: data.userProducts && data.userProducts.length > 0 && data.userProducts[0].courses,
    })

    data = await fetchAll('live-events', { productID: id, offLimit: true })
    this.setState({
      liveEvents: data.events,
    })

  }

  // 
  componentDidMount() {
    let slug = this.props.productslug;

    if (slug) {
      this.fetchData(slug);
    } else {
      alert("Oh!");
    }

  }


  render() {
    const tabs = [

      {
        index: 0,
        title: 'Recorded Videos',
        content: (
          <div id="curricularm">

            <div className="curriculum-text-box">
              <div className="curriculum-section">
                <div className="panel-group accordion" id="accordion" >
                  {
                    this.state.videoCourses && this.state.videoCourses.length > 0 && this.state.videoCourses.map((course, i) => {
                      return <div className="panel panel-default mb-4">

                        <h5 className="panel-title click  mt-2 " data-toggle="collapse" data-parent={`#accordion`} href={`#collapsecourse${course.id}`} className="" aria-expanded="true">
                          <i class="fa fa-graduation-cap mr-2" aria-hidden="true"></i>
                          <a >
                            {course.name}
                            <span className="float-right accordion-toggle">
                              <i class="fa fa-arrow-down" aria-hidden="true"></i>
                            </span>
                          </a>
                        </h5>
                        <hr className="" />

                        <ul id={`collapsecourse${course.id}`} className={`panel-collapse collapse in  mt-2 ${i == 0 ? 'show' : ''}`}>
                          {course.subjects && course.subjects.length > 0 && course.subjects.map((subject, index) => {
                            return <li>
                              <div className="panel-heading pt-1">
                                <h6 className="panel-title click">
                                  <a data-toggle="collapse" data-parent={`#accordion`} href={`#collapsesubject${subject.id}`} className="">
                                    <i class="fa fa-bookmark mr-2 ml-3" aria-hidden="true"></i> {subject.name}
                                    <span className={`float-right accordion-toggle `}>
                                      <i class={`fa fa-chevron-down ${index == 0 ? '' : 'collapsedTag'}`}></i>
                                    </span>
                                  </a>
                                </h6>

                              </div>
                              <div id={`collapsesubject${subject.id}`} className={`panel-collapse collapse in ${index == 0 ? 'show' : ''}`}>
                                <div className="panel-body mb-2">
                                  <hr className="mb-2"></hr>
                                  {
                                    subject.chapters && subject.chapters.length > 0 && subject.chapters.map((chapter, key) => {
                                      return <div className="curriculum-single ml-3 mb-2">
                                        <Link href="/web-app/dashboard/[productslug]/[chapterslug]/videos" as={`/web-app/dashboard/${this.props.productslug}/${subject.id}-${chapter.id}/videos`}>
                                          <a className="lecture">
                                            <span className=" pr-2"><i class="fa fa-play mr-2" aria-hidden="true"></i>Chapter  {index}. {key}</span>
                                            <span>{chapter.name}</span>
                                          </a>
                                        </Link>
                                      </div>
                                    })
                                  }</div>
                              </div>
                            </li>
                          })}
                        </ul>
                      </div>

                    })
                  } </div>

              </div>
            </div>
          </div>

        )
      },
      {
        index: 1,
        title: 'Live Lectures',
        content: (
          <div id="curricularm">
            <div className="curriculum-text-box">
              <div className="curriculum-section">
                <div className="panel-group accordion" id="accordion" >
                  {
                    this.state.liveEvents && this.state.liveEvents.length > 0 && this.state.liveEvents.map(event => {
                      return <div className=" card mb-2 p-2" style={{ 'opacity': event.event_status == 'ENDED' ? 0.5 : 1 }}>
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
                                      <Link href={`/web-app/dashboard/[productslug]/live-events/[slug]`} as={`/web-app/dashboard/${this.props.productslug}/live-events/${event.id}`} className="">
                                        <a className=" btn btn-success text-white"><i class="fa fa-play-circle" aria-hidden="true"></i> Join Class</a>
                                      </Link>
                                    </span>}
                                    {(event.event_status == 'STARTED') && <span className="">
                                      <Link href={`/web-app/dashboard/[productslug]/live-events/[slug]`} as={`/web-app/dashboard/${this.props.productslug}/live-events/${event.id}`} className="">
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
                    })
                  } </div>

              </div>
            </div>
          </div>

        )
      },
      {
        index: 3,
        title: 'Study Materials',
        content: (
          <div id="curricularm">
            <div className="curriculum-text-box">
              <div className="curriculum-section">
                <div className="panel-group accordion" id="accordion" >
                  {
                    this.state.pyqCourses && this.state.pyqCourses.length > 0 && this.state.pyqCourses.map((course, i) => {
                      return <div className="panel panel-default mb-4">

                        <h5 className="panel-title click  mt-2 " data-toggle="collapse" data-parent={`#accordion`} href={`#collapsecourse${course.id}`} className="" aria-expanded="true">
                          <i class="fa fa-graduation-cap mr-2" aria-hidden="true"></i>
                          <a >
                            {course.name}
                            <span className="float-right accordion-toggle">
                              <i class="fa fa-arrow-down" aria-hidden="true"></i>
                            </span>
                          </a>
                        </h5>
                        <hr className="" />

                        <ul id={`collapsecourse${course.id}`} className={`panel-collapse collapse in  mt-2 ${i == 0 ? 'show' : ''}`}>
                          {course.subjects && course.subjects.length > 0 && course.subjects.map((subject, index) => {
                            return <li>
                              <div className="panel-heading pt-1">
                                <h6 className="panel-title click">
                                  <a data-toggle="collapse" data-parent={`#accordion`} href={`#collapsesubject${subject.id}`} className="">
                                    <i class="fa fa-bookmark mr-2 ml-3" aria-hidden="true"></i> {subject.name}
                                    <span className={`float-right accordion-toggle `}>
                                      <i class={`fa fa-chevron-down ${index == 0 ? '' : 'collapsedTag'}`}></i>
                                    </span>
                                  </a>
                                </h6>

                              </div>
                              <div id={`collapsesubject${subject.id}`} className={`panel-collapse collapse in ${index == 0 ? 'show' : ''}`}>
                                <div className="panel-body  mb-2">
                                  <hr className="mb-2"></hr>
                                  {
                                    subject.chapters && subject.chapters.length > 0 && subject.chapters.map((chapter, key) => {
                                      return <div className="curriculum-single ml-3 mb-2">
                                        <Link href="/web-app/dashboard/[productslug]/[chapterslug]/documents" as={`/web-app/dashboard/${this.props.productslug}/${subject.id}-${chapter.id}/documents`}>
                                          <a className="lecture">
                                            <span className=" pr-2"><i class="fa fa-play mr-2" aria-hidden="true"></i>Chapter  {index}. {key}</span>
                                            <span>{chapter.name}</span>
                                          </a>
                                        </Link>
                                      </div>
                                    })
                                  }</div>
                              </div>
                            </li>
                          })}
                        </ul>
                      </div>

                    })
                  } </div>

              </div>
            </div>
          </div>

        )
      },

    ];


    return (

      <>
        {
          this.state.product &&

          <>

            <section className="blog_wrapper mt-3 webbgdashboard" id="courses_details_wrapper">
              <div className="container">
                <div className="row">

                  <div className="col-12 col-sm-12 col-md-4 col-lg-4 blog_wrapper_right ">
                    <div className="blog-right-items">
                      <img src={this.state.product.cover_image} alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid w-100" />
                      <div className="courses_features_web widget_single">
                        <div className="items-title">


                        </div>

                        <div className="features_items ">

                          {<div className="web_date_btn single_items mb-3 mt-0">

                            {this.state.productRef && this.state.productRef.activated == true &&
                              <a title="" onClick={(e) => e.preventDefault()} >{this.state.productRef.leftDays} Days Left</a>
                            }
                          </div>}

                          <ul className="list-unstyled">

                            {
                              this.state.product.attributes &&
                              Object.values(this.state.product.attributes).map(attribute => {
                                if (attribute.hidden == 0) {
                                  return (
                                    <li className="row">
                                      <a title="" className="col-6 pr-0 text-left"> {attribute.title} </a>
                                      <span className="col-6 text-right "> {attribute.value}</span>
                                    </li>
                                  )

                                }

                              })
                            }
                            {
                              this.state.product.details &&
                              Object.values(this.state.product.details).map((value) => {
                                return (
                                  <li className="row">
                                    <a title="" className="col-6 pr-0 text-left"> {value.label} </a>
                                    <span className="col-6 text-right "> {value.value}</span>
                                  </li>
                                )

                              })
                            }

                          </ul>



                        </div>
                      </div>

                    </div>
                  </div>
                  <div className="col-12 col-sm-12 col-md-8 col-lg-8">
                    <h2 className="cart_btn font-bold mt-3">{this.state.product && this.state.product.name}</h2>
                    <div className="breadcrumbs-text">
                      <br />

                      <p className="text-white">

                        {
                          this.state.product && this.state.product.exams && this.state.product.exams.map(exam => {
                            return <span className="branch_name "><a className=" mr-1 mb-1 active ">
                              {exam.name}
                            </a>
                            </span>
                          })
                        }
                        {
                          this.state.product && this.state.product.courses && this.state.product.courses.map(course => {
                            return <span className="branch_name ">
                              <a className=" mr-2 active">
                                {course.name}
                              </a>
                            </span>
                          })
                        }
                        {this.state.product.product_type && this.state.product.product_type.title}
                      </p>
                    </div>
                    <div className="courses_details">
                      <hr className="mt-2"></hr>
                      <div>

                        <UnderlinedTabs tabs={tabs} />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </section>

          </>
        }
      </>
    )
  }
}