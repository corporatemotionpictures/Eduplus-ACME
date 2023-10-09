import Head from 'next/head'
import config from 'helpers/redux/reducers/config'
import toastr from 'toastr'
import Link from "next/link";
import TopBar from "components/website/TopBar";
import WebAppHeader from "components/website/WebAppHeader";

import Footer from "components/website/Footer";
import { getSettings } from 'helpers/apiService';
import React, { useState, useEffect } from 'react';
import PopupModel from 'components/functional-ui/modals/modal-popup'
import { useRouter } from 'next/router'
import { fetchAll } from 'helpers/apiService';

const WebAppLayout = ({ children, forApp = false }) => {

  const router = useRouter()
  const [model, setModel] = useState(false)

  const [appData, setAppdata] = useState({})
  const [first, setFirst] = useState(true)
  const [loading, setLoading] = useState(true)
  const [colors, setColors] = useState({})


  useEffect(() => {
    async function getInnerdata() {
      if (first == true) {
        let data = await getSettings('metaDetails')
        setAppdata(data)
        data = await getSettings('colors')
        await setColors(data)
        setLoading(false)
      }
    }

    getInnerdata()


    setFirst(false)
    return
  }, [first])


  useEffect(() => {

    async function getInnerdataNext() {
      {

        document.addEventListener('contextmenu', (e) => {
          e.preventDefault();
        });
        //Prevent Ctrl+S (and Ctrl+W for old browsers and Edge)
        document.onkeydown = function (e) {
          e = e || window.event;//Get event

          if (!e.ctrlKey) return;

          var code = e.which || e.keyCode;//Get key code

          switch (code) {
            case 73://Block Ctrl+shift+1
            case 85://Block Ctrl+u
            case 67://Block Ctrl+c
            case 83://Block Ctrl+S
            case 87://Block Ctrl+W -- Not work in Chrome and new Firefox
              e.preventDefault();
              e.stopPropagation();
              break;
          }
        };
      }
    }

    getInnerdataNext()

  }, [router.pathname])

  
  
  useEffect(() => {

    if (colors) {
      Object.keys(colors).map((key) => {
        document.documentElement.style.setProperty(`--${key}`, colors[key] && colors[key] != '' ? `#${colors[key]}` : getComputedStyle(document.documentElement)
          .getPropertyValue(`--${key}`));
      })
    }

    return
  }, [colors])

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

  return (

    <>

      <div>

        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
          <link rel="shortcut icon" href={appData.favicon} type="image/x-icon" />

          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap" rel="stylesheet" />

          <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous" />

          <link rel="stylesheet" href="/website/assets/css/font-awesome.min.css" />
          <link rel="stylesheet" href="/website/assets/css/flaticon.css" />
          <link rel="stylesheet" href="/website/assets/css/magnific-popup.css" />

          <link rel="stylesheet" href="/website/assets/css/owl.carousel.css" />
          <link rel="stylesheet" href="/website/assets/css/owl.theme.css" />
          <link rel="stylesheet" href="/website/assets/css/animate.css" />

          <link rel="stylesheet" href="/website/assets/css/slick.css" />
          <link rel="stylesheet" href="/website/assets/css/preloader.css" />


          <link rel="stylesheet" href="/website/assets/css/revolution/layers.css" />
          <link rel="stylesheet" href="/website/assets/css/revolution/navigation.css" />
          <link rel="stylesheet" href="/website/assets/css/revolution/settings.css" />

          <link rel="stylesheet" href="/website/assets/css/meanmenu.css" />

          <link rel="stylesheet" href="/website/assets/css/style.css" />
          <link rel="stylesheet" href="/website/assets/css/responsive.css" />
          <link rel="stylesheet" href="/website/assets/css/demo.css" />

          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.8.2/css/lightbox.min.css" />
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.css" integrity="sha512-3pIirOrwegjM6erE5gPSwkUzO+3cTjpnV9lexlNZqvupR64iZBnOOTiiLPb9M36zpMScbmUNIcHUqKD47M719g==" crossorigin="anonymous" />
          <script src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js" integrity="sha512-VEd+nq25CkR676O+pLBnDW09R7VQX9Mdiij052gVCp5yVH3jGtH70Ho/UUv4mJDsEdTvqRCFZg0NKGiojGnUCw==" crossorigin="anonymous"></script>
          <script src="https://checkout.razorpay.com/v1/checkout.js"></script>

        </Head>

        <div>

          {loading == true && <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-screen z-50 overflow-hidden opacity-75 flex items-center justify-center">
            <img src="/images/loader.gif" />
          </div>
            ||

            <>
              {forApp == false && <header className="header_inner courses_page" oncontextmenu="return false;">
                <WebAppHeader title={appData.name} metaDescription={appData.description} />
              </header>}

              <div className="">
                {
                  model && <PopupModel image={model.image} link={model.link} />
                }

                {children}
                {/* <div id='react-root'></div>
                {forApp == false && false && <footer>
                  <Instructor />
                  <Footer />
                </footer>} */}
              </div>
            </>
          }
        </div>
      </div>

    </>
  )
}
export default WebAppLayout
