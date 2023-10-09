import { FiSettings, FiMenu, FiMoreVertical } from 'react-icons/fi'
import AppsDropdown from './dropdown-1'
import FlagsDropdown from './dropdown-2'
import NotificationDropdown from './dropdown-3'
import StatusDropdown from './dropdown-4'
import ProfileDropdown from './dropdown-5'
import ExploreDropdown from './dropdown-6'
import Search from './search'
import config from 'helpers/redux/reducers/config'
import Link from 'next/link'
import { get } from 'helpers/apiService';
import React, { useState, useEffect } from 'react';


const Navbar = () => {
  const { configValue } = config()
  const dispatch = config

  const [appData, setAppdata] = useState({})
  const [first, setFirst] = useState(true)
  const [collapsed, setCollapsed] = useState(config().collapsed)
  const [rightSidebar, setRightSidebar] = useState(config().rightSidebar)

  const [membershipReuests, setMembershipReuests] = useState(0)


  useEffect(() => {
    async function getInnerdata() {
      if (first == true) {
        let access = {}
        let param = {}

        param.url = '/dashboard/coupons'
        let data = await get(`modules/byUrl`, param)
        if (data.module) {
          access.coupons = true
        }
        param.url = '/dashboard/announcements'
        data = await get(`modules/byUrl`, param)
        if (data.module) {
          access.announcements = true
        }
        param.url = '/dashboard/push-notifications'
        data = await get(`modules/byUrl`, param)
        if (data.module) {
          access.pushnotifications = true
        }
        param.url = '/dashboard/notifications'
        data = await get(`modules/byUrl`, param)
        if (data.module) {
          access.notifications = true
        }
        param.url = '/dashboard/settings'
        data = await get(`modules/byUrl`, param)
        if (data.module) {
          access.settings = true
        }
        param.url = '/dashboard/discussion-forum'
        data = await get(`modules/byUrl`, param)
        if (data.module) {
          access.discussionforum = true
        }
        param.url = '/dashboard/membership-requests'
        data = await get(`modules/byUrl`, param)
        if (data.module) {
          access.membershiprequests = true
        }

        param = { approved: 0 }
        data = await get(`users/membership-documents`, param)

        if (data.totalCount) {
          setMembershipReuests(data.totalCount)
        }

        window.onstorage = () => {
          setCollapsed(JSON.parse(window.localStorage.getItem('collapsed')))
        };

        setAppdata(access)
      }
    }
    getInnerdata()

    setFirst(false)
    return
  }, [first])

  return (
    <div className="navbar navbar-1 border-b">
      <div className="navbar-inner w-full flex items-center justify-start">
        <button
          onClick={async () => {
            window.localStorage.setItem('collapsed', !collapsed)
            window.dispatchEvent(new Event('storage'))
          }

          }
          className="mx-4">
          <FiMenu size={20} />
        </button>
        <div className="w-full max-w-xs mr-2 navbar-search">
          <div className="relative">
            <h5 className="pl-1 text-bold truncate md:w-80 w-48"><b>{window.localStorage.getItem('baseTitle')}</b></h5>
            {/* <input
              type="search"
              name="search"
              placeholder="Search..."
              className="pl-10 pr-5 appearance-none h-10 w-full rounded-full text-sm focus:outline-none"
            /> */}
          </div>
        </div>
        <span className="ml-auto"></span>

        {appData && appData.pushnotifications == true && <Link href="/dashboard/push-notifications">
          <a
            className="btn-transparent items-center justify-center h-16 mx-4 hidden  sm:flex"
          >
            <i class="far fa-paper-plane"></i>
            <span className="pl-2">Send Notification</span>
          </a>
        </Link>}
        {appData && appData.discussionforum == true && <Link href="/dashboard/discussion-forum">
          <a
            className="btn-transparent items-center justify-center h-16 mx-4 hidden  sm:flex"
          >
            <i class="far fa-file-alt"></i>
            <span className="pl-2">Discussion Forum</span>
          </a>
        </Link>}
        {appData && appData.announcements == true && <Link href="/dashboard/announcements">
          <a
            className="btn-transparent items-center justify-center h-16 mx-4 hidden  sm:flex"
          >
            <i class="fas fa-bullhorn"></i>
            <span className="pl-2">News & Updates</span>
          </a>
        </Link>}
        {appData && appData.coupons == true && <Link href="/dashboard/coupons">
          <a
            className="btn-transparent items-center justify-center h-16 mx-4 hidden  sm:flex">
            <i class="fas fa-ticket-alt"></i>
            <span className="pl-2">Coupons</span>
          </a>
        </Link>}
        {appData && appData.notifications == true && <Link href="/dashboard/notifications">
          <a
            className="btn-transparent items-center justify-center h-16 mx-4 hidden  sm:flex">
            <i class="far fa-bell"></i>
            <span className="pl-2">Notifications</span>
          </a>
        </Link>}
        {appData && appData.membershiprequests == true && <Link href="/dashboard/membership-requests">
          <a
            className=" relative btn-transparent items-center justify-center h-16 mx-4 hidden  sm:flex">
            <i class="far fa-bell"></i>
            <span className="pl-2">Membership Documents</span>
            {membershipReuests > 0 && <span
              className="absolute uppercase font-bold inline-flex text-center p-0 leading-none text-2xs h-4 w-4 inline-flex items-center justify-center rounded-full bg-base text-white"
              style={{ top: 14, left: 7 }}>
              {membershipReuests}
            </span>}
          </a>
        </Link>}

        {/* <AppsDropdown />
        <FlagsDropdown />
        <NotificationDropdown />
        <ExploreDropdown />
        <StatusDropdown /> */}
        <ProfileDropdown />
        {appData && appData.settings == true && <Link href="/dashboard/settings">
          <a
            className="btn-transparent flex items-center justify-center h-16 w-8 mr-4 "

          >
            <FiSettings size={18} />
          </a>
        </Link>}

        <button
          onClick={async () => {
            window.localStorage.setItem('rightSidebar', !rightSidebar)
            window.dispatchEvent(new Event('storage'))
          }

          }
          className=" mr-4 inline-flex sm:hidden lg:hidden">
          <FiMoreVertical size={18} />
        </button>
      </div>
    </div>
  )
}

export default Navbar
