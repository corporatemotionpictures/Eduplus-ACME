import Head from 'next/head'
import Navbar1 from 'components/functional-ui/navbar'
import LeftSidebar1 from 'components/functional-ui/left-sidebar'
import RightSidebar1 from 'components/functional-ui/right-sidebar'
import config from 'helpers/redux/reducers/config'
import toastr from 'toastr'
import { getSettings, get } from 'helpers/apiService';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router'

const Dashboard = ({ children, contentDeletable = null, moduleParent = null, hideHierarchy = null }) => {

  const router = useRouter()
  const [palettes, setPalettes] = useState({})
  const [appData, setAppdata] = useState({})
  const [metaDetails, setmetaDetails] = useState({})
  const [first, setFirst] = useState(true)
  const [configData, setConfig] = useState({ ...config() })
  const [collapsed, setCollapsed] = useState(configData.collapsed)

  useEffect(() => {
    async function getInnerdata() {
      if (first == true) {




        let data = await getSettings('metaDetails')
        setAppdata(data)

        data = await getSettings('metaDetails')
        setmetaDetails(data)

        data = await getSettings('palatters')
        setPalettes(data)



        window.localStorage.setItem('palatters', JSON.stringify(data))
        window.dispatchEvent(new Event('storage'))

        window.localStorage.setItem('collapsed', false)
        window.dispatchEvent(new Event('storage'))

        window.addEventListener('storage', () => {
          setCollapsed(window.localStorage.getItem('collapsed'))
          setPalettes(JSON.parse(window.localStorage.getItem('palatters')))
        })
      }
    }

    getInnerdata()

    setFirst(false)
    return
  }, [first])

  const { layout } = config()
  let { background, navbar, leftSidebar, rightSidebar } = palettes

  toastr.options = {
    "closeButton": false,
    "debug": false,
    "newestOnTop": false,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
  }

  function recursiveMap(children, fn) {
    return React.Children.map(children, child => {
      if (!React.isValidElement(child) || typeof child.type == 'string') {
        return child;
      }

      if (child.props.children) {
        child = React.cloneElement(child, {
          children: recursiveMap(child.props.children, fn)
        });
      }

      return fn(child);
    });
  }

  // Add props to all child elements.
  const childrenWithProps = recursiveMap(children, child => {
    // Checking isValidElement is the safe way and avoids a TS error too.
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { contentDeletable: contentDeletable, parentName: moduleParent, hideHierarchy: hideHierarchy })
      // Pass additional props here
    }

    return child;
  });

  return (
    <>
      <Head>
        <meta charSet="utf-8" />

        <meta name="format-detection" content="telephone=no" />
        <meta http-equiv="origin-trial" content=""></meta>

        <link rel="manifest" href="/manifest.json" />
        {metaDetails &&
          <title>{process.env.NEXT_PUBLIC_DOMAIN != 'vajrashiksha' ? 'EduPlus - ' : ''} {metaDetails.name}</title>}
        <link rel="stylesheet" href="/website/assets/css/font-awesome.min.css" />
        <link rel="stylesheet" href="/website/assets/css/zoomstyle.css" />

        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.css" integrity="sha512-3pIirOrwegjM6erE5gPSwkUzO+3cTjpnV9lexlNZqvupR64iZBnOOTiiLPb9M36zpMScbmUNIcHUqKD47M719g==" crossorigin="anonymous" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js" integrity="sha512-VEd+nq25CkR676O+pLBnDW09R7VQX9Mdiij052gVCp5yVH3jGtH70Ho/UUv4mJDsEdTvqRCFZg0NKGiojGnUCw==" crossorigin="anonymous"></script>
      </Head>

      <div
        data-layout={layout}
        data-collapsed={collapsed}
        data-background={background}
        data-navbar={palettes.navbar}
        data-left-sidebar={leftSidebar}
        data-right-sidebar={rightSidebar}
        className={`font-sans antialiased text-sm disable-scrollbars ${background === 'dark' ? 'dark' : ''
          }`}>
        <RightSidebar1 />
        <div className="wrapper ">
          <LeftSidebar1 />
          <div className="main w-full  text-gray-900 dark:bg-gray-900 dark:text-white">
            <Navbar1 />

            <div className="h-95vh w-full p-4 overflow-scroll dashboard-parent">
              <div className='bg-image-dashboard dark:bg-gray-900'></div>
              <div className='dashboard-main'>
                {module && childrenWithProps}

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
export default Dashboard
