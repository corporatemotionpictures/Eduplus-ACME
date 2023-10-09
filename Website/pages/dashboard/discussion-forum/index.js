import { Component } from 'react';
import { fetchAll, deleteData, updateAdditional, add, edit } from 'helpers/apiService';
import React from 'react'
import Link from 'next/link'
import SectionTitle from 'components/functional-ui/section-title'
import Datatable from 'components/functional-ui/datatable'
import Widget from 'components/functional-ui/widget'
import Filter from 'components/classical-ui/filters'
import toastr from 'toastr'
import define from 'src/json/worddefination.json'
import StoreModel from 'components/functional-ui/modals/modal-store'
import Validation from 'components/functional-ui/forms/validation'
import { Badge, CircularBadge } from 'components/functional-ui/badges'

//

export default class extends Component {
  state = {
    values: {},
    defaultValues: {},
    search: '',
    id: null,
    delete: false,
    fetching: true,
    filters: {
      limit: 10,
      offset: 0
    },
    storeFields: [],
    displayModelTitle: 'Add New',
    showModel: false,
    deleteModel: false,
    id: null,
    posts: [],
    storeFilter: {},
    imageLimits: {},
    baseTitle: define.post,
    modelTitle: 'posts',
    queryTitle: 'posts',
    hideHierarchy: this.props.hideHierarchy,
    hierarchyDefaultValues: {}
  }

  // Fetch data by offset
  fetchByOffset = async (offset, limit) => {
    var filters = this.state.filters;
    if ((offset || offset == 0) && limit) {
      this.setState({ fetching: true })
      var data;
      this.setState({
        filters: {
          ...filters,
          offset: offset,
          limit: limit,
        }
      }, async () => {
        this.fetchList();
      })
    }

  }

  // Search data
  search = async (e) => {
    if (e.target.value !== '') {
      this.setState({ fetching: true })
      let data = await fetchAll(`search/dashboard-search?field=${this.state.queryTitle}&&searchKey=${e.target.value}`)
      this.setState(data)
      this.setState({ fetching: false })
    } else {
      this.fetchList()
    }

  }

  // Search data
  onFilter = async (filterData) => {
    var filters = this.state.filters;
    this.setState({ fetching: true })
    var data;
    this.setState({
      filters: {
        ...filters,
        ...filterData
      }
    }, async () => {
      this.fetchList();
    })

  }

