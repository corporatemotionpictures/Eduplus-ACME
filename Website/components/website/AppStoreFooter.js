import Link from "next/link";
import { getSettings } from 'helpers/apiService';
import React, { useState, useEffect } from 'react';
import define from 'src/json/worddefination.json'

export default function Footer(props) {

  const [appData, setAppdata] = useState({})
  const [contactData, setContactdata] = useState({})
  const [first, setFirst] = useState(true)

  useEffect(() => {
    async function getInnerdata() {
      if (first == true) {
        let data = await getSettings('metaDetails')
        setAppdata(data)
        data = await getSettings('contacts')
        setContactdata(data)
      }
    }

    getInnerdata()

    setFirst(false)
    return
  }, [first])

  return (

    <div className="rs-download-app  md-pb-30 lg-pb-60">
      <div className="container">
        <div className="row align-items-center ">
          <div className="col-lg-5 md-mb-40">
            <div className="img-part" style={{ marginBottom: "0px" }}>
              <img src="/website/assets/images/download/m-app.png" alt={window.localStorage.getItem('defaultImageAlt')} style={{ height: '400px' }} />
            </div>
          </div>
          <div className="col-lg-7 md-pl-15">
            <div className="sec-title3 mb-30">
              <div className="sub-title">Download the Android Mobile App</div>
              <h2 className=" title new-title font-bold">Learn Anytime, Anywhere</h2>
              <div className="desc big text-justify mt-3"> {window.localStorage.getItem('baseTitle')} has been imparting guidance for MCA Entrance Examinations to students from all over states of Chhattisgarh, M.P, Orissa, West Bengal, Bihar, Jharkhand, etc.<br></br>Fast, simple & Delightful. <br></br>All it takes is 30 seconds to Download.</div>
            </div>
            <div className="mobile-img">
              <div className="w-100 row pr-2 sm-pr-5 mt-4 pl-3" >
                {
                  contactData && contactData.playStore && contactData.playStore != '' &&
                  JSON.parse(contactData.playStore).map(data => {
                    if (data.playStore != '') {
                      return <Link href={data.playStore}>
                        <a target="_blank">
                          <img src="/website/assets/images/download/play.png" style={{ width: '150px', marginRight: '20px' }} alt={window.localStorage.getItem('defaultImageAlt')} />
                        </a>
                      </Link>

                    }
                  })
                }
                {
                  contactData && contactData.appStore && contactData.appStore != '' &&
                  JSON.parse(contactData.appStore).map(data => {
                    if (data.appStore != '') {
                      return <Link href={data.appStore}>
                        <a target="_blank">
                          <img src="/website/assets/images/download/apple.png" style={{ width: '150px' }} alt={window.localStorage.getItem('defaultImageAlt')} />
                        </a>
                      </Link>

                    }
                  })
                }
                <Link href="/exe/Acme-Academy.exe">
                  <a target="_blank">
                    <img src="/website/assets/images/icons/windows.png" style={{ width: '150px' }} alt={window.localStorage.getItem('defaultImageAlt')} />
                  </a>
                </Link>

              </div>

            </div>
          </div>
        </div>
      </div>
    </div>


  )
}