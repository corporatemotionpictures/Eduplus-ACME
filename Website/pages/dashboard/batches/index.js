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
    batches: [],
    storeFilter: {},
    baseTitle: define.batch,
    modelTitle: 'batches',
    queryTitle: 'batches',
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

    data = await fetchAll('days', { 'forList': true });

    let days = []
    data.days.map(day => {
      let d = {
        label: day.day,
        value: day.day,
      }
      days.push(d)
    })
    this.setState({ days: days })


    //     data = await updateAdditional('count-all', this.state.queryTitle, {  }
    // );
    //     this.setState(data)
    this.setState({ fetching: false })
  }

  buildAddModel = () => {

    this.setState({
      displayModelTitle: `Add ${this.state.baseTitle}`
    })

    let items = {
      'faculty_id': {
        datalabel: 'users',
        dataname: 'facultyID',
        label: 'Facuty Name',
        error: { required: 'Please enter a valid Facuty Name' },
        name: 'faculty_id',
        idSelector: 'id',
        view: 'name_with_mobile',
        type: 'select',
        className: "sm:w-1/2",
        placeholder: 'Enter Facuty Name',
        isMultiple: false,
        preFilters: { type: 'FACULTY' },
        effectedRows: [],

      },
      'title': {
        label: 'Title',
        error: { required: 'Please enter a valid Title' },
        name: 'title',
        type: 'text',
        className: "sm:w-1/2",
        autoFocus: true,
        placeholder: 'Enter Title'
      },
      'schedules': {
        label: 'Schedules',
        type: 'multiple-fields',
        name: 'schedules',
        fields: [{
          label: 'Days',
          name: 'day',
          error: { required: 'Please choose One' },
          type: 'radio',
          options: this.state.days,
          className: "w-full sm:w-3/5 pb-3 pt-3 batch-radio",
          placeholder: 'Enter Description'

        },
        {
          label: 'start time',
          error: { required: 'Please enter a valid start time' },
          name: 'start_time',
          type: 'time',
          className: "sm:w-1/5  pb-3",
          placeholder: 'Enter start time'
        },
        {
          label: 'end time',
          error: { required: 'Please enter a valid end time' },
          name: 'end_time',
          type: 'time',
          className: "sm:w-1/5  pb-3",
          placeholder: 'Enter end time'
        }
        ],
        className: "w-full flex flex-col lg:flex-row lg:flex-wrap pb-3",
        placeholder: 'Enter Description',
        box:true,
      },
    }


    return this.setState({
      storeFields: items,
      showModel: false
    })

  }

  randerEditModal = (row) => {

    this.buildAddModel();

    this.setState({
      displayModelTitle: `Edit ${this.state.baseTitle} - ${row.title ? row.title : row.name}`

    })

    var items = this.state.storeFields;

    Object.keys(items).map((key) => {
      items[key].defaultValue = row[key]
    })

    if(items.schedules.fields[0]){
      items.schedules.fields[0].options = this.state.days
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

    var batch;
    var message;

    if ('id' in data) {
      batch = await edit(this.state.modelTitle, data);
      message = `${this.state.baseTitle} Updated Successfully`
    } else {
      batch = await add(this.state.modelTitle, data);
      message = `${this.state.baseTitle} Added Successfully`
    }


    // check Response
    if (batch.updated) {
      toastr.success(message)
      this.fetchList()

      this.setState({
        showModel: false
      })
    }
    else {
      let error;
      if (batch.batch) {
        error = batch.batch.error
      }
      else if (batch.error) {
        error = batch.error.details ? batch.error.details[0].message : batch.error
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
    let data = this.state.batches
    const columns = [

      {
        Header: 'Title',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              {props.row.original.title}
            </div>
          )
        },
      },
      {
        Header: 'Faculty',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              {props.row.original.faculty ? `${props.row.original.faculty.first_name} ${props.row.original.faculty.last_name}` : ''}
            </div>
          )
        },
      },
    ]


    return (
      <>
        <SectionTitle title={this.props.parentName ? this.props.parentName : 'Dashbaord'} subtitle={`${define.batches}`} onClick={this.changeModalStatus} />

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
          {/* <Filter filterObjects={filterObjects}  filterOnChange ={true} onFilter={this.onFilter} /> */}
          {
            this.state.fetching &&

            <Shimmer /> ||
            <Datatable
              columns={columns}
              deletable={this.props.contentDeletable}
              data={this.state.batches}
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
            />
          }

        </Widget>


      </>

    )
  }

}
