import { Component } from 'react';
import { fetchByID } from 'helpers/apiService';
import React from 'react'
import SectionTitle from 'components/functional-ui/section-title'
import Datatable from 'components/functional-ui/datatable'
import Shimmer from 'components/website/shimmer/datatable'
import Widget from 'components/functional-ui/widget'
import Comments from 'components/functional-ui/social-feed/comments'
import { Badge } from 'components/functional-ui/badges'
import define from 'src/json/worddefination.json'
import {
  FiThumbsUp,
  FiMessageCircle,
  FiShare2
} from 'react-icons/fi'
import moment from 'moment'

//

export default class extends Component {
  state = {
    blog: {},
    search: '',
    fetching: true,
    modelTitle: 'blogs',
  }

  // 
  static getInitialProps({ query }) {
    return query;
  }

  // Function for fetch data
  fetchData = async (id) => {
    var data = await fetchByID(this.state.modelTitle, id, { noLog: true });
    this.setState({ data })

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
    const blog = this.state.data && this.state.data.blog

    return (
      <>
        {
          this.state.data && this.state.data.blog &&
          <>
            <SectionTitle title="blog" subtitle={`${blog.title}`} hideButton={true} />

            <Widget
              title=""
              description=''>
              <div className="flex flex-row justify-start mb-4">

                <div className='w-full'>
                  <div className="pb-2 w-1/2">
                    <img src={blog.image}></img>
                  </div>

                  <div className="flex flex-row items-center justify-start mb-4">

                    <button className="btn btn-default btn-rounded btn-icon">
                      <FiThumbsUp size={18} className="stroke-current" />
                      <span className="ml-2">{blog.likes} Like</span>
                    </button>

                    <button className="btn btn-default btn-rounded btn-icon">
                      <FiMessageCircle size={18} className="stroke-current" />
                      <span className="ml-2">{blog.all_comments.length} Comment</span>
                    </button>

                    {/* <Avatars items={items} /> */}
                  </div>

                  <div className="pb-2 flex flex-col lg:flex-row">
                    <div className="text-sm pt-1" dangerouslySetInnerHTML={{ __html: blog.body }}>
                    </div>
                  </div>


                  {this.props.hideHierarchy < 1 && <div className="pb-2 flex flex-row pl-2 justify-between">
                    <div className="text-sm font-boldlg:w-1/4">Exams</div>
                    <div className="text-sm pt-1 w-2/3">
                      <div className="flex flex-wrap justify-start items-start" >
                        {blog.exams && blog.exams.map((item) => {
                          return <Badge key={item.id} size='sm' color="bg-blue-200 text-blue-600 mr-2 mb-2" rounded>
                            {item.name}
                          </Badge>
                        })}
                      </div>
                    </div>
                  </div>}
                  {this.props.hideHierarchy < 2 && <div className="pb-2 flex flex-row pl-2 justify-between">
                    <div className="text-sm font-boldlg:w-1/4">Courses</div>
                    <div className="text-sm pt-1 w-2/3">
                      <div className="flex flex-wrap justify-start items-start" >
                        {blog.courses && blog.courses.map((item) => {
                          return <Badge key={item.id} size='sm' color="bg-blue-200 text-blue-600 mr-2 mb-2" rounded>
                            {item.name}
                          </Badge>
                        })}
                      </div>
                    </div>
                  </div>}
                  <div className="pb-2 flex flex-row pl-2 justify-between">
                    <div className="text-sm font-boldlg:w-1/4">Subjects</div>
                    <div className="text-sm pt-1 w-2/3">
                      <div className="flex flex-wrap justify-start items-start" >
                        {blog.subjects && blog.subjects.map((item) => {
                          return <Badge key={item.id} size='sm' color="bg-blue-200 text-blue-600 mr-2 mb-2" rounded>
                            {item.name}
                          </Badge>
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="pb-2 flex flex-row pl-2 justify-between">
                    <div className="text-sm font-boldlg:w-1/4">Chapters</div>
                    <div className="text-sm pt-1 w-2/3">
                      <div className="flex flex-wrap justify-start items-start" >
                        {blog.chapters && blog.chapters.map((item) => {
                          return <Badge key={item.id} size='sm' color="bg-blue-200 text-blue-600 mr-2 mb-2" rounded>
                            {item.name}
                          </Badge>
                        })}
                      </div>
                    </div>
                  </div>


                  <div className="text-sm font-boldlg:w-1/4 pl-2">Comments</div>
                  <div className="w-full mb-4">
                    {blog.all_comments && blog.all_comments.length > 0 && blog.all_comments.map((comment, i) => (
                      <div
                        className="flex items-start justify-start space-x-4 p-4"
                        key={i}>
                        <div className="flex-shrink-0 w-8">
                          <img
                            src={comment.user_image}
                            alt={window.localStorage.getItem('defaultImageAlt')}
                            className={`h-8 w-full shadow-lg rounded-full ring`}
                          />
                        </div>
                        <div className="flex flex-col lg:flex-row">
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
              </div>
            </Widget>
          </>
        }
      </>

    )
  }

}
