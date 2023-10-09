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
    defaultValues: {},
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
    productTypes: [],
    storeFilter: {},
    imageLimits: {},
    baseTitle: 'Product Type',
    modelTitle: 'product-types',
    queryTitle: 'product_types',
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
        error: { required: 'Please enter a valid NTitTitleleame' },
        name: 'title',
        type: 'text',
        className: "sm:w-1/3",
        placeholder: 'Enter Title'
      },
      'selling_on': {
        label: 'Open Order For Product Type',
        error: { required: 'Please choose One' },
        name: 'selling_on',
        type: 'radio',
        options: [{ value: true, label: 'ON' }, { value: false, label: 'OFF' }],
        className: "sm:w-1/3",
        placeholder: 'Enter Description'
      },
      'is_package': {
        label: 'This type includes Study materials ',
        error: { required: 'Please choose One' },
        name: 'is_package',
        type: 'radio',
        options: [{ value: true, label: 'Online' }, { value: false, label: 'Offline' }],
        className: "sm:w-1/3",
        placeholder: 'Enter Description'
      },
      'is_free': {
        label: 'This type includes all free products ',
        error: { required: 'Please choose One' },
        name: 'is_free',
        type: 'radio',
        options: [{ value: true, label: 'Yes' }, { value: false, label: 'No' }],
        className: "sm:w-1/3",
        placeholder: 'Enter Description'
      },
      'description': {
        label: 'Description',
        error: { required: 'Please enter a valid Description' },
        name: 'description',
        type: 'textarea',
        className: "w-full",
        placeholder: 'Enter Description'
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

    var productType;
    var message;


    if ('id' in data) {
      productType = await edit(this.state.modelTitle, data);
      message = `${this.state.baseTitle} Updated Successfully`
    } else {
      productType = await add(this.state.modelTitle, data);
      message = `${this.state.baseTitle} Added Successfully`
    }


    // check Response
    if (productType.updated) {
      toastr.success(message)
      this.fetchList()

      this.setState({
        showModel: false
      })
    }
    else {
      let error;
      if (productType.productType) {
        error = productType.productType.error
      }
      else if (productType.error) {
        error = productType.error.details ? productType.error.details[0].message : productType.error
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
    let data = this.state.productTypes
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
        Header: 'Selling',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              <span className="pt-1">{props.row.original.selling_on ? 'ON' : 'OFF'}</span>
            </div>
          )
        },

      },
      {
        Header: 'Description',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              {props.row.original.description}
            </div>
          )
        },

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
          {
            this.state.fetching &&

            <Shimmer /> ||
            <Datatable
              columns={columns}
              deletable={this.props.contentDeletable}
              data={this.state.productTypes}
              paginationClick={this.fetchByOffset}
              pageSizedata={this.state.filters.limit}
              pageIndexdata={(this.state.filters.offset / this.state.filters.limit)}
              pageCountData={this.state.totalCount}
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
