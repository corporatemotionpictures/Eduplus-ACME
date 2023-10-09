import Link from "next/link";
import React from 'react';
import { get, fetchByID, fetchAll, add, post } from 'helpers/apiService';
import { UnderlinedTabs } from 'components/functional-ui/tabs';
import { Component } from 'react';
import moment from 'moment';
import toastr from 'toastr';
import ScrollableFeed from 'react-scrollable-feed'

import define from 'src/json/worddefination.json'

export default class extends Component {
  state = {
    video: {},
    url: null,
    autoplay: false,
    wishListed: false,
    liked: false,
    loader: true,
    videoID: null,
    speeds: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
  }


  // 
  static getInitialProps({ query }) {
    console.log(query)
    return query;
  }


  // Function for fetch data
  fetchData = async (id) => {

    this.setState({
      loader: true,

    })


    let dataSlug = this.props.chapterslug.split('-')

    let subjectID = dataSlug[0]
    let chapterID = dataSlug[1]

    data = await fetchByID(`chapters`, chapterID)
    let chapter = data.chapter ? data.chapter : null

    data = await fetchByID(`subjects`, subjectID)
    let subject = data.subject ? data.subject : null

    // this.setState({ video: null })
    let data = await get(`products/slug?slug=${this.props.productslug}`)
    let productid = data.product ? data.product.id : null

    let product = data.product

    let filters = { productID: productid }

    var video = await fetchByID('videos', id, filters)

    // this.setState({ video: null })
    let comments = await fetchAll('video-comments', { videoID: id })
    comments = comments.comments ? comments.comments : []

    let url = null
    if (video.video && video.video.videoUrl) {
      url = video.video.videoUrl
    }

    this.setState({
      loader: false,
      video: video.video,
      comments: comments,
      url: url,
      chapter: chapter,
      subject: subject,
      product: product,
      watchListed: video.video.watchListedByUser ? true : false,
      liked: video.video.likedByUser ? true : false,
    }, () => {

      this.setState({
        viewed: false
      }, () => {

        const video = document.querySelector('#videoFrame');

        video.addEventListener('timeupdate', (event) => {
          var totalLength = video.duration;
          var percentageCompleted = (video.currentTime / totalLength) * 100;
          console.log('percentage', (percentageCompleted + '%'));

          if (percentageCompleted >= 20 && !this.state.viewed) {

            this.setState({
              viewed: true
            }, () => {
              this.addView()
            })

          }
        });
      })
    })


  }

  // Function for fetch data
  fetchComment = async (id) => {

    let comments = await fetchAll('video-comments', { videoID: id })
    comments = comments.comments ? comments.comments : []

    this.setState({
      comments: comments,
    })

  }

  comment = async (event) => {
    event.preventDefault()
    var f = document.getElementById('form')
    var form = new FormData(document.getElementById('form'));
    var inputValue = form.get("comment");
    let body = {
      video_id: this.props.slug,
      comment: inputValue
    }
    var comme = await add('video-comments', body)
    if (comme.updated) {
      this.fetchComment(this.props.slug)
    }
    if (f) {
      f.reset()
    }
  }

  addToWishlist = async (event) => {
    event.preventDefault()
    let body = {
      video_id: this.props.slug
    }
    var comme = await add('videos/watch-lists', body)
    if (comme.success) {
      toastr.success(' Video Added To Watchlist')
      this.setState({
        wishListed: true
      })
    }
  }

  removeFromWishlist = async (event) => {
    event.preventDefault()
    let body = {
      video_id: this.props.slug
    }
    var comme = await post('videos/watch-lists/remove', body)
    if (comme.success) {
      toastr.success(' Video Removed From Watchlist')
      this.setState({
        wishListed: false
      })
    }
  }

  addView = async () => {
    let body = {
      video_id: this.props.slug
    }

    var comme = await get(`videos/add-view?videoID=${this.props.slug}`)
    if (comme.success) {
      // toastr.success('Video Liked')

    }
  }

  like = async (event) => {
    event.preventDefault()
    let body = {
      video_id: this.props.slug
    }
    var comme = await post('videos/likes/like', body)
    if (comme.success) {
      // toastr.success('Video Liked')
      this.setState({
        liked: true
      })
    }
  }

  dislike = async (event) => {
    event.preventDefault()
    let body = {
      video_id: this.props.slug
    }
    var comme = await post('videos/likes/remove-like', body)
    if (comme.success) {
      // toastr.success('Video Like Removed')
      this.setState({
        liked: false
      })
    }
  }

