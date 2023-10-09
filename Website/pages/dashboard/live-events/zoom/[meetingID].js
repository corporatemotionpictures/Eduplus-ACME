import { Component } from 'react';
import { fetchByID, edit } from 'helpers/apiService';
import React from 'react'
import SectionTitle from 'components/functional-ui/section-title'
import Datatable from 'components/functional-ui/datatable'
import Shimmer from 'components/website/shimmer/datatable'
import Widget from 'components/functional-ui/widget'
import Comments from 'components/functional-ui/social-feed/comments'
import { Badge } from 'components/functional-ui/badges'
import { getToken } from "helpers/auth";
import { getSettings, add } from "helpers/apiService";
import { getUser } from "helpers/auth";
import { generateSignature } from "helpers/zoom";
import ChatOne from "pages/socket/clone";
import { getOne } from 'helpers/zoom';
import Router from 'next/router';
import toastr from 'toastr'
import define from 'src/json/worddefination.json';
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
    version: null,
    domainUrl: null,
    user: null,
  }

  // 
  static getInitialProps({ query }) {
    return query;
  }

  // Function for fetch data
  fetchData = async (id) => {

    // ZoomMtg.setZoomJSLib('node_modules/@zoomus/websdk/dist/lib', '/av');

    ZoomMtg.setZoomJSLib(`https://source.zoom.us/${this.state.version}/lib`, '/av');
    ZoomMtg.preLoadWasm();
    // ZoomMtg.prepareJssdk();
    ZoomMtg.prepareJssdk([ 'WebAssembly SIMD', 'WebCodecs']);

    let zoomDetails = await fetchByID('live-events', id, { noLog: true });
    zoomDetails = zoomDetails.event

    if (zoomDetails.event_status == 'STARTED') {
      var role = 1
    } else {
      var role = 1
    }

    let user = await getUser()

    var meetingNumber = zoomDetails.zoom_id
    var leaveUrl = '/dashboard/live-events'
    var userName = `${user.first_name} ${user.last_name}`
    var userEmail = user.email
    var password = zoomDetails.zoomDetails.password

    let zoomAuth = await getSettings('zoomAuth');


    let apiKey = zoomAuth.apiKey;
    let apiSecret = zoomAuth.apiSecret;


    $(document).on('click', '.leave-meeting-options__btn--danger', async function () {
      console.log('ended')
      let event = await edit('live-events', { id: zoomDetails.id, event_status: 'ENDED' })
      if (event.updated) {
        let body = {
          title: `${define.liveEvent} Ended`,
          body: ` ${zoomDetails.title} ${define.liveEvent} has been ended on ${moment().format('hh:mm A, MMMM Do YYYY')}`,
          course_ids: zoomDetails.mode == 'FREE' ? null : zoomDetails.course_ids,
          action:'Videos'
        };

        let pushNotification = await add('push-notifications', body);
      }
    })

    // $(document).on('click', '.footer-button__button', function () {
    //   console.log('mcmdscm')
    //   $('.third-part-app-info__button-icon').replaceWith('')
    //   $('#app-signal').replaceWith('')
    // })

    // $('.third-part-app-info__button-icon').load(function(){alert('jdsncjsdjsd csdcsd cksdjckds csdb  fdfsd fbsdv obfcsdodsbnv sdsid vosdvkd ')})


    $('div.alert .close').on('click', function() {
      $('.third-part-app-info__button-icon').replaceWith('')
    });
    

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
            leaveUrl: '/dashboard/live-events', //required
            // webEndpoint: 'PSO web domain', // PSO option
            showMeetingHeader: false, //option
            disableInvite: false, //optional
            disableCallOut: false, //optional
            disableRecord: false, //optional
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
            videoHeader: true, //optional,
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
              'mn',
              'pwd',
              'telPwd',
              'invite',
              'participant',
              'dc',
              'enctype',
              'report'
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

                  ZoomMtg.record({
                    record: true
                  });

                  let event = await edit('live-events', { id: zoomDetails.id, event_status: 'STARTED' })

                  if (event.updated) {
                    let body = {
                      title: `${define.liveEvent} Started`,
                      body: `${zoomDetails.title} ${define.liveEvent} has been srtated on ${moment().format(' hh:mm A, MMMM Do YYYY')}`,
                      course_ids: zoomDetails.mode == 'FREE' ? null : zoomDetails.course_ids,
                      action:'Videos'
                    };

                    let pushNotification = await add('push-notifications', body);
                  }

                  // console.log("join meeting success");
                  // console.log("get attendeelist");
                  ZoomMtg.getAttendeeslist({});
                  ZoomMtg.getCurrentUser({
                    success: function (res) {
                      // console.log(res);
                      // console.log("success getCurrentUser", res.result.currentUser);
                    },
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
      ZoomMtg.inMeetingServiceListener('onLeaveMeeting', function (data) {
        // console.log('onLeaveMeeting', data);
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

  // 
  componentDidMount() {

    const { ZoomMtg } = require("@zoomus/websdk")
    let version = ZoomMtg.getWebSDKVersion()
    version = version[0]

    this.setState({
      version: version
    }, () => {
      let id = this.props.meetingID;
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
        {this.state.version && <head>
          <meta charset="utf-8" />

          {/* <meta http-equiv="origin-trial" content="**insert your token as provided in the developer console**" /> */}
          <link type="text/css" rel="stylesheet" href={`https://source.zoom.us/${this.state.version}/css/react-select.css`} />
          <link type="text/css" rel="stylesheet" href={`https://source.zoom.us/${this.state.version}/css/bootstrap.css`} />

          <meta name="format-detection" content="telephone=no" />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
          <meta http-equiv="origin-trial" content="" />
        </head>}
        <script src={`https://source.zoom.us/${this.state.version}/lib/vendor/react.min.js`}></script>
        <script src={`https://source.zoom.us/${this.state.version}/lib/vendor/react-dom.min.js`}></script>
        <script src={`https://source.zoom.us/${this.state.version}/lib/vendor/redux.min.js`}></script>
        <script src={`https://source.zoom.us/${this.state.version}/lib/vendor/redux-thunk.min.js`}></script>
        <script src={`https://source.zoom.us/${this.state.version}/lib/vendor/lodash.min.js`}></script>


        <body class="ReactModal__Body--open">

          <div id="zmmtg-root"></div>
          <div id="aria-notify-area"></div>

          <div class="ReactModalPortal"></div>
          <div class="ReactModalPortal"></div>
          <div class="ReactModalPortal"></div>
          <div class="ReactModalPortal"></div>
          <div class="global-pop-up-box"></div>
          <div class="sharer-controlbar-container sharer-controlbar-container--hidden"></div>

        </body>

      </>

    )
  }

}