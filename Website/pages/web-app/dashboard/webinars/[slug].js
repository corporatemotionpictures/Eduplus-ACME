import { Component } from 'react';
import { fetchByID, edit } from 'helpers/apiService';
import React from 'react'
import SectionTitle from 'components/functional-ui/section-title'
import Datatable from 'components/functional-ui/datatable'
import Widget from 'components/functional-ui/widget'
import Comments from 'components/functional-ui/social-feed/comments'
import { Badge } from 'components/functional-ui/badges'
import { getToken } from "helpers/auth";
import { getSettings, get } from "helpers/apiService";
import { getUser } from "helpers/auth";
import { generateSignature } from "helpers/zoom";
import ChatOne from "pages/socket/clone";
import { getOne } from 'helpers/zoom';
import Router from 'next/router';
import toastr from 'toastr';

import WebAppHeader from "components/website/WebAppHeader";
import {
  FiThumbsUp,
  FiMessageCircle,
  FiShare2
} from 'react-icons/fi'
import moment from 'moment';

//

export default class extends Component {
  state = {
    video: {},
    search: '',
    fetching: true,
    modelTitle: 'live-events',
    embedLink: null,
    embadChatLink: null,
    token: null,
    domainUrl: null,
    user: null,
    YoutubeData: null,
    started: null,
  }

  // 
  static getInitialProps({ query }) {
    return query;
  }

  // Function for fetch data
  fetchData = async (id) => {


    let zoomDetails = await fetchByID('live-events', id);
    zoomDetails = zoomDetails.event

    // this.setState({ video: null })
    let data = await get(`products/slug?slug=${this.props.productslug}`)
    let productid = data.product ? data.product.id : null

    let product = data.product



    if (zoomDetails && zoomDetails.base_type == 'ZOOM') {

      // ZoomMtg.setZoomJSLib('node_modules/@zoomus/websdk/dist/lib', '/av');

      ZoomMtg.setZoomJSLib(`https://source.zoom.us/${this.state.version}/lib`, '/av');
      ZoomMtg.preLoadWasm();
      ZoomMtg.prepareJssdk(['WebAssembly SIMD', 'WebCodecs']);

      var role = 0

      let user = await getUser()

      var meetingNumber = zoomDetails.zoom_id
      var leaveUrl = `/web-app/dashboard/webinars/${this.props.productslug}`
      var userName = `${user.first_name} ${user.last_name}`
      var userEmail = user.email
      var password = zoomDetails.zoomDetails.password

      let zoomAuth = await getSettings('zoomAuth');


      let apiKey = zoomAuth.apiKey;
      let apiSecret = zoomAuth.apiSecret;

      let thisRef = this

      setTimeout(() => {
        var signature = ZoomMtg.generateSignature({
          meetingNumber: meetingNumber,
          apiKey: apiKey,
          apiSecret: apiSecret,
          role: role,
          success: function (res) {
            console.log(res.result);

            const meetingConfig = {
              apiKey: apiKey,
              meetingNumber: meetingNumber,
              userName: userName,
              passWord: password,
              leaveUrl: leaveUrl,
              role: role,
              userEmail: userEmail,
              signature: res.result,
              china: 0,
            };

            ZoomMtg.init({
              debug: true, //optional
              leaveUrl: leaveUrl, //required
              // webEndpoint: 'PSO web domain', // PSO option
              showMeetingHeader: false, //option
              disableInvite: true, //optional
              disableCallOut: true, //optional
              disableRecord: true, //optional
              disableJoinAudio: false, //optional
              audioPanelAlwaysOpen: true, //optional
              showPureSharingContent: false, //optional
              isSupportAV: true, //optional,
              isSupportChat: true, //optional,
              isSupportQA: true, //optional,
              isSupportPolling: true, //optional
              isSupportBreakout: true, //optional
              isSupportCC: true, //optional,
              screenShare: true, //optional,
              rwcBackup: '', //optional,
              videoDrag: true, //optional,
              sharingMode: 'both', //optional,
              videoHeader: false, //optional,
              isLockBottom: true, // optional,
              isSupportNonverbal: true, // optional,
              isShowJoiningErrorDialog: true, // optional,
              inviteUrlFormat: '', // optional
              disableCORP: !window.crossOriginIsolated,
              loginWindow: {  // optional,
                width: 400,
                height: 380
              },
              meetingInfo: [ // optional
                'topic',
                'host',
              ],
              disableVoIP: false, // optional
              disableReport: false, // optional
              success: function () {
                // console.log(meetingConfig);
                // console.log("signature", signature);
                ZoomMtg.join({
                  meetingNumber: meetingConfig.meetingNumber,
                  userName: meetingConfig.userName,
                  signature: meetingConfig.signature,
                  apiKey: meetingConfig.apiKey,
                  userEmail: meetingConfig.userEmail,
                  passWord: meetingConfig.passWord,
                  success: async function (res) {

                    thisRef.setState({
                      started: true,

                    })

                    ZoomMtg.getAttendeeslist({});
                    ZoomMtg.getCurrentUser({
                      success: function (res) {
                        // console.log(res);
                        // console.log("success getCurrentUser", res.result.currentUser);
                      },
                    });
                    ZoomMtg.record({
                      record: true
                    });
                  },
                  error: function (res) {
                    console.log(res);
                    toastr.error(res.error)
                  },
                });
              },
              error: function (res) {
                console.log(res);
              },
            });
          },
        });

        ZoomMtg.inMeetingServiceListener('onUserJoin', function (data) {
          // console.log('inMeetingServiceListener onUserJoin', data);
        });

        ZoomMtg.inMeetingServiceListener('onUserLeave', function (data) {
          // console.log('inMeetingServiceListener onUserLeave', data);
        });

        ZoomMtg.inMeetingServiceListener('onUserIsInWaitingRoom', function (data) {
          // console.log('inMeetingServiceListener onUserIsInWaitingRoom', data);


        });

        ZoomMtg.inMeetingServiceListener('onMeetingStatus', function (data) {
          // console.log('inMeetingServiceListener onMeetingStatus', data);
          console.log(data.meetingStatus)

          if (data.meetingStatus == 3) {
            console.log('meeting ended')
          }
        });
        // leave-meeting-options__btn
      }, 6000);

    }

    else {

      if (zoomDetails && zoomDetails.base_type == 'YOUTUBE') {

        let data = await getSettings('metaDetails')

        this.setState({
          YoutubeData: zoomDetails,
          product: product,
          appData: data
        })
      }

    }

  }