  // 
  componentDidMount() {
    let id = this.props.slug;
    if (id) {
      this.fetchData(id);
    } else {
      alert("Oh!");
    }



    this.setState({ videoID: this.props.slug })

  }
  // 
  checkTime = (e) => {

  }




  render() {
    const tabs = [
      {
        index: 0,
        title: 'Video Lectures',
        content: (
          <div id="curricularm">
            <div className="curriculum-text-box">
              <div className="curriculum-section">
                <div className="panel-group accordion" id="accordion" >
                  {
                    this.state.video && this.state.video.chapters && this.state.video.chapters.length > 0 && this.state.video.chapters.map((chapter, i) => {
                      return <div className="panel panel-default">

                        <h5 className="panel-title click  mt-4 " data-toggle="collapse" data-parent={`#accordion`} href={`#collapsecourse${chapter.id}`} className="" aria-expanded="true">
                          <a >
                            {chapter.name}
                          </a>
                        </h5>

                        <ul id={`collapsecourse${chapter.id}`} className={`panel-collapse collapse in  mt-4 ${i == 0 ? 'show' : ''}`}>
                          {chapter.videos && chapter.videos.length > 0 && chapter.videos.map((video, index) => {

                            var ms = video.duration,
                              min = Math.floor((ms / 60) << 0),
                              sec = Math.floor((ms) % 60);
                            let duration = min + ':' + sec
                            return <li className={this.props.slug == video.id ? 'selected-list' : ''}>
                              <div className="panel-heading pt-1" onClick={() => { this.fetchData(video.id) }}>
                                <p className="panel-title click playlist mb-1" >
                                  <Link href={`/web-app/dashboard/${this.props.productslug}/${this.state.subject && this.state.subject.id}-${this.state.chapter && this.state.chapter.id}/videos/${video.id}`} >
                                    <a className="row">
                                      <div className="col-1 pl-4">
                                        <h5><i class="fa fa-play-circle pr-3"></i></h5>
                                      </div>
                                      <div className="col-10 p-0">
                                        <b>{video.title}</b> <span className="float-right">{duration} mins</span>
                                        <br />

                                      </div>
                                    </a>
                                  </Link>
                                </p>

                              </div>

                            </li>
                          })}
                        </ul>
                      </div>

                    })
                  } </div>

              </div>
            </div>
          </div>

        )
      },
      {
        index: 1,
        title: 'Discussion',
        content: (
          <div id="curricularm">
            <div className="curriculum-text-box">
              <div className="curriculum-section">
                <div className="mb-1 ">
                  <div className="div-fix">
                    <ScrollableFeed>
                      {
                        this.state.comments && this.state.comments.length > 0 && this.state.comments.map((comment, i) => {
                          return <div className="comment-list-wrapper  comment-box">
                            <div className="comment-list">

                              <div className="row pb-3">
                                <div className="col-1">
                                  <div className="flex-shrink-0 w-8">
                                    <img
                                      src={comment.user_image}
                                      alt={window.localStorage.getItem('defaultImageAlt')}
                                      className={`h-8 w-full shadow-lg rounded-full ring`}
                                    />
                                  </div>
                                </div>
                                <div className="comment-text col-11">
                                  <div className="author_info d-flex justify-content-between">
                                    <Link href="/">

                                      <a className="author_name text-primary">

                                        <strong>

                                          {comment.user_first_name} {comment.user_last_name}</strong></a>
                                    </Link>
                                    <span>{moment(comment.created_at).fromNow()}</span>
                                  </div>
                                  <p className="text-black text-justify">{comment.comment}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                        })
                      }
                    </ScrollableFeed>
                  </div>

                </div>
                <hr className="mb-2"></hr>

                <div className="">
                  <form method="POST" onSubmit={this.comment} id="form" className="mb-8 mr-2">

                    <div className="row">
                      <div className="col-10 pr-0">
                        <input type="text" name="comment" className="form-control" placeholder="Write your comment about the video here" />

                      </div>
                      <div className="col-2 pl-0">
                        <button type="submit" id="send" className="btn btn-white text-right" value="send" ><h3><i className="fa fa-paper-plane float-right"></i></h3> </button>

                      </div>
                    </div>
                  </form>
                </div>

              </div>
            </div>
          </div >
        )
      },

    ];


    return (
      <>
        <div className="webbgdashboard mt-4">
          <div className=" container">
            <div className="row ">
              <div className="col-md-7">
                {
                  this.state.video && !this.state.loader && <div className="player-wrapper player-height ">
                    <div className="player-button">
                      <div class="dropdown mr-2">
                        <button class="btn btn-secondary" type="button" id="dropdownMenu1">
                          <i class="fa fa-cog"></i>
                        </button>
                        <div class="dropdown-menu dropdown-content" aria-labelledby="dropdownMenu1">
                          {
                            this.state.video.progressive && this.state.video.progressive.map(prog => {
                              return <button class={`dropdown-item urls ${this.state.url && this.state.url.includes(prog.url) ? 'active' : ''}`} type="button" onClick={(e) => {
                                let time = document.getElementById("videoFrame").currentTime
                                console.log(prog.url)
                                this.setState({
                                  url: `${prog.url}#t=${time}`,
                                  autoplay: true
                                })

                                this.state.video.progressive.map((index , i) => {
                                  document.getElementsByClassName('urls')[i].classList.remove('active');
                                })
                                e.target.className = 'dropdown-item urls active';
                              }}>{prog.quality}</button>
                            })
                          }

                        </div>


                      </div>

                      <div className="dropdown mr-2">
                        <button class="btn btn-secondary" type="button">
                        <i class="fas fa-tachometer-alt"></i> </button>
                        <div class="dropdown-menu dropdown-content" aria-labelledby="dropdownMenu2">
                          {

                            this.state.speeds && this.state.speeds.map(speed => {
                              return <button className={`dropdown-item speeds ${document.getElementById("videoFrame") && document.getElementById("videoFrame").playbackRate == speed ? 'active' : ''}`} type="button" onClick={(e) => {
                                let video = document.getElementById("videoFrame")
                                video.playbackRate = speed;

                                this.state.speeds.map((index , i) => {
                                  document.getElementsByClassName('speeds')[i].classList.remove('active');
                                })
                                e.target.className = 'dropdown-item speeds active';
                              }}>{speed}</button>
                            })
                          }

                        </div>
                      </div>

                    </div>
                    <video ontimeupdate={(e) => this.checkTime(e)} id="videoFrame" autoplay={this.state.autoplay} controls src={this.state.url} preload="auto" poster={this.state.video.thumbnailUrl} controlsList="nodownload" className="w-100" ></video>

                  </div>
                }

                {
                  this.state.loader && <div className="top-0 left-0 right-0 bottom-0  h-screen z-2000 overflow-hidden opacity-100 flex items-center justify-center bg-white border-all player-height ">
                    <img src="/images/wait.gif" />
                    <div>
                      <h5 className="mb-0">Buffering Video</h5>
                      <p>It may take few seconds. Please be patient.</p>
                    </div>
                  </div>
                }

                <div className="row">
                  <div className="col-8">
                    <h3 className="font-bold">{this.state.video.title}</h3>
                    <p className="cart_btn">{this.state.product && this.state.product.name} / {this.state.subject && this.state.subject.name} / <span className="font-bold font-blue">{this.state.chapter && this.state.chapter.name}</span> </p>

                  </div>

                  <div className="col-4 float-right">
                    <div className="d-flex ml-auto mr-0 float-right">
                      {
                        !this.state.liked && <p className="m-3"><a onClick={(e) => this.like(e)}><i class="fa fa-heart mr-1" aria-hidden="true"></i></a> Like</p>
                        || <p className="m-3"><a onClick={(e) => this.dislike(e)}><i class="fa fa-heart text-red mr-1" aria-hidden="true"></i> Liked</a> </p>
                      }
                      {
                        !this.state.wishListed && <p className="m-3"><a onClick={(e) => this.addToWishlist(e)}><i class="fa fa-plus-square mr-1" aria-hidden="true"></i>Save Video</a></p>
                        || <p className="m-3"><a onClick={(e) => this.removeFromWishlist(e)}><i class="fa fa-check text-primary mr-1" aria-hidden="true"></i>Saved</a></p>
                      }
                    </div>

                  </div>
                  <p className="m-3">{this.state.video.description}</p>
                </div>

              </div><div className="col-md-5 border-left">
                <UnderlinedTabs tabs={tabs} />
              </div>

              {
                !this.state.video &&
                <div className="empty_box">
                  <h2 className="text-center"><i className="fas fa-cart-plus"></i></h2>
                  <h5 className="text-center"> <b className="font-saffron"><b></b></b>Video Not found</h5>
                </div>
              }
            </div>
          </div>
        </div>
      </>

    )
  }
}