import Head from 'next/head'
import toastr from 'toastr'
import TopBar from "components/website/TopBar";
import Header from "components/website/Header";
import Instructor from "components/website/Instructor";
import Footer from "components/website/Footer";
import { getSettings } from 'helpers/apiService';
import React, { useState, useEffect } from 'react';
import PopupModel from 'components/functional-ui/modals/modal-popup'
import { useRouter } from 'next/router'
import { fetchAll } from 'helpers/apiService';
import WebsiteShimmer from 'components/website/shimmer/websiteShimmer';


const WebLayout = ({ children, forApp = false }) => {

  const router = useRouter()

  const [appData, setAppdata] = useState({})
  const [metaData, setmetadata] = useState({})
  const [first, setFirst] = useState(true)
  const [model, setModel] = useState(false)
  const [loading, setLoading] = useState(true)
  const [contactData, setContactdata] = useState({})
  const [pages, setPages] = useState({})
  const [policies, setPolicies] = useState({})
  const [colors, setColors] = useState(null)

  useEffect(() => {
    async function getInnerdata() {
      if (first == true) {
        let data = await getSettings('appConfigurations')
        setAppdata(data)
        data = await getSettings('contacts')
        await setContactdata(data)
        data = await getSettings('metaDetails')
        await setmetadata(data)

        randerScript(data.footerScript, 'body')
        randerScript(data.headerScript, 'head')

        
        data = await getSettings('colors')
        await setColors(data)
        
        let pages = await fetchAll('pages', { byType: true })
        setPages(pages.pages)
        
        let policies = await fetchAll('policies', { byType: true })
        setPolicies(policies.policies)
        

        setLoading(false)
      }
    }

    getInnerdata()

    setFirst(false)
    return
  }, [first])


  useEffect(() => {

    if (colors) {
      Object.keys(colors).map((key) => {
        document.documentElement.style.setProperty(`--${key}`, colors[key] && colors[key] != '' ? `#${colors[key]}` : getComputedStyle(document.documentElement)
          .getPropertyValue(`--${key}`));
      })
    }

    return
  }, [colors])

  const randerScript = (html, area) => {
    $(area).append(html);
  }

  useEffect(() => {


    if (document.getElementById('navbar-toggler')) {
      document.getElementById('navbar-toggler').setAttribute('aria-expanded', false)
      document.getElementsByClassName('navbar-collapse')[0].setAttribute('class', 'navbar-collapse collapse')
    }
    // document.getElementById('navbar-toggler').addClass('collapsed')
    return
  }, [router.pathname])

  useEffect(() => {

    async function getInnerdataAgain() {
      let model = await fetchAll('popup-models', { pageUrl: router.pathname })
      

      if (model.popupModels) {
        return setModel(model.popupModels)
      } else {
        return setModel(false)
      }
    }

    getInnerdataAgain()


  }, [router.pathname])

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
          <link rel="stylesheet" type="text/css" href="/website/assets/css/section.css" />

          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.8.2/css/lightbox.min.css" />
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.css" integrity="sha512-3pIirOrwegjM6erE5gPSwkUzO+3cTjpnV9lexlNZqvupR64iZBnOOTiiLPb9M36zpMScbmUNIcHUqKD47M719g==" crossorigin="anonymous" />
          <script src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js" integrity="sha512-VEd+nq25CkR676O+pLBnDW09R7VQX9Mdiij052gVCp5yVH3jGtH70Ho/UUv4mJDsEdTvqRCFZg0NKGiojGnUCw==" crossorigin="anonymous"></script>
          <script src="https://checkout.razorpay.com/v1/checkout.js"></script>

        </Head>

          <div class="h-100-vh">

          {loading == true && <div className="mt-5">
            {/* <img src="/images/loader.gif" /> */}
            <WebsiteShimmer />
            
          </div>
            ||

            <>
              {forApp == false && <header className="header_inner courses_page overflow-visisble">
                {/* <Preloader /> */}
                <TopBar  contactData={contactData} pages={pages.TOPNAV} />
                <Header appData={appData} contactData={contactData} metaData={metaData} pages={pages.HEADER} pagesTopbar={pages.TOPNAV}/>
                {/* <Slider /> */}
              </header>}

              <div className="">
                {
                  model && <PopupModel image={model.image} link={model.link} />
                }

                {children}
                <div id='react-root'></div>
                {forApp == false && <footer>
                  <Instructor />
                  <Footer pages={pages.FOOTER} policies={policies}/>
                </footer>}
              </div>
            </>
          }
        </div>
      </div>

    </>
  )
}
export default WebLayout
