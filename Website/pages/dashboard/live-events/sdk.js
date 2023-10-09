import { Component } from 'react';
import { fetchByID } from 'helpers/apiService';
import React from 'react'
import SectionTitle from 'components/functional-ui/section-title'
import Datatable from 'components/functional-ui/datatable'
import Shimmer from 'components/website/shimmer/datatable'
import Widget from 'components/functional-ui/widget'
import Comments from 'components/functional-ui/social-feed/comments'
import { Badge } from 'components/functional-ui/badges'
import { getToken } from "helpers/auth";
import { getSettings } from "helpers/apiService";
import { generateSignature } from "helpers/zoom";
import { getUser } from "helpers/auth";
import ChatOne from "pages/socket/clone";
import {
    FiThumbsUp,
    FiMessageCircle,
    FiShare2
} from 'react-icons/fi'
import moment from 'moment'

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
    }

    // 
    static getInitialProps({ query }) {
        return query;
    }

    // Function for fetch data
    fetchData = async () => {

        const { ZoomMtg } = require("@zoomus/websdk")

        // ZoomMtg.setZoomJSLib('node_modules/@zoomus/websdk/dist/lib', '/av');

        ZoomMtg.setZoomJSLib('https://source.zoom.us/1.9.5/lib', '/av');
        ZoomMtg.preLoadWasm();
        ZoomMtg.prepareJssdk();


        var signatureEndpoint = 'http://localhost:4000'
        var meetingNumber = this.props.meetingID
        var role = 1
        var leaveUrl = '/dashboard/live-events'
        var userName = 'Swarna sahu'
        var userEmail = 'swarna.sahu@etherealcorporate.com'
        var passWord = 1234

        let zoomAuth = await getSettings('zoomAuth');
        // let signature = await generateSignature(meetingNumber, role);

        let apiKey = zoomAuth.apiKey;
        let apiSecret = zoomAuth.apiSecret;

        // ZoomMtg.preLoadWasm();
        // ZoomMtg.prepareJssdk();

        setTimeout(() => {
            var signature = ZoomMtg.generateSignature({
                meetingNumber: meetingNumber,
                apiKey: apiKey,
                apiSecret: apiSecret,
                role: 1,
                success: function (res) {
                    console.log(res.result);

                    const meetingConfig = {
                        apiKey: apiKey,
                        meetingNumber: meetingNumber,
                        userName: userName,
                        passWord: '1234',
                        leaveUrl: leaveUrl,
                        role: role,
                        userEmail: userEmail,
                        signature: res.result,
                        china: 0,
                    };


                    console.log(JSON.stringify(ZoomMtg.checkSystemRequirements()));

                    ZoomMtg.init({
                        debug: true, //optional
                        leaveUrl: 'http://www.zoom.us', //required
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
                            console.log(meetingConfig);
                            console.log("signature", signature);
                            ZoomMtg.join({
                                meetingNumber: meetingConfig.meetingNumber,
                                userName: meetingConfig.userName,
                                signature: meetingConfig.signature,
                                apiKey: meetingConfig.apiKey,
                                userEmail: meetingConfig.userEmail,
                                passWord: meetingConfig.passWord,
                                success: function (res) {
                                    console.log(res);
                                    console.log("join meeting success");
                                    console.log("get attendeelist");
                                    ZoomMtg.getAttendeeslist({});
                                    ZoomMtg.getCurrentUser({
                                        success: function (res) {
                                            console.log(res);
                                            console.log("success getCurrentUser", res.result.currentUser);
                                        },
                                    });
                                },
                                error: function (res) {
                                    console.log(res);
                                },
                            });
                        },
                        error: function (res) {
                            console.log(res);
                        },
                    });
                    // var joinUrl = "/meeting.html?" + testTool.serialize(meetingConfig);
                    // console.log(joinUrl);
                    // window.open(joinUrl, "_blank");
                },
            });

            ZoomMtg.inMeetingServiceListener('onUserJoin', function (data) {
                console.log('inMeetingServiceListener onUserJoin', data);
            });

            ZoomMtg.inMeetingServiceListener('onUserLeave', function (data) {
                console.log('inMeetingServiceListener onUserLeave', data);
            });

            ZoomMtg.inMeetingServiceListener('onUserIsInWaitingRoom', function (data) {
                console.log('inMeetingServiceListener onUserIsInWaitingRoom', data);
            });

            ZoomMtg.inMeetingServiceListener('onMeetingStatus', function (data) {
                console.log('inMeetingServiceListener onMeetingStatus', data);
            });
        }, 6000);




    }

    // 
    componentDidMount() {
        this.fetchData()
    }

    // 
    render() {

        return (
            <>
                <head>
                    {/* <link type="text/css" rel="stylesheet" href="node_modules/@zoomus/websdk/dist/css/bootstrap.css" />
                    <link type="text/css" rel="stylesheet" href="node_modules/@zoomus/websdk/dist/css/bootstrap.css" /> */}
                    <link type="text/css" rel="stylesheet" href="https://source.zoom.us/1.9.5/css/bootstrap.css" />
                    <link type="text/css" rel="stylesheet" href="https://source.zoom.us/1.9.5/css/react-select.css" />
                </head>

                <body className="ReactModal__Body--open">
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