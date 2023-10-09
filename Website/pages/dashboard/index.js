import Widget1 from 'components/functional-ui/dashboard/widget-1'
import Section from 'components/functional-ui/dashboard/section'
import { Bar1 } from 'components/functional-ui/dashboard/bar-chart'
import SectionTitle from 'components/functional-ui/section-title'
import Datatable from 'components/functional-ui/datatable'
import GraphShimmer from 'components/website/shimmer/graph-shimmer'
import ProfileShimmer from 'components/website/shimmer/profile-shimmer'
import Shimmer from 'components/website/shimmer/datatable'
import { FiActivity, FiUsers, FiExternalLink, FiClock, FiBarChart, FiDatabase, FiTag } from 'react-icons/fi'
import { Donut1 } from 'components/functional-ui/dashboard/donut-chart'
import { List } from 'components/functional-ui/dashboard/list'
import { Badge } from 'components/functional-ui/badges'
import { Line1 } from 'components/functional-ui/dashboard/line-chart'
import Dropdown from 'components/functional-ui/widgets/dropdown-2'
// import  serviceAccount from 'src/json/serviceAccountKey.json'

import { fetchAll, updateAdditional, get } from 'helpers/apiService';
import { Component } from 'react';
import moment from 'moment';

export default class Index extends Component {

  constructor(props) {
    super(props);
  }

  state = {
    cloak: null,
    avatar: null,
    loggedInUser: null,
    notifications: [],
    notifications: [],
    graphData: null,
    isNotification: false,
    counts: {},
    graphFilter: {
      conversions: {
        format: 'monthly',
        month: moment().format("YYYY-MM"),
        year: moment().format("YYYY")
      },
      packageType: {
        format: 'all',
        month: moment().format("YYYY-MM"),
        year: moment().format("YYYY")
      },
      productType: {
        format: 'all',
        month: moment().format("YYYY-MM"),
        year: moment().format("YYYY")
      },
    },
    years: [moment().format("YYYY")]

  }

  url = `/dashboard/${this.props.back}`

  fetchData = async () => {


    let data = await fetchAll('users', { limit: 10 })
    this.setState({ ...data })

    data = await fetchAll('orders', { limit: 10, orderBy: 'DESC', 'forList': true })
    this.setState({ ...data })

    data = await fetchAll('raise-tickets', { limit: 5, orderBy: 'DESC' })
    this.setState({ ...data })


    data = await updateAdditional('count-all', 'users');
    let userCount = data.totalCount

    data = await updateAdditional('count-all', 'products', { 'is_active': true })
    let productCount = data.totalCount

    data = await updateAdditional('count-all', 'orders', { 'status': 'SUCCESS' })
    let orderCount = data.totalCount

    data = await updateAdditional('count-all', 'orders', { 'status': 'SUCCESS', 'sum': 'final_price' })
    let revenueCount = data.totalCount

    data = await get('graphs/users-orders', { ...this.state.graphFilter.conversions })
    let graphData = data.graphData

    this.setState({
      counts: {
        userCount: userCount,
        productCount: productCount,
        orderCount: orderCount,
        revenueCount: revenueCount ? revenueCount : 0,
      },
      graphData: graphData,
      years: data.years
    })

  }



  getConversions = async () => {

    let data = await get('graphs/users-orders', { ...this.state.graphFilter.conversions })
    let graphData = data.graphData

    this.setState({
      graphData: graphData
    })

  }




  componentDidMount = async () => {
    this.fetchData();
  }

