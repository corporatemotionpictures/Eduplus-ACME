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
import { Badge, CircularBadge } from 'components/functional-ui/badges'


//

export default class extends Component {

  state = {
    values: {},
    search: '',
    id: null,
    delete: false,
    fetching: true,
    filters: {
      limit: 10,
      offset: 0
    },
    storeFields: [], displayModelTitle: 'Add New',
    showModel: false,
    deleteModel: false,
    id: null,
    attributes: [],
    storeFilter: {},
    imageLimits: {},
    baseTitle: 'Attribute',
    modelTitle: 'attributes',
    queryTitle: 'attributes',
    defaultValues: {},
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
    //     data = await updateAdditional('count-all', this.state.queryTitle, {  }
    // );
    //     this.setState(data)
    var imageLimits = await fetchAll('image-size-limits', { 'label': this.state.queryTitle });
    imageLimits = imageLimits.success = true ? imageLimits.sizes : {}
    this.setState({ fetching: false, imageLimits: imageLimits })
  }

  buildAddModel = () => {

    this.setState({
      displayModelTitle: `Add ${this.state.baseTitle}`
    })

    let items = {
      'title': {
        label: 'Title',
        error: { required: 'Please enter a valid Title' },
        name: 'title',
        type: 'text',
        className: "sm:w-1/3",
        placeholder: 'Enter Title'
      },

      'referance': {
        datalabel: 'attribute-referances',
        dataname: 'referanceID',
        label: 'Choose if values are taken from other data',
        fetchlabel: 'attributereferances',
        name: 'referance',
        error: {},
        idSelector: 'id',
        view: 'title',
        type: 'select',
        className: "sm:w-1/3",
        placeholder: 'Select Referance',
        isMultiple: false,
        effectedRows: [],
        watchBy: "is_referance_values",
        watchValues: ["1"]
      },
      'applied_as': {
        label: 'Applied AS',
        name: 'applied_as',
        error: { required: 'Please choose One' },
        type: 'radio',
        options: [{ value: 'MANUAL', label: 'User can choose before checkout' }, { value: 'AUTOMATIC', label: 'Applied automaticly before checkout' }],
        className: "sm:w-2/3",
        placeholder: 'Enter Description'
      },
      'description': {
        label: 'Description',
        error: { required: 'Please enter a valid description' },
        name: 'description',
        type: 'text',
        className: "w-full",
        placeholder: 'Enter Description'
      },


      'is_referance_values': {
        label: 'Is this Atrribute values retrived from other dataset',
        error: { required: 'Please choose One' },
        name: 'is_referance_values',
        type: 'radio',
        options: [{ value: 1, label: 'Yes' }, { value: 0, label: 'No' }],
        className: "sm:w-1/3",
        placeholder: 'Enter Description'
      },
      'is_optional_values': {
        label: 'Is this Atrribute has pre set of custom values',
        error: { required: 'Please choose One' },
        name: 'is_optional_values',
        type: 'radio',
        options: [{ value: 1, label: 'Yes' }, { value: 0, label: 'No' }],
        className: "sm:w-1/3",
        placeholder: 'Enter Description',
        watchBy: "is_referance_values",
        watchValues: ["0"]
      },
      'filterable': {
        label: 'Is This Attribute can used for filter  of attribute',
        error: { required: 'Please choose One' },
        name: 'filterable',
        type: 'radio',
        options: [{ value: 1, label: 'Yes' }, { value: 0, label: 'No' }],
        className: "sm:w-1/3",
        placeholder: 'Enter Description'
      },
      'is_multiple': {
        label: 'Is this attribute can multiple values',
        error: { required: 'Please choose One' },
        name: 'is_multiple',
        type: 'radio',
        options: [{ value: 1, label: 'Yes' }, { value: 0, label: 'No' }],
        className: "sm:w-1/3",
        placeholder: 'Enter Description'
      },
      'is_required': {
        label: 'Is this attribute is required field for product',
        error: { required: 'Please choose One' },
        name: 'is_required',
        type: 'radio',
        options: [{ value: true, label: 'Yes' }, { value: false, label: 'No' }],
        className: "sm:w-1/3",
        placeholder: 'Enter Description'
      },
      'values': {
        label: 'Values',
        type: 'multiple-fields',
        name: 'values',
        fields: [{
          label: 'Title',
          name: 'title',
          type: 'text',
          error: { required: 'Please enter a valid value' },
          className: "sm:w-1/2",
          placeholder: 'Enter Title'
        },
        {
          label: 'Status',
          name: 'is_active',
          type: 'radio',
          className: "w-auto",
          error: { required: 'Please Choose status' },
          options: [{ value: 1, label: 'Active' }, { value: 0, label: 'Deactive' }],
          placeholder: 'Enter Title'
        }],
        className: "w-full flex flex-col lg:flex-row lg:flex-wrap",
        placeholder: 'Enter Description',
        watchBy: "is_optional_values",
        watchValues: ["1"]
      },
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

    if (row.referance) {
      items.is_referance_values.defaultValue = 1
    }else{
      items.is_referance_values.defaultValue = 0
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
      showModel: true,

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

    var attribute;
    var message;


    if ('id' in data) {
      attribute = await edit(this.state.modelTitle, data);
      message = `${this.state.baseTitle} Updated Successfully`
    } else {
      attribute = await add(this.state.modelTitle, data);
      message = `${this.state.baseTitle} Added Successfully`
    }


    // check Response
    if (attribute.updated) {
      toastr.success(message)
      this.fetchList()

      this.setState({
        showModel: false
      })
    }
    else {
      let error;
      if (attribute.attribute) {
        error = attribute.attribute.error
      }
      else if (attribute.error.details) {
        error = attribute.error.details[0].message
      }
      else if (attribute.error) {
        error = attribute.error
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
    let data = this.state.attributes
    const columns = [
      {
        Header: 'Title',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              <span className="pt-1">{props.row.original.title}</span>
            </div>
          )
        },

      },
      {
        Header: 'Referance',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              <span className="pt-1">{props.row.original.referances ? props.row.original.referances.title : ''}</span>
            </div>
          )
        },

      },
      {
        Header: 'Applied AS',
        accessor: 'applied_as'

      },
      {
        Header: 'Is Optional Value ',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              {props.row.original.is_optional_values == 1 ? 'Yes' : "No"}
            </div>
          )
        },

      },
      {
        Header: 'Is Data Filterable',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              {props.row.original.filterable == 1 ? 'Yes' : "No"}
            </div>
          )
        },

      },
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
                  this.state.storeFields && this.state.storeFields != {} && <Validation items={Object.values(this.state.storeFields)} onSubmit={this.onStoreSubmit} alerts={false} />
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
              data={this.state.attributes}
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
              deletable={false}
            />
          }

        </Widget>


      </>

    )
  }

}
