import Link from "next/link";
import { authGaurd, getUser, getToken } from 'helpers/auth';

import { Component } from 'react';

import { fetchBySlug, add, edit, fetchAll } from 'helpers/apiService';
import { comment } from "postcss";
import moment from "moment";

import define from 'src/json/worddefination.json'

export default class Layouts extends Component {

  state = {
    blog: {},
  }

  static getInitialProps({ query }) {
    return query;
  }


  fetchData = async (id) => {
    let data = await fetchBySlug('blogs', id)
    this.setState({
      blog: data.blog
    })
  }

  comment = async (e) => {

    e.preventDefault()

    this.setState({
      error: null
    })

    if (document.forms["reviewForm"]["comment"].value == '') {
      this.setState({
        error: {
          comment: "comment is Required"
        }
      })
      return;
    }


    let data = {
      comment: document.forms["reviewForm"]["comment"].value,
      post_id: this.state.blog.id
    }

    data = await add('blog-comments', data)

    // check Response
    if (data.updated) {
      toastr.success('Commentted');
      this.fetchData(this.props.id);

      document.forms["reviewForm"].reset()
    }
    else {
      let error;
      if (data.comment) {
        error = data.comment.error
      }
      else if (data.error.details) {
        error = data.error.details[0].message
      }
      else if (data.error) {
        error = data.error
      }
      toastr.error(error)
    }

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

  render() {

    const blog = this.state.blog
    return (

      <>
        {
          this.state.blog &&
          <>
            {/* <header className="header_inner courses_page">

              <div className="intro_wrapper blogs_details_head">
                <div className="container">
                  <div className="row">
                    <div className="col-sm-12 col-md-8 col-lg-8">
                      <div className="intro_text">
                        <h1>{this.state.blog.title}</h1>
                        <div className="pages_links">
                          <Link href="/">
                            <a title="">Home</a>
                          </Link>
                          <Link href="/blogs">
                            <a title="">Blogs</a>
                          </Link>
                          <Link href="/blog/BlogDetails">
                            <a title="" className="active">{this.state.blog.title}</a>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </header> */}
            {/* Blog Details Content starts */}
            <section className="blog_wrapper py-3 blog-p">
              <div className="container mt-md-4 mt-lg-0">
                <div className="row ">
                  <div className="col-12 col-sm-12 col-md-8 col-lg-8">
                    <div className="blog_post sm-mt-4">
                      <h3>{this.state.blog.title}</h3>
                      <div className="post_by d-flex">
                        <span>By - <a title="" className="bloger_name">{blog.user && blog.user.first_name} {blog.user && blog.user.last_name}</a></span>
                        <span>Posted On : {moment(blog.created_at).format('MMMM Do YYYY, h:mm:ss a')}</span>
                        {/* <span>
                          <Link href="/">
                            <a title="">Your Category Name</a>
                          </Link>
                        </span> */}
                      </div>
                      <img src={this.state.blog.image} alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid" />
                      <div className="postpage_content_wrapper">
                        
                        <div className="blog_post_content">
                          <div dangerouslySetInnerHTML={{ __html: this.state.blog.body }}>
                          </div>
                          <div className="post_response_count d-flex justify-content-between">
                            <ul className="d-flex tags">
                              {
                                this.state.blog.exams &&
                                this.state.blog.exams.map((exam, index) => {
                                  return (
                                    <li>
                                      <span className="badge_one badge-primary mb-2 "> {exam.name} </span>
                                    </li>
                                  )
                                })
                              }
                              {
                                this.state.blog.courses &&
                                this.state.blog.courses.map((course, index) => {
                                  return (
                                    <li>
                                      <span className="badge_one badge-primary mb-2 "> {course.name} </span>
                                    </li>
                                  )
                                })
                              }

                              {
                                this.state.blog.subjects &&
                                this.state.blog.subjects.map((subject, index) => {
                                  return (
                                    <li>
                                      <span className="badge_one badge-primary"> {subject.name} </span>
                                    </li>
                                  )
                                })
                              }

                              {
                                this.state.blog.chapters &&
                                this.state.blog.chapters.map((chapter, index) => {
                                  return (
                                    <li>
                                      <span className="badge_one badge-primary"> {chapter.name} </span>
                                    </li>
                                  )
                                })
                              }
                              <li>
                                <a>{blog.tags}</a>
                              </li>


                            </ul>
                          </div>
                          <div className="adding">
                      <div className="social_wrapper flex setup ">
                          <h4>Share :</h4>
                          <ul className="social_items list-unstyled adjust">
                            <li>
                              <Link href=" https://www.facebook.com/nimcetcoaching/">
                                <a><i class="fab fa-facebook-f tw_icon"></i></a>
                              </Link>
                            </li>
                            <li>
                              <Link href="https://www.youtube.com/channel/UCCTGL0PszN3EOTcXgViH4DA">
                                <a><i class="fab fa-youtube tw_icon_one"></i></a>
                              </Link>
                            </li>
                            <li>
                              <Link href="https://t.me/Acme_Academy">
                                <a><i className="fab fa-telegram link_icon"></i></a>
                              </Link>
                            </li>
                            <li>
                              <Link href="https://www.instagram.com/acmeacademyraipur/">
                                <a><i className="fab fa-instagram in_icon"></i></a>
                              </Link>
                            </li>
                          </ul>
                       
                        </div>
                        </div>


                          {/* <!-- Blog Comment Wrappper--> */}
                          <div className="commenting">
                            <div className="items_title">
                              {
                                blog.all_comments && blog.all_comments.length != 0 &&
                                <h3 className="title">{blog.all_comments && blog.all_comments.length && blog.all_comments.length != 0 && blog.all_comments.length} Commnets</h3>
                              }

                            </div>
                            <div className="comment-list-items">
                              <div className="comment-list-wrapper">
                                {
                                  this.state.blog.all_comments &&
                                  this.state.blog.all_comments.map(comment => {
                                    return (
                                      <div className="comment-list mb-3">
                                        <div className="commnet_img">
                                          <img src={comment.user_image} alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid" />
                                        </div>
                                        <div className="comment-text">
                                          <div className="author_info">
                                            <div className="author_name">
                                              <Link href="/">
                                                <a className="">{comment.user_first_name}</a>
                                              </Link>
                                              <span>{moment(comment.created_at).format('MMMM Do YYYY, h:mm:ss a')}  </span>
                                            </div>
                                          </div>
                                          <p className="mt-1">
                                            {comment.comment}
                                          </p>
                                        </div>
                                      </div>

                                    )
                                  })
                                }



                              </div>

                            </div>
                            {/* <!--  Leave Commnent Wrapper --> */}
                            {getToken() != undefined && <div className="leave_comment_wrapper">
                              <div className="items_title">
                                <h3 className="title">Leave A Comment</h3>
                                <p>You need to be sure there isn't anything embarrassing hidden in the repeat predefined</p>
                              </div>
                              <form onSubmit={(e) => this.comment(e)} name="reviewForm">
                                <div className="comment-text ">


                                  <textarea className="form-control" name="comment" placeholder="Write your comment here"></textarea>
                                  {this.state.error && this.state.error.comment && <span className="text-danger">{this.state.error.message}</span>}
                                  <input
                                    type="submit"
                                    value="Submit "
                                    className="btn-submit text-center mt-3 "
                                  />
                                </div>
                              </form>
                            </div>}
                          </div>
                        </div>
                        
                      </div>
                     
                    
                    </div>
                  </div>
                  {/* <!-- End Blog Left Side--> */}

                  <div className="col-12 col-sm-12 col-md-4 col-lg-4 blog_wrapper_right ">
                    <div className="blog-right-items">

                      {/* <div className="become_a_teacher widget_single">
                        <div className="form-full-box">
                          <div className="form_title">
                            <h2>Become A Member</h2>
                            <p>Get Instant access to <span>5000+ </span>Video courses </p>
                          </div>
                          <form>
                            <div className="register-form">
                              <div className="row">
                                <div className="col-12 col-xs-12 col-md-12">
                                  <div className="form-group">
                                    <label><i className="fas fa-user"></i></label>
                                    <input className="form-control" name="name" placeholder="Write Your Name" required="" type="text" />
                                  </div>
                                </div>

                                <div className="col-12 col-xs-12 col-md-12">
                                  <div className="form-group">
                                    <label><i className="flaticon-email"></i></label>
                                    <input className="form-control" name="email" placeholder="Write Your E-mail" required="" type="email" />
                                  </div>
                                </div>
                                <div className="col-12 col-xs-12 col-md-12">
                                  <div className="form-group massage_text">
                                    <label><i className="flaticon-copywriting"></i></label>
                                    <textarea className="form-control" placeholder="Write Something Here" required="" ></textarea>
                                  </div>
                                </div>
                                <div className="col-12 col-xs-12 col-md-12 register-btn-box">
                                  <button className="register-btn" type="submit">Send Now</button>
                                </div>
                              </div>
                            </div>
                          </form>
                        </div>
                      </div> */}


                      <div className="recent_post_wrapper widget_single">
                        <div className="items-title">
                          <h3 className="title">Recent Post</h3>
                        </div>
                        <hr className="mb-3 rows"></hr>

                        {
                          blog.recentBlogs && blog.recentBlogs.map(recentBlog => {
                            return <div className="single-post">
                              <div className="recent_img">
                                <Link href="/">
                                  <a title=""><img src={recentBlog.image} alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid" /></a>
                                </Link>
                              </div>
                              <div className="post_title">
                                <Link href="/blogs/[id]" as={`/blogs/${recentBlog.slug}`}>
                                  <a title="" onClick={() => fetchData(recentBlog.slug)}>{recentBlog.title}</a>
                                </Link>
                                <div className="post-date">
                                  <span>{moment(recentBlog.created_at).format('MMMM Do YYYY, h:mm:ss a')}</span>
                                </div>
                              </div>
                            </div>
                          })
                        }
                      </div></div>
                  </div>
                  {/* <!-- ./ End  Blog Right Side--> */}

                </div>
              </div>
            </section>
            {/* Blog Details Content ends */}
          </>
        }
      </>
    )
  }
}