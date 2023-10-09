import Link from "next/link";
import { Component } from 'react';
import { fetchByID, add, get, fetchAll,getSettings } from 'helpers/apiService';
import toastr from 'toastr';
import { UnderlinedTabs } from 'components/functional-ui/tabs';
import moment from 'moment';
import { getToken, getUser } from 'helpers/auth';
import StoreModel from 'components/functional-ui/modals/modal-store'
import Router from 'next/router';
import Validation from 'components/functional-ui/forms/validation'
import ValidationFront from 'components/functional-ui/forms/validationFront'


import define from 'src/json/worddefination.json'

export default class ProductDetails extends Component {

  

  state = {
    product: {},
    addedToCart: false,
    error: null,
    productID: null,
    productRef: null,
    demoApplied: true,
    batches: true,
    items: true,
    attributeModel: false,
    redirect: false,
    attributeItems: {},
    hideHierarchy:0,
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
      productID: data.product ? data.product.id : null,
      demoApplied: data.product ? data.product.demoApplied : null
    })

    data = await getSettings('hide_hierarchy')
    this.setState({
      hideHierarchy: data
    })


    if (data.product && data.product.attributes) {

      let batches = data.product.attributes['batches']
      if (batches) {
        var values = [];

        batches.values.map(value => {
          values.push({
            value: value.id,
            label: value.name ? value.name : value.title
          })
        })

        if (batches.referances) {
          batches.referances.fetcher = batches.referances.fetcher.split(',')
        }

        let items = {
          batch_id: {
            datalabel: `${batches.slug}`,
            dataname: "batchId",
            error: {},
            label: 'Batches',
            name: "batch_id",
            idSelector: 'value',
            view: 'label',
            type: 'select',
            values: values,
            className: "w-full",
            placeholder: 'Enter Module Type',
            isMultiple: false,
            onTab: 1,
            effectedRows: [],
            byProduct: true,
            onChange: this.onBatchChange
          }
        }


        this.setState({
          items: items
        })
      }



      let attritems = []


      if (data.product.attributes) {

        Object.values(data.product.attributes).map(attr => {
          if (attr.applied_as == 'MANUAL') {

            var values = [];

            attr.values.map(value => {
              values.push({
                value: value.id,
                label: value.name ? value.name : value.title
              })
            })

            if (attr.referances) {
              attr.referances.fetcher = attr.referances.fetcher.split(',')
            }


            attritems[attr.attribute_id] = {
              datalabel: `${attr.slug}`,
              dataname: attr.attribute_id,
              error: { required: `Please Select ${attr.title}` },
              label: attr.title,
              name: attr.attribute_id,
              idSelector: 'id',
              view: attr.referances ? attr.referances.fetcher[0] : 'title',
              type: 'select-plane',
              values: values,
              className: "col-6",
              placeholder: 'Enter Module Type',
              isMultiple: false,
              effectedRows: [],
            }
          }
        })

        this.setState({
          attributeItems: attritems
        })
      }
    }


    if (data.product && data.product.AddedToCart == true) {
      this.setState({
        addedToCart: true,
        attributeModel: false,
      })
    }


    if (data.product) {

      data = await fetchAll('users/active-products', { productID: data.product.id, noLog: true })
      this.setState({
        productRef: data.productRef
      })
    }
  }


  changeModalStatus = () => {

    console.log(this.state.items)

    if (this.state.showModel == true) {
      // this.buildAddModel();
      this.setState({
        showModel: false
      })
    } else {
      // this.buildAddModel();
      this.setState({
        showModel: true
      })
    }
  }



  onBatchChange = async (e) => {

    let batch = await fetchByID('batches', e.value)


    batch = batch.batch

    let dates = batch.dates

    var items = this.state.items;

    Object.values(items).map((item, i) => {
      if (item.byBatch) {
        return delete items[item.name]
      }
    })
    this.setState({
      items: items
    })


    if (dates) {

      items.scheduled_at = {
        datalabel: 'scheduledus',
        dataname: "scheduledId",
        error: {},
        label: 'Scheduled AT',
        name: "scheduled_at",
        idSelector: 'value',
        view: 'label',
        type: 'select',
        values: dates,
        className: "w-full",
        placeholder: 'Enter Module Type',
        isMultiple: false,
        onTab: 1,
        effectedRows: [],
      }

    }


    console.log(items)

    this.setState({
      items: items
    })

  }



  applyDemo = async (data) => {

    data.product_id = this.state.productID

    var demoClass;
    var message;

    demoClass = await add('demo-classes', data);
    message = `Demo Request send Successfully`


    // check Response
    if (demoClass.updated) {
      toastr.success(message)

      this.setState({
        showModel: false,
        demoApplied: true,

      })
    }
    else {
      let error;
      if (demoClass.demoClass) {
        error = demoClass.demoClass.error
      }
      else if (demoClass.error.details) {
        error = demoClass.error.details[0].message
      }
      else if (demoClass.error) {
        error = demoClass.error
      }
      toastr.error(error)
    }
  }

  addedToCartModel = (redirect = false) => {

    if (this.state.attributeItems != {} && Object.values(this.state.attributeItems).length > 0) {
      if (this.state.attributeModel == true) {

        this.setState({
          attributeModel: false,
          redirect: false
        })
      } else {

        this.setState({
          attributeModel: true,
          redirect: redirect
        })
      }
    } else {
      this.addToCart([], redirect)
    }
  }


  addToCart = async (attributes, redirect = this.state.redirect) => {


    let id = this.state.product.id


    console.log(attributes)



    // e.preventDefault()
    if (getToken() != undefined) {

      if (this.state.product.amount == 0) {

        let attributeList = []

        Object.keys(attributes).map(attr => {
          attributeList[attr] = attributes[attr]
        })

        let data = {
          product_id: id,
          amount: this.state.product.amount,
          finalAmount: this.state.product.amount,
          pay_via: 'ONLINE',
        }


        if (attributeList.length > 0) {
          data.attributes = attributeList
        }


        data = await add('orders', data)

        // check Response
        if (data.updated) {
          toastr.success('Product Activated');

          this.setState({
            addedToCart: true,
            attributeModel: false,
          })

          this.fetchData(this.props.id)

        }
        else {
          let error;
          if (data.order) {
            error = data.order.error
          }
          else if (data.error.details) {
            error = data.error.details[0].message
          }
          else if (data.error) {
            error = data.error
          }
          toastr.error(error)
        }

      } else {

        let attributeList = []

        Object.keys(attributes).map(attr => {
          attributeList.push({
            attribute_id: parseInt(attr),
            value_id: attributes[attr]
          })
        })

        let data = {
          product_id: id,
        }


        if (attributeList.length > 0) {
          data.attributes = attributeList
        }


        data = await add('carts', data)

        // check Response
        if (data.updated) {
          toastr.success('Added To cart');

          this.setState({
            addedToCart: true,
            attributeModel: false,
          })

          if (redirect == true) {
            Router.push('/accounts/cart')
          }

        }
        else {
          let error;
          if (data.cart) {
            error = data.cart.error
          }
          else if (data.error.details) {
            error = data.error.details[0].message
          }
          else if (data.error) {
            error = data.error
          }
          toastr.error(error)
        }
      }
    } else {

      localStorage.setItem('redirectUrl', `/courses/${this.props.id}`)
      Router.push('/auth/login')
    }

  }

  makeReview = async (e) => {

    e.preventDefault()

    this.setState({
      error: null
    })

    if (document.forms["reviewForm"]["ratting"].value == '') {
      this.setState({
        error: {
          ratting: "Ratting is Required"
        }
      })
      return;
    }

    let data = {
      ratting: document.forms["reviewForm"]["ratting"].value,
      message: document.forms["reviewForm"]["message"].value != '' ? document.forms["reviewForm"]["message"].value : null,
      product_id: this.state.productID
    }

    data = await add('product-reviews', data)

    // check Response
    if (data.updated) {
      toastr.success('Review Submitted');
      this.fetchData(this.props.id);

      document.forms["reviewForm"].reset()
    }
    else {
      let error;
      if (data.review) {
        error = data.review.error
      }
      else if (data.error) {
        error = data.error.details[0].message
      }
      toastr.error(error)
    }

  }

  // 
  componentDidMount() {

    console.log(this.props)
    let slug = this.props.id;

    if (slug) {
      this.fetchData(slug);
    } else {
      alert("Oh!");
    }

  }


  render() {
    const tabs = this.state.product ? [
      {
        index: 0,
        title: 'Information',
        content: (
          <div>
            {this.state.product.description !== undefined && <div id="information" dangerouslySetInnerHTML={{ __html: this.state.product.description }}></div> ||
              <div>
                <div className="comment br animateShimmer mt-4 w80"></div>
                <div className="comment br animateShimmer mt-4"></div>
                <div className="comment br animateShimmer mt-4"></div>
                <div className="comment br animateShimmer mt-8 w80"></div>
                <div className="comment br animateShimmer mt-4"></div>
                <div className="comment br animateShimmer mt-4"></div>
                <div className="comment br animateShimmer mt-8 w80"></div>
                <div className="comment br animateShimmer mt-4"></div>
                <div className="comment br animateShimmer mt-4"></div>
              </div>}</div>
        )
      },
      {
        index: 1,
        title: 'Course Details',
        content: (
          <div id="curricularm">
            <div className="curriculum-text-box">
              <div className="curriculum-section">
                <div className="curriculum-section">
                  <div className="panel-group accordion" id="accordion" >
                    {
                      this.state.product && this.state.product.courses && this.state.product.courses.length > 0 && this.state.product.courses.map((course, i) => {
                        return <div className="panel panel-default mb-4">

                          <h5 className="panel-title click  mt-2 " data-toggle="collapse" data-parent={`#accordion`} href={`#collapsecourse${course.id}`} className="" aria-expanded="true">
                            <i class="fas fa-graduation-cap mr-2" aria-hidden="true"></i>
                            <a >
                              {course.name}
                              <span className="float-right accordion-toggle">
                                <i class="fas fa-arrow-down" aria-hidden="true"></i>
                              </span>
                            </a>
                          </h5>
                          <hr className="" />

                          <ul id={`collapsecourse${course.id}`} className={`panel-collapse collapse in  mt-4 ${i == 0 ? 'show' : ''}`}>
                            {course.subjects && course.subjects.length > 0 && course.subjects.map((subject, index) => {
                              return <li>
                                <div className="panel-heading">
                                  <h6 className="panel-title click pl-0">
                                    <a data-toggle="collapse" data-parent={`#accordion`} href={`#collapsesubject${subject.id}`} className="hovered">
                                      <i class="fas fa-bookmark mr-2 ml-3 " aria-hidden="true"></i> {subject.name}
                                      <span className={`float-right accordion-toggle `}>
                                        <i class={`fas fa-chevron-down ${index == 0 ? '' : 'collapsedTag'}`}></i>
                                      </span>
                                    </a>
                                  </h6>

                                </div>
                                <div id={`collapsesubject${subject.id}`} className={`panel-collapse collapse in ${index == 0 ? 'show' : ''}`}>
                                  <div className="panel-body mb-2">
                                    <hr className="mb-2"></hr>
                                    {
                                      subject.chapters && subject.chapters.length > 0 && subject.chapters.map((chapter, key) => {
                                        return <div className="curriculum-single  mb-2">
                                          <a className="lecture">
                                            <span className=" icon_adjust pr-2"><i class="fas fa-play mr-2" aria-hidden="true"></i>Chapter  {index}. {key}</span>

                                            <span>{chapter.name}</span>
                                            <div className="course-item-meta">
                                              <span className="item-meta duration">17 min</span>																										                                        <span className="duration">Preview</span>
                                            </div>
                                            <div class="rtin-right"><i class="far fa-clock" aria-hidden="true"></i><span className="timing">17m</span></div>
                                          </a>
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
          </div>

        )
      },
      {
        index: 2,
        title: 'Faculty',
        content: (
          <div id="instructor" >
            <div className="courses_teacher row  spacing mt-4 justify">
              {this.state.product && this.state.product.attributes && this.state.product.attributes['faculty'] && this.state.product.attributes['faculty'].value &&
                Array.isArray(this.state.product.attributes['faculty'].values) && this.state.product.attributes['faculty'].values.map(value => {
                  return <div className="tutor_signling col-12 col-sm-12 col-md-5 col-lg-3 mb-3 w-m" >
                    <div className="tutor_pro mr-3">
                      <Link href="/">
                        <a title=""><img src={value.image ? value.image : '/website/assets/images/faculty_default.jpg'} alt={window.localStorage.getItem('defaultImageAlt')} className=" img-fluid rounded-full " /></a>
                      </Link>
                    </div>
                    {/* <img src={value.image} alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid" /> */}

                    <div className="teachers_name my-4 ">
                      <h5><Link href="/"><a title="">{value.first_name}  {value.last_name}</a></Link></h5>
                      <span>{value.designation}</span>
                    </div>
                  </div>
                })
              }
            </div>
          </div>

        )
      },

      {
        index: 3,
        title: 'Reviews',
        content: (
          <div id="reviews">
            <div className="commnet-wrapper">
              <div className="comment-list-items pb-2 mt-4">
                {(this.state.product && this.state.product.reviews && this.state.product.reviews.length) &&
                  this.state.product.reviews.map(review => {
                    <div>

                      <h2>Reviews</h2>
                    </div>
                    return <>

                      <div className="comment-list-wrapper  commenting">
                        <div className="comment-list review_design">

                          <div className="col-12 col-sm-12 col-md-12 col-lg-12  comment-text">
                            <div className="author_info d-flex justify-content-between">

                              <Link href="/">
                                <a className="author_name font-saffron">{review.first_name} {review.last_name}</a>
                              </Link>
                              <div className="rating-2 course__comment-info ">
                                <span>{moment(review.created_at).fromNow()}</span>
                              </div>
                              <ul className="rating d-flex justify-content-start rating_space">
                                {
                                  Array.from(Array(5).keys()).map((index) => {
                                    return <li><i className={`fas fa-star ${(index + 1) <= review.ratting && 'setected-start'}`}></i></li>
                                  })
                                }

                              </ul>

                            </div>
                            <div className="message mt-3">
                              <p>{review.message}</p>
                            </div>

                          </div>
                        </div>
                      </div>
                      {/* <hr className="mt-2 mb-2"></hr> */}
                    </>
                  })
                  ||
                  <div className="empty_box">
                    <h1 className="text-center"><i className="fas fa-star"></i></h1>
                    <h5 className="text-center">Be the first to review our product</h5>
                  </div>
                }
              </div>
            </div>

            {getToken() != undefined && !this.state.product.currentUserCommnet && <div className="comment-list-wrapper">
              <div className="comment-list ">
                <div className=" my-1 mb-4 mb-md-5">
                  <h5 className="bold">Write your Review</h5>
                </div>
                <form onSubmit={(e) => this.makeReview(e)} name="reviewForm">
                  <div className="comment-text ">

                    <div className="rating row col-12">
                      <ul className="rating d-flex starrating risingstar flex-row-reverse text-center mb-3">

                        <input type="radio" id="star5" name="ratting" value="5" /><label for="star5" title="5 star"><li><i className="fas fa-star"></i></li></label>
                        <input type="radio" id="star4" name="ratting" value="4" /><label for="star4" title="4 star"><li><i className="fas fa-star"></i></li></label>
                        <input type="radio" id="star3" name="ratting" value="3" /><label for="star3" title="3 star"><li><i className="fas fa-star"></i></li></label>
                        <input type="radio" id="star2" name="ratting" value="2" /><label for="star2" title="2 star"><li><i className="fas fa-star"></i></li></label>
                        <input type="radio" id="star1" name="ratting" value="1" /><label for="star1" title="1 star"><li><i className="fas fa-star"></i></li></label>
                        <input type="number" name="ratting" className="form-control"></input>
                      </ul>
                    </div>
                    {this.state.error && this.state.error.ratting && <span className="text-danger">{this.state.error.ratting}</span>}
                    <textarea className="form-control" name="message" placeholder="Write your review here"></textarea>
                    {this.state.error && this.state.error.message && <span className="text-danger">{this.state.error.message}</span>}
                    <input
                      type="submit"
                      value="Submit Review"
                      className="btn-submit text-center mt-4  mb-2"
                    />
                  </div>
                </form>
              </div>
            </div>}

          </div>

        )
      },

    ] : [];


    return (

      <>
        {
          this.state.product &&

          <>
            <header className="header_inner courses_page">

            </header>
            <section className="blog_wrapper " id="courses_details_wrapper">
              {
                this.state.attributeModel &&
                <StoreModel
                  title={this.state.product.name}
                  body={
                    <div>
                      {
                        this.state.attributeItems && this.state.attributeItems != {} && <Validation items={Object.values(this.state.attributeItems)} onSubmit={this.addToCart} alerts={false} buttonText="Add to Cart" btnClass="w-100 px-0" />
                      }

                    </div>
                  }
                  useModel={this.state.attributeModel}
                  hideModal={this.addedToCartModel}
                />
              }
              {
                this.state.showModel &&
                <StoreModel
                  title='Request for demo Class'
                  body={
                    <div>
                      {
                        this.state.items && this.state.items != {} && <Validation items={Object.values(this.state.items)} onSubmit={this.applyDemo} alerts={false} />
                      }

                    </div>
                  }
                  useModel={this.state.showModel}
                  hideModal={this.changeModalStatus}
                />
              }
              <div class="page__title-shape">
                <img class="page-title-shape-5 d-none d-sm-block" src="/uploads/settings/page-title-shape-1.png" alt=""></img>
                <img class="page-title-shape-6" src="/uploads/settings/page-title-shape-6.png" alt=""></img>
                <img class="page-title-shape-7" src="/uploads/settings/page-title-shape-4.png" alt=""></img>
              </div>
              <header className="header_inner courses_page">
                <div className="intro_wrapper product_head ">
                  <div className="container">
                    <div className="row">
                      <div className="col-sm-12 col-md-8 col-lg-8">

                      </div>
                    </div>
                  </div>
                </div>

              </header>

              <div className="container">
                <div className="row course-space course_top">
                  <div className="col-12 col-sm-12 col-md-7 col-lg-8 spacing spacing sign__wrapper-2 white-bg">
                    <div className="intro_text text_small">
                    {this.state.product.name !== undefined &&
                      <h1 className="page-title font-weight-bold mb-4"> {this.state.product.name}</h1>
                      ||
                      <div className=" animateShimmer transparent h14  mb-3"></div>}

                      <p className="text-white detail-tags mt-4">
                        <span className="branch_name "><a className=" mr-2 mb-2 active ">
                          {this.state.product.product_type && this.state.product.product_type.title}
                        </a>
                        </span>
                        <span className="branch_name "><a className=" mr-2 mb-2 active ">
                          {this.state.product.package_type && this.state.product.package_type.title}
                        </a>
                        </span>
                        {console.log("aa",this.state.hideHierarchy)}

                        {
                            this.state.hideHierarchy < 1 && this.state.product && this.state.product.exams && this.state.product.exams.map(exam => {
                            return <span className="branch_name "><a className=" mr-2 mb-2 active ">
                              {exam.name}
                            </a>
                            </span>
                          })
                        }
                        {
                            this.state.hideHierarchy < 2 && this.state.product && this.state.product.courses && this.state.product.courses.map(course => {
                            return <span className="branch_name ">
                              <a className=" mr-2 mb-2 active">
                                {course.name}
                              </a>
                            </span>
                          })
                        }


                      </p>

                    </div>
                    <div className="courses_details">
                      <div className="single-curses-contert">

                        <div className="review-option">
                          {this.state.product.attributes && this.state.product.attributes['faculty'] && this.state.product.attributes['faculty'].value &&
                            <div className="col-12 col-md-4 col-lg-6 teacher-info single_items single_items_shape sm-p-0 ">


                              <div className="">
                                <span>Teacher</span>
                                <div className="teacher_name">
                                  {
                                    Array.isArray(this.state.product.attributes['faculty'].values) && this.state.product.attributes['faculty'].values.map(value => {
                                      return <p className="branch_name ">
                                        <a className=" mr-2 ">
                                          {value.first_name} {value.last_name}
                                        </a>
                                      </p>
                                    })
                                  }
                                </div>


                              </div>
                            </div>}
                          <div className="col-12 col-md-4 col-lg-3 review-rank single_items single_items_shape sm-p-0 sm-mt-1 ">
                            <span>Reviews</span>
                            <div className="rank-icons">
                            {this.state.product.reviews !== undefined &&
                              <ul className="list-unstyled">
                                {

                                  Array.from(Array(5).keys()).map((index) => {
                                    return <li><i className={`fas fa-star ${(index + 1) <= this.state.product.average_review && 'setected-start'}`}></i></li>
                                  })
                                }

                                <li><span>({this.state.product.reviews ? this.state.product.reviews.length : 0} Reviews)</span></li>
                              </ul>
                              ||
                              <div className="animateShimmer h10 w36"></div>}
                            </div>
                          </div>
                          <div className="col-12 col-md-4 col-lg-3 teacher_fee single_items sm-p-0 sm-mt-1 ">
                            <span>Price</span>
                            {this.state.product.finalAmount !== undefined &&
                            <span className="courses_price">
                              ₹ {this.state.product.finalAmount}
                              <small>

                                {
                                  this.state.product.finalAmount < this.state.product.amount &&
                                  <del> ₹ {this.state.product.amount}</del>
                                }

                              </small>

                            </span>
                            ||
                                <div className=" animateShimmer h10  w36"></div>}
                            <label className="text-small">{(this.state.product.taxIncluded == true) && 'including GST' || ''}</label>
                          </div>
                          {/* <div className="buy_btn single_items responsive_buy_button">
                            {
                              this.state.product && this.state.product.product_type && this.state.product.product_type.selling_on &&
                              (
                                this.state.productRef && this.state.productRef.activated == true &&
                                <a title="" onClick={(e) => e.preventDefault()} >Product Activated</a> ||
                                this.state.addedToCart == false &&
                                <a title="" onClick={(e) => this.addedToCartModel()}>Add To Cart</a> ||
                                <a title="" onClick={(e) => e.preventDefault()} >Added To Cart</a>
                              )
                              || <a title="" onClick={(e) => e.preventDefault()} >Contact </a>

                            }

                          </div> */}
                        </div>
                        {/* <div className="details-img-bxo">
                          <img src={this.state.product.cover_image} alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid" />
                        </div> */}
                      </div>

                      <div>
                        <UnderlinedTabs tabs={tabs} />
                      </div>
                    </div>
                  </div>


                  <div className="col-12 col-sm-12 col-md-4 col-lg-3 blog_wrapper_right spacing sign__wrapper-2 white-bg ">
                    <div class="course__shape">
                      <img class="course-dot" src="" alt=""></img>
                    </div>
                    <div className="blog-right-items">
                    {this.state.product.cover_image !== undefined &&
                        <img src={this.state.product.cover_image} className="trans img-fluid w-100 " />
                        ||
                        <div className="p20 trans h-22 animateShimmer"></div>
                      }

                      <div className="courses_features widget_single">

                        <div className="features_items px-4">
                          <ul className="list-unstyled">
                            {
                              this.state.product.attributes !== undefined &&
                              Object.values(this.state.product.attributes).map(attribute => {
                                if (attribute.hidden == 0) {
                                  return (
                                    <li className="row">
                                      <a title="" className="col-6 pr-0 pl-0 text-left"> {attribute.title} </a>
                                      <span className="col-6 text-left  "> {attribute.value}</span>
                                    </li>
                                  )

                                }

                              })
                              ||
                              <div className="h13 trans">
                                <div className="details">
                                  <div className="comment p-2 animateShimmer transparent w-25"></div>
                                  <div className="comment p-2 animateShimmer transparent w-25"></div>
                                </div>
                                <div className="details">
                                  <div className="comment p-2 animateShimmer transparent w-25"></div>
                                  <div className="comment p-2 animateShimmer transparent w-25"></div>
                                </div>
                                <div className="details">
                                  <div className="comment p-2 animateShimmer transparent w-25"></div>
                                  <div className="comment p-2 animateShimmer transparent w-25"></div>
                                </div>
                                <div className="comment  animateShimmer transparent mt-5 p-4 w-100 rounded-f"></div>
                              </div>
                            }
                            {
                              this.state.product.details &&
                              Object.values(this.state.product.details).map((value) => {
                                return (
                                  <li className="row">
                                    <a title="" className="col-6 pr-0 pl-0 text-left"> {value.label} </a>
                                    <span className="col-6 text-left "> {value.value}</span>
                                  </li>
                                )

                              })
                            }

                            {this.state.product.model && <li className="row">

                              <a title="" className="col-6 pl-0 pr-0 text-left"> Model</a>

                              <span className="col-6 text-left ">{this.state.product.model}</span></li>}
                            {/* <li className="row">

                              <a title="" className="col-6 pr-0 text-left"><i className="flaticon-eye-open"></i> Views</a>

                              <span className="col-6 text-right">{this.state.product.viewed}</span>
                            </li>
                            <li className="row">

                              <a title="" className="col-6 pr-0 text-left"><i className="flaticon-eye-open"></i> Liked</a>

                              <span className="col-6 text-right ">{this.state.product.liked}</span>
                            </li>
                            <li className="row">

                              <a title="" className="col-6 pr-0 text-left"><i className="flaticon-eye-open"></i> Ordered</a>

                              <span className="col-6 text-right">{this.state.product.ordered}</span>
                            </li> */}
                          </ul>

                          {this.state.product && this.state.product.product_type && this.state.product.product_type.selling_on && <div className="buy_btn single_items">

                            {this.state.productRef && this.state.productRef.activated == true &&
                              <a title="" onClick={(e) => e.preventDefault()} >{this.state.productRef.leftDays} Days Left</a> ||
                              <a title="" onClick={(e) => this.addedToCartModel(true)}>Buy Now</a>
                            }
                          </div>}
                          {this.state.product && this.state.product.product_type && this.state.product.product_type.selling_on && <div className="addcart_btn single_items">
                            {
                              this.state.productRef && this.state.productRef.activated == true &&
                              <a className="w-100" title="" onClick={(e) => e.preventDefault()} >Product Activated</a> ||
                              this.state.addedToCart == false &&
                              <a className="w-100" title="" onClick={(e) => this.addedToCartModel()}>Add To Cart</a> ||
                              <a className="w-100" title="" onClick={(e) => e.preventDefault()} >Added To Cart</a>
                            }
                          </div>}
                          {console.log(process.env.NEXT_PUBLIC_DEMO_CLASSES)}
                          {process.env.NEXT_PUBLIC_DEMO_CLASSES == "true" && this.state.product && this.state.product.product_type && this.state.product.product_type.selling_on && <div className="addcart_btn single_items">
                            {
                              this.state.demoApplied == true &&
                              <a className="w-100" title="" onClick={(e) => e.preventDefault()} >Demo Applied</a> ||
                              <a className="w-100" title="" onClick={(e) => this.changeModalStatus(e)}>Apply Demo</a>
                            }
                          </div>}
                        </div>
                        <img src="/website/assets/images/shapes/testimonial_2_shpe_2.png" alt={window.localStorage.getItem('defaultImageAlt')} className="courses_feaures_shpe" />
                      </div>

                    </div>
                  </div>

                </div>
              </div>
            </section>

          </>
          ||
          <>
            <div className="rs-breadcrumbs breadcrumbs-overlay">
              <div className="breadcrumbs-img">
                <img src="/website/assets/images/breadcrumbs/2.jpg" alt={window.localStorage.getItem('defaultImageAlt')} />
              </div>

            </div>

            <div
              data-layout="centered"
              className="container w-full p-4 flex items-center justify-left ">
              <div className="flex flex-col w-1/2 max-w-xl text-center">
                <img
                  className="object-contain w-auto "
                  src="/images/404.jpg"
                  alt={window.localStorage.getItem('defaultImageAlt')} />


              </div>
              <div className="pl-10">
                <h4 className="text-5xl font-bold font-blue">Oops!</h4>

                <div className="my-2 mb-4">
                  The Product you are looking for doesn't exist or removed.
                </div>
                {/* <p className="my-1 mb-4">The page you are looking for doesn't exist.</p> */}
                <Link href="/" className="mt-2 ">
                  <a className="btn btn-md bg-blue px-3 py-2 text-white rounded">
                    Go to Home
                  </a>
                </Link>
              </div>
            </div>
          </>
        }
      </>
    )
  }
}