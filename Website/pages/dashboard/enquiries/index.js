import { Component } from 'react';
import { fetchAll, deleteData, updateAdditional, add, edit } from 'helpers/apiService';
import React from 'react'
import SectionTitle from 'components/functional-ui/section-title'
import Datatable from 'components/functional-ui/datatable'
import Shimmer from 'components/website/shimmer/datatable'
import Widget from 'components/functional-ui/widget'
import Filter from 'components/classical-ui/filters'
import toastr from 'toastr'
import define from 'src/json/worddefination.json'
import StoreModel from 'components/functional-ui/modals/modal-store'
import Validation from 'components/functional-ui/forms/validation'
import PopupModel from 'components/functional-ui/modals/modal-popup'
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
    modelImage: null,
    modelTitle: 'posts',
    storeFields: [],
    displayModelTitle: 'Add New',
    showModel: false,
    deleteModel: false,
    id: null,
    enquiries: [],
    storeFilter: {},
    imageLimits: {},
    baseTitle: 'Ask Your Doubt',
    modelTitle: 'enquiries',
    queryTitle: 'enquiries',
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

  buildAddModel = () => {

    this.setState({
      displayModelTitle: `Add ${this.state.baseTitle}`
    })

    let items = {

      'user_name': {
        label: 'User Name',
        name: 'user_name',
        type: 'text',
        className: "sm:w-1/3",
        placeholder: ' User Name',
        disabled: true,
      },
      'exam_name': {
        label: `${define.exam} Name`,
        name: 'exam_name',
        type: 'text',
        className: "sm:w-1/3",
        placeholder: ' User Name',
        disabled: true,
      },
      'course_name': {
        label: `${define.course} Name`,
        name: 'course_name',
        type: 'text',
        className: "sm:w-1/3",
        placeholder: ' User Name',
        disabled: true,
      },
      'subject_name': {
        label: `${define.subject} Name`,
        name: 'subject_name',
        type: 'text',
        className: "sm:w-1/3",
        placeholder: ' Subject Name',
        disabled: true,
      },
      'chapter_name': {
        label: `${define.chapter} Name`,
        name: 'chapter_name',
        type: 'text',
        className: "sm:w-1/3",
        placeholder: ' Chapter Name',
        disabled: true,
      },
      'replied_user': {
        label: 'Replied By',
        name: 'replied_user',
        type: 'text',
        className: "sm:w-1/3",
        placeholder: 'Replied By',
        disabled: true,
      },
      'image': {
        label: 'Image  from user',
        error: {},
        name: 'image',
        ...this.state.imageLimits,
        fileTypes: ["jpg", "png", "jpeg"],
        type: 'image',
        className: "sm:w-1/3",
        disabled: true,
        onImageClick: this.openModal
      },
      'message': {
        label: 'Question by User',
        name: 'message',
        type: 'text',
        className: "w-full",
        placeholder: ' Chapter Name',
        disabled: true,
      },
      'reply': {
        label: 'Your Reply',
        name: 'reply',
        type: 'textarea',
        className: "w-full",
        placeholder: 'Enter Reply',
      },
      'image_for_user': {
        label: 'Image for user',
        error: {},
        name: 'image_for_user',
        ...this.state.imageLimits,
        fileTypes: ["jpg", "png", "jpeg"],
        type: 'image',
        className: "sm:w-1/3",
      }
    }
    return this.setState({
      storeFields: items,
      showModel: false
    })

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

  randerEditModal = (row) => {

    this.setState({
      displayModelTitle: `Reply ${this.state.baseTitle} `
    })

    var items = this.state.storeFields;

    Object.keys(items).map((key) => {
      items[key].defaultValue = row[key]
    })

    if ('id' in items) {
      items.id.defaultValue = row.id
    } else {
      items = {
        'id': {
          label: '',
          name: 'id',
          type: 'hidden',
          defaultValue: row.id,
        },
        ...items
      }
    }

    this.setState({
      storeFields: items,
      showModel: true
    })



  }

  changeModalStatus = () => {

    if (this.state.showModel == true) {
      // this.buildAddModel();
      this.setState({
        showModel: false
      })
    } else {
      this.buildAddModel();
      this.setState({
        showModel: true
      })
    }
  }

  onStoreSubmit = async (data) => {

    var enquery;
    var message;


    if ('id' in data) {
      enquery = await edit(this.state.modelTitle, data, 'image_for_user');
      message = `${this.state.baseTitle} Updated Successfully`
    } else {
      enquery = await add(this.state.modelTitle, data, 'image_for_user');
      message = `${this.state.baseTitle} Added Successfully`
    }


    // check Response
    if (enquery.updated) {
      toastr.success(message)
      this.fetchList()

      this.setState({
        showModel: false
      })
    }
    else {
      let error;
      if (enquery.enquery) {
        error = enquery.enquery.error
      }
      else if (enquery.error) {
        error = enquery.error.details ? enquery.error.details[0].message : enquery.error
      }
      toastr.error(error)
    }

  }

  // 
  componentDidMount() {
    this.buildAddModel();
    this.fetchList();
    // this.fetchBase();
  }

  // 
  render() {
    let data = this.state.enquiries
    const columns = [

      {
        Header: 'User Name',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >

              <span >{props.row.original.user_name}</span>
            </div>
          )
        },

      },
      {
        Header: 'Message',
        accessor: 'message'
      },
      this.state.hideHierarchy >= 1 ? { Header: '' } : {
        Header: 'Exam',
        accessor: 'exam_name'
      },
      this.state.hideHierarchy >= 2 ? { Header: '' } : {
        Header: 'Course',
        accessor: 'course_name'
      },
      {
        Header: 'Subject',
        accessor: 'subject_name'
      },
      {
        Header: 'Chapter',
        accessor: 'chapter_name'
      },
    ]


    const filterObjects = [
      {
        label: 'users',
        name: 'userID',
        idSelector: 'id',
        view: 'first_name',
        type: 'select-multiple',
        effectedRows: [],
      },
      this.state.hideHierarchy >= 1 ? { type: 'blank' } : {
        label: `${define.exams}`,
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

        {
          this.state.showModel &&
          <StoreModel
            title={this.state.displayModelTitle}
            body={
              <div>
                {
                  this.state.storeFields && this.state.storeFields != {} && <Validation items={Object.values(this.state.storeFields)} onSubmit={this.onStoreSubmit} alerts={false} defaultValues={this.state.defaultValues} />
                }

              </div>
            }
            useModel={this.state.showModel}
            hideModal={this.changeModalStatus}
          />
        }

        {
          this.state.modelOpen && this.state.modelImage && <PopupModel image={this.state.modelImage} link={null} />
        }

        <Widget
          title=""
          description=''>
          <Filter filterObjects={filterObjects} filterOnChange={true} onFilter={this.onFilter} />
          {
            this.state.fetching &&

            <Shimmer /> ||
            <Datatable
              columns={columns}
              deletable={this.props.contentDeletable}
              data={this.state.enquiries}
              paginationClick={this.fetchByOffset}
              pageSizedata={this.state.filters.limit}
              pageIndexdata={(this.state.filters.offset / this.state.filters.limit)}
              pageCountData={this.state.totalCount}
              baseTitle={this.state.baseTitle}
              modelTitle={this.state.modelTitle}
              queryTitle={this.state.queryTitle}
              randerEditModal={this.randerEditModal}
              fetchList={this.fetchList}
              sectionRow={false}
              approvable={false}
              status={false}
              sortable={false}
            />
          }

        </Widget>


      </>

    )
  }

}
