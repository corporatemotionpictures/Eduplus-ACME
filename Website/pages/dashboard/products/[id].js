import { Component } from 'react';
import { fetchByID, updateAdditional, edit, fetchAll } from 'helpers/apiService';
import React from 'react'
import SectionTitle from 'components/functional-ui/section-title'
import Datatable from 'components/functional-ui/datatable'
import Shimmer from 'components/website/shimmer/datatable'
import Widget from 'components/functional-ui/widget'
import Comments from 'components/functional-ui/social-feed/comments'
import { Badge } from 'components/functional-ui/badges'
import { UnderlinedTabs } from 'components/functional-ui/tabs'
import { FiTwitter, FiFacebook, FiInstagram } from 'react-icons/fi'
import Switch from 'components/functional-ui/switch'
import { multiLine, DoubleLine } from 'components/functional-ui/lists'
import Link from 'next/link';
import DeleteModel from 'components/functional-ui/modals/modal-confirmation'
import toastr from 'toastr'
import { FiX } from 'react-icons/fi'
import define from 'src/json/worddefination.json'
import { CircularBadge } from 'components/functional-ui/badges'
import {
  FiThumbsUp,
  FiMessageCircle,
  FiShare2
} from 'react-icons/fi'
import moment from 'moment'

//

export default class extends Component {
  state = {
    user: {},
    search: '',
    fetching: true,
    modelTitle: 'products',
    logs: [],
    notifications: [],
    bulkSms: [],
    orders: [],
    filterObject: {

      orders: {
        limit: 10,
        offset: 0
      },
    },
    totalCount: {},
    deleteReviewModal: false
  }

  // 
  static getInitialProps({ query }) {
    return query;
  }

  // Function for fetch data
  fetchList = async (id) => {
    let filter = {
      ...this.state.filterObject.orders,
      productID: id,
      count: true,
      'forList': true
    }

    var data = await fetchAll('orders', filter);
    this.setState({
      orders: data.orders,
      totalCount: {
        orders: data.totalCount
      }
    })
  }

  // Function for fetch data
  fetchData = async (id) => {
    var data = await fetchByID(this.state.modelTitle, id, { 'forWeb': true, 'noLog': true, forActive: true });
    this.setState({ data })
  }

  // Function for fetch data
  deleteReview = async () => {
    let deleteStatus = await deleteData(`product-reviews`, JSON.stringify({ id: this.state.deleteReviewID }))
    if (deleteStatus.success == true) {
      toastr.success(`Product Review Deleted Successfully`)
      this.fetchData(this.props.id)
      this.setState({
        deleteReviewModal: false
      })
    }
    else {
      toastr.info(`You can't delete this Product Review.`, 'Oops Sorry !',)
    }
  }