  // Function for fetch data
  fetchList = async () => {
    var data = await fetchAll(this.state.modelTitle, { ...this.state.filters, 'forList': true });
    this.setState(data)

    var imageLimits = await fetchAll('image-size-limits', { 'label': this.state.queryTitle });
    imageLimits = imageLimits.success = true ? imageLimits.sizes : {}
    this.setState({ fetching: false, imageLimits: imageLimits })
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
  componentDidMount() {
    this.fetchList();
    // this.fetchBase();
  }

  // 
  render() {
    let data = this.state.posts

    const filterObjects = [
      this.state.hideHierarchy >= 1 ? { type: 'blank' } : {
        label: `exams`,
        title: `${define.exams}`,
        name: 'examID',
        idSelector: 'id',
        view: 'name',
        type: 'select-multiple',
        effectedRows: ['courseID', 'subjectID', 'chapterID'],
      },
      this.state.hideHierarchy >= 2 ? { type: 'blank' } : {
        label: `courses`,
        title: `${define.courses}`,
        name: 'courseID',
        idSelector: 'id',
        view: 'name',
        type: 'select-multiple',
        effectedRows: ['subjectID', 'chapterID'],
      },
      {
        label: `subjects`,
        title: `${define.subjects}`,
        name: 'subjectID',
        idSelector: 'id',
        view: 'name',
        type: 'select-multiple',
        effectedRows: ['chapterID'],
      },
      {
        label: `chapters`,
        title: `${define.chapters}`,
        name: 'chapterID',
        idSelector: 'id',
        view: 'name',
        type: 'select-multiple',
        effectedRows: [],
      },
    ]

    return (
      <>


        <SectionTitle title={this.props.parentName ? this.props.parentName : 'Dashbaord'} subtitle={`${this.state.baseTitle}s`} onClick={this.changeModalStatus} hideButton={true} />

        <Widget
          title=""
          description=''>
          <Filter filterObjects={filterObjects} filterOnChange={true} onFilter={this.onFilter} />

          <div className="mt-4">
            {this.state.posts && this.state.posts.map(post => {
              return (
                <div key={post.id} className="border-b last:border-none mt-4">
                  <div className="w-full">
                    <div className="flex flex-row justify-between w-full">

                      <div>
                        <h5 className="text-black capitalize">{`${post.user_first_name} ${post.user_last_name}`}</h5>
                      </div>
                      <div className="flex flex-col lg:flex-row flex-wrap justify-start items-start">
                        <Badge key={post.id} size='sm' color={` text-white mr-2 mt-1 ${post.closed == 0 ? 'bg-green-600' : 'bg-red-600'}`} rounded >
                          {post.closed == 0 ? 'Open' : 'Closed'}
                        </Badge>
                        {post.hide != 0 && <Badge key={post.id} size='sm' color={` text-white mr-2 mt-1 bg-red-600`} rounded>
                          Hidden
                        </Badge>}

                      </div>
                    </div>
                    <div className="flex  flex-wrap justify-start items-start pt-1">

                      {this.state.hideHierarchy < 1 && post.exam_name && post.exam_name != null && <div className=" br-3 mr-2">
                        <Badge key={post.id} size='default' color="badge mr-2 mb-2" >
                          {`${post.exam_name ? post.exam_name : 'No Exam'}`}
                        </Badge>
                      </div>}
                      {this.state.hideHierarchy < 2 && post.course_name && post.course_name != null && <div className=" br-3 mr-2">
                        <Badge key={post.id} size='default' color="badge  text-white mr-2 mb-2" >
                          {`${post.course_name ? post.course_name : 'No course'}`}
                        </Badge>
                      </div>}
                      {post.subject_name && post.subject_name != null && <div className=" br-3 mr-2">
                        <Badge key={post.id} size='default' color="badge  text-white mr-2 mb-2" >
                          {`${post.subject_name ? post.subject_name : 'No subject'}`}
                        </Badge>
                      </div>}
                      {post.chapter_name && post.chapter_name != null && <div className=" br-3 mr-2">
                        <Badge key={post.id} size='default' color="badge  text-white mr-2 mb-2" >
                          {`${post.chapter_name ? post.chapter_name : 'No chapter'}`}
                        </Badge>
                      </div>}



                    </div>
                    <div className="card-body  pt-0 pb-4 " key={post.id}>
                      <Link href="/dashboard/discussion-forum/[id]" as={`/dashboard/discussion-forum/${post.id}`}>
                        <p className="text-gray-500  cursor-pointer mb-3">
                          {post.body}
                        </p>
                      </Link>

                      {post.image != null && <p className="text-gray-500  my-4 pt-2">
                        {/* <span className="attachment-tag"><i className="fas fa-image"></i> {post.image.split("/").pop()}</span> */}
                        <span className="attachment-tag border rounded-full py-2 px-6 text-gray-500 font-bold"><i className="fas fa-image"></i> One Attachment</span>
                      </p>}

                      {/* {post.image != null && <div className="text-center" >
                <img alt={window.localStorage.getItem('defaultImageAlt')} src={post.image} className="img-fluid" style={post.image != null ? { maxHeight: '500px' } : { height: '0' }} />
                
              </div>} */}

                      <div className="flex justify-items-end items-center w-full pt-3">



                        <div className="flex flex-wrap justify-end items-end">
                          <div className="mr-2"> <i className="fas fa-comments"></i> {post.comments == null ? '0' : post.comments}</div>
                        </div>
                        <div className="mr-2"><button type="button" className=" btn-bordered border px-3 py-1 br-3" onClick={() => this.hide(post.id, post.hide)}> {post.hide == 0 ? <i className="fas fa-eye text-success"></i> : <i className="fas fa-eye-slash text-danger"></i>}</button></div>

                        <div className="mr-2"><button type="button" className=" btn-bordered border px-3 py-1 br-3" id={post.id} closed={post.closed} onClick={this.update}>{post.closed == 0 ? 'Mark As Closed' : 'Re-Open Query'} </button></div>

                        <div >
                          <Link href="/dashboard/discussion-forum/[id]" as={`/dashboard/discussion-forum/${post.id}`}>
                            <button type="button" className="btn btn-dark btn-md  py-1 br-3"><i class="fas fa-reply"></i> Reply</button>
                          </Link>
                        </div>

                      </div>

                    </div>
                  </div>
                </div>
              )
            })}

            {
              this.state.posts && this.state.posts.length <= 0 && <div className="text-center lg:mb-10 mb-4 mt-20">
                <img className="w-1/4 lg:w-1/5 mx-auto block" src="/images/search.png"></img>
                <h5 className="font-bold">No Data Available</h5>
                <p className="text-gray-400 mt-1">There is no data available in the table.</p>
              </div>
            }

          </div>
          {/* {
            !this.state.fetching &&
            <Datatable
              columns={columns}
              deletable={this.props.contentDeletable}
              data={this.state.posts}
              paginationClick={this.fetchByOffset}
              pageSizedata={this.state.filters.limit}
              pageIndexdata={(this.state.filters.offset / this.state.filters.limit)}
              pageCountData={this.state.totalCount}
              sectionRow={true}
              baseTitle={this.state.baseTitle}
              modelTitle={this.state.modelTitle}
              queryTitle={this.state.queryTitle}
              randerEditModal={this.randerEditModal}
              fetchList={this.fetchList}
              sectionRow={true}
              viewable={true}
            />
          } */}

        </Widget>

      </>

    )
  }

}