  render() {
    const { children, router } = this.props

    const dataColumns = [

      {
        Header: '#Order',
        Cell: props => {
          return (
            <span className="">{props.row.original.order_number}</span>
          )
        },
      },

      {
        Header: 'Product',
        Cell: props => {
          return (
            <table className="w-full">
              <tbody>
                {props.row.original.carts.map(cart => {
                  return <tr style={{ borderBottom: '1px solid rgba(0,0,0,.05)' }}>
                    <td className="w-2/4">
                      <b>{cart.product.name}</b>
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
            <div className={`form-element form-element-inline `}>
              <div className={` text-white border-0 text-center rounded w-20 py-1 ${props.row.original.status == 'SUCCESS' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`} >
                {props.row.original.status}
              </div>
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
            <>
              <p className="">{moment(props.row.original.created_at).format('MMMM Do YYYY')}</p>
              <p className="">{moment(props.row.original.created_at).format('h:mm a')}</p>
            </>
          )
        },
      },
    ]

    return (
      <>
        {/* <Notification /> */}
        {/* <SectionTitle title="Welcome to the EduPlus+" subtitle="Dashboard" hideButton={true} /> */}
        {
          this.state.counts &&
          <div className="flex flex-row w-full space-x-2 space-y-0 mb-2 lg:mb-4 overflow-auto">
            {/*widget*/}
            <div className="w-3/4 lg:w-1/4 flex-shrink-0  ">
              <Widget1
                title="Total Users"
                description={<div className={!this.state.counts.userCount && 'border-shimmer animateShimmer mt-4 p-2'}>{this.state.counts.userCount && this.state.counts.userCount}</div>}
                right={
                  <FiUsers size={24} className="stroke-current text-gray-500" />
                }
              />
            </div>
            {/*widget*/}
            <div className="w-3/4 lg:w-1/4 flex-shrink-0  ">
              <Widget1
                title="Total Orders"
                description={<div className={!this.state.counts.userCount && 'border-shimmer animateShimmer mt-4 p-2'}>{this.state.counts.orderCount && this.state.counts.orderCount}</div>}
                right={
                  <FiDatabase size={24} className="stroke-current text-gray-500" />
                }
              />
            </div>
            {/*widget*/}
            <div className="w-3/4 lg:w-1/4 flex-shrink-0  ">
              <Widget1
                title="Revenue Generated"
                description={<div className={!this.state.counts.userCount && 'border-shimmer animateShimmer mt-4 p-2'}>{this.state.counts.revenueCount && `₹ ${this.state.counts.revenueCount}`}</div>}
                right={
                  <FiBarChart
                    size={24}
                    className="stroke-current text-gray-500"
                  />
                }
              />
            </div>
            {/*widget*/}
            <div className="w-3/4 lg:w-1/4 flex-shrink-0  ">
              <Widget1
                title="Total Products"
                description={<div className={!this.state.counts.productCount && 'border-shimmer animateShimmer mt-4 p-2' || ' '}>{this.state.counts.productCount && this.state.counts.productCount}</div>}
                right={
                  <FiTag size={24} className="stroke-current text-gray-500" />
                }
              />
            </div>
          </div>


        }

        <div className="flex flex-col lg:flex-row w-full lg:space-x-2  lg:space-y-0  lg:mb-4">
          <div className="w-full lg:w-2/3 mb-2 md:mb-0">
            <Section
              title="Conversions"
              description={<span>Users vs Sales</span>}
              right={
                <div>
                  <select className="rounded border-b-1 p-1 px-8 font-13 bg-transparent float-right mb-2 ml-2" onChange={(e) => {

                    if (e.target.value != 'custom') {
                      this.setState({
                        graphFilter: {
                          ...this.state.graphFilter,
                          conversions: {
                            ...this.state.graphFilter.conversions,
                            format: e.target.value,
                            month: moment().format("YYYY-MM"),
                            year: moment().format("YYYY")
                          }
                        },
                      }, () => {
                        this.getConversions()
                      })
                    } else {
                      this.setState({
                        customdate: true
                      })
                    }
                  }}>
                    <option selected={this.state.graphFilter && this.state.graphFilter.conversions && this.state.graphFilter.conversions.format == 'yearly' ? true : false} value="yearly">Yearly</option>
                    <option selected={this.state.graphFilter && this.state.graphFilter.conversions && this.state.graphFilter.conversions.format == 'monthly' ? true : false} value="monthly">Monthly</option>
                    <option selected={this.state.graphFilter && this.state.graphFilter.conversions && this.state.graphFilter.conversions.format == 'daily' ? true : false} value="daily">Daily</option>
                  </select>

                  {this.state.graphFilter && this.state.graphFilter.conversions && this.state.graphFilter.conversions.format == 'monthly' &&


                    <select className="rounded border-b-1 p-1 px-8  font-13 bg-transparent float-right" onChange={(e) => {

                      if (e.target.value != 'custom') {
                        this.setState({
                          graphFilter: {
                            ...this.state.graphFilter,
                            conversions: {
                              ...this.state.graphFilter.conversions,
                              year: e.target.value,
                            }
                          },
                        }, () => {
                          this.getConversions()
                        })
                      } else {
                        this.setState({
                          customdate: true
                        })
                      }
                    }}>

                      {
                        this.state.years && this.state.years.map(year => {
                          return <option selected={this.state.graphFilter && this.state.graphFilter.conversions && this.state.graphFilter.conversions.year == year ? true : false} value={year}>{year}</option>
                        })
                      }
                    </select>
                  }
                  {
                    this.state.graphFilter && this.state.graphFilter.conversions && this.state.graphFilter.conversions.format == 'daily' && <input className="border-0 border-b py-1 font-13 year-only float-right md:mr-2  px-0" type="month" value={this.state.graphFilter && this.state.graphFilter.conversions && this.state.graphFilter.conversions.month} onChange={(e) => {


                      this.setState({
                        graphFilter: {
                          ...this.state.graphFilter,
                          conversions: {
                            ...this.state.graphFilter.conversions,
                            month: e.target.value,
                          }
                        },

                      }, () => {
                        this.getConversions()
                      })
                    }} />
                  }
                </div>
              }
            >
              <div className="flex flex-row w-full">
                {this.state.graphData && <Bar1 graphData={this.state.graphData} /> || <GraphShimmer />}
              </div>
            </Section>
          </div>
          <div className="w-full lg:w-1/3 mb-2">
            <Section
              title="Package Type"
              description={<span>Sales Graph</span>}
              right={
                <div>
                  <select className="rounded border-b-1 p-1 px-8 mb-2 font-13 bg-transparent float-right ml-2" onChange={(e) => {

                    if (e.target.value != 'custom') {
                      this.setState({
                        graphFilter: {
                          ...this.state.graphFilter,
                          packageType: {
                            ...this.state.graphFilter.packageType,
                            format: e.target.value,
                            month: moment().format("YYYY-MM"),
                            year: moment().format("YYYY")
                          }
                        },
                      }, () => {
                        // this.getpackageType()
                      })
                    } else {
                      this.setState({
                        customdate: true
                      })
                    }
                  }}>
                    <option selected={this.state.graphFilter && this.state.graphFilter.packageType && this.state.graphFilter.packageType.format == 'all' ? true : false} value="all">All</option>
                    <option selected={this.state.graphFilter && this.state.graphFilter.packageType && this.state.graphFilter.packageType.format == 'yearly' ? true : false} value="yearly">Yearly</option>
                    <option selected={this.state.graphFilter && this.state.graphFilter.packageType && this.state.graphFilter.packageType.format == 'monthly' ? true : false} value="monthly">Monthly</option>
                  </select>

                  {this.state.graphFilter && this.state.graphFilter.packageType && this.state.graphFilter.packageType.format == 'yearly' &&


                    <select className="rounded border-b-1 p-1 px-8  font-13 bg-transparent float-right" onChange={(e) => {

                      if (e.target.value != 'custom') {
                        this.setState({
                          graphFilter: {
                            ...this.state.graphFilter,
                            packageType: {
                              ...this.state.graphFilter.packageType,
                              year: e.target.value,
                            }
                          },
                        }, () => {
                          // this.getpackageType()
                        })
                      } else {
                        this.setState({
                          customdate: true
                        })
                      }
                    }}>

                      {
                        this.state.years && this.state.years.map(year => {
                          return <option selected={this.state.graphFilter && this.state.graphFilter.packageType && this.state.graphFilter.packageType.year == year ? true : false} value={year}>{year}</option>
                        })
                      }
                    </select>
                  }
                  {
                    this.state.graphFilter && this.state.graphFilter.packageType && this.state.graphFilter.packageType.format == 'monthly' && <input className="border-0 border-b py-1 font-13 year-only float-right px-0 " type="month" value={this.state.graphFilter && this.state.graphFilter.packageType && this.state.graphFilter.packageType.month} onChange={(e) => {


                      this.setState({
                        graphFilter: {
                          ...this.state.graphFilter,
                          packageType: {
                            ...this.state.graphFilter.packageType,
                            month: e.target.value,
                          }
                        },

                      }, () => {
                        // this.getpackageType()
                      })
                    }} />
                  }
                </div>
              }
            >
              <div className="flex flex-row w-full">
                {this.state.graphFilter.packageType && <Donut1 url="orders/revenue-by-type" query={this.state.graphFilter.packageType} />}
              </div>
            </Section>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row w-full lg:space-x-2  lg:space-y-0 lg:mb-4">
          <div className="w-full lg:w-1/2 mb-2 md:mb-0 raise-height">
            <Section
              title="Raise Tickets"
              description={<span>Latest Enquiries</span>}
            >
              <div className="flex flex-row w-full overflow-y-scroll h-60">
                <div className="w-full mb-4">
                  {this.state.raiseTickets && this.state.raiseTickets.map((ticket, i) => (
                    <div className="flex items-center justify-start p-2 space-x-4" key={i}>
                      <div className="flex-shrink-0 w-8">
                        <span className="h-8 w-8 bg-base text-white flex items-center justify-center rounded-full text-lg font-display font-bold">
                          {i + 1}
                        </span>
                      </div>
                      <div className="flex flex-col w-5/6">
                        <div className="text-sm font-bold">{`${ticket.name}`}</div>
                        <div className="text-sm truncate ">{ticket.query}</div>
                        <div className="flex flex-row">
                          {/* <ProgressBar width={item.progress} color={item.color} /> */}
                          <span className="text-gray-500 whitespace-nowrap">{moment(ticket.created_at).fromNow()}</span>
                        </div>
                      </div>
                    </div>
                  )) || <ProfileShimmer />}
                </div>
              </div>
            </Section>
          </div>
          <div className="w-full lg:w-1/2  mb-2">
            <Section
              title="Product Type"
              description={<span>Sales Graph</span>}
              right={
                <div>
                  <select className="rounded border-b-1 p-1 px-8 ml-2 mb-2 font-13 bg-transparent float-right" onChange={(e) => {

                    if (e.target.value != 'custom') {
                      this.setState({
                        graphFilter: {
                          ...this.state.graphFilter,
                          productType: {
                            ...this.state.graphFilter.productType,
                            format: e.target.value,
                            month: moment().format("YYYY-MM"),
                            year: moment().format("YYYY")
                          }
                        },
                      }, () => {
                        // this.getproductType()
                      })
                    } else {
                      this.setState({
                        customdate: true
                      })
                    }
                  }}>
                    <option selected={this.state.graphFilter && this.state.graphFilter.productType && this.state.graphFilter.productType.format == 'all' ? true : false} value="all">All</option>
                    <option selected={this.state.graphFilter && this.state.graphFilter.productType && this.state.graphFilter.productType.format == 'yearly' ? true : false} value="yearly">Yearly</option>
                    <option selected={this.state.graphFilter && this.state.graphFilter.productType && this.state.graphFilter.productType.format == 'monthly' ? true : false} value="monthly">Monthly</option>
                  </select>

                  {this.state.graphFilter && this.state.graphFilter.productType && this.state.graphFilter.productType.format == 'yearly' &&


                    <select className="rounded border-b-1 p-1 px-8  font-13 bg-transparent float-right" onChange={(e) => {

                      if (e.target.value != 'custom') {
                        this.setState({
                          graphFilter: {
                            ...this.state.graphFilter,
                            productType: {
                              ...this.state.graphFilter.productType,
                              year: e.target.value,
                            }
                          },
                        }, () => {
                          // this.getproductType()
                        })
                      } else {
                        this.setState({
                          customdate: true
                        })
                      }
                    }}>

                      {
                        this.state.years && this.state.years.map(year => {
                          return <option selected={this.state.graphFilter && this.state.graphFilter.productType && this.state.graphFilter.productType.year == year ? true : false} value={year}>{year}</option>
                        })
                      }
                    </select>
                  }
                  {
                    this.state.graphFilter && this.state.graphFilter.productType && this.state.graphFilter.productType.format == 'monthly' && <input className="border-0 border-b py-1 font-13 year-only float-right px-0  md:mr-2" type="month" value={this.state.graphFilter && this.state.graphFilter.productType && this.state.graphFilter.productType.month} onChange={(e) => {


                      this.setState({
                        graphFilter: {
                          ...this.state.graphFilter,
                          productType: {
                            ...this.state.graphFilter.productType,
                            month: e.target.value,
                          }
                        },

                      }, () => {
                        // this.getproductType()
                      })
                    }} />
                  }
                </div>
              }
            >
              <div className="flex flex-row w-full">
                {this.state.graphFilter.productType && <Donut1 url="orders/revenue-by-product-type" query={this.state.graphFilter.productType} />}
              </div>
            </Section>
          </div>
        </div>

        <div className="w-full lg:space-x-2  lg:space-y-0 mb-2 lg:mb-4">
          <Section
            title="Recent"
            description={<span>Orders</span>}>
            <div className="flex flex-col w-full">
              <div className="overflow-x-scroll lg:overflow-hidden">
                {
                  this.state.orders &&
                  <Datatable
                    columns={dataColumns}
                    data={this.state.orders}
                    pageSizedata={10}
                    sectionRow={true}
                    baseTitle="Order"
                    modelTitle='orders'
                    queryTitle='orders'
                    editable={false}
                    viewable={false}
                    deletable={false}
                    pagination={false}
                    sectionRow={false}
                    approvable={false}
                    status={false}
                    sortable={false}
                  /> || <Shimmer />
                }
              </div>
            </div>
          </Section>
        </div>


        {/* <div className="flex flex-col lg:flex-row w-full lg:space-x-2  lg:space-y-0 mb-2 lg:mb-4">
                    <div className="w-full lg:w-1/2">
                        <Section
                            title="Project status"
                            description={<span>This week</span>}
                            right={<Dropdown />}>
                            <div className="flex flex-row w-full">
                                <List />
                            </div>
                        </Section>
                    </div>
                    <div className="w-full lg:w-1/2">
                        <Section
                            title="Sales"
                            description={<span>This month</span>}
                            right={<Dropdown />}
                            >
                            <div className="flex flex-row w-full">
                                <Line1 />
                            </div>
                        </Section>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row w-full lg:space-x-2  lg:space-y-0 mb-2 lg:mb-4">
                    <div className="w-full lg:w-1/3">
                        <Section
                            title="Activities"
                            description={<span>Today</span>}
                            right={<Dropdown />}>
                            <div className="flex flex-row w-full">
                                <Timeline1 />
                            </div>
                        </Section>
                    </div>
                    <div className="w-full lg:w-2/3">
                        <Section
                            title="To do"
                            description={<span>In progress</span>}
                            right={<Dropdown />}>
                            <div className="flex flex-row w-full">
                                <Tasks />
                            </div>
                        </Section>
                    </div>
                </div> */}
      </>
    )
  }

}


