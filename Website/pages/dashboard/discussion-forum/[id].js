import { Component } from 'react';
import { fetchByID, fetchAll, add } from 'helpers/apiService';
import React from 'react'
import SectionTitle from 'components/functional-ui/section-title'
import Datatable from 'components/functional-ui/datatable'
import Widget from 'components/functional-ui/widget'
import Comments from 'components/functional-ui/social-feed/comments'
import { Badge } from 'components/functional-ui/badges'
import Link from 'next/link'
import PopupModel from 'components/functional-ui/modals/modal-popup'
import define from 'src/json/worddefination.json'
import {
  FiCamera,
  FiPaperclip,
  FiMic,
} from 'react-icons/fi'
import {
  FiThumbsUp,
  FiMessageCircle,
  FiShare2
} from 'react-icons/fi'
import moment from 'moment'

//

export default class extends Component {
  state = {
    post: {},
    search: '',
    fetching: true,
    modelOpen: false,
    modelImage: null,
    modelTitle: 'posts',
  }

  // 
  static getInitialProps({ query }) {
    return query;
  }

  // Function for fetch data
  fetchData = async (id) => {
    var data = await fetchByID(this.state.modelTitle, id , { noLog: true });
    this.setState(data)


  }

  // fetch all comments
  fetchComment = async (id) => {
    let data = await fetchAll(`comments?postID=${id}`);
    this.setState(data)
  }

  comment = async (event) => {
    event.preventDefault()
    var f = document.getElementById('form')
    var form = new FormData(document.getElementById('form'));
    var inputValue = form.get("comment");
    var file = form.get("image");

    let body = {
      post_id: this.props.id,
      comment: inputValue,

    }

    // Add Comment
    let comme;
    if (file != undefined && file.name != '') {
      body.image = [file]
      comme = await add('comments', body, 'image');
    } else {
      comme = await add('comments', body)
    }


    if (comme.updated) {
      this.fetchData(this.props.id);
      this.fetchComment(this.props.id)
    } else {
      let error;
      if (comme.comment) {
        error = comme.comment.error
      }
      else if (comme.error.details) {
        error = comme.error.details[0].message
      } else if (comme.error) {
        error = comme.error
      }
      toastr.error(error)
    }
    f.reset()

    this.setState({ img: null })
  }

  // 
  componentDidMount() {
    let id = this.props.id;
    if (id) {
      this.fetchData(id);
      this.fetchComment(id)
    } else {
      alert("Oh!");
    }
  }

  update = async (e) => {

    let body = {
      id: e.target.id,
      closed: e.target.getAttribute('closed') == 0 ? 1 : 0
    }
    var comme = await edit('posts', body)
    if (comme.updated) {
      this.fetchList()
      toastr.success('Status Updated')
    }

  }

  // 
  openModal = async (image) => {

    this.setState({
      modelOpen: true,
      modelImage: null,
    }, () => this.setState({
      modelOpen: true,
      modelImage: image,
    }))

  }
  // 
  hide = async (id, hide) => {

    let body = {
      id: parseInt(id),
      hide: hide == 0 ? 1 : 0
    }
    var comme = await edit('posts', body)
    if (comme.updated) {
      this.fetchList()
      toastr.success('Status Updated')
    }

  }

