import { FiBox } from 'react-icons/fi'
import Link from 'next/link'
import config from 'helpers/redux/reducers/config'
import { getSettings } from 'helpers/apiService';
import React, { useState, useEffect } from 'react';


const Logo = ({className="w-1/2"}) => {

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

  const { configValue } = config()
  const { name } = { ...configValue }
  return (
    <div className="uppercase font-bold text-base tracking-wider flex flex-row items-center justify-start w-full whitespace-nowrap text-white">
      <Link href="/">
        <a className="flex flex-row items-center justify-start space-x-2">

          {
            process.env.NEXT_PUBLIC_DOMAIN == 'vajrashiksha' &&
            <img className={className} src={appData.logoLight}></img> ||
            <img className={className} src="/images/eduplus-light.png"></img>
          }

          {/* <FiBox size={28} />
          <span>{name}</span> */}
        </a>
      </Link>
    </div>
  )
}

export default Logo
