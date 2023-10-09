import { Component } from 'react';
import { fetchByID } from 'helpers/apiService';
import React from 'react'
import SectionTitle from 'components/functional-ui/section-title'
import Datatable from 'components/functional-ui/datatable'
import Shimmer from 'components/website/shimmer/datatable'
import Widget from 'components/functional-ui/widget'
import Comments from 'components/functional-ui/social-feed/comments'
import { Badge } from 'components/functional-ui/badges'
import ScrollableFeed from 'react-scrollable-feed'
import { UnderlinedTabs } from 'components/functional-ui/tabs';
import Link from "next/link";

import {
  FiThumbsUp,
  FiMessageCircle,
  FiShare2
} from 'react-icons/fi'
import moment from 'moment'
import define from 'src/json/worddefination.json'

//

export default class extends Component {
  state = {
    video: {},
    search: '',
    fetching: true,
    modelTitle: 'videos',
  }

  // 
  static getInitialProps({ query }) {
    return query;
  }

  // Function for fetch data
  fetchData = async (id) => {
    var data = await fetchByID(this.state.modelTitle, id, { noLog: true });
    let url = null
    if (data.video && data.video.videoUrl) {
      url = data.video.videoUrl
    }
    this.setState({ data, url: url })



  }

  // 
  componentDidMount() {
    let id = this.props.id;
    if (id) {
      this.fetchData(id);
    } else {
      alert("Oh!");
    }
  }

