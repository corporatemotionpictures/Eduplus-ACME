import Link from 'next/link'
import { FiMail, FiStar, FiUser, FiLogIn } from 'react-icons/fi'
import { logout } from 'helpers/auth';
import { get } from 'helpers/apiService';
import React, { useState, useEffect, useRef } from 'react'

const AccountLinks = () => {


  const [membershipReuests, setMembershipReuests] = useState(0)
  const [first, setFirst] = useState(true)


  useEffect(() => {
    async function getInnerdata() {
      if (first == true) {
        let access = {}
        let param = { approved: 0 }
        let data = await get(`users/membership-documents`, param)

        if (data.totalCount) {

          setMembershipReuests(data.totalCount)
        }
      }
    }
    getInnerdata()

    setFirst(false)
    return
  }, [first])


  const items = [


  ]

  // if (membershipReuests > 0) {
  //   items.push({
  //     url: '/dashboard/membership-requests',
  //     icon: <FiMail size={18} className="stroke-current" />,
  //     name: 'Membership Documents',
  //     badge: {
  //       number: membershipReuests,
  //       color: 'bg-red-500 text-white'
  //     }
  //   })

  // }
  items.push({
    url: '/dashboard/profile',
    icon: <FiUser size={18} className="stroke-current" />,
    name: 'Profile',
    badge: null
  },
    {
      url: null,
      icon: <FiLogIn size={18} className="stroke-current" />,
      name: 'Logout',
      badge: null,
      onClick: function () {
        logout('/auth/admin/login');
      }
    })

  return (
    <div className="flex flex-col w-full">
      <ul className="list-none">
        {items.map((item, i) => (
          <li key={i} className="dropdown-item">
            {item.url &&
              <Link onClick={item.onClick} href={item.url}>
                <a className="flex flex-row items-center justify-start h-10 w-full px-2">
                  {item.icon}
                  <span className="mx-2">{item.name}</span>
                  {item.badge && (
                    <span
                      className={`uppercase font-bold inline-flex text-center p-0 leading-none text-2xs h-4 w-4 inline-flex items-center justify-center rounded-full ${item.badge.color} ml-auto`}>
                      {item.badge.number}
                    </span>
                  )}
                </a>
              </Link>
              ||
              <div onClick={item.onClick}>
                <a className="flex flex-row items-center justify-start h-10 w-full px-2">
                  {item.icon}
                  <span className="mx-2">{item.name}</span>
                  {item.badge && (
                    <span
                      className={`uppercase font-bold inline-flex text-center p-0 leading-none text-2xs h-4 w-4 inline-flex items-center justify-center rounded-full ${item.badge.color} ml-auto`}>
                      {item.badge.number}
                    </span>
                  )}
                </a>
              </div>

            }
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AccountLinks
