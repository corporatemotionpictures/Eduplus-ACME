import Head from 'next/head'
import Layout from 'layouts'
import Router from 'next/router'
import NProgress from 'nprogress'
import 'public/css/tailwind.css'
import 'public/css/main.css'
import 'public/css/layouts/dashboard.css'
import 'public/css/animate.css'
import 'public/css/components/buttons.css'
import 'public/css/components/datepicker.css'
import 'public/css/components/dropdowns.css'
import 'public/css/components/forms.css'
import 'public/css/components/left-sidebar-1/styles-lg.css'
import 'public/css/components/left-sidebar-1/styles-sm.css'
import 'public/css/components/modals.css'
import 'public/css/components/navbar.css'
import 'public/css/components/nprogress.css'
import 'public/css/components/recharts.css'
import 'public/css/components/right-sidebar.css'
// import 'public/css/components/sliders.css'
import 'public/css/components/steps.css'
import 'public/css/components/tables.css'
import 'public/css/components/tabs.css'
import 'public/css/components/user-widgets/widget-2.css'
import 'public/css/components/user-widgets/widget-4.css'
import App from 'next/app';
import { getSettings } from 'helpers/apiService';


Router.events.on('routeChangeStart', () => NProgress.start())
Router.events.on('routeChangeComplete', () => NProgress.done())
Router.events.on('routeChangeError', () => NProgress.done())


CustomApp.getInitialProps = async (appContext) => {
  const appProps = await App.getInitialProps(appContext);

  let metaDetails = await getSettings('metaDetails')
  let appData = await getSettings('appConfigurations')

  appProps.metaData = {
    metaDetails: metaDetails,
    appData: appData
  }
  return { ...appProps };
};


function CustomApp({ Component, pageProps, metaData }) {

  return (
    <>

      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta charSet="utf-8" />
        <title>{metaData.metaDetails ? metaData.metaDetails.name : ''}</title>
        <meta name="title" content={metaData.metaDetails ? metaData.metaDetails.name : ''} />
        {/* <Meta /> */}

        <meta name="keywords" content={metaData.metaDetails ? metaData.metaDetails.keywords : ''} />
        <meta name="revised" content={metaData.metaDetails ? metaData.metaDetails.revised : ''} />
        <meta name="author" content={metaData.metaDetails ? metaData.metaDetails.author : ''} />
        <meta name="description" content={metaData.metaDetails ? metaData.metaDetails.description : ''} />
        <meta name="robots" content={metaData.metaDetails ? metaData.metaDetails.robots : ''} />
        <meta property="og:type" content={metaData.metaDetails ? metaData.metaDetails.ogType : ''} />
        <meta property="og:url" content={metaData.metaDetails ? metaData.metaDetails.ogUrl : ''} />
        <meta property="og:title" content={metaData.metaDetails ? metaData.metaDetails.name : ''} />
        <meta property="og:description" content={metaData.metaDetails ? metaData.metaDetails.description : ''} />
        <meta property="og:image" content={metaData.metaDetails ? metaData.metaDetails.image : ''} />
        <meta name="theme-color" content={metaData.metaDetails ? metaData.metaDetails.themeColor : ''} />
        <meta name="msapplication-navbutton-color" content={metaData.metaDetails ? metaData.metaDetails.msapplicationNavbuttonColor : ''} />
        <meta name="apple-mobile-web-app-status-bar-style" content={metaData.metaDetails ? metaData.metaDetails.appleMobileWebAppStatusBarStyle : ''} />
        <link rel="shortcut icon" href={metaData.metaDetails ? metaData.metaDetails.favicon : ''} type="image/x-icon" />
        <link rel="icon" href={metaData.metaDetails ? metaData.metaDetails.favicon : ''} />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  )
}


export default CustomApp
