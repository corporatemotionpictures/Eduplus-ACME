import Colors from './colors'
import { FiSettings, FiMenu } from 'react-icons/fi'
import Toggle from './toggle'
import Sidebar from './sidebar'
import Demos from './demos'
import AccountLinks from 'components/functional-ui/navbar/account-links'
import config from 'helpers/redux/reducers/config'
import palettes from 'helpers/redux/reducers/palettes'
import Link from 'next/link'
import { get } from 'helpers/apiService';
import React, { useState, useEffect } from 'react';

const RightSidebar = () => {
  const colors = [
    { bg: 'bg-white', text: 'text-white', name: 'light' },
    { bg: 'bg-gray-900', text: 'text-gray-900', name: 'dark' }
  ]
  const items = [
    { title: 'Background', key: 'background' },
    { title: 'Navbar', key: 'navbar' },
    { title: 'Left sidebar', key: 'leftSidebar' }
  ]
  const configValue = config()
  // let { rightSidebar } = { ...configValue }
  const [rightSidebar, setrightSidebar] = useState(config().rightSidebar)
  const dispatch = config

  const [appData, setAppdata] = useState({})
  const [first, setFirst] = useState(true)
  const [collapsed, setCollapsed] = useState(config().collapsed)


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

        window.addEventListener('storage', () => {
          setrightSidebar(JSON.parse(window.localStorage.getItem('rightSidebar')))
        })

        setAppdata(access)
      }
    }
    getInnerdata()

    setFirst(false)
    return
  }, [first])

  return (
    <div
      className={`right-sidebar right-sidebar-1 ${rightSidebar ? 'open' : ''}`}>
      <div>
        <div>
          <div className="flex flex-col">
            <div className="px-4 h-16 flex flex-row items-center justify-between bg-base text-white">
              <div className="uppercase text-sm font-bold tracking-wider">
                Quick Links
              </div>
              <Toggle />
            </div>
          </div>

          <div className="flex flex-col p-4">
            <div className="uppercase text-sm font-bold tracking-wider mb-2">
              Quick Urls
            </div>
            <div className="flex flex-col">
              {appData && appData.pushnotifications == true && <Link href="/dashboard/push-notifications">
                <a
                  className="flex flex-row items-center justify-start h-10 w-full px-2"
                >
                  <i class="far fa-paper-plane"></i>
                  <span className="pl-2">Send Notification</span>
                </a>
              </Link>}
              {appData && appData.discussionforum == true && <Link href="/dashboard/discussion-forum">
                <a
                  className="flex flex-row items-center justify-start h-10 w-full px-2"
                >
                  <i class="far fa-file-alt"></i>
                  <span className="pl-2">Discussion Forum</span>
                </a>
              </Link>}
              {appData && appData.announcements == true && <Link href="/dashboard/announcements">
                <a
                  className="flex flex-row items-center justify-start h-10 w-full px-2"
                >
                  <i class="fas fa-bullhorn"></i>
                  <span className="pl-2">News & Updates</span>
                </a>
              </Link>}
              {appData && appData.coupons == true && <Link href="/dashboard/coupons">
                <a
                  className="flex flex-row items-center justify-start h-10 w-full px-2">
                  <i class="fas fa-ticket-alt"></i>
                  <span className="pl-2">Coupons</span>
                </a>
              </Link>}
              {appData && appData.notifications == true && <Link href="/dashboard/notifications">
                <a
                  className="flex flex-row items-center justify-start h-10 w-full px-2">
                  <i class="far fa-bell"></i>
                  <span className="pl-2">Notifications</span>
                </a>
              </Link>}



              {/* <ProfileDropdown />
              {appData && appData.settings == true && <Link href="/dashboard/settings">
                <a
                  className="btn-transparent flex items-center justify-center h-16 w-8 mr-4"

                >
                  <FiSettings size={18} />
                </a>
              </Link>} */}
            </div>
          </div>

          <div className="flex flex-col p-4">
            <div className="mb-2">
              <div className="uppercase text-sm font-bold tracking-wider mb-2">
                Profile
              </div>
            </div>
            <AccountLinks />


          </div>
          <div className="flex flex-col p-4">
            <div className="mb-2">
              <div className="uppercase text-sm font-bold tracking-wider mb-2">
                Setting
              </div>
            </div>
            {appData && appData.settings == true && <Link href="/dashboard/settings">
              <a
                className="flex flex-row items-center justify-start h-10 w-full px-2"

              >
                <FiSettings size={18} />
                <span className="pl-2">Settings</span>
              </a>
            </Link>}


          </div>
          {/* <Demos />
          <Sidebar />

          <div className="flex flex-col p-4">
            <div className="mb-2">
              <div className="uppercase text-sm font-bold tracking-wider mb-2">
                Colors
              </div>
            </div>

            {items.map((item, i) => (
              <Colors
                key={item.key}
                title={item.title}
                palettes={colors}
                name={item.key}
              />
            ))}
          </div> */}
        </div>
      </div>
    </div>
  )
}

export default RightSidebar
