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
  fetchData = async (id) => {
    var data = await fetchByID(this.state.modelTitle, id, { noLog: true });
    this.setState({ data })

    var embedLink;
    var embadChatLink;
    var zoomDetails;

    if (data.event.base_type != 'ZOOM' && data.event.base_type != 'YOUTUBE') {
      if (data.event.video_id) {
        embedLink = `https://player.vimeo.com/video/${data.event.video_id}`;
        embadChatLink = `https://vimeo.com/live-chat/${data.event.video_id}/`;
      }
      else {
        embedLink = `https://vimeo.com/event/${data.event.event_id}/embed`;
        embadChatLink = `https://vimeo.com/event/${data.event.event_id}/chat`;
      }
    }


    if (data.event.base_type == 'ZOOM' && data.event.zoomDetails) {
      zoomDetails = data.event.zoomDetails
    }


    this.setState({
      fetching: false,
      values: data.event,
      embedLink: embedLink,
      embadChatLink: embadChatLink,
      zoomDetails: zoomDetails,
      recording: zoomDetails.recording,
      user: await getUser()
    });


    console.log(zoomDetails.recording)


  }

  // 
  componentDidMount() {
    let id = this.props.id;
    if (id) {
      this.fetchData(id);
    } else {
      alert("Oh!");
    }

    this.setState({
      token: getToken(),
      domainUrl: process.env.NEXT_PUBLIC_SOCKET_URL,
      user: getUser()
    })
  }

  // 
  render() {
    const video = this.state.data && this.state.data.event

    return (
      <>
        {
          this.state.data && this.state.data.event &&
          <>
            <SectionTitle title="Video" subtitle={`${video.title}`} hideButton={true} />

            <Widget
              title=""
              description=''>
              <div className="flex flex-row justify-start mb-4">

                {video.video_id && <div className='w-1/2'>
                  <iframe
                    src={`https://player.vimeo.com/video/${video.video_id}`}
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen="false"
                    ref={frame => this.video = frame}
                    className="video__iframe"
                  />

                  <div className="flex flex-row items-center justify-start mb-4">
                    <button className="btn btn-default btn-rounded btn-icon">
                      <FiThumbsUp size={18} className="stroke-current" />
                      <span className="ml-2">{video.likes} Like</span>
                    </button>
                    <button className="btn btn-default btn-rounded btn-icon">
                      <FiMessageCircle size={18} className="stroke-current" />
                      <span className="ml-2">{video.count_comments} Comment</span>
                    </button>

                    {/* <Avatars items={items} /> */}
                  </div>

                  <ChatOne token={this.state.token} eventId={video.id} user_id={this.state.user.id} />

                  <div className="w-full mb-4">
                    {/* <div className="video">
                      <iframe
                        width="100%"
                        height="300px"
                        src={`${this.state.domainUrl}/socket/clone?token=${this.state.token}&&eventId=${video.id}&&user_id=${this.state.user.id}`}
                        frameBorder="0"
                        allow="autoplay; encrypted-media"
                        allowFullScreen="false"
                        className="video__iframe"
                      />

                      {this.state.videoIsLoading ? <Loader /> : null}
                    </div> */}

                  </div>

                </div>}


                <div className="w-1/2">
                  <div className="pb-2 w-1/2">
                    <img src={video.thumbnail}></img>
                  </div>
                  <div className="pb-2 flex flex-col lg:flex-row">
                    <div className="text-sm pt-1">
                      {video.description}
                    </div>
                  </div>
                  <div className="pb-2 flex flex-col lg:flex-row">
                    <div className="text-sm font-bold w-1/3">Video ID</div>
                    <div className="text-sm pt-1 w-2/3 ">
                      <span className="capitalized">{video.video_id}</span>
                    </div>
                  </div>
                  <div className="pb-2 flex flex-col lg:flex-row">
                    <div className="text-sm font-bold w-1/3">Event ID</div>
                    <div className="text-sm pt-1 w-2/3 ">
                      <span className="capitalized">{video.event_id}</span>
                    </div>
                  </div>
                  <div className="pb-2 flex flex-col lg:flex-row">
                    <div className="text-sm font-bold w-1/3">Tags</div>
                    <div className="text-sm pt-1 w-2/3 ">
                      <span className="capitalized">{video.tags}</span>
                    </div>
                  </div>
                  <div className="pb-2 flex flex-col lg:flex-row">
                    <div className="text-sm font-bold w-1/3">Status</div>
                    <div className="text-sm pt-1 w-2/3 ">
                      <span className="capitalized">{video.status}</span>
                    </div>
                  </div>
                  <div className="pb-2 flex flex-col lg:flex-row">
                    <div className="text-sm font-bold w-1/3">Mode</div>
                    <div className="text-sm pt-1 w-2/3">
                      {video.mode}
                    </div>
                  </div>

                  {this.props.hideHierarchy < 1 && <div className="pb-2 flex flex-col lg:flex-row">
                    <div className="text-sm font-bold w-1/3">Exams</div>
                    <div className="text-sm pt-1 w-2/3">
                      <div className="flex flex-wrap justify-start items-start" >
                        {video.exams && video.exams.map((item) => {
                          return <Badge key={item.id} size='sm' color="bg-blue-200 text-blue-600 mr-2 mb-2" rounded>
                            {item.name}
                          </Badge>
                        })}
                      </div>
                    </div>
                  </div>}
                  {this.props.hideHierarchy < 2 && <div className="pb-2 flex flex-col lg:flex-row">
                    <div className="text-sm font-bold w-1/3">Courses</div>
                    <div className="text-sm pt-1 w-2/3">
                      <div className="flex flex-wrap justify-start items-start" >
                        {video.courses && video.courses.map((item) => {
                          return <Badge key={item.id} size='sm' color="bg-blue-200 text-blue-600 mr-2 mb-2" rounded>
                            {item.name}
                          </Badge>
                        })}
                      </div>
                    </div>
                  </div>}
                  <div className="pb-2 flex flex-col lg:flex-row">
                    <div className="text-sm font-bold w-1/3">Subjects</div>
                    <div className="text-sm pt-1 w-2/3">
                      <div className="flex flex-wrap justify-start items-start" >
                        {video.subjects && video.subjects.map((item) => {
                          return <Badge key={item.id} size='sm' color="bg-blue-200 text-blue-600 mr-2 mb-2" rounded>
                            {item.name}
                          </Badge>
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="pb-2 flex flex-col lg:flex-row">
                    <div className="text-sm font-bold w-1/3">Chapters</div>
                    <div className="text-sm pt-1 w-2/3">
                      <div className="flex flex-wrap justify-start items-start" >
                        {video.chapters && video.chapters.map((item) => {
                          return <Badge key={item.id} size='sm' color="bg-blue-200 text-blue-600 mr-2 mb-2" rounded>
                            {item.name}
                          </Badge>
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="pb-2 flex flex-col lg:flex-row">
                    <div className="text-sm font-bold w-1/3">Batches</div>
                    <div className="text-sm pt-1 w-2/3">
                      <div className="flex flex-wrap justify-start items-start" >
                        {video.batches && video.batches.map((item) => {
                          return <Badge key={item.id} size='sm' color="bg-blue-200 text-blue-600 mr-2 mb-2" rounded>
                            {item.title}
                          </Badge>
                        })}
                      </div>
                    </div>
                  </div>

                </div>

                {
                  this.state.recording && <div className='w-1/2'>

                    {
                      this.state.recording.recording_files && this.state.recording.recording_files.map(recording => {

                        console.log(recording)
                        return <div>

                          <video id="videoFrame" src={recording.play_url} preload="auto" controlsList="nodownload" className="w-100" ></video>
                          <a  id="videoFrame"  href={recording.download_url} preload="auto"  controlsList="nodownload" className="w-100 btn btn-primary" download>DOwnload</a>
                        </div>

                      })
                    }

                  </div>
                }
              </div>
            </Widget>
          </>
        }
      </>

    )
  }

}
