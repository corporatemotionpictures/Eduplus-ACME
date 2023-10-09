import Link from "next/link";
import { Component } from 'react';
import { fetchByID, add, get, fetchAll } from 'helpers/apiService';
import toastr from 'toastr';
import { UnderlinedTabs } from 'components/functional-ui/tabs';
import moment from 'moment';
import { getToken, getUser } from 'helpers/auth';
import StoreModel from 'components/functional-ui/modals/modal-store'
import Router from 'next/router';
import Validation from 'components/functional-ui/forms/validation'


import define from 'src/json/worddefination.json'

export default class Layouts extends Component {

  state = {
    membership: {},
    addedToCart: false,
    error: null,
    membershipID: null,
    membershipRef: null,
    demoApplied: true,
    batches: true,
    items: true,
  }

  static getInitialProps({ query }) {
    return query;
  }

  fetchData = async (slug) => {

    let data = await get(`memberships/slug?slug=${slug}`)
    let id = data.membership ? data.membership.id : null


    data = await fetchByID('memberships', id, { 'forWeb': true })
    this.setState({
      membership: data.membership,
      membershipID: data.membership.id,
    })


    if (data.membership && data.membership.AddedToCart == true) {
      this.setState({
        addedToCart: true
      })
    }

    data = await fetchAll('users/active-membership', { membershipID: data.membership.id, noLog: true })

    console.log(data.membershipRef)
    this.setState({
      membershipRef: data.membershipRef
    })



  }




  addToCart = async (e, id, redirect = false) => {


    e.preventDefault()
    if (getToken() != undefined) {
      let data = {
        membership_id: id
      }

      data = await add('membership-carts', data)

      // check Response
      if (data.updated) {
        toastr.success('Added To cart');

        this.setState({
          addedToCart: true
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
    } else {

      localStorage.setItem('redirectUrl', `/memberships/${this.props.id}`)
      Router.push('/auth/login')


    }

  }

  buyNow = async (e, id) => {

    if (getToken() != undefined) {

      if (this.state.addedToCart == true) {
        Router.push('/accounts/cart')
      } else {
        this.addToCart(e, id, true)
      }
    } else {
      localStorage.setItem('redirectUrl', `/memberships/${this.props.id}`)
      Router.push('/auth/login')
    }
  }

  // 
  componentDidMount() {
    let slug = this.props.id;

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
        title: ' Information',
        content: (
          <div id="information" dangerouslySetInnerHTML={{ __html: this.state.membership.description }}>

          </div>
        )
      },

    ];


    return (

      <>
        {
          this.state.membership &&

          <>
            <div className="rs-breadcrumbs breadcrumbs-overlay">
              <div className="breadcrumbs-img">
                <img src="/website/assets/images/breadcrumbs/5.jpg" alt={window.localStorage.getItem('defaultImageAlt')} />
              </div>
              <div className="breadcrumbs-text">
                <br />
                <h1 className="page-title text-white"> {this.state.membership.title}</h1>
              </div>
            </div>
            <section className="blog_wrapper mt-3" id="courses_details_wrapper">
              <div className="container">
                <div className="row">
                  <div className="col-12 col-sm-12 col-md-12 col-lg-12">
                    <div className="courses_details">
                      <div className="single-curses-contert">

                        <div className="review-option">
                          <div className="teacher-info single_items single_items_shape">


                            <div className="">
                              <span>Validity</span>
                              <p className="branch_name ">
                                <a className=" mr-2 active">
                                  {
                                    this.state.membership.validity ? this.state.membership.validity.title : 0
                                  }
                                </a>
                              </p>


                            </div>
                          </div>


                          <div className="teacher_fee single_items ">
                            <span>Price</span>
                            <span className="courses_price">
                              ₹ {this.state.membership.amount}
                            </span>
                          </div>
                          <div className="buy_btn single_items responsive_buy_button">
                            {
                              (
                                this.state.membershipRef && this.state.membershipRef.activated == true &&
                                <a title="" onClick={(e) => e.preventDefault()} >membership Activated</a> ||
                                this.state.addedToCart == false &&
                                <a title="" onClick={(e) => this.addToCart(e, this.state.membership.id)}>Add To Cart</a> ||
                                <a title="" onClick={(e) => e.preventDefault()} >Added To Cart</a>
                              )
                              || <a title="" onClick={(e) => e.preventDefault()} >Contact </a>

                            }

                          </div>
                        </div>
                        {/* <div className="details-img-bxo">
                          <img src={this.state.membership.cover_image} alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid" />
                        </div> */}
                      </div>

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