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
    modelTitle: 'demo-requests',
    storeFields: [],
    displayModelTitle: 'Add New',
    showModel: false,
    deleteModel: false,
    id: null,
    demoRequests: [],
    storeFilter: {},
    imageLimits: {},
    baseTitle: 'Demo Class Request',
    modelTitle: 'demo-requests',
    queryTitle: 'demo_requests',
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

      'name': {
        label: 'User Name',
        name: 'name',
        type: 'text',
        className: "sm:w-1/3",
        placeholder: ' User Name',
        disabled: true,
      },
      'email': {
        label: 'User Name',
        name: 'email',
        type: 'text',
        className: "sm:w-1/3",
        placeholder: ' User Name',
        disabled: true,
      },
      'mobile_number': {
        label: 'User Name',
        name: 'mobile_number',
        type: 'text',
        className: "sm:w-1/3",
        placeholder: ' User Name',
        disabled: true,
      },
      'name': {
        label: 'User Name',
        name: 'name',
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
      'product_type_name': {
        label: `Course Type Name`,
        name: 'product_type_name',
        type: 'text',
        className: "sm:w-1/3",
        placeholder: ' Course Type Name',
        disabled: true,
      },
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
    let data = this.state.demoRequests
    const columns = [

      {
        Header: 'User Name',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >

              <span >{props.row.original.name}</span>
            </div>
          )
        },

      },
      {
        Header: 'Email',
        accessor: 'email'
      },
      {
        Header: 'Mobile Number',
        accessor: 'mobile_number'
      },
      {
        Header: 'Exam',
        accessor: 'exam_name'
      },
      {
        Header: 'Course',
        accessor: 'course_name'
      },
      {
        Header: 'Subject',
        accessor: 'subject_name'
      },
      {
        Header: 'Course Type',
        accessor: 'product_type_name'
      },
    ]


    const filterObjects = [
      {
        label: `exams`,
        title: `${define.exams}`,
        name: 'examID',
        idSelector: 'id',
        view: 'name',
        type: 'select-multiple',
        effectedRows: ['subjectID', 'chapterID'],
      },
      
      {
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
              data={this.state.demoRequests}
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
              editable={false}
              deletable={false}
            />
          }

        </Widget>


      </>

    )
  }

}
