import React, { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import * as Icon from 'react-icons/fi'
// import Icon from './icon'
import {
  FiToggleLeft,
  FiList,
  FiActivity,
  FiCalendar,
  FiStar,
  FiDroplet,
  FiGrid,
  FiClock,
  FiCopy,
  FiUser,
  FiPieChart,
  FiCompass,
  FiHelpCircle,
  FiShoppingCart,
  FiHome
} from 'react-icons/fi'


const Item = ({ url, icon, title, badge, items, newdata, hiddenData = true }) => {
  const [hidden, setHidden] = useState(hiddenData)
  const router = useRouter()
  let { pathname } = { ...router }
  let active = pathname === url ? true : false
  if (pathname === '/' && url === '/dashboard') {
    active = true
  }
  if (pathname === '/' && url !== '/dashboard') {
    active = false
  }

  let IconDirects = null

  if (icon) {
    IconDirects = Icon[icon]
  }
  if (items == undefined || items.length === 0) {

    return (

      <Link href={url} as={url}>
        <a className={`left-sidebar-item ${active ? 'active' : ''}`}>
          {IconDirects && <IconDirects size={20} />}
          <span className="title">{title}</span> {newdata && <span className="text-blue border-0 text-center rounded  px-2 m15 bg-blue-100 tutorial"><small>View Tutorials</small></span>}
          {badge && (
            <span className={`badge badge-circle badge-sm ${badge.color}`}>
              {badge.text}
            </span>
          )}
        </a>
      </Link>

    )
  }
  return (
    <button
      onClick={() => {

        if (hidden == true) {
          var elems = document.querySelectorAll(".open-sibling");

          [].forEach.call(elems, function (el) {
            el.classList.add("hidden-sibling");
            el.classList.remove("open-sibling");
          });
        }

        setHidden(!hidden)
      }}
      className={`left-sidebar-item ${active ? 'active' : ''} ${hidden ? 'hidden-sibling' : 'open-sibling'
        }`}>
      {IconDirects && <IconDirects size={20} />}
      <span className="title">{title}</span>
      {badge && (
        <span className={`badge badge-circle badge-sm ${badge.color}`}>
          {badge.text}
        </span>
      )}
      <Icon.FiChevronLeft className="ml-auto arrow" />
    </button>
  )
}

export default Item
