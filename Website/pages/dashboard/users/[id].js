import { Component } from 'react';
import { fetchByID, updateAdditional, edit, fetchAll, get, post, getSettings } from 'helpers/apiService';
import React from 'react'
import SectionTitle from 'components/functional-ui/section-title'
import Datatable from 'components/functional-ui/datatable'
import Shimmer from 'components/website/shimmer/datatable'
import Widget from 'components/functional-ui/widget'
import Comments from 'components/functional-ui/social-feed/comments'
import { Badge } from 'components/functional-ui/badges'
import { UnderlinedTabs } from 'components/functional-ui/tabs'
import { FiDelete, FiX, FiEye } from 'react-icons/fi'
import { MdVerifiedUser, MdWarning } from 'react-icons/md'
import Switch from 'components/functional-ui/switch'
import { multiLine, DoubleLine } from 'components/functional-ui/lists'
import Link from 'next/link';
import StoreModel from 'components/functional-ui/modals/modal-store'
import toastr from 'toastr'
import define from 'src/json/worddefination.json'
import { CircularBadge } from 'components/functional-ui/badges'
import Validation from 'components/functional-ui/forms/validation'
import DeleteModel from 'components/functional-ui/modals/modal-confirmation'

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
    modelTitle: 'users',
    logs: [],
    otsActiveSubscription: [],
    otsSubscriptions: [],
    notifications: [],
    bulkSms: [],
    orders: [],
    assessmentResults: [],
    selfAssessmentResults: [],
    quickTests: [],
    membershipOrders: [],
    products: [],
    filterObject: {
      logs: {
        limit: 10,
        offset: 0
      },
      notifications: {
        limit: 10,
        offset: 0
      },
      sms: {
        limit: 10,
        offset: 0
      },
      orders: {
        limit: 10,
        offset: 0
      },
      membershipOrders: {
        limit: 10,
        offset: 0
      },
      products: {
        limit: 10,
        offset: 0
      },
      quickTests: {
        limit: 10,
        offset: 0
      },
      assessmentResults: {
        offset: 0
      },
      selfAssessmentResults: {
        offset: 0
      },
    },
    totalCount: {},
    showOtsModel: false
  }

  // 
  static getInitialProps({ query }) {
    return query;
  }

  changeOtsModelStatus = () => {

    if (this.state.showOtsModel == true) {
      // this.buildAddModel();
      this.setState({
        showOtsModel: false
      })
    } else {
      this.buildAddModel();
      this.setState({
        showOtsModel: true
      })
    }
  }

  // Function for fetch data
  fetchList = async (id) => {
    id = id ? id : this.props.id

    let filter = {
      ...this.state.filterObject.orders,
      userID: id,
      forList: true
    }

    let allowQuickTest = await getSettings('allow_quick_test')
    let allowAssessementTest = await getSettings('allow_assessement_test')
    let allowSelfAssessementTest = await getSettings('allow_self_assessement_test')
    this.setState({
      allowQuickTest: allowQuickTest,
      allowAssessementTest: allowAssessementTest,
      allowSelfAssessementTest: allowSelfAssessementTest,
    })

    var orders = await fetchAll('orders', filter);
    this.setState({ orders: orders.orders })

    filter = {
      ...this.state.filterObject.membershipOrders,
      userID: id,
      forList: true
    }

    var membershipOrders = await fetchAll('membership-orders', filter);
    this.setState({ membershipOrders: membershipOrders.membershipOrders })

    filter = {
      ...this.state.filterObject.products,
      userID: id,
      status: 'ADDED',
      forList: true
    }

    var products = await fetchAll('carts', filter);
    this.setState({ products: products.carts })

    filter = {
      ...this.state.filterObject.logs,
      userID: id,
      forList: true
    }

    var logs = await fetchAll('logs', filter);
    this.setState({ logs: logs.logs })

    filter = {
      ...this.state.filterObject.notifications,
      userID: id,
      forList: true
    }

    let notificatiosn = await fetchAll('push-notifications', filter);
    this.setState({ notifications: notificatiosn.pushNotifications })

    filter = {
      ...this.state.filterObject.sms,
      userID: id,
      forList: true
    }

    let quickTests = await fetchAll('tests', filter);
    this.setState({ quickTests: quickTests.completedTests })

    filter = {
      ...this.state.filterObject.sms,
      userID: id,
      forList: true
    }

    let data = await fetchAll('bulk-sms', filter);
    this.setState({ bulkSms: data.bulkSms })

    filter = {
      ...this.state.filterObject.assessmentResults,
      userID: id,
      forList: true
    }
    filter = {
      ...this.state.filterObject.selfAssessmentResults,
      userID: id,
      forList: true
    }

    let assessmentData = await get('assessment-tests/result', filter);
    this.setState({
      assessmentResults: assessmentData.assessmentResults && assessmentData.assessmentResults.length > 0 ? assessmentData.assessmentResults[0] : [],

    })

    let selfAssessmentdata = await get('self-assessment-tests/result', filter);
    this.setState({
      selfAssessmentResults: selfAssessmentdata.assessmentResults ? selfAssessmentdata.assessmentResults : [],

    })


    this.setState({
      totalCount: {
        logs: logs.totalCount,
        sms: data.totalCount,
        orders: orders.totalCount,
        membershipOrders: membershipOrders.totalCount,
        assessmentResults: assessmentData.assessmentResults && assessmentData.assessmentResults.length > 0 ? assessmentData.assessmentResults[0].totalQuestions : 0,
        selfAssessmentResults: selfAssessmentdata.totalCount,
        products: products.totalCount,
        quickTests: quickTests.totalCount,
        notifications: notificatiosn.totalCount,
      }
    })


    data = await get('users/refer-and-earn', { userID: id })
    this.setState(data)

    if (process.env.NEXT_PUBLIC_OTS_INTIGRATION == "true") {
      let otsUrl = process.env.NEXT_PUBLIC_TEST_SERIES_URL
      let url = otsUrl.concat('/branches')

      let ots = await fetch(url);
      if (ots && ots.status == 200) {
        ots = await ots.json()

        this.setState({
          otsBranches: ots.branches
        })
      }


      url = otsUrl.concat('/subscriptions')

      ots = await fetch(url);
      if (ots && ots.status == 200) {
        ots = await ots.json()

        this.setState({
          otsSubscriptions: ots.subscriptions
        }, () => {

          this.getSubscription()
        })
      }




    }

  }

  // Function for fetch data
  fetchData = async (id) => {
    var data = await fetchByID(this.state.modelTitle, id, { noLog: true });
    this.setState({ data })
  }

  resetUuid = async () => {
    let body = {
      id: this.props.id,
      uuid: null
    }

    let user = await edit('users', body);

    if (user.success) {
      toastr.success('Device ID Reset Successfully')
    }

    let id = this.props.id;
    this.fetchData(id);
  }

  resetMachineId = async () => {
    let body = {
      id: this.props.id,
      machine_id: null
    }

    let user = await edit('users', body);

    if (user.success) {
      toastr.success('Device ID Reset Successfully')
    }

    let id = this.props.id;
    this.fetchData(id);
  }

  changeMembershipStatus = async (membership_id, status) => {
    let body = {
      id: membership_id,
      approved: status == 1 ? 0 : 1
    }

    let user = await post('users/membership-document-status', body);

    if (user.success) {
      toastr.success('Status Changed Suceessfully')
    }

    let id = this.props.id;
    this.fetchData(id);
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

  buildOtsModel = (user) => {

    let subscriptions = []
    this.state.otsSubscriptions.map(subscription => {
      subscriptions.push({
        label: subscription.name,
        value: subscription.id
      })
    })


    let items = {
      name: {
        label: 'Name',
        error: { required: 'Please enter Name' },
        name: 'name',
        defaultValue: `${user.first_name} ${user.last_name}`,
        type: 'text',
        placeholder: 'Enter you Name',
        className: 'sm:w-1/3',
      },
      mobile_number: {
        label: 'Mobile Number',
        error: {
          required: 'Please enter mobile number',
        },
        defaultValue: `${user.mobile_number}`,
        name: 'mobile_number',
        type: 'number',
        placeholder: 'Enter your Mobile Number',
        className: 'sm:w-1/3',
      },
      email: {
        label: 'Email',
        error: { required: 'Please enter a valid email' },
        name: 'email',
        type: 'email',
        defaultValue: `${user.email}`,
        placeholder: 'Enter you email',
        className: 'sm:w-1/3',
        onTab: 1
      },
      subscription_id: {
        datalabel: 'Subscription ',
        dataname: 'Subscription ',
        label: 'Subscription',
        name: 'subscription_id',
        idSelector: 'value',
        view: 'label',
        type: 'select',
        values: subscriptions,
        className: "sm:w-1/2",
        placeholder: 'Enter  Type',
        isMultiple: false,
        // defaultValue: this.state.user && this.state.user.gender ? { value: this.state.user.gender, label: this.state.user.gender } : ''
      },
    }

    return this.setState({
      otsStoreFields: items,
      showOtsModel: true
    })

  }

  syncUser = async (value) => {

    let otsUrl = process.env.NEXT_PUBLIC_TEST_SERIES_URL
    let body = {
      email: value.email,
      subscription_id: value.subscription_id,
    }


    let url = otsUrl.concat('/assignSubscription')

    let data = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })


    if (data.status != 200) {

      body = {
        name: value.name,
        email: value.email,
        mobile_number: value.mobile_number,
        subscription_id: value.subscription_id,
        // branch_id: data.branch_id,
      }


      url = otsUrl.concat('/syncUser')

      data = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (data.status == 200) {
        toastr.success('Subscription Added Successfully')
        this.setState({
          showOtsModel: false
        })

        this.getSubscription()
      } else {
        toastr.error('Something wont wrong')
      }


    } else {
      toastr.success('Subscription Added Successfully')
      this.setState({
        showOtsModel: false
      })

      this.getSubscription()
    }

  }

  getSubscription = async () => {

    let otsUrl = process.env.NEXT_PUBLIC_TEST_SERIES_URL
    let url = otsUrl.concat('/getUserSubscription')

    let body = {
      email: this.state.data.user.email,
    }

    let data = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (data.status == 200) {

      data = await data.json()


      let subscriptions = this.state.otsSubscriptions

      data.activeSubscriptions.map(subscription => {
        let subs = subscriptions.filter(sub => subscription.subscription_id == sub.id)

        subscription.name = subs && subs.length > 0 ? subs[0].name : ''
      })
      this.setState({
        otsActiveSubscription: data.activeSubscriptions
      })
    }
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

    var update = await updateAdditional('change-status', 'users', data)

    if (update.success == true) {
      toastr.success('Status change Successfull')
    }
  }

  // Fetch data by offset
  fetchByOffsetLog = async (offset, limit) => {
    var filters = this.state.filterObject.logs;
    if ((offset || offset == 0) && limit) {
      this.setState({ fetching: true })
      var data;

      this.setState({
        filterObject: {
          ...this.state.filterObject,
          logs: {
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

  // Fetch data by offset
  fetchByOffsetNotification = async (offset, limit) => {
    var filters = this.state.filterObject.notifications;
    if ((offset || offset == 0) && limit) {
      this.setState({ fetching: true })
      var data;
      this.setState({
        filterObject: {
          ...this.state.filterObject,
          notifications: {
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

  // Fetch data by offset
  fetchByOffsetSms = async (offset, limit) => {
    var filters = this.state.filterObject.sms;
    if ((offset || offset == 0) && limit) {
      this.setState({ fetching: true })
      var data;
      this.setState({
        filterObject: {
          ...this.state.filterObject,
          sms: {
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

  // Fetch data by offset
  fetchByOffsetCarts = async (offset, limit) => {
    var filters = this.state.filterObject.products;
    if ((offset || offset == 0) && limit) {
      this.setState({ fetching: true })
      var data;
      this.setState({
        filterObject: {
          ...this.state.filterObject,
          products: {
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

  // Fetch data by offset
  fetchByOffsetOrder = async (offset, limit) => {
    var filters = this.state.filterObject.orders;
    if ((offset || offset == 0) && limit) {
      this.setState({ fetching: true })
      var data;
      this.setState({
        filterObject: {
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
  // Fetch data by offset
  fetchByOffsetmembershipOrder = async (offset, limit) => {
    var filters = this.state.filterObject.membershipOrders;
    if ((offset || offset == 0) && limit) {
      this.setState({ fetching: true })
      var data;
      this.setState({
        filterObject: {
          ...this.state.filterObject,
          membershipOrders: {
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
  // Fetch data by offset
  fetchByOffsetquickTest = async (offset, limit) => {
    var filters = this.state.filterObject.quickTests;
    if ((offset || offset == 0) && limit) {
      this.setState({ fetching: true })
      var data;
      this.setState({
        filterObject: {
          ...this.state.filterObject,
          quickTests: {
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


  // Function for delete data
  deleteSubscription = async () => {

    let otsUrl = process.env.NEXT_PUBLIC_TEST_SERIES_URL
    let url = otsUrl.concat('/removeSubscription')

    let body = {
      email: this.state.data.user.email,
      subscription_id: this.state.deleteID,
    }

    let deleteStatus = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })


    if (deleteStatus.status == 200) {
      toastr.success(`Subscription Deleted Successfully`)
      this.getSubscription()
    }
    else {
      toastr.info(`You can't delete this Subscription.`, 'Oops Sorry !',)
    }

    this.setState({
      deleteModel: false
    })
  }


  // 
  render() {
    const user = (this.state.data && this.state.data.user) ? this.state.data.user : {}

    const logs = [
      {
        Header: 'ACTION',
        style: { 'whiteSpace': 'unset' },
        Cell: props => {
          return (
            <div className="capitalize">
              {!props.row.original.payload && props.row.original.action}
              {props.row.original.payload && props.row.original.payload.field_name}
              {props.row.original.payload && props.row.original.payload.tag && <span className=" capitalize text-white text-center rounded w-20 py-1 bg-green-500 text-white mx-2 px-2 ">{props.row.original.payload.tag.charAt(0).toUpperCase() + props.row.original.payload.tag.slice(1)}</span>}

            </div>
          )
        },
      },

      {
        Header: 'Date',
        Cell: props => {
          var created_at = new Date(props.row.original.created_at)
          var date = created_at.getDate() + '/' + (created_at.getMonth() + 1) + '/' + created_at.getFullYear()
          return <div> {date} </div>
        },
      },
      {
        Header: 'Time',
        Cell: props => {
          var created_at = new Date(props.row.original.created_at)
          //var date = created_at.getHours() + ':' + created_at.getMinutes() + ':' + + created_at.getSeconds() + ':' + created_at.getMilliseconds()
          var date = this.formatAMPM(created_at)
          return <div> {date} </div>
        },
      }
    ]

    const notifications = [
      {
        Header: 'Title',
        Cell: props => {
          return <div> {props.row.original.title} </div>
        },
      },
      {
        Header: 'Body',
        accessor: 'body',
      },
      {
        Header: 'Created AT',
        Cell: props => {
          var date = moment(props.row.original.created_at).format('MMMM Do YYYY, h:mm:ss a')
          return <div> {date} </div>
        },
      },
    ]

    const sms = [
      {
        Header: 'Message',
        Cell: props => {
          return <div> {props.row.original.message} </div>
        },
      },
      {
        Header: 'Created AT',
        Cell: props => {
          var date = moment(props.row.original.created_at).format('MMMM Do YYYY, h:mm:ss a')
          return <div> {date} </div>
        },
      },
    ]

    const products = [
      {
        Header: 'Name',
        Cell: props => {
          return <div> {props.row.original.product.name} </div>
        },
      },
      {
        Header: 'Created AT',
        Cell: props => {
          var date = moment(props.row.original.created_at).format('MMMM Do YYYY, h:mm:ss a')
          return <div> {date} </div>
        },
      },
    ]

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
        Header: 'Name',
        Cell: props => {
          return (
            <table className="w-full">
              <tbody>
                {props.row.original.carts.map(cart => {
                  return <tr style={{ borderBottom: '1px solid rgba(0,0,0,.05)' }}>
                    <td className="w-2/4">
                      {cart.product.name}
                      <br />
                      {cart.upgraded_cart_id && cart.order_type == 'UPGRADE' && <small className="bg-green-500 text-white p-1 rounded"> Upgraded Product</small>}
                    </td>
                    <td className="w-1/4">
                      {props.row.original.status == 'SUCCESS' && (cart.activated && cart.activated == true ? <span className="text-green-500"><b>Activated</b></span> : <span className="text-red-500">Expired</span>)}
                    </td>
                    <td className="w-1/4">
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


    const assessmentResults = [
      {
        Header: 'Questions',
        Cell: props => {
          return <div> {props.row.original.question.question} </div>
        },
      },
      {
        Header: 'Right Answers',
        Cell: props => {
          return <div> {props.row.original.right_answer} </div>
        },
      },
      {
        Header: 'User Answers',
        Cell: props => {
          return <div> {`${props.row.original.question[props.row.original.answer]}`} </div>
        },
      },
      {
        Header: 'Status',
        Cell: props => {
          return <div> {props.row.original.answer == props.row.original.right_answer && <i class="fas fa-check right_answer mr-2"></i> ||
            <i class="fas fa-times wrong mr-2"></i>} </div>
        },
      },
    ]

    const selfAssessmentResults = [
      {
        Header: 'Question',
        Cell: props => {
          return <div> {props.row.original.question.question} </div>
        },
      },
      {
        Header: "User's Answer",
        Cell: props => {
          return <div> {`${props.row.original.answer}`} </div>
        },
      },
      {
        Header: 'Marks',
        Cell: props => {
          return <div> {`${props.row.original.marks}`} </div>
        },
      }
    ]

    const membershipOrders = [

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
        Header: 'Membership',
        Cell: props => {
          return (
            <table className="w-full">
              <tbody>
                {props.row.original.carts.map(cart => {
                  return <tr style={{ borderBottom: '1px solid rgba(0,0,0,.05)' }}>
                    <td className="w-2/4">
                      <b>{cart.membership.title}</b>
                    </td>
                    <td className="lg:w-1/4">
                      {props.row.original.status == 'SUCCESS' && (cart.activated && cart.activated == true ? <span className="text-green-500"><b>Activated</b></span> : <span className="text-red-500">Expired</span>)}
                    </td>
                    <td className="lg:w-1/4">
                      <span className="text-red-500">
                        {props.row.original.status == 'SUCCESS' && (cart.activated && cart.activated == true ? (
                          <>
                            <span>{cart.leftDays} Days Left ({moment(cart.expDate).format('MMMM Do YYYY')})</span>
                          </>
                        ) : (
                          <>
                            <span>{moment(cart.expDate).format('MMMM Do YYYY')}</span><br />
                            <span>{moment(cart.expDate).format('h:mm:ss a')}</span>
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

            <div className={`form-element form-element-inline `}>
              <select className={` text-white border-0 text-center rounded ${props.row.original.status == 'SUCCESS' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`} onChange={(e) => this.onChange(e, props.row.original.id, e.target.value)}>
                <option className="bg-green-500 text-white" selected={props.row.original.status == 'SUCCESS'} value="SUCCESS">SUCCESS</option>
                <option className="bg-red text-white" selected={props.row.original.status == 'FAILED'} value="FAILED">FAILED</option>
              </select>
            </div>
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
            <span className="">{moment(props.row.original.created_at).format('MMMM Do YYYY')}</span>
          )
        },
      },
    ]


    const membershipTabs = []
    const quickTests = [


      {
        Header: 'Title',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              <span >{props.row.original.title}</span>
            </div>
          )
        },

      },
      {
        Header: 'Right Answer',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              <span >{props.row.original.right_answer_count}</span>
            </div>
          )
        },
      },
      {
        Header: 'Wrong Answer',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              <span >{props.row.original.wrong_answer_count}</span>
            </div>
          )
        },
      },
      {
        Header: 'Total Questions',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              <span >{props.row.original.testQuestions && props.row.original.testQuestions.length}</span>
            </div>
          )
        },
      },
      {
        Header: 'Marks',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              <span >{props.row.original.marks} %</span>
            </div>
          )
        },
      },
      {
        Header: '',
        Cell: props => {
          return (
            <a className="viewButton mb-1 lg:pl-2" title="View">
              <span className="h-8 w-8 bg-blue-100 text-primary flex items-center justify-center rounded-full text-lg font-display font-bold">
                <Link href={`/dashboard/completed-tests/[id]`} as={`/dashboard/completed-tests/${props.row.original.test_id}`} className="">
                  <a target="_blank"><FiEye size={16} className="stroke-current text-base" /></a>
                </Link>
              </span>
            </a>
          )
        },
      },

    ]


    {
      this.state.data && this.state.data.user && this.state.data.user.membership_documents && this.state.data.user.membership_documents.map((document, i) => {
        membershipTabs.push({
          index: i,
          title: document.title,
          content: (
            <div className="pb-6 w-full">
              <button className={`btn btn-default btn-rounded hover:bg-blue-600 text-white mb-4 float-right ${document.approved == 1 ? 'bg-red-500 ' : 'bg-green-500 '}`} onClick={() => this.changeMembershipStatus(document.id, document.approved)}>
                {document.approved == 1 ? 'Reject' : 'Approve'}
              </button>
              <iframe
                src={`${document.document}`}
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen="false"
                width='100%'
                height="700"
                className="previousYearQuestion__iframe"
              />
            </div>
          )
        })
      })
    }

    const tabs = [
      {
        index: 0,
        title: 'Account settings',
        content: (
          <div className="py-4 w-full flex flex-col sm:flex-wrap sm:flex-row">
            <div className="pb-2 pt-2 flex flex-row justify-between border-b w-full sm:w-1/2">
              <div className="text-sm font-bold sm:w-1/3">Name</div>
              <div className="flex flex-col lg:flex-wrap lg:flex-row text-sm  sm:w-2/3  ">
                <span className="capitalize text-right md:text-left">{user.first_name} {user.last_name}</span>
              </div>
            </div>
            <div className="pb-2 pt-2 flex flex-row justify-between border-b w-full sm:w-1/2">
              <div className="text-sm font-bold sm:w-1/3">Registration Number</div>
              <div className="flex flex-col lg:flex-wrap lg:flex-row text-sm  sm:w-2/3  ">
                <span className="capitalize text-right md:text-left">{user.registration_number}</span>
              </div>
            </div>
            <div className="pb-2 pt-2 flex flex-row justify-between border-b w-full sm:w-1/2">
              <div className="text-sm font-bold sm:w-1/3">Date of Birth</div>
              <div className="flex flex-col lg:flex-wrap lg:flex-row text-sm  sm:w-2/3  ">
                <span className="capitalize text-right md:text-left">{user.dob}</span>
              </div>
            </div>
            <div className="pb-2 pt-2 flex flex-row justify-between border-b w-full sm:w-1/2">
              <div className="text-sm font-bold sm:w-1/3">Branch</div>
              <div className="flex flex-col lg:flex-wrap lg:flex-row text-sm  sm:w-2/3  ">
                <span className="capitalize text-right md:text-left">{user.branch}</span>
              </div>
            </div>
            <div className="pb-2 pt-2 flex flex-row justify-between border-b w-full sm:w-1/2">
              <div className="text-sm font-bold sm:w-1/3">Gender</div>
              <div className="flex flex-col lg:flex-wrap lg:flex-row text-sm  sm:w-2/3  ">
                <span className="capitalize text-right md:text-left">{user.gender}</span>
              </div>
            </div>
            <div className="pb-2 pt-2 flex flex-row justify-between border-b w-full sm:w-1/2">
              <div className="text-sm font-bold sm:w-1/3">Category</div>
              <div className="flex flex-col lg:flex-wrap lg:flex-row text-sm  sm:w-2/3  ">
                <span className="capitalize text-right md:text-left">{user.category}</span>
              </div>
            </div>

            <div className="pb-2 pt-2 flex flex-row justify-between border-b w-full sm:w-1/2">
              <div className="text-sm font-bold sm:w-1/3">Email</div>
              <div className="flex flex-col lg:flex-wrap lg:flex-row text-sm  sm:w-2/3  ">
                <span className="capitalize text-right md:text-left break-words">{user.email}</span>
              </div>
            </div>
            <div className="pb-2 pt-2 flex flex-row justify-between border-b w-full sm:w-1/2">
              <div className="text-sm font-bold sm:w-1/3">Email Status</div>
              <div className="flex flex-col lg:flex-wrap lg:flex-row text-sm  sm:w-2/3  ">
                <span className="capitalize text-right md:text-left">{user.is_email_verified == 1 ? <div className="flex flex-row items-center"><MdVerifiedUser className="w-8 text-green-500" /> Verified</div> : <div className="flex flex-row items-center"><MdWarning className="w-8 text-red-500" />Verification Pending</div>}</span>
              </div>
            </div>

            <div className="pb-2 pt-2 flex flex-row justify-between border-b w-full sm:w-1/2">
              <div className="text-sm font-bold sm:w-1/3">Mobile Number</div>
              <div className="flex flex-col lg:flex-wrap lg:flex-row text-sm  sm:w-2/3  ">
                <span className="capitalize text-right md:text-left">{user.mobile_number}</span>
              </div>
            </div>
            <div className="pb-2 pt-2 flex flex-row justify-between border-b w-full sm:w-1/2">
              <div className="text-sm font-bold sm:w-1/3">Mobile Status</div>
              <div className="flex flex-col lg:flex-wrap lg:flex-row text-sm  sm:w-2/3  ">
                <span className="capitalize text-right md:text-left">{user.is_mobile_verified == 1 ? <div className="flex flex-row items-center"><MdVerifiedUser className="w-8 text-green-500" /> Verified</div> : <div className="flex flex-row items-center"><MdWarning className="w-8 text-red-500" />Verification Pending</div>}</span>
              </div>
            </div>
            <div className="pb-2 pt-2 flex flex-row justify-between border-b w-full sm:w-full">
              <div className="text-sm font-bold sm:w-1/3">Whatsapp Connect</div>
              <div className="flex flex-col lg:flex-wrap lg:flex-row text-sm  sm:w-2/3  ">
                <span className="capitalize text-right md:text-left">{user.whatsapp_number}</span>
              </div>
            </div>
            <div className="pb-2 pt-2 flex flex-row justify-between border-b w-full sm:w-1/2">
              <div className="text-sm font-bold sm:w-1/3">Device ID</div>
              <div className="flex flex-col lg:flex-wrap lg:flex-row text-sm  sm:w-2/3  ">
                <span className="capitalize text-right md:text-left">{user.uuid}</span>
              </div>
            </div>
            <div className="pb-2 pt-2 flex flex-row justify-between border-b w-full sm:w-1/2">
              <div className="text-sm font-bold sm:w-1/3">Device Brand</div>
              <div className="flex flex-col lg:flex-wrap lg:flex-row text-sm  sm:w-2/3  ">
                <span className="capitalize text-right md:text-left">{user.device_brand}</span>
              </div>
            </div>
            <div className="pb-2 pt-2 flex flex-row justify-between border-b w-full sm:w-1/2">
              <div className="text-sm font-bold sm:w-1/3">Device Model</div>
              <div className="flex flex-col lg:flex-wrap lg:flex-row text-sm  sm:w-2/3  ">
                <span className="capitalize text-right md:text-left">{user.device_model}</span>
              </div>
            </div>


            <div className="pb-2 pt-2 flex flex-row justify-between border-b w-full sm:w-1/2">
              <div className="text-sm font-bold sm:w-1/3">System Device ID</div>
              <div className="flex flex-col lg:flex-wrap lg:flex-row text-sm  sm:w-2/3  ">
                <span className="capitalize text-right md:text-left">{user.machine_id}</span>
              </div>
            </div>


            <div className="pb-2 pt-2 flex flex-row justify-between border-b w-full sm:w-1/2">
              <div className="text-sm font-bold sm:w-1/3">Video View Limit</div>
              <div className="flex flex-col lg:flex-wrap lg:flex-row text-sm  sm:w-2/3  ">
                <span className="capitalize text-right md:text-left">{user.video_view_limit}</span>
              </div>
            </div>
            <div className="pb-2 pt-2 flex flex-row justify-between border-b w-full sm:w-1/2">
              <div className="text-sm font-bold sm:w-1/3">Video Consumed</div>
              <div className="flex flex-col lg:flex-wrap lg:flex-row text-sm  sm:w-2/3  ">
                <span className="capitalize text-right md:text-left">{user.video_count}</span>
              </div>
            </div>

            <div className="pb-2 pt-2 w-full border-b">
              <div className="text-sm font-bold w-full">User Addresses</div>
              <div className="text-sm ">
                <div className="w-full">
                  {user.addresses &&
                    user.addresses.map((address, i) => (
                      <div
                        className="flex items-start justify-start py-2 space-x-1 lg:space-x-4"
                        key={i}>
                        {/* <div className="flex-shrink-0 w-8">
                          <span className="lg:h-7 lg:w-7 w-6 h-6 bg-base text-white flex items-center justify-center rounded-full text-sm lg:text-lg font-display font-bold">
                            {i + 1}
                          </span>
                        </div> */}
                        <div className=" w-full">
                          <div className="text-sm font-bold">{address.address}</div>
                          <div className="text-sm">{address.city},  {address.state}, {address.pincode}, {address.country}</div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
            <div className="pb-2 pt-2 border-b w-full">
              <div className="text-sm font-bold w-full">Guardians</div>
              <div className="text-sm ">
                <div className="w-full">
                  {user.user_guardians &&
                    user.user_guardians.map((guardian, i) => (
                      <div
                        className="flex items-start justify-start py-2 space-x-1 lg:space-x-4"
                        key={i}>
                        {/* <div className="flex-shrink-0 w-8">
                          <span className="lg:h-7 lg:w-7 w-6 h-6 bg-base text-white flex items-center justify-center rounded-full text-sm lg:text-lg font-display font-bold">
                            {i + 1}
                          </span>
                        </div> */}
                        <div className=" w-full">
                          <div className="text-sm font-bold">{guardian.guardian_relation} : {guardian.guardian_name}</div>
                          <div className="text-sm">Occupation : {guardian.guardian_occupation}</div>
                          <div className="text-sm break-words">Email : {guardian.guardian_email}</div>
                          <div className="text-sm">Mobile Number : {guardian.guardian_mobile_number}</div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
            <div className="pb-2 pt-2 border-b w-full">
              <div className="text-sm font-bold w-full">Academic Details</div>
              <div className="text-sm ">
                <div className="w-full">
                  {user.academic_details &&
                    user.academic_details.map((academic_detail, i) => (
                      <div
                        className="flex items-start justify-start py-2 space-x-1 lg:space-x-4"
                        key={i}>
                        {/* <div className="flex-shrink-0 w-8">
                          <span className="lg:h-7 lg:w-7 w-6 h-6 bg-base text-white flex items-center justify-center rounded-full text-sm lg:text-lg font-display font-bold">
                            {i + 1}
                          </span>
                        </div> */}
                        <div className="  w-full">
                          <div className="text-sm font-bold">{academic_detail.degree} {academic_detail.institute}</div>
                          <div className="text-sm">Marks : {academic_detail.marks}</div>
                          <div className="text-sm">Passing year : {academic_detail.passing_year}</div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          </div>
        )
      },
      {
        index: 1,
        title: 'Logs',
        content: (
          <div className="py-4 w-full">
            {
              this.state.logs &&
              <Datatable
                columns={logs}
                data={this.state.logs}
                paginationClick={this.fetchByOffsetLog}
                pageSizedata={this.state.filterObject.logs.limit}
                pageIndexdata={(this.state.filterObject.logs.offset / this.state.filterObject.logs.limit)}
                pageCountData={this.state.totalCount.logs}
                baseTitle='Log'
                modelTitle='logs'
                queryTitle='logs'
                fetchList={this.fetchList}
                sectionRow={true}
                approvable={false}
                viewable={false}
                editable={false}
                deletable={false}
                status={false}
                sortable={false}
              />
            }
          </div>
        )
      },
      {
        index: 2,
        title: 'Notifications',
        content: (
          <div className="py-4 w-full">
            {
              this.state.notifications &&
              <Datatable
                columns={notifications}
                data={this.state.notifications}
                paginationClick={this.fetchByOffsetNotification}
                pageSizedata={this.state.filterObject.notifications.limit}
                pageIndexdata={(this.state.filterObject.notifications.offset / this.state.filterObject.notifications.limit)}
                pageCountData={this.state.totalCount.notifications}
                baseTitle='Notification'
                modelTitle='push-notifications'
                queryTitle='push_notifications'
                fetchList={this.fetchList}
                sectionRow={false}
                approvable={false}
                viewable={false}
                editable={false}
                deletable={false}
                status={false}
                sortable={false}
              />
            }

          </div>
        )
      },
      {
        index: 3,
        title: 'Messages',
        content: (
          <div className="py-4 w-full">
            <div className="py-4 w-full">
              {
                this.state.bulkSms &&
                <Datatable
                  columns={sms}
                  data={this.state.bulkSms}
                  paginationClick={this.fetchByOffsetSms}
                  pageSizedata={this.state.filterObject.sms.limit}
                  pageIndexdata={(this.state.filterObject.sms.offset / this.state.filterObject.sms.limit)}
                  pageCountData={this.state.totalCount.sms}
                  baseTitle='Bulk'
                  modelTitle='bulk-sms'
                  queryTitle='send_sms'
                  fetchList={this.fetchList}
                  sectionRow={false}
                  approvable={false}
                  viewable={false}
                  editable={false}
                  deletable={false}
                  status={false}
                  sortable={false}
                />
              }
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
                  sortable={false}
                />
              }
            </div>
          </div>
        )
      },
      {
        index: 5,
        title: 'Products In Cart',
        content: (
          <div className="py-4 w-full">
            <div className="py-4 w-full">
              {
                this.state.products &&
                <Datatable
                  columns={products}
                  data={this.state.products}
                  paginationClick={this.fetchByOffsetproducts}
                  pageSizedata={this.state.filterObject.products.limit}
                  pageIndexdata={(this.state.filterObject.products.offset / this.state.filterObject.products.limit)}
                  pageCountData={this.state.totalCount.products}
                  baseTitle='products'
                  modelTitle='carts'
                  queryTitle='carts'
                  fetchList={this.fetchList}
                  sectionRow={false}
                  approvable={false}
                  viewable={false}
                  editable={false}
                  deletable={false}
                  status={false}
                  sortable={false}
                />
              }
            </div>
          </div>
        )
      },
      {
        index: 6,
        title: 'Referral',
        content: (
          <div className="setting_tab">
            <div className="">
              <div className="admission_form">
                <div className="">
                  <div className="contact_form_wrapper mb-2">

                    {this.state.referralCode && <div className="leave_comment">
                      <div className="contact_form">
                        <div className="container">
                          <h5 className="my-2  text-center">User Referral Code</h5>
                          <button className="btn btn-default btn-rounded bg-base hover:bg-blue-600 text-white text-center m-auto block" ><h1>{this.state.referralCode.code}</h1></button>

                        </div>
                      </div>
                    </div>}
                    {
                      this.state.userReferrals && this.state.userReferrals.length > 0 && <>
                        <div className="table-responsive mt-4 w-full overflow-auto">
                          <table className="table table-striped">
                            <thead>
                              <tr>
                                <th scope="col">#</th>
                                <th scope="col">User name</th>
                                <th scope="col">Course Name</th>
                                <th scope="col">Price</th>
                                <th scope="col">Referrar Discount</th>
                                <th scope="col">Date</th>
                                <th scope="col">Applied Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {

                                this.state.userReferrals && this.state.userReferrals.map((refererOrder, index) => {
                                  return <tr>
                                    <th scope="row">{index + 1}</th>
                                    <th scope="row">{refererOrder.order.user.first_name} {refererOrder.order.user.last_name}</th>
                                    <td>
                                      {
                                        <table className="w-100">
                                          <tbody>
                                            {refererOrder.order.carts && refererOrder.order.carts.map((cart, index) => {
                                              return <tr style={{ backgroundColor: 'rgba(0,0,0,.05)' }}>
                                                <td>
                                                  {cart.product.name}
                                                </td>
                                                <td >
                                                  {/* {order.status == 'SUCCESS' && (cart.activated && cart.activated == true ? <span className="text-success">Activated</span> : <span className="text-danger">Expired</span>)} */}
                                                </td>
                                                <td >
                                                  {cart.referral_amount ? (cart.referral_discount_type == 'PERCENT' ? `₹ ${cart.finalReferralDiscount}  (${cart.referral_amount} % ${cart.referral_discount_amount_upto ? `Upto ₹ ${cart.referral_discount_amount_upto}` : ''})` : `₹ ${cart.referral_amount}`) : `₹ 0`}

                                                </td>
                                              </tr>

                                            })}
                                          </tbody>
                                        </table>
                                      }
                                    </td>
                                    <td>₹ {refererOrder.order.final_price}</td>
                                    <td>
                                      {refererOrder.discount ? (refererOrder.discount_type == 'PERCENT' ? ` ${refererOrder.discount}  %` : `₹ ${refererOrder.discount}`) : `₹ 0`}
                                    </td>
                                    <td>{moment(refererOrder.order.created_at).format('MMMM Do YYYY, h:mm:ss a')}</td>
                                    <td>{refererOrder.applied ? <h5 className="badge badge-success text-green-500 fold-bold">Applied</h5> : <h5 className="badge badge-danger text-red-500 fold-bold"> Not Applied</h5>}</td>

                                  </tr>
                                })
                              }
                            </tbody>
                          </table>
                        </div>
                      </>

                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      },
      {
        index: 7,
        title: 'Membership Orders',
        content: (
          <div className="py-4 w-full">
            <div className="py-4 w-full">
              {
                this.state.orders &&
                <Datatable
                  columns={membershipOrders}
                  data={this.state.membershipOrders}
                  paginationClick={this.fetchByOffsetOrder}
                  pageSizedata={this.state.filterObject.membershipOrders.limit}
                  pageIndexdata={(this.state.filterObject.membershipOrders.offset / this.state.filterObject.membershipOrders.limit)}
                  pageCountData={this.state.totalCount.membershipOrders}
                  baseTitle='Order'
                  modelTitle='membership-orders'
                  queryTitle='membership_orders'
                  fetchList={this.fetchList}
                  sectionRow={false}
                  approvable={false}
                  viewable={false}
                  editable={false}
                  deletable={false}
                  status={false}
                  sortable={false}
                />
              }
            </div>
          </div>
        )
      },
      {
        index: 8,
        title: 'Membership Requests',
        content: (
          <div className="flex flex-wrap">
            <div className="w-full p-4 ">
              <UnderlinedTabs tabs={membershipTabs} />
            </div>
          </div>
        )
      },


    ]


    {
      process.env.NEXT_PUBLIC_OTS_INTIGRATION == "true" && tabs.push({
        index: 9,
        title: 'Ots Subscription',
        content: (
          <div className="setting_tab">
            <div className="">
              <div className="admission_form">
                <div className="">
                  <div className="contact_form_wrapper mt-4 mb-2">
                    <div className="contact_form">
                      <div className="container">
                        <button className="btn btn-default btn-rounded bg-base hover:bg-blue-600 text-white text-center m-auto block" onClick={() => this.buildOtsModel(user)} >Add Subscription</button>

                      </div>
                    </div>

                    {
                      this.state.otsActiveSubscription && this.state.otsActiveSubscription.length > 0 && <>
                        <div className="table-responsive mt-4 w-full overflow-auto">
                          <table className="table table-striped w-full">
                            <thead>
                              <tr>
                                <th scope="col">#</th>
                                <th scope="col">Subscription name</th>
                                <th scope="col"  >Price</th>
                                <th scope="col"  >Date</th>
                                <th scope="col" className="float-right">Applied Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {

                                this.state.otsActiveSubscription && this.state.otsActiveSubscription.map((subscription, index) => {
                                  return <tr>
                                    <td >{index + 1}</td>
                                    <td  >{subscription.name}</td>

                                    <td >₹ {subscription.amount}</td>
                                    <td >{moment(subscription.paid_at).format('MMMM Do YYYY, h:mm:ss a')}</td>
                                    <td className="float-right">
                                      <span className=""
                                        onClick={() => {
                                          this.setState({
                                            deleteID: subscription.subscription_id,
                                            deleteModel: true
                                          })
                                        }}
                                      >
                                        <a title="Delete">
                                          <span className="h-8 w-8 bg-red-100 text-white flex items-center justify-center rounded-full text-lg font-display font-bold">
                                            <FiDelete size={16} className="stroke-current text-red-500" />
                                          </span>
                                        </a>
                                      </span>
                                    </td>

                                  </tr>
                                })
                              }
                            </tbody>
                          </table>
                        </div>
                      </>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })
    }

    {
      this.state.allowQuickTest == 'YES' && tabs.push({
        index: 10,
        title: 'Quick Tests',
        content: (
          <div className="py-4 w-full">

            <div className="py-4 w-full">
              {
                this.state.quickTests &&
                <Datatable
                  columns={quickTests}
                  data={this.state.quickTests}
                  paginationClick={this.fetchByOffsetquickTest}
                  pageSizedata={this.state.filterObject.quickTests.limit}
                  pageIndexdata={(this.state.filterObject.quickTests.offset / this.state.filterObject.quickTests.limit)}
                  pageCountData={this.state.totalCount.quickTests}
                  baseTitle='Quick Tests'
                  modelTitle='tests'
                  queryTitle='tests'
                  fetchList={this.fetchList}
                  sectionRow={false}
                  approvable={false}
                  viewable={false}
                  editable={false}
                  deletable={false}
                  status={false}
                  sortable={false}
                />
                || <div className="text-center lg:mb-10 mb-4 mt-20">
                  <img className="w-1/4 lg:w-1/5 mx-auto block" src="/images/search.png"></img>
                  <h5 className="font-bold">No Data Available</h5>
                  <p className="text-gray-400 mt-1">There is no data available in the table.</p>
                </div>
              }
            </div>
          </div>
        )
      })
    }

    {
      this.state.allowAssessementTest == 'YES' && tabs.push({
        index: 11,
        title: 'Assessment Tests',
        content: (
          <div className="py-4 w-full">
            {this.state.assessmentResults && this.state.assessmentResults.tests && <div className='flex my-2'>
              <div className='border-r  px-5'>
                <h5 className='text-gray-500 mb-3'>
                  Total Questions
                </h5>
                <h1 className=''>
                  <b>{this.state.totalCount.assessmentResults}</b>
                </h1>
              </div>
              <div className='border-r  px-5'>
                <h5 className='text-gray-500 mb-3'>
                  Correct Answer
                </h5>
                <h1 className=''>
                  <b>{this.state.assessmentResults.rightAnswer}</b>
                </h1>
              </div>
              <div className='border-r  px-5'>
                <h5 className='text-gray-500 mb-3'>
                  Wrong Answer
                </h5>
                <h1 className=''>
                  <b>{this.state.totalCount.assessmentResults - this.state.assessmentResults.rightAnswer}</b>
                </h1>
              </div>

            </div>}
            <div className="py-4 w-full">
              {
                this.state.assessmentResults && this.state.assessmentResults.tests &&
                <Datatable
                  columns={assessmentResults}
                  data={this.state.assessmentResults.tests}
                  pageSizedata={this.state.totalCount.assessmentResults}
                  pageIndexdata={(this.state.filterObject.assessmentResults.offset / this.state.totalCount.assessmentResults)}
                  pageCountData={this.state.totalCount.assessmentResults}
                  baseTitle='assessmentResults'
                  modelTitle='assessmentResults'
                  queryTitle='assessmentResults'
                  fetchList={this.fetchList}
                  sectionRow={false}
                  approvable={false}
                  viewable={false}
                  editable={false}
                  deletable={false}
                  status={false}
                  sortable={false}
                />
                || <div className="text-center lg:mb-10 mb-4 mt-20">
                  <img className="w-1/4 lg:w-1/5 mx-auto block" src="/images/search.png"></img>
                  <h5 className="font-bold">No Data Available</h5>
                  <p className="text-gray-400 mt-1">There is no data available in the table.</p>
                </div>
              }
            </div>
          </div>
        )
      })
    }

    {
      this.state.allowSelfAssessementTest == 'YES' && tabs.push({
        index: 12,
        title: 'Self Assessment Tests',
        content: (
          <div className="py-4 w-full">
            {this.state.selfAssessmentResults && this.state.selfAssessmentResults.tests && <div className='flex my-2'>
              <div className='border-r  px-5 mr-5'>
                <h5 className='text-gray-500 mb-3'>
                  Total Questions
                </h5>
                <h1 className=''>
                  <b>{this.state.totalCount.selfAssessmentResults}</b>
                </h1>
              </div>
              <div className='border-r  px-5 mr-5'>
                <h5 className='text-gray-500 mb-3'>
                  User Marks
                </h5>
                <h1 className=''>
                  <b>{this.state.selfAssessmentResults.finalMarks}</b>
                </h1>
              </div>
              <div className='border-r  px-5 mr-5'>
                <h5 className='text-gray-500 mb-3'>
                  Total Marks
                </h5>
                <h1 className=''>
                  <b>{this.state.selfAssessmentResults.totalMarks}</b>
                </h1>
              </div>

            </div>}

            <div className="py-4 w-full">
              {
                this.state.selfAssessmentResults && this.state.selfAssessmentResults.tests &&
                <Datatable
                  columns={selfAssessmentResults}
                  data={this.state.selfAssessmentResults.tests}
                  pageSizedata={this.state.totalCount.selfAssessmentResults}
                  pageIndexdata={(this.state.filterObject.selfAssessmentResults.offset / this.state.totalCount.selfAssessmentResults)}
                  pageCountData={this.state.totalCount.selfAssessmentResults}
                  baseTitle='selfAssessmentResults'
                  modelTitle='selfAssessmentResults'
                  queryTitle='selfAssessmentResults'
                  fetchList={this.fetchList}
                  sectionRow={false}
                  approvable={false}
                  viewable={false}
                  editable={false}
                  deletable={false}
                  status={false}
                  sortable={false}
                /> || <div className="text-center lg:mb-10 mb-4 mt-20">
                  <img className="w-1/4 lg:w-1/5 mx-auto block" src="/images/search.png"></img>
                  <h5 className="font-bold">No Data Available</h5>
                  <p className="text-gray-400 mt-1">There is no data available in the table.</p>
                </div>
              }
            </div>
          </div>
        )
      })
    }


    return (
      <>
        {
          this.state.data && this.state.data.user &&
          <>
            <SectionTitle title="user" subtitle={`${user.first_name} ${user.last_name}`} hideButton={true} />
            {
              this.state.showOtsModel &&
              <StoreModel
                title="Sync User"
                body={
                  <div>
                    {
                      this.state.otsStoreFields && this.state.otsStoreFields != {} && <Validation items={Object.values(this.state.otsStoreFields)} onSubmit={this.syncUser} alerts={false} />
                    }

                  </div>
                }
                useModel={this.state.showOtsModel}
                hideModal={this.changeOtsModelStatus}
              />

            }


            {this.state.deleteModel && <DeleteModel
              title="Delete"
              icon={
                <span className="h-10 w-10 bg-red-100 text-white flex items-center justify-center rounded-full text-lg font-display font-bold">
                  <FiX size={18} className="stroke-current text-red-500" />
                </span>
              }
              body={
                <div className="text-sm text-gray-500">
                  Are you sure you want to delete ?
                </div>
              }
              buttonTitle="Delete"
              buttonClassName="btn btn-default btn-rounded bg-red-500 hover:bg-red-600 text-white"
              useModel={this.state.deleteModel}
              hideModal={() => this.setState({
                deleteModel: false
              })}
              onClick={this.deleteSubscription}
            />
            }

            <Widget
              title=""
              description=''>

              <div className="flex flex-row items-center justify-start p-4">
                <div className="flex-shrink-0 w-12 h-12 lg:w-16 lg:h-16 ">
                  {user.image === "/images/default-profile.jpg" &&
                    <div className="profile_image profile_image-0 w-12 h-12 lg:w-16 lg:h-16 text-lg lg:text-2xl flex items-center justify-center font-bold uppercase">
                      {`${user.first_name.charAt(0)}`}
                    </div>
                    ||
                    <img
                      src={user.image}
                      alt={window.localStorage.getItem('defaultImageAlt')}
                      className="shadow rounded-full  ring mb-2"
                    />
                  }
                </div>
                <div className="py-2 px-2 pl-4">
                  <p className="text-base font-bold md:whitespace-nowrap">{user.first_name} {user.last_name}</p>
                  <p className="text-sm text-gray-500 md:whitespace-nowrap break-words">
                    {user.email}
                  </p>
                  <p className="text-sm text-gray-500 md:whitespace-nowrap">
                    {user.mobile_number}
                  </p>
                </div>
                <div className="ml-auto flex-shrink-0 space-x-2 hidden lg:flex items-center">
                  <Switch initialState={user.is_active == 1 ? true : false} color='green' offColor="red" id={user.id} onChange={this.changeStatus} />
                  <button className="btn btn-default btn-rounded bg-base hover:bg-blue-600 text-white" onClick={() => this.resetUuid()}>
                    Reset Mobile Device ID
                  </button>
                  <button className="btn btn-default btn-rounded bg-base hover:bg-blue-600 text-white" onClick={() => this.resetMachineId()}>
                    Reset System Device ID
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap">
                <div className="w-full lg:p-4 tab-border">
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
