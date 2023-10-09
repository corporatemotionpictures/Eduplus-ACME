import { FiBox, FiMenu } from 'react-icons/fi'
import Link from 'next/link'
import config from 'helpers/redux/reducers/config'
import leftSidebar from 'helpers/redux/reducers/left-sidebar'
import { getSettings } from 'helpers/apiService';
import React, { useState, useEffect } from 'react';
import palettes from 'helpers/redux/reducers/palettes'

const Logo = () => {

  const configValue = config()
  const { showLogo } = leftSidebar()

  const [appData, setAppdata] = useState({})
  const [first, setFirst] = useState(true)



  useEffect(() => {
    async function getInnerdata() {
      if (first == true) {
        let data = await getSettings('metaDetails')
        setAppdata(data)
      }
    }
    getInnerdata()

    setFirst(false)
    return
  }, [first])

  if (showLogo) {
    return (
      <div className="logo truncate">
        <Link href="/dashboard">
          <a className="flex flex-row items-center lg:justify-center space-x-2 w-full" id="parentLogo">
            {
              process.env.NEXT_PUBLIC_DOMAIN == 'vajrashiksha' &&
              <img className="w-3/4" src={appData.logoDark}></img> ||
              ((screen.width <= 767 || !window.localStorage.getItem('collapsed') || window.localStorage.getItem('collapsed') == 'false') &&

                (JSON.parse(window.localStorage.getItem('palatters')) && JSON.parse(window.localStorage.getItem('palatters')).leftSidebar == 'dark' ? <img className="w-3/4" src="/images/eduplus-light.png"></img> : <img className="w-3/4" src="/images/eduplus-dark.png"></img>)
                || <img className="w-3/4" src="/images/eduplus-short.png"></img>)
            }
            {/* <span>{appData.name}</span> */}
          </a>
        </Link>
        <button
          onClick={async () => {

            await window.localStorage.setItem('collapsed', !window.localStorage.getItem('collapsed'))
            window.dispatchEvent(new Event('storage'))
          }
          }
          className="ml-auto mr-4 block lg:hidden">
          <FiMenu size={20} />
        </button>
      </div>
    )
  }
  return null
}

export default Logo