  // 
  render() {
    const post = this.state.post

    return (
      <>
        {
          this.state.post &&
          <>
            <SectionTitle title="post" subtitle="Discussion Forum " hideButton={true} />

            {
              this.state.modelOpen && this.state.modelImage && <PopupModel image={this.state.modelImage} link={null} />
            }

            <Widget
              title=""
              description=''>
              
              <div key={post.id}>
                <div className='w-full'>
                  <div className="flex flex-row justify-between w-full">

                    <div>
                      <h5 className="text-black capitalize">{`${post.user_first_name} ${post.user_last_name}`}</h5>
                    </div>
                    <div className="flex flex-col lg:flex-row  flex-wrap justify-start items-start">
                        <Badge key={post.id} size='sm' color={` text-white mr-2  ${post.closed == 0 ? 'bg-green-600' : 'bg-red-600'}`} rounded >
                          {post.closed == 0 ? 'Open' : 'Closed'}
                        </Badge>
                        {post.hide != 0 && <Badge key={post.id} size='sm' color={` text-white mr-2 mb-2 bg-red-600`} rounded>
                          Hidden
                        </Badge>}
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-start items-start pt-1">

                      {post.exam_name && post.exam_name != null && <div className=" br-3 lg:mr-2">
                        <Badge key={post.id} size='default' color="badge  mb-2" >
                          {`${post.exam_name ? post.exam_name : 'No Exam'}`}
                        </Badge>
                      </div>}
                      {post.course_name && post.course_name != null && <div className=" br-3 lg:mr-2">
                        <Badge key={post.id} size='default' color="badge mb-2" >
                          {`${post.course_name ? post.course_name : 'No course'}`}
                        </Badge>
                      </div>}
                      {post.subject_name && post.subject_name != null && <div className=" br-3 lg:mr-2">
                        <Badge key={post.id} size='default' color="badge  mb-2" >
                          {`${post.subject_name ? post.subject_name : 'No subject'}`}
                        </Badge>
                      </div>}
                      {post.chapter_name && post.chapter_name != null && <div className=" br-3 lg:mr-2">
                        <Badge key={post.id} size='default' color="badge mb-2" >
                          {`${post.chapter_name ? post.chapter_name : 'No chapter'}`}
                        </Badge>
                      </div>}
                      </div>


                      

                  <div className="card-body  pt-0 pb-4 " key={post.id}>
                    <Link href="/dashboard/discussion-forum/[id]" as={`/dashboard/discussion-forum/${post.id}`}>
                      <p className="text-gray-500 cursor-pointer mb-3">
                        {post.body}
                      </p>
                    </Link>

                    {post.image != null && <p className="text-gray-500  my-4 lg:pt-4">
                      {/* <span className="attachment-tag"><i className="fas fa-image"></i> {post.image.split("/").pop()}</span> */}
                      <span className="attachment-tag border rounded-full py-2 px-6 text-gray-500 font-bold" onClick={() => this.openModal(post.image)}><i className="fas fa-image"></i> One Attachment</span>
                    </p>}

                    {/* {post.image != null && <div className="text-center" >
                <img alt={window.localStorage.getItem('defaultImageAlt')} src={post.image} className="img-fluid" style={post.image != null ? { maxHeight: '500px' } : { height: '0' }} />
                
              </div>} */}

                    <div className="flex justify-items-end  w-full items-center pt-3">
                      

                      <div className="flex flex-row flex-wrap justify-end items-end">
                        <div className=" pr-2"> <i className="fas fa-comments"></i> {post.comments == null ? '0' : post.comments}</div>
                        </div>

                        <div className="mr-2"><button type="button" className=" btn-bordered border px-3 py-1 br-3" onClick={() => this.hide(post.id, post.hide)}> {post.hide == 0 ? <i className="fas fa-eye text-success"></i> : <i className="fas fa-eye-slash text-danger"></i>}</button></div>

                        <div className="mr-2"><button type="button" className=" btn-bordered border px-3 py-1 br-3" id={post.id} closed={post.closed} onClick={this.update}>{post.closed == 0 ? 'Mark As Closed' : 'Re-Open Query'} </button></div>

                        <div >
                          <Link href="/dashboard/discussion-forum/[id]" as={`/dashboard/discussion-forum/${post.id}`}>
                            <button type="button" className="btn btn-dark btn-md  py-1 br-3 pr-0"><i class="fas fa-reply"></i> Reply</button>
                          </Link>
                        </div>

                      </div>

                    </div>
                  


                  <div className="w-full mb-4">
                    {this.state.comments && this.state.comments.map((comment, i) => (
                      <div
                        className="flex items-start justify-start space-x-4 p-4"
                        key={i}>
                        <div className="flex-shrink-0 w-8">
                          { comment.user_image === "/images/default-profile.jpg" &&
                            <div className={`profile_image profile_image-${i%8} h-8 flex items-center justify-center font-bold uppercase`}>
                            {`${comment.user_first_name.charAt(0)}`}
                            </div>
                            ||
                            <img
                            src={comment.user_image}
                            alt={window.localStorage.getItem('defaultImageAlt')}
                            className={`h-8 w-full shadow-lg rounded-full ring`}
                          />
                          }
                          
                        </div>
                        <div className="flex flex-col lg:flex-row">
                          <div className="flex flex-col w-full">
                            <div className="flex lg:flex-row flex-col">
                              <div className="text-sm font-bold">{`${comment.user_first_name} ${comment.user_last_name}`}</div>
                              <div className="flex-shrink-0">
                              <div className="text-gray-500 lg:ml-1">{moment(comment.created_at).fromNow()}</div>
                          </div>
                            </div>
                            
                            <div className="text-sm">{comment.comment}</div>
                            <div className=""> {comment.image && <p className="text-gray-500  my-4">
                              {/* <span className="attachment-tag"><i className="fas fa-image"></i> {comment.image.split("/").pop()}</span> */}
                              <span className="attachment-tag border rounded-full py-2 px-6 text-gray-500 font-bold" onClick={() => this.openModal(comment.image)}><i className="fas fa-image"></i> One Attachment</span>
                            </p>}</div>
                          </div>

                        </div>
                      </div>
                    ))}
                  </div>


                  <div className="">
                    <div className="">
                      {this.state.img && <div className="flex-shrink-0 w-1/5"><img
                        ref={input => this.prev = input}
                        src={this.state.img}
                        className="h-auto w-full shadow-lg ml-2"
                      /></div>

                      }
                      <form method="POST" onSubmit={this.comment} id="form" className="form-element form-element-inline mb-4 lg:mb-8" enctype="multipart/form-data">


                        {/* <div className="w-1/6 px-1"><img alt={window.localStorage.getItem('defaultImageAlt')} className="avatar avatar-md rounded-circle" src="/img/logo.png" /></div> */}
                        <textarea name="comment" className="form-input border-0 bg-gray-100  rounded-lg p-4" placeholder="Write your comment" rows="1">
                        </textarea>
                        <div className="flex flex-row items-center justify-end space-x-1">
                          <label for="file" className=" btn-bordered border w-full text-center py-2 br-3 img-selecteor">
                            <div className="btn btn-circle" for="file" >
                              <FiCamera size={18} className="stroke-current" />
                            </div></label>

                          <input type="file" id="file" name="image" className="d-none form-control" hidden onChange={(event) => {
                            this.setState({ img: URL.createObjectURL(event.currentTarget.files[0]), error: false })
                          }} />

                          <div className="w-1/3 col-lg-2 px-1">
                            <button type="submit" id="send" className="btn btn-primary" value="send" ><i className="fas fa-paper-plane"></i> Send</button>
                          </div>


                        </div>
                      </form>
                    </div>
                  </div>


                </div>

              </div>

                
             
            </Widget>
          </>
        }
      </>

    )
  }

}