  // 
  render() {
    const video = this.state.data && this.state.data.video

    const tabs = [

      {
        index: 0,
        title: 'Discussion',
        content: (
          <div className="w-full mb-4">
            {video && video.all_comments.map((comment, i) => (
              <div
                className="flex items-start justify-start space-x-4 p-4 border-b"
                key={i}>
                <div className="flex-shrink-0 w-8">
                  <img
                    src={comment.user_image}
                    // alt={window.localStorage.getItem('defaultImageAlt')}
                    className={`h-8 w-full shadow-lg rounded-full ring`}
                  />
                </div>
                <div className="flex flex-col lg:flex-row w-full">
                  <div className="flex flex-col w-full">
                    <div className="text-sm font-bold">{`${comment.user_first_name} ${comment.user_last_name}`}</div>
                    <div className="text-sm">{comment.comment}</div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="text-gray-500 lg:ml-1">{moment(comment.created_at).fromNow()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      },

    ];

    return (
      <>


        {
          this.state.data && this.state.data.video &&
          <>
            <SectionTitle title="Video" subtitle={`${video.title}`} hideButton={true} />

            <Widget
              title=""
              description=''>
              <div className="flex flex-row justify-start mb-4">
                {
                  video && (video.lacture_type == 'VIDEO' || video.lacture_type == 'YOUTUBE') &&
                  <div className='w-2/3 border-r px-4'>
                    {
                      video && <div className="player-wrapper player-height ">
                        <div className="player-button">
                          <div class="dropdown mr-2">
                            <button class="btn btn-secondary" type="button" id="dropdownMenu1">
                              <i class="fa fa-cog"></i>
                            </button>

                            <div class="dropdown-menu dropdown-content" aria-labelledby="dropdownMenu1">
                              {
                                video.lacture_type == 'VIDEO' && video.progressive && video.progressive.map(prog => {
                                  return <button class={`dropdown-item urls ${this.state.url && this.state.url.includes(prog.url) ? 'active' : ''}`} type="button" onClick={(e) => {
                                    let time = document.getElementById("videoFrame").currentTime
                                    this.setState({
                                      url: `${prog.url}#t=${time}`,
                                      autoplay: true
                                    })

                                    video.progressive.map((index, i) => {
                                      document.getElementsByClassName('urls')[i].classList.remove('active');
                                    })
                                    e.target.className = 'dropdown-item urls active';
                                  }}>{prog.quality}</button>
                                })
                              }

                              {
                                video.lacture_type == 'YOUTUBE' && <iframe id="ytplayer" type="text/html" width="100%" height="100%"
                                  src={`https://www.youtube.com/embed/${video.video_id}?autoplay=1`}
                                  frameborder="0"></iframe>
                              }

                            </div>


                          </div>

                          <div className="dropdown mr-2">
                            <button class="btn btn-danger" type="button">
                              <i class="fa fa-tachometer"></i> </button>
                            <div class="dropdown-menu dropdown-content" aria-labelledby="dropdownMenu2">


                            </div>
                          </div>

                        </div>
                        <video ontimeupdate={(e) => this.checkTime(e)} id="videoFrame" autoplay={this.state.autoplay} controls src={this.state.url} preload="auto" poster={video.thumbnailUrl} controlsList="nodownload" className="w-full" ></video>

                      </div>
                    }

                    <div className="flex flex-row items-center justify-end mb-4 mt-3">
                      <button className="btn btn-default btn-rounded btn-icon border mr-3">
                        <FiMessageCircle size={18} className="stroke-current" />
                        <span className="ml-2">{video.count_comments} Comment</span>
                      </button>
                      <button className="btn btn-default btn-rounded btn-icon bg-red-500 text-white">
                        <FiThumbsUp size={18} className="stroke-current" />
                        <span className="ml-2">{video.likes} Like</span>
                      </button>


                      {/* <Avatars items={items} /> */}
                    </div>

                    <div >
                      {/* <img className="w-full px-2" src={video.thumbnail} /> */}

                      <div className="pb-2 flex flex-col lg:flex-row p-2">
                        <div className=" w-full font-bold ">
                          <h3 className="capitalized">{video.title}</h3>
                        </div>


                      </div>
                      <div className="pb-2 flex flex-col lg:flex-row p-2">
                        <div className=" w-full text-justify">
                          <span className=" text-justify justify">{video.description}</span>
                        </div>
                      </div>
                      <div className="pb-2 flex flex-col lg:flex-row p-2 border-b border-t mt-2">
                        <div className=" text-gray-600 w-1/3">Language</div>
                        <div className="  w-2/3 font-bold text-right">
                          <span className="capitalize">{video.language && video.language.title}</span>
                        </div>
                      </div>
                      {video.lacture_type == 'VIDEO' && <div className="pb-2 flex flex-col lg:flex-row p-2 border-b">
                        <div className=" text-gray-600 w-1/3">Video ID</div>
                        <div className="  w-2/3 font-bold text-right">
                          <span className="capitalize">{video.video_id}</span>
                        </div>
                      </div>}
                      <div className="pb-2 flex flex-col lg:flex-row p-2 border-b">
                        <div className=" text-gray-600 w-1/3">Tags</div>
                        <div className="  w-2/3 font-bold text-right">
                          <span className="capitalize">{video.tags}</span>
                        </div>
                      </div>
                      <div className="pb-2 flex flex-col lg:flex-row p-2 border-b">
                        <div className=" text-gray-600 w-1/3">Status</div>
                        <div className="  w-2/3 font-bold text-right">
                          <span className="capitalize text-white border-0 text-center rounded px-2 py-1 bg-green-500">{video.status}</span>
                        </div>
                      </div>
                      <div className="pb-2 flex flex-col lg:flex-row p-2 border-b">
                        <div className=" text-gray-600 w-1/3">Mode</div>
                        <div className="  w-2/3 font-bold text-right">
                          <span className="capitalize">{video.mode}</span>
                        </div>
                      </div>
                      {video.lacture_type == 'VIDEO' && <div className="pb-2 flex flex-col lg:flex-row p-2 border-b">
                        <div className=" text-gray-600 w-1/3">Views</div>
                        <div className="  w-2/3 font-bold text-right">
                          <span className="capitalize">{video.views}</span>
                        </div>
                      </div>}
                      {this.props.hideHierarchy < 1 && <div className="pb-2 flex flex-col lg:flex-row p-2 border-b">
                        <div className=" text-gray-600 w-full">Exams</div>
                        <div className="  w-full font-bold text-right">
                          <span className="capitalize">
                            {
                              video.exams && video.exams.map((exam, i) => {
                                return i == 0 ? exam.name : `, ${exam.name}`
                              })
                            }
                          </span>
                        </div>
                      </div>}
                      {this.props.hideHierarchy < 2 && <div className="pb-2 flex flex-col lg:flex-row p-2 border-b">
                        <div className=" text-gray-600 w-1/3">Courses</div>
                        <div className="  w-2/3 font-bold text-right">
                          <span className="capitalized">
                            {
                              video.courses && video.courses.map((course, i) => {
                                return i == 0 ? course.name : `, ${course.name}`
                              })
                            }
                          </span>
                        </div>
                      </div>}
                      <div className="pb-2 flex flex-col lg:flex-row p-2 border-b">
                        <div className=" text-gray-600 w-1/3">Subjects</div>
                        <div className="  w-2/3 font-bold text-right">
                          <span className="capitalized">
                            {
                              video.subjects && video.subjects.map((subject, i) => {
                                return i == 0 ? subject.name : `, ${subject.name}`
                              })
                            }
                          </span>
                        </div>
                      </div>
                      <div className="pb-2 flex flex-col lg:flex-row p-2 border-b">
                        <div className=" text-gray-600 w-1/3">Chapters</div>
                        <div className="  w-2/3 font-bold text-right">
                          <span className="capitalized">
                            {
                              video.chapters && video.chapters.map((chapter, i) => {
                                return i == 0 ? chapter.name : `, ${chapter.name}`
                              })
                            }
                          </span>
                        </div>
                      </div>
                      <div className="pb-2 flex flex-col lg:flex-row p-2 border-b">
                        <div className=" text-gray-600 w-1/3">Created At</div>
                        <div className="  w-2/3 font-bold text-right">
                          <span className="capitalized">{moment(video.created_at).format('DD MMM YYYY hh:mm A')}</span>
                        </div>
                      </div>

                    </div>



                  </div>
                }
                {
                  video && video.lacture_type == 'TEST' &&
                  <div className='w-2/3 border-r px-4 h-95vh overflow-y-scroll'>
                    <h5>Questions</h5>
                    {
                      video.questions && video.questions.map((question, i) => {
                        return <div className="w-full mt-4 pb-4 border-b">
                          <div className="flex">
                            <p><b>{i + 1}. {question.question}</b></p>
                          </div>
                          <div className="flex ml-2 mt-1">
                            <p>Option 1 : {question.option1}</p>
                          </div>
                          <div className="flex ml-2 mt-1">
                            <p>Option 2 : {question.option2}</p>
                          </div>
                          <div className="flex ml-2 mt-1">
                            <p>Option 3 : {question.option3}</p>
                          </div>
                          <div className="flex ml-2 mt-1">
                            <p>Option 4 : {question.option4}</p>
                          </div>
                          <div className="flex ml-2 mt-1">
                            <p><b>Answer : {question[question.answer]}</b></p>
                          </div>
                          <div className="flex ml-2 mt-1">
                            <p>Explain : {question.explain}</p>
                          </div>
                        </div>
                      })
                    }
                  </div>
                }
                <div className="w-1/3">
                  {video && video.lacture_type == 'TEST' &&
                    <div >
                      <img className="w-full px-2" src={video.thumbnail} />

                      <div className="pb-2 flex flex-col lg:flex-row p-2">
                        <div className=" w-full font-bold ">
                          <span className="capitalized">{video.title}</span>
                        </div>


                      </div>
                      <div className="pb-2 flex flex-col lg:flex-row p-2">
                        <div className=" w-full">
                          <span className="">{video.description}</span>
                        </div>
                      </div>
                      {/* <div className="pb-2 flex flex-col lg:flex-row p-2">
                                         <div className="text-sm  w-full font-bold ">
                                             <span className="capitalized">Information</span>
                                         </div>
                                     </div> */}
                      <div className="pb-2 flex flex-col lg:flex-row p-2 border-b">
                        <div className=" text-gray-600 w-1/3">Language</div>
                        <div className="  w-2/3 font-bold text-right">
                          <span className="capitalized">{video.language && video.language.title}</span>
                        </div>
                      </div>
                      {video.lacture_type == 'VIDEO' && <div className="pb-2 flex flex-col lg:flex-row p-2 border-b">
                        <div className=" text-gray-600 w-1/3">Video ID</div>
                        <div className="  w-2/3 font-bold text-right">
                          <span className="capitalized">{video.video_id}</span>
                        </div>
                      </div>}
                      <div className="pb-2 flex flex-col lg:flex-row p-2 border-b">
                        <div className=" text-gray-600 w-1/3">Tags</div>
                        <div className="  w-2/3 font-bold text-right">
                          <span className="capitalized">{video.tags}</span>
                        </div>
                      </div>
                      <div className="pb-2 flex flex-col lg:flex-row p-2 border-b">
                        <div className=" text-gray-600 w-1/3">Status</div>
                        <div className="  w-2/3 font-bold text-right">
                          <span className="capitalized">{video.status}</span>
                        </div>
                      </div>
                      <div className="pb-2 flex flex-col lg:flex-row p-2 border-b">
                        <div className=" text-gray-600 w-1/3">Mode</div>
                        <div className="  w-2/3 font-bold text-right">
                          <span className="capitalized">{video.mode}</span>
                        </div>
                      </div>
                      {video.lacture_type == 'VIDEO' && <div className="pb-2 flex flex-col lg:flex-row p-2 border-b">
                        <div className=" text-gray-600 w-1/3">Views</div>
                        <div className="  w-2/3 font-bold text-right">
                          <span className="capitalized">{video.views}</span>
                        </div>
                      </div>}
                      {this.props.hideHierarchy < 1 && <div className="pb-2 flex flex-col lg:flex-row p-2 border-b">
                        <div className=" text-gray-600 w-full">Exams</div>
                        <div className="  w-full font-bold text-right">
                          <span className="capitalized">
                            {
                              video.exams && video.exams.map((exam, i) => {
                                return i == 0 ? exam.name : `, ${exam.name}`
                              })
                            }
                          </span>
                        </div>
                      </div>}
                      {this.props.hideHierarchy < 2 && <div className="pb-2 flex flex-col lg:flex-row p-2 border-b">
                        <div className=" text-gray-600 w-1/3">Courses</div>
                        <div className="  w-2/3 font-bold text-right">
                          <span className="capitalized">
                            {
                              video.courses && video.courses.map((course, i) => {
                                return i == 0 ? course.name : `, ${course.name}`
                              })
                            }
                          </span>
                        </div>
                      </div>}
                      <div className="pb-2 flex flex-col lg:flex-row p-2 border-b">
                        <div className=" text-gray-600 w-1/3">Subjects</div>
                        <div className="  w-2/3 font-bold text-right">
                          <span className="capitalized">
                            {
                              video.subjects && video.subjects.map((subject, i) => {
                                return i == 0 ? subject.name : `, ${subject.name}`
                              })
                            }
                          </span>
                        </div>
                      </div>
                      <div className="pb-2 flex flex-col lg:flex-row p-2 border-b">
                        <div className=" text-gray-600 w-1/3">Chapters</div>
                        <div className="  w-2/3 font-bold text-right">
                          <span className="capitalized">
                            {
                              video.chapters && video.chapters.map((chapter, i) => {
                                return i == 0 ? chapter.name : `, ${chapter.name}`
                              })
                            }
                          </span>
                        </div>
                      </div>
                      <div className="pb-2 flex flex-col lg:flex-row p-2 border-b">
                        <div className=" text-gray-600 w-1/3">Created At</div>
                        <div className="  w-2/3 font-bold text-right">
                          <span className="capitalized">{moment(video.created_at).format('DD MMM YYYY hh:mm A')}</span>
                        </div>
                      </div>

                    </div>
                  }
                  {video && (video.lacture_type == 'VIDEO' || video.lacture_type == 'YOUTUBE') &&
                    <div >

                      <div className="w-full mb-4">
                        <h4 className='text-center text-bold border-b pb-2'>Discussion</h4>
                        {video && video.all_comments.map((comment, i) => (
                          <div
                            className="flex items-start justify-start space-x-4 p-4 border-b"
                            key={i}>
                            <div className="flex-shrink-0 w-10">
                              {comment.user_image === "/images/default-profile.jpg" &&
                                <div className={`profile_image profile_image-${i%8} h-10 w-full text-lg flex items-center justify-center font-bold uppercase`}>
                                  {`${comment.user_first_name.charAt(0)}`}
                                </div>
                                ||
                                <img
                                  src={comment.user_image}
                                  alt={window.localStorage.getItem('defaultImageAlt')}
                                  className="h-8 w-full shadow-lg rounded-full ring"
                                />
                              }
                            </div>
                            <div className="flex flex-col lg:flex-row w-full">
                              <div className="flex flex-col w-full">
                                <div className="text-sm font-bold">{`${comment.user_first_name} ${comment.user_last_name}`}</div>
                                <div className="text-sm">{comment.comment}</div>
                              </div>
                              <div className="flex-shrink-0">
                                <div className="text-gray-500 lg:ml-1">{moment(comment.created_at).fromNow()}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  }

                </div>
              </div>
            </Widget>
          </>
        }
      </>

    )
  }

}
