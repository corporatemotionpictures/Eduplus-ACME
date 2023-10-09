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
    memberships: [],
    storeFilter: {},
    baseTitle: 'memberships',
    modelTitle: 'memberships',
    queryTitle: 'memberships',
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
    this.setState({ fetching: false })
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
        className: "sm:w-1/2",
        placeholder: 'Enter title'
      },
      'amount': {
        label: 'amount',
        error: { required: 'Please enter a valid amount' },
        name: 'amount',
        type: 'number',
        className: "sm:w-1/2",
        placeholder: 'Enter amount',
        watchBy:'type',
        watchValues:['BUYABLE']
      },
      'description': {
        label: 'Description',
        name: 'description',
        type: 'textarea',
        className: "w-full",
        placeholder: 'Enter Name',
        editor: true,
      },
      'type': {
        label: 'Type',
        name: 'type',
        error: { required: 'Please choose One' },
        type: 'radio',
        options: [{ value: 'APPROVEABLE', label: 'Approveable by Management' }, { value: 'BUYABLE', label: 'Buyable by user' }],
        className: "sm:w-1/2",
        placeholder: 'Enter Description',
        defaultValue:'BUYABLE'
      },
      'product_ids': {
        datalabel: 'products',
        dataname: 'productID',
        label: 'Free Products',
        name: 'product_ids',
        idSelector: 'id',
        view: 'name',
        type: 'select',
        className: 'sm:w-1/2',
        placeholder: 'Enter Free Products',
        isMultiple: true,
        effectedRows: [],
      },
      'tax_id': {
        datalabel: 'taxes',
        dataname: 'taxID',
        label: `Tax`,
        name: 'tax_id',
        idSelector: 'id',
        view: 'title',
        type: 'select',
        className: "sm:w-1/2",
        placeholder: 'Enter tax Name',
        isMultiple: false,
        effectedRows: [],
        watchBy:'type',
        watchValues:['BUYABLE']
      },
      'validity_id': {
        datalabel: 'validities',
        dataname: 'validityID',
        label: `validity`,
        name: 'validity_id',
        idSelector: 'id',
        view: 'title',
        type: 'select',
        className: "sm:w-1/2",
        placeholder: 'Enter validity Name',
        isMultiple: false,
        effectedRows: [],
        watchBy:'type',
        watchValues:['BUYABLE']
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

    var membership;
    var message;

    if ('id' in data) {
      membership = await edit(this.state.modelTitle, data);
      message = `${this.state.baseTitle} Updated Successfully`
    } else {
      membership = await add(this.state.modelTitle, data);
      message = `${this.state.baseTitle} Added Successfully`
    }


    // check Response
    if (membership.updated) {
      toastr.success(message)
      this.fetchList()

      this.setState({
        showModel: false
      })
    }
    else {
      let error;
      if (membership.membership) {
        error = membership.membership.error
      }
      else if (membership.error) {
        error = membership.error.details ? membership.error.details[0].message : membership.error
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
    let data = this.state.memberships
    const columns = [

      {
        Header: 'title',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              {props.row.original.title}
            </div>
          )
        },
      },
      {
        Header: 'validity',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
               {props.row.original.validity ? props.row.original.validity.title : ''}
            </div>
          )
        },
      },
      {
        Header: 'amount',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              ₹ {props.row.original.amount}
            </div>
          )
        },
      },
    ]

    return (
      <>
        <SectionTitle title={this.props.parentName ? this.props.parentName : 'Dashbaord'} subtitle={`${this.state.baseTitle}`} onClick={this.changeModalStatus} />

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
          {
            this.state.fetching &&

            <Shimmer /> ||
            <Datatable
              columns={columns}
              deletable={this.props.contentDeletable}
              data={this.state.memberships}
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
              sectionRow={false}
              approvable={false}
            />
          }

        </Widget>


      </>

    )
  }

}
