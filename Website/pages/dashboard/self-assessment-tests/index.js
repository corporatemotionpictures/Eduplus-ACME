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
    assessmentTests: [],
    storeFilter: {},
    imageLimits: {},
    baseTitle: 'Self Assessment',
    modelTitle: 'self-assessment-tests',
    queryTitle: 'self_assessment_tests',
    displayModelTitle: `Add New Assessments`,
    defaultOptions:[
      {option:'', value:0},
      {option:'', value:0},
      {option:'', value:0},
      {option:'', value:0},
    ]
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
    console.log('abc', data)

    var imageLimits = await fetchAll('image-size-limits', { 'label': this.state.queryTitle });
    imageLimits = imageLimits.success = true ? imageLimits.sizes : {}
    this.setState({ fetching: false, imageLimits: imageLimits })
  }

  buildAddModel = () => {

    this.setState({
      displayModelTitle: `Add ${this.state.baseTitle}`
    })

    this.setState({
      displayModelTitle: `Add New Assessment`
    })

    let items = {
      'question': {
        label: 'Question',
        error: { required: 'Please enter a valid Name' },
        name: 'question',
        type: 'text',
        className: "sm:w-full",
        placeholder: 'Enter Question'
      },
      options : {
        label: 'Options',
        type: 'multiple-fields',
        name: 'options',
        fields: [{
          label: 'Option',
          name: 'option',
          type: 'text',
          error: { required: 'Please enter a valid Option' },
          className: "sm:w-3/4",
          placeholder: 'Enter Option'

        },
        {
          label: 'Marks',
          error: { required: 'Please enter a valid Marks' },
          name: 'marks',
          type: 'text',
          className: "md:w-1/4",
          placeholder: 'Enter Marks'
        }
        ],
        className: "w-full flex flex-col lg:flex-row lg:flex-wrap pb-3",
        placeholder: 'Enter Description',
        box: true,
        fixNumber:4,
        defaultValue : this.state.defaultOptions
      },
     
      'total_marks': {
        label: 'Final Marks',
        error: { required: 'Please enter a valid Marks' },
        name: 'total_marks',
        type: 'text',
        className: "sm:w-1/3",
        placeholder: 'Enter Final Marks',
        defaultValue:1
      },

    }
    return this.setState({
      storeFields: items,
      showModel: false
    })

  }

  randerEditModal = (row) => {

    this.setState({
      displayModelTitle: `Edit ${this.state.baseTitle} - ${row.title ? row.title : row.question}`

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

    var assessment;
    var message;

    if ('id' in data) {
      assessment = await edit(this.state.modelTitle, data);
      message = `${this.state.baseTitle} Updated Successfully`
    } else {
      assessment = await add(this.state.modelTitle, data);
      message = `${this.state.baseTitle} Added Successfully`
    }


    // check Response
    if (assessment.updated) {
      toastr.success(message)
      this.fetchList()

      this.setState({
        showModel: false
      })
    }
    else {
      let error;
      if (assessment.assessment) {
        error = assessment.assessment.error
      }
      else if (assessment.error.details) {
        error = assessment.error.details[0].message
      } else if (assessment.error) {
        error = assessment.error
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
    let data = this.state.assessmentTests
    const columns = [

      {
        Header: 'Question',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >

              <span className="pt-1">{props.row.original.question}</span>
            </div>
          )
        },

      },
      {
        Header: 'Option 1',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >

              <span className="pt-1">{props.row.original.options[0].option}</span>
            </div>
          )
        },

      },
      {
        Header: 'Option 2',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >

              <span className="pt-1">{props.row.original.options[1].option}</span>
            </div>
          )
        },

      },
      {
        Header: 'Option 3',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >

              <span className="pt-1">{props.row.original.options[2].option}</span>
            </div>
          )
        },

      },
      {
        Header: 'option 4',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >

              <span className="pt-1">{props.row.original.options[3].option}</span>
            </div>
          )
        },

      },
      {
        Header: 'Final Marks',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >

              <span className="pt-1">{props.row.original.total_marks}</span>
            </div>
          )
        },

      },
    ]

    const filterObjects = [
      {
        label: `Search Assessment`,
        name: 'search',
        type: 'text',
        effectedRows: [],
        className: "sm:w-1/2",
        placeholder: 'Enter Name'
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
              data={this.state.assessmentTests}
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
              approvable={false}
            />
          }

        </Widget>


      </>

    )
  }

}