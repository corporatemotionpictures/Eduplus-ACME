import { Component } from 'react';
import router, { useRouter } from 'next/router'
import Centered from 'layouts/centered'
import Dashbaord from 'layouts/dashboard'
import WebLayout from 'layouts/website'
import Shimmer from 'components/website/shimmer'
import { authGaurd, redirect, logout, getToken } from 'helpers/auth';
import { getUser } from 'helpers/auth';
import { fetchAll, get, getSettings } from 'helpers/apiService';
import Router from 'next/router';
import WebAppLayout from 'layouts/web-app'

// import {withRouter} from 'react-router-dom';
const MyClassWithRouter = (props) => {
  const router = useRouter()
  return <Layouts {...props} router={router} />
}

class Layouts extends Component {

  constructor(props) {
    super(props);
  }

  state = {
    cloak: null,
    avatar: null,
    moduleData: null,
    loggedInUser: null,
    contentDeletable: null,
    notifications: [],
    isNotification: false
  }

  url = `/dashboard/${this.props.back}`

  markAllRead = async () => {
    let data = {
      data: 'data'
    };

    let notification = await get('notifications/mark-all-read');

    // Check Response
    if (notification.updated == true) {
      this.setState({ submitted: true, msg: 'updated' },
        () => { setTimeout(() => this.setState({ submitted: false }), 3300) });

      let notice = await fetchAll("notifications");
      this.setState({ isNotification: true, notifications: notice.values.notifications });

    }
    else {
      let error;
      if (notification.notification) {
        error = notification.notification.error;
      }
      else if (notification.error.details) {
        error = notification.error.details[0].message;
      }
      else if (notification.error) {
        error = notification.error;
      }
      this.setState({
        submitted: true,
        msg: error
      })
    }

  }


  redirectPage = () => {
    redirect()
    this.fetchAll()
  }

  fetchAll = async () => {

    let hideWebsite = await getSettings('hide_website')

    let metaDetails = await getSettings('metaDetails')
    window.localStorage.setItem('defaultImageAlt', metaDetails.defaultImageAlt)
    window.localStorage.setItem('baseTitle', metaDetails.baseTitle)

    if ((!this.props.router.pathname.startsWith('/web-app') && this.props.router.pathname != '/dashboard' && !this.props.router.pathname.startsWith('/dashboard') && !this.props.router.pathname.startsWith('/auth/admin') && hideWebsite == 'YES')) {
      this.setState({
        onProcess: true
      })
    } else {

      if (this.props.router.pathname.startsWith('/web-app') && process.env.NEXT_PUBLIC_DESKTOP_APP == 'false') {
        Router.push('/404')
      }

      let userType = await authGaurd()

      // Redirect if user are logged in as admin type 
      if (this.props.router.pathname.startsWith('/auth/')) {
        getToken() == undefined ? this.setState({ cloak: true }) : this.redirectPage();
        // this.setState({ cloak: true })
      }

      // Redirect if user are logged in as admin type 
      else if (this.props.router.pathname.startsWith('/web-app/auth/')) {
        getToken() == undefined ? this.setState({ cloak: true }) : window.location = '/web-app/dashboard';
        // this.setState({ cloak: true })
      }

      else if (this.props.router.pathname.startsWith('/accounts/')) {
        getToken() == undefined ? this.redirectPage() : this.setState({ cloak: true });
      }

      else if (this.props.router.pathname.startsWith('/webinars/[slug]')) {
        getToken() == undefined ? window.location = '/auth/login' : this.setState({ cloak: true });
      }
      else if (this.props.router.pathname.startsWith('/web-app/dashboard')) {
        getToken() == undefined ? window.location = '/web-app/auth/login' : this.setState({ cloak: true });
      }


      else if (this.props.router.pathname.startsWith('/payment') || this.props.router.pathname.startsWith('/invoice')) {
        (!userType && !this.props.router.query.token) ? this.redirectPage() : this.setState({ cloak: true });
      }

      else if (this.props.router.pathname == '/dashboard' || this.props.router.pathname.startsWith('/dashboard')) {


        if (!userType) {
          Router.push('/auth/admin/login');
        }
        else if (userType == "isAdmin") {


          let data = await get('modules/byUrl', { url: this.props.router.pathname })
          this.setState({
            moduleParent: data.module && data.module.parentdata ? data.module.parentdata.title : 'Dashboard'
          })

          data = await getSettings('hide_hierarchy')
          this.setState({
            hideHierarchy: data
          })


          // this.setState({ cloak: true });
          data = await getUser();
          this.setState({ avatar: data.image == undefined ? '' : data.image, tag: data.first_name, loggedInUser: data });


          this.setState({
            contentDeletable: data.type == 'ADMIN'
          })

          if (data.type == 'ADMIN') {
            let notice = await fetchAll("notifications");
            this.setState({ isNotification: true, notifications: notice.notifications, cloak: true });
          } else {

            let diverted = false

            let urls = []
            data.modules.map(module => {

              if (this.props.router.pathname.startsWith(module.url) && module.url != '/dashboard') {
                this.setState({
                  cloak: true
                })
                diverted = true
              }

              urls.push(module.url)
            })

            if (!diverted && this.props.router.pathname != '/dashboard' && this.props.router.pathname != '/dashboard/tutorials'
              && this.props.router.pathname != '/dashboard/profile' && !urls.includes(this.props.router.pathname) &&
              (!this.props.router.pathname.startsWith('/dashboard/live-events/zoom/') || !urls.includes('/dashboard/live-events'))
            ) {
              Router.push('/404')
            }
            else if (!diverted && this.props.router.pathname == '/dashboard' && !urls.includes(this.props.router.pathname)) {
              Router.push('/dashboard/tutorials')
            } else {
              this.setState({
                cloak: true
              })
            }
          }

        } else {
          Router.push('/auth/admin/login');
        }

      } else {

        if (this.props.router.query && this.props.router.query.landingPage) {
          let pageDetail = await get('pages/getBySlug', { slug: `${this.props.router.query.landingPage}` })


          if (pageDetail.success == false) {
            Router.push('/404')
          } else {
            this.setState({ cloak: true, pageDetail: pageDetail });
          }
        } else {
          this.setState({ cloak: true });
        }


      }

    }
  }

  componentDidMount = () => {

    Router.events.on("routeChangeComplete", () => {
      this.fetchAll()
    });

    this.fetchAll()
  }

  render() {
    const { children, router } = this.props

    return (
      <>
        {this.state.cloak &&
          <>

            {/* {
              (['/404', '/500'].includes(router.pathname)) && <Centered>{children}</Centered>
            } */}
            {

              (router.pathname.startsWith('/dashboard/pages/add') || router.pathname.startsWith('/dashboard/pages/edit/[slug]')) &&
              <WebLayout forApp={true}>{children}</WebLayout> ||

              (router.pathname.startsWith('/dashboard')) &&
              <Dashbaord contentDeletable={this.state.contentDeletable} moduleParent={this.state.moduleParent} hideHierarchy={this.state.hideHierarchy}>{children}</Dashbaord>
              ||

              (router.pathname.startsWith('/web-app/dashboard/[productslug]/live-events/[slug]') || router.pathname.startsWith('/webinars/[slug]') || router.pathname.startsWith('/web-app/dashboard/webinars/[slug]')) &&
              <Centered>{children}</Centered> ||

              router.pathname.startsWith('/web-app/auth/') &&
              <WebAppLayout forApp={true}>{children}</WebAppLayout> ||

              router.pathname.startsWith('/web-app/') &&
              <WebAppLayout>{children}</WebAppLayout> ||

              router.pathname.startsWith('/auth/admin/') &&
              <Centered>{children}</Centered> ||

              router.pathname.startsWith('/auth/') &&
              <WebLayout>{children}</WebLayout> ||

              (router.pathname.startsWith('/payment') || router.pathname.startsWith('/payment-response')) &&
              <WebLayout forApp={true}>{children}</WebLayout> ||

              (router.pathname.startsWith('/invoice') && router.query.token) &&
              <WebLayout forApp={true}>{children}</WebLayout> ||

              (router.query.token || router.query.isAndroid) &&
              <WebLayout forApp={true}>{children}</WebLayout> ||

              <WebLayout >{children}</WebLayout>
            }
          </>
        }

        {
          !this.state.clock || !this.state.onProcess && <>

            {(this.props.router.pathname == '/dashboard' || router.pathname.startsWith('/auth/admin/') || router.pathname.startsWith('/dashboard')) && <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-screen z-50 overflow-hidden ">
              <Shimmer />
            </div> || <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-screen z-50 overflow-hidden opacity-75 flex items-center justify-center">
                <img className="w-custom"  src="/images/loader.gif" />
              </div>}
          </>
        }
        {
          this.state.onProcess && <>
            <div >

              Website is in process
            </div>
          </>
        }
      </>
    )
  }
}

export default MyClassWithRouter

