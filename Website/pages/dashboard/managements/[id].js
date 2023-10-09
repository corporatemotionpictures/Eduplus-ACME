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
import { MdVerifiedUser, MdWarning } from 'react-icons/md'
import Switch from 'components/functional-ui/switch'
import { multiLine, DoubleLine } from 'components/functional-ui/lists'
import Link from 'next/link';
import toastr from 'toastr'
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
    modelTitle: 'managements',
    logs: [],
    notifications: [],
    bulkSms: [],
    orders: [],
    filterObject: {
      products: {
        limit: 10,
        offset: 0
      },
      notifications: {
        limit: 10,
        offset: 0
      },
    },
    totalCount: {}
  }

  // 
  static getInitialProps({ query }) {
    return query;
  }

  // Function for fetch data
  fetchList = async (id) => {

    let filter = {
      ...this.state.filterObject.notifications,
      userID: id
    }
    let data = await fetchAll('notifications', filter);
    this.setState({ notifications: data.notifications })

    data = await updateAdditional('count-all', 'admin_notifications', { 'reciever_id': id });
    this.setState({
      totalCount: {
        notifications: data.totalCount
      }
    })


  }

  // Function for fetch data
  fetchData = async (id) => {
    var data = await fetchByID(this.state.modelTitle, id, { noLog: true });
    this.setState({ data })
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

    var update = await updateAdditional('change-status', 'users', data)

    if (update.success == true) {
      toastr.success('Status change Successfull')
    }
  }

  // Fetch data by offset
  fetchByOffsetNotification = async (offset, limit) => {
    var filters = this.state.filterObject.notifications;
    if ((offset || offset == 0) && limit) {
      this.setState({ fetching: true })
      var data;
      this.setState({
        filters: {
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

  randerHtml = (html) => {
    return html
  }

  // 
  render() {
    const user = (this.state.data && this.state.data.user) ? this.state.data.user : {}


    const notifications = [
      {
        Header: 'Notification',
        Cell: props => {
          return <div >  {this.randerHtml(props.row.original.notification)} </div>
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

    const tabs = [
      {
        index: 0,
        title: 'Account settings',
        content: (
          <div className="py-4 w-full flex flex-col sm:flex-wrap sm:flex-row">
            <div className="pb-2 flex flex-row items-center border-b w-full sm:w-1/2">
              <div className="text-sm font-bold w-1/3">Name</div>
              <div className="text-sm pt-1 w-2/3 text-right md:text-left">
                <span className="capitalized">{user.first_name} {user.last_name}</span>
              </div>
            </div>
            <div className="pb-2 flex flex-row items-center border-b w-full sm:w-1/2">
              <div className="text-sm font-bold w-1/3">Type</div>
              <div className="text-sm pt-1 w-2/3 text-right md:text-left">
                <span className="capitalized">{user.type}</span>
              </div>
            </div>
            <div className="pb-2 flex flex-row items-center border-b w-full sm:w-1/2">
              <div className="text-sm font-bold w-1/3">Email</div>
              <div className="text-sm pt-1 w-2/3 text-right md:text-left">
                <span className="capitalized break-words">{user.email}</span>
              </div>
            </div>
            <div className="pb-2 pt-2 flex flex-row justify-between border-b w-full sm:w-1/2">
              <div className="text-sm font-bold sm:w-1/3">Email Status</div>
              <div className="flex flex-col lg:flex-wrap lg:flex-row text-sm  sm:w-2/3  ">
                <span className="capitalize text-right md:text-left">{user.is_email_verified == 1 ? <div className="flex flex-row items-center"><MdVerifiedUser className="w-8 text-green-500" /> Verified</div> : <div className="flex flex-row items-center"><MdWarning className="w-8 text-red-500" />Verification Pending</div>}</span>
              </div>
            </div>
            <div className="pb-2 flex flex-row  items-center border-b w-full sm:w-1/2">
              <div className="text-sm font-bold w-1/3">Mobile Number</div>
              <div className="text-sm pt-1 w-2/3 text-right md:text-left">
                <span className="capitalized">{user.mobile_number}</span>
              </div>
            </div>

            <div className="pb-2 pt-2 flex flex-row justify-between border-b w-full sm:w-1/2">
              <div className="text-sm font-bold sm:w-1/3">Mobile Status</div>
              <div className="flex flex-col lg:flex-wrap lg:flex-row text-sm  sm:w-2/3  ">
                <span className="capitalize text-right md:text-left">{user.is_mobile_verified == 1 ? <div className="flex flex-row items-center"><MdVerifiedUser className="w-8 text-green-500" /> Verified</div> : <div className="flex flex-row items-center"><MdWarning className="w-8 text-red-500" />Verification Pending</div>}</span>
              </div>
            </div>
            <div className="pb-2 flex flex-row  items-center border-b w-full sm:w-1/2">
              <div className="text-sm font-bold w-1/3">Designation</div>
              <div className="text-sm pt-1 w-2/3 text-right md:text-left">
                <span className="capitalized">{user.designation}</span>
              </div>
            </div>


            <div className="pb-2 flex flex-row  items-center border-b w-full sm:w-1/2">
              <div className="text-sm font-bold w-1/3">Date Of Birth</div>
              <div className="text-sm pt-1 w-2/3 text-right md:text-left">
                <span className="capitalized">{user.dob}</span>
              </div>
            </div>
            <div className="pb-2 flex flex-row items-center border-b w-full sm:w-1/2">
              <div className="text-sm font-bold w-1/3">Gender</div>
              <div className="text-sm pt-1 w-2/3 text-right md:text-left">
                <span className="capitalized">{user.gender}</span>
              </div>
            </div>
            <div className="pb-2 flex flex-row items-center border-b w-full sm:w-1/2">
              <div className="text-sm font-bold w-1/3">Category</div>
              <div className="text-sm pt-1 w-2/3 text-right md:text-left">
                <span className="capitalized">{user.category}</span>
              </div>
            </div>
            {user.type == 'FACULTY' && <div className="pb-2 border-b w-full">
              <div className="text-sm font-bold w-full">Subjects</div>
              <div className="text-sm pt-1">
                <div className="w-full mb-4 flex flex-col sm:flex-wrap sm:flex-row">
                  {user.subjects &&
                    user.subjects.map((subject, i) => (
                      <div
                        className="w-1/4  items-start justify-start md:p-2 py-2 space-x-1 md:space-x-2 items-center"
                        key={i}>
                        <li className="text-sm w-full">{subject.name}</li>

                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
            }<div className="pb-2 border-b w-full">
              <div className="text-sm font-bold w-full">Permitted Modules </div>
              <div className="text-sm pt-1">
                <div className="w-full mb-4 flex flex-col sm:flex-wrap sm:flex-row">
                  {user.modules &&
                    user.modules.map((module, i) => (
                      <div
                        className="w-1/4  items-start justify-start md:p-2 py-2 space-x-1 md:space-x-2 items-center"
                        key={i}>
                        <li className="text-sm w-full">{module.title}</li>

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
                modelTitle='notifications'
                queryTitle='notifications'
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
    ]

    return (
      <>
        {
          this.state.data && this.state.data.user &&
          <>
            <SectionTitle title="user" subtitle={`${user.first_name} ${user.last_name}`} hideButton={true} />

            <Widget
              title=""
              description=''>

              <div className="flex flex-row items-center justify-start p-4">
                <div className="flex-shrink-0 w-12 h-12 lg:w-16 lg:h-16 mr-4">
                  {user.image === "/images/default-profile.jpg" &&
                    <div className="profile_image w-12 h-12 lg:w-16 lg:h-16 text-lg lg:text-2xl flex items-center justify-center font-bold uppercase">
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
                <div className="py-2 px-2">
                  <p className="text-base font-bold md:whitespace-nowrap">{user.first_name} {user.last_name}</p>
                  <p className="text-sm text-gray-500 md:whitespace-nowrap break-words">
                    {user.email}
                  </p>
                  <p className="text-sm text-gray-500 md:whitespace-nowrap">
                    {user.mobile_number}
                  </p>
                  {/* <div className="flex flex-row items-center justify-start w-full py-1 space-x-2">
                    <FiTwitter className="stroke-current text-xl text-twitter" />
                    <FiFacebook className="stroke-current text-xl text-facebook" />
                    <FiInstagram className="stroke-current text-xl text-instagram" />
                  </div> */}
                </div>
                <div className="ml-auto flex-shrink-0 space-x-2 hidden lg:flex">
                  <Switch initialState={user.is_active == 1 ? true : false} color='green' offColor="red" id={user.id} onChange={this.changeStatus} />

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
