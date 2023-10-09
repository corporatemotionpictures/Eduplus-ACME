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
    storeFields: [],     displayModelTitle: 'Add New',
    showModel: false,
    deleteModel: false,
    id: null,
    packageTypes: [],
    storeFilter: {},
    imageLimits: {},
    baseTitle: 'Package Type', 
    modelTitle: 'package-types',
    queryTitle: 'course_types',
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
      'include_ids': {
        datalabel: 'course-modules',
        fetchlabel: 'courseModules',
        dataname: 'moduleID',
        label: 'Module Name',
        error: { required: 'Select valid module Name' },
        name: 'include_ids',
        idSelector: 'id',
        view: 'title',
        type: 'select',
        className: "sm:w-1/2",
        placeholder: 'Enter module Name',
        isMultiple: true,
        effectedRows: [],
      },
      'title': {
        label: 'Title',
        error: { required: 'Please enter a valid NTitTitleleame' },
        name: 'title',
        type: 'text',
        className: "sm:w-1/2",
        placeholder: 'Enter Title'
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

    var packageType;
    var message;

    
    if ('id' in data) {
      packageType = await edit(this.state.modelTitle, data);
      message = `${this.state.baseTitle} Updated Successfully`
    } else {
      packageType = await add(this.state.modelTitle, data);
      message = `${this.state.baseTitle} Added Successfully`
    }


    // check Response
    if (packageType.updated) {
      toastr.success(message)
      this.fetchList()

      this.setState({
        showModel: false
      })
    }
    else {
      let error;
      if (packageType.packageType) {
        error = packageType.packageType.error
      }
      else if (packageType.error) {
        error = packageType.error.details ? packageType.error.details[0].message : packageType.error
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
    let data = this.state.packageTypes
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
        Header: 'Modules',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              {props.row.original.modules && props.row.original.modules.map((item) => {
                return <Badge key={item.id} size='sm' color="bg-base text-white mr-2 mb-2" rounded>
                  {item.title}
                </Badge>
              })}
            </div>
          )
        },

      }
    ]

    const filterObjects = [
      {
        title: 'Modules',
        fetchlabel: 'courseModules',
        label: 'course-modules',
        name: 'moduleID',
        className: 'w-full',
        idSelector: 'id',
        view: 'title',
        type: 'select-multiple',
        effectedRows: []
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
          <Filter filterObjects={filterObjects}  filterOnChange ={true} onFilter={this.onFilter} />
          {
            this.state.fetching &&

            <Shimmer /> ||
            <Datatable
              columns={columns}
              deletable={this.props.contentDeletable}
              data={this.state.packageTypes}
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
