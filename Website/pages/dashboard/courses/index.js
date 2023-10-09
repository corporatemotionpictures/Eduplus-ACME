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
import { FiEdit, FiDelete } from 'react-icons/fi'
import Tooltip from 'components/functional-ui/tooltips'
import StoreModel from 'components/functional-ui/modals/modal-store'
import DeleteModel from 'components/functional-ui/modals/modal-confirmation'
import Validation from 'components/functional-ui/forms/validation'
import { FiX } from 'react-icons/fi'
import { Badge, CircularBadge } from 'components/functional-ui/badges'
import Switch from 'components/functional-ui/switch'


//


export default class extends Component {

  constructor(props) {
    super(props);
  }

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
    courses: [],
    storeFilter: {},
    imageLimits: {},
    baseTitle: define.course,
    modelTitle: 'courses',
    queryTitle: 'courses',
    hideHierarchy: this.props.hideHierarchy,
    hierarchyDefaultValues: {},
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
    // data = await updateAdditional('count-all', this.state.queryTitle, {});
    // this.setState(data)
    var imageLimits = await fetchAll('image-size-limits', { 'label': this.state.queryTitle });
    imageLimits = imageLimits.success = true ? imageLimits.sizes : {}
    this.setState({ fetching: false, imageLimits: imageLimits })

    if (this.state.hideHierarchy && this.state.hideHierarchy <= 2 && this.state.hideHierarchy > 0) {
      var data = await fetchAll('exams', { 'limit': 1, offset: 1, 'forList': true });
      if (data && data.exams && data.exams[0]) {
        this.setState({
          hierarchyDefaultValues: {
            ...this.state.hierarchyDefaultValues,
            examID: data.exams[0].id
          }
        })
      }
    }
  }

  buildAddModel = () => {

    this.setState({
      displayModelTitle: `Add ${this.state.baseTitle}`
    })

    let examID = this.state.hideHierarchy >= 1 ? [this.state.hierarchyDefaultValues.examID] : null


    let items = {
      'exam_ids': {
        datalabel: 'exams',
        dataname: 'examID',
        label: `${define.exam} Name`,
        error: { required: `Please select ${define.exam} Name` },
        name: 'exam_ids',
        idSelector: 'id',
        view: 'name',
        type: examID ? 'hidden' : 'select',
        className: examID ? '' : "sm:w-1/2",
        defaultValue: examID && `[${examID}]`,
        placeholder: 'Enter Exam Name',
        isMultiple: true,
        addNew: {
          baseTitle: define.exam,
          modelTitle: 'exams',
          queryTitle: 'exams',
        },
        effectedRows: [],
      },
      'name': {
        label: 'Name',
        error: { required: 'Please enter a valid Name' },
        name: 'name',
        type: 'text',
        className: "sm:w-1/2",
        placeholder: 'Enter Name'
      },
      'description': {
        label: 'Description',
        error: { required: 'Please enter a valid Description' },
        name: 'description',
        type: 'textarea',
        className: "w-full",
        placeholder: 'Enter Description'
      },
      'thumbnail': {
        label: 'Image',
        name: 'thumbnail',
        error: this.state.imageLimits.is_required !== 0 ? { required: 'Please Choose an Image' } : null,
        sizeRequired: this.state.imageLimits.is_required == 0,
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

  randerEditModal = (row) => {

    this.setState({
      displayModelTitle: `Edit ${this.state.baseTitle} - ${row.title ? row.title : row.name}`

    })

    var items = this.state.storeFields;

    Object.keys(items).map((key) => {
      items[key].defaultValue = row[key]
    })

    delete items.thumbnail.error.required;

    items.thumbnail = {
      ...items.thumbnail,
      ...this.state.imageLimits
    }

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

    var course;
    var message;


    if ('id' in data) {
      course = await edit(this.state.modelTitle, data, 'thumbnail');
      message = `${this.state.baseTitle} Updated Successfully`
    } else {
      course = await add(this.state.modelTitle, data, 'thumbnail');
      message = `${this.state.baseTitle} Added Successfully`
    }


    // check Response
    if (course.updated) {
      toastr.success(message)
      this.fetchList()

      this.setState({
        showModel: false
      })
    }
    else {
      let error;
      if (course.course) {
        error = course.course.error
      }
      else if (course.error.details) {
        error = course.error.details[0].message
      } else if (course.error) {
        error = course.error
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
    let data = this.state.courses
    const columns = [

      {
        Header: 'Name',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              <img
                key={props.row.original.id}
                src={props.row.original.thumbnail}
                alt={window.localStorage.getItem('defaultImageAlt')}
                className={`h-8 rounded-full max-w-full mr-2 mb-2`}
              />
              <span className="pt-1">{props.row.original.name}</span>
            </div>
          )
        },

      },
      this.state.hideHierarchy >= 1 ? { Header: ``, } : {
        Header: `${define.exams}`,
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              {props.row.original.exams && props.row.original.exams.map((item) => {
                return <Badge key={item.id} size='sm' color="bg-base text-white mr-2 mb-2" rounded>
                  {item.name}
                </Badge>
              })}
            </div>
          )
        },

      },

    ]

    const filterObjects = [
      this.state.hideHierarchy >= 1 ? { type : 'blank'} : {
        label: `exams`,
        title: `${define.exams}`,
        name: 'examID',
        idSelector: 'id',
        view: 'name',
        type: 'select-multiple',
        className: "sm:w-1/3",
        effectedRows: []
      },
      {
        label: `Search ${this.state.baseTitle}s`,
        name: 'search',
        type: 'text',
        effectedRows: [],
        className: "sm:w-2/3",
        placeholder: `Search  ${this.state.baseTitle} name here`
      }
    ]

    return (
      <>
        <SectionTitle title={this.props.parentName ? this.props.parentName : 'Dashbaord'} subtitle={`${this.state.baseTitle}s`} onClick={this.changeModalStatus} />

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
              data={this.state.courses}
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
              approvable={false}
            />
          }

        </Widget>


      </>

    )
  }

}