  formatAMPM = (date) => {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

  // 
  componentDidMount() {
    let id = this.props.id;
    if (id) {
      this.fetchList(id);
      this.fetchData(id);
    } else {
      alert("Oh!");
    }
  }


  // Function for delete data
  changeStatus = async (ids, status) => {

    var data = {
      id: ids,
      is_active: status,
    }

    var update = await updateAdditional('change-status', 'products', data)

    if (update.success == true) {
      toastr.success('Status change Successfull')
    }
  }

  // Fetch data by offset
  fetchByOffsetOrder = async (offset, limit) => {
    var filters = this.state.filterObject.orders;
    if ((offset || offset == 0) && limit) {
      this.setState({ fetching: true })
      var data;
      this.setState({
        filters: {
          ...this.state.filterObject,
          orders: {
            ...filters,
            offset: offset,
            limit: limit,
          }

        }
      }, async () => {
        this.fetchList();
      })
    }
  }


  // 
  render() {
    const product = (this.state.data && this.state.data.product) ? this.state.data.product : {}

    const orders = [

      {
        Header: '#Order',
        Cell: props => {
          return (
            <span className="">{props.row.original.order_number}</span>
          )
        },
      },
      {
        Header: 'User',
        Cell: props => {
          return (
            <span className="capitalize">{props.row.original.user ? `${props.row.original.user.first_name} ${props.row.original.user.last_name}` : ''}</span>
          )
        },
      },

      {
        Header: 'Name',
        Cell: props => {
          return (
            <table className="w-100">
              <tbody>
                {props.row.original.carts.map(cart => {
                  return <tr style={{ borderBottom: '1px solid rgba(0,0,0,.05)' }}>
                    <td>
                      {cart.product.name}
                      <br />
                      {cart.upgraded_cart_id && cart.order_type == 'UPGRADE' && <small className="bg-green-500 text-white p-1 rounded"> Upgraded Product</small>}

                    </td>
                    <td >
                      {props.row.original.status == 'SUCCESS' && (cart.activated && cart.activated == true ? <span className="text-green-500"><b>Activated</b></span> : <span className="text-red-500">Expired</span>)}
                    </td>
                    <td >
                      <span className="text-red-500">
                        {props.row.original.status == 'SUCCESS' && (cart.activated && cart.activated == true ? (
                          <>
                            {cart.notStarted &&
                              <div className="float-right">
                                <span className="">{moment(cart.validity_start_from).format('MMMM Do YYYY')}</span>
                                <br />
                                <span className=""> to </span>
                                <br />
                                <span className="">{moment(cart.expDate).format('MMMM Do YYYY')}</span>
                                <br />
                              </div>
                              ||
                              <>
                                <span className="float-right">{cart.leftDays} Days Left ({moment(cart.expDate).format('DD-MM-YYYY')})</span>
                                <br /></>
                            }
                          </>
                        ) : (
                          <>
                            <span>{moment(cart.expDate).format('MMMM Do YYYY, h:mm:ss a')}</span>
                          </>

                        ))}
                      </span>
                    </td>
                  </tr>
                })}
              </tbody>
            </table >

          )
        },

      },
      {
        Header: 'Status',
        Cell: props => {
          return (
            <Badge key={props.row.original.id} size='sm' color={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full  uppercase last:mr-0 mr-1 ${props.row.original.status == 'SUCCESS' ? 'text-green-600 bg-green-200' : 'text-red-600 bg-red-200'}`} rounded>
              {props.row.original.status}
            </Badge>
          )
        },
      },
      {
        Header: 'Amount',
        Cell: props => {
          return (
            <span className="">₹ {props.row.original.final_price}</span>
          )
        },
      },
      {
        Header: 'Date',
        Cell: props => {
          return (
            <span className="">{moment(props.row.original.created_at).format('MMMM Do YYYY, h:mm:ss a')}</span>
          )
        },
      },
    ]

    const tabs = [
      {
        index: 0,
        title: 'Details',
        content: (
          <div className="py-4 w-full">
            <div className="pb-2 flex flex-col lg:flex-row">
              <div className="text-sm pt-1 w-full" dangerouslySetInnerHTML={{ __html: product.description }}>

              </div>
            </div>
            <div className="pb-2 flex flex-row items-center mt-2">
              <div className="text-sm font-bold w-1/3">Product Type</div>
              <div className="text-sm pt-1 w-2/3 text-right md:text-left ">
                <span className="capitalized">{product.product_type && product.product_type.title}</span>
              </div>
            </div>
            <div className="pb-2 flex flex-row items-center">
              <div className="text-sm font-bold w-1/3">Package Type</div>
              <div className="text-sm pt-1 w-2/3 text-right md:text-left">
                <span className="capitalized">{product.package_type && product.package_type.title}</span>
              </div>
            </div>

            {
              product.attributes &&
              Object.values(product.attributes).map(attribute => {
                if (attribute.hidden == 0) {
                  return (
                    <div className="pb-2 flex fflex-row items-center">
                      <div className="text-sm font-bold w-1/3">{attribute.title}</div>
                      <div className="text-sm pt-1 w-2/3 text-right md:text-left">
                        <span className="capitalized">{attribute.value}</span>
                      </div>
                    </div>
                  )

                }

              })
            }
            {
              product.details &&
              Object.values(product.details).map((value) => {
                return (
                  <div className="pb-2 flex flex-row">
                    <div className="text-sm font-bold w-1/3">{value.label}</div>
                    <div className="text-sm pt-1 w-2/3 text-right md:text-left ">
                      <span className="capitalized">{value.value}</span>
                    </div>
                  </div>
                )

              })
            }


            <div className="pb-2">
              <div className="text-sm font-bold w-full">Faculty</div>
              <div className="text-sm pt-2 lg:pt-5 pb-2 lg:pb-4">
                <div className="w-full mb-4">
                  {product && product.attributes && product.attributes['faculty'] && product.attributes['faculty'].value && product.attributes['faculty'].values && Array.isArray(product.attributes['faculty'].values) &&
                    product.attributes['faculty'].values.map((value, i) => {
                      return <div
                        className="flex items-start justify-start md:p-2 space-x-1 lg:space-x-2 py-2 items-center"
                        key={i}>
                        <div className="flex-shrink-0 w-8">
                          <span className="lg:h-7 lg:w-7  w-6 h-6 bg-base text-white flex items-center justify-center rounded-full text-lg font-display font-bold">
                            <img src={value.image} alt={window.localStorage.getItem('defaultImageAlt')} className="z-10 img-fluid  rounded-full" />
                          </span>
                        </div>
                        <div className="flex flex-col w-full">
                          <div className="text-sm font-bold">{value.first_name} {value.gender == 'Female' ? 'Mam' : 'Sir'}</div>
                          {/* <div className="text-sm"></div> */}
                        </div>
                      </div>
                    })
                  }
                </div>
              </div>
            </div>
            <div className="pb-2">
              <div className="text-sm font-bold w-full">Course Details</div>
              <div className="text-sm pt-1">
                <div className="w-full mb-4">

                  {product && product.courses && product.courses.length > 0 && product.courses.map((course, i) => {

                    return <div
                      className="flex items-start justify-start md:p-2 py-2 space-x-1 md:space-x-2"
                      key={i}>
                      <div className="flex-shrink-0 w-8">
                        <span className="lg:h-7 lg:w-7 w-6 h-6 bg-base text-white flex items-center justify-center rounded-full text-sm md:text-lg font-display font-bold">
                          {i + 1}
                        </span>
                      </div>
                      <div className="flex flex-col w-full">
                        <div className="text-sm font-bold">{course.name}</div>
                        {course.subjects && course.subjects.length > 0 && course.subjects.map((subject, index) => {

                          let chpaters = ''
                          {
                            subject.chapters && subject.chapters.length > 0 && subject.chapters.map((chapter, key) => {
                              return chpaters += `${chapter.name} ,`
                            })
                          }
                          return <div className="text-sm">{subject.name} {chpaters != '' && ` : ${chpaters}`}</div>
                        })}
                      </div>
                    </div>
                  })
                  }
                </div>
              </div>
            </div>
          </div>
        )
      },
      {
        index: 1,
        title: 'Reviews',
        content: (
          <div className="py-4 w-full">
            <div className="pb-2">
              <div className="text-sm font-bold w-full">Reviews</div>
              <div className="text-sm pt-1">
                <div className="w-full mb-4">
                  {(product && product.reviews && product.reviews.length > 0) &&
                    product.reviews.map((review, i) => {
                      return <div
                        className="flex items-start justify-start space-x-1 lg:space-x-4 p-4"
                        key={i}>
                        <div className="flex-shrink-0 w-8">
                          <span className="lg:h-7 lg:w-7 w-6 h-6 bg-base text-white flex items-center justify-center rounded-full text-sm md:text-lg font-display font-bold">
                            {i + 1}
                          </span>
                        </div>
                        <div className="flex flex-col lg:flex-row">
                          <div className="flex flex-col w-full">
                            <div className="text-sm font-bold">{review.first_name} {review.last_name}</div>
                            <div className="text-sm">
                              <div className="rating">
                                <ul className="rating flex flex-wrap justify-start items-start">
                                  {
                                    Array.from(Array(5).keys()).map((index) => {
                                      return <li key={index}><i className={`fas fa-star ${(index + 1) <= review.ratting && 'setected-start text-yellow-500'}`}></i></li>
                                    })
                                  }

                                </ul>
                              </div></div>
                            <div className="text-sm">{review.message}</div>
                          </div>
                          <div className="flex-shrink-0">
                            <div className="text-gray-500 lg:ml-1">{moment(review.created_at).fromNow()}</div>
                          </div>
                        </div>
                        <div className="flex-shrink-0  float-right">
                          <button className={`btn btn-default btn-rounded hover:bg-blue-600 text-white mb-4 float-right bg-red-500`} onClick={() => {
                            this.setState({
                              deleteReviewModal: true,
                              deleteReviewID: review.id
                            })
                          }}>
                            Delete
                          </button>
                        </div>
                      </div>
                    })
                    ||
                    'No Reviews Yet'
                  }
                </div>
              </div>
            </div>
          </div>
        )
      },
      {
        index: 4,
        title: 'Orders',
        content: (
          <div className="py-4 w-full">
            <div className="py-4 w-full">
              {
                this.state.orders &&
                <Datatable
                  columns={orders}
                  data={this.state.orders}
                  paginationClick={this.fetchByOffsetOrder}
                  pageSizedata={this.state.filterObject.orders.limit}
                  pageIndexdata={(this.state.filterObject.orders.offset / this.state.filterObject.orders.limit)}
                  pageCountData={this.state.totalCount.orders}
                  baseTitle='Order'
                  modelTitle='orders'
                  queryTitle='orders'
                  fetchList={this.fetchList}
                  sectionRow={false}
                  approvable={false}
                  viewable={false}
                  editable={false}
                  deletable={false}
                  status={false}
                />
              }
            </div>
          </div>
        )
      },
    ]

    return (
      <>
        {
          this.state.data && this.state.data.product &&
          <>
            <SectionTitle title="Product" subtitle={`${product.name}`} hideButton={true} />

            <Widget
              title=""
              description=''>

              <div className="flex flex-row items-center justify-start p-4">
                <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 mr-3">
                  <img
                    src={product.cover_image}
                    alt={window.localStorage.getItem('defaultImageAlt')}
                    className="shadow  ring mb-2"
                  />
                </div>
                <div className="py-2 px-2">
                  <p className="text-base font-bold ">{product.name}</p>
                  <p className="text-sm text-gray-500 ">
                    {product.product_type && product.product_type.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {product.package_type && product.package_type.title}
                  </p>
                </div>
                <div className="ml-auto flex-shrink-0 space-x-2 hidden lg:flex">
                  <Switch initialState={product.is_active == 1 ? true : false} color='green' offColor="red" id={product.id} onChange={this.changeStatus} />

                </div>
              </div>

              <div className="flex flex-wrap">
                <div className="w-full md:p-4 tab-border">
                  <UnderlinedTabs tabs={tabs} />
                </div>
              </div>


            </Widget>
          </>
        }
      </>

    )
  }

}