  // 
  componentDidMount() {
    const { ZoomMtg } = require("@zoomus/websdk")
    let version = ZoomMtg.getWebSDKVersion()
    version = version[0]

    this.setState({
      version: version
    }, () => {
      let id = this.props.slug;

      if (id) {
        this.fetchData(id);
      } else {
        alert("Oh!");
      }
    })
  }

  // 
  render() {

    return (
      <>
        <head>
          <meta charset="utf-8" />

          {/* <meta http-equiv="origin-trial" content="**insert your token as provided in the developer console**" /> */}
          <link type="text/css" rel="stylesheet" href={`https://source.zoom.us/${this.state.version}/css/react-select.css`} />
          <link type="text/css" rel="stylesheet" href={`https://source.zoom.us/${this.state.version}/css/bootstrap.css`} />

          <meta name="format-detection" content="telephone=no" />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
          <meta http-equiv="origin-trial" content="" />
        </head>

        {!this.state.YoutubeData && <body className="ReactModal__Body--open">
          {
            !this.state.started &&
            <a className="back-btn my-1 " onClick={() => Router.back()}><i class="fa fa-arrow-left"></i></a>
          }
          <div id="zmmtg-root"></div>
          <div id="aria-notify-area"></div>

          <div class="ReactModalPortal"></div>
          <div class="ReactModalPortal"></div>
          <div class="ReactModalPortal"></div>
          <div class="ReactModalPortal"></div>
          <div class="global-pop-up-box"></div>
          <div class="sharer-controlbar-container sharer-controlbar-container--hidden"></div>
        </body>}

        {this.state.YoutubeData && <>
          {/* {this.state.appData && <WebAppHeader title={this.state.appData.name} />} */}

          {this.state.YoutubeData && <div className="border-bottom w-100 " style={{ height: '100vh' }}>


            <div className=" p-5 pb-2 h-75">
              {
                !this.state.started &&
                <a className="back-btn my-1 " onClick={() => Router.back()}><i class="fa fa-arrow-left"></i></a>
              }
              <div className="py-5">
                <h3 className="font-bold">{this.state.YoutubeData.title}</h3>
                <p className="cart_btn">{this.state.product && this.state.product.name}  / <span className="font-bold font-blue"></span> </p>

                <p className="m-3">{this.state.YoutubeData.description}</p>
              </div>

              <div className="h-100">
                <iframe id="ytplayer" type="text/html" width="100%" height="100%"
                  src={`https://www.youtube.com/embed/${this.state.YoutubeData.youtube_link}?autoplay=1&origin=http://example.com`}
                  frameborder="0"></iframe>
              </div>

            </div>

          </div>}

        </>}



      </>

    )
  }

}