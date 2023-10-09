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
    storeFields: [],
    displayModelTitle: 'Add New',
    showModel: false,
    deleteModel: false,
    id: null,
    storeFilter: {},
    modules: {},
    baseTitle: 'Module',
    modelTitle: 'modules',
    queryTitle: 'modules',

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
      let data = await fetchAll(`search/dashboard-search?field=modules&&searchKey=${e.target.value}`)
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
    var data = await fetchAll('modules', this.state.filters);
    this.setState(data)
    this.setState({ fetching: false })
  }


  // Function for delete data
  reorder = async (data) => {
    var update = await updateAdditional('re-indexing', 'modules', data)

    if (update.success == true) {
      toastr.success('Re-Indexing Successfull')
    }
  }

  buildAddModel = () => {

    this.setState({
      displayModelTitle: `Add ${this.state.baseTitle}`
    })

    let items = {
      'parent_id': {
        datalabel: 'modules',
        dataname: 'moduleID',
        label: 'Parent Module',
        name: 'parent_id',
        idSelector: 'id',
        view: 'title',
        type: 'select',
        className: "sm:w-1/2",
        placeholder: 'Enter Parent Module',
        isMultiple: false,
      },
      'type': {
        datalabel: 'main_sections',
        dataname: 'mainSectionID',
        label: 'Module Type',
        name: 'type',
        idSelector: 'value',
        view: 'label',
        type: 'select',
        values: [{
          value: 'Applications',
          label: 'Applications'
        },
        {
          value: 'Dashboard',
          label: 'Dashboard'
        }
        ],
        className: "sm:w-1/2",
        placeholder: 'Enter Module Type',
        isMultiple: false,
      },
      'title': {
        label: 'Module Title',
        error: { required: 'Please enter a valid Module Title' },
        name: 'title',
        type: 'text',
        className: "sm:w-1/2",
        placeholder: 'Enter Module Title'
      },
      'url': {
        label: 'Module URL',
        error: { required: 'Please enter a valid URL' },
        name: 'url',
        type: 'text',
        className: "sm:w-1/2",
        placeholder: 'Enter URL'
      },
      'icon': {
        label: 'Module Icon',
        name: 'icon',
        type: 'text',
        className: "sm:w-1/2",
        placeholder: 'Enter Icon'
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

    var module;
    var message;

    data.parent_id = data.parent_id == '' ? null : data.parent_id
    data.icon = data.icon == '' ? null : data.icon
    if ('id' in data) {
      module = await edit('modules', data);
      message = 'Module Updated Successfully'
    } else {
      module = await add('modules', data);
      message = 'Module Added Successfully'
    }


    // check Response
    if (module.updated) {
      toastr.success(message)
      this.fetchList()

      this.setState({
        showModel: false
      })
    }
    else {
      let error;
      if (module.module) {
        error = module.module.error
      }
      else if (module.error) {
        error = module.error.details ? module.error.details[0].message : module.error
      }
      toastr.error(error)
    }
  }

  // Function for delete data
  delete = async () => {
    let deleteStatus = await deleteData('modules', JSON.stringify({ id: this.state.id }))
    if (deleteStatus.success == true) {
      toastr.success('Module Deleted Successfully')
      this.fetchList()
    }
    else {
      toastr.info("You can't delete this module. To delete this, you first need to delete the associated components with the this Module.", 'Oops Sorry !',)
    }

    this.setState({ deleteModel: false })

  }

  // 
  componentDidMount() {
    this.buildAddModel();
    this.fetchList();
   
    // this.fetchBase();
  }

  // 
  render() {
    let data = this.state.modules

   
    const columns = [
      {
        Header: '',
        accessor: 'id',
      },
      {
        Header: 'Title',
        accessor: 'title'
      },
      {
        Header: 'Childrens',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              {props.row.original.items && props.row.original.items.map((item) => {
                return <Badge key={item.id} size='sm' color="bg-base text-white mr-2 mb-2" rounded>
                  {item.title}
                </Badge>
              })}
            </div>
          )
        },

      },
      {
        Header: 'URL',
        accessor: 'url'
      },
      {
        Header: 'Type',
        accessor: 'type'
      }
    ]

    const filterObjects = [{
      label: 'modules',
      name: 'parentID',
      idSelector: 'id',
      view: 'title',
      type: 'select-multiple',
      effectedRows: []
    },
    ]

    return (
      <>
        <SectionTitle title="Settings" subtitle="Modules" onClick={this.changeModalStatus} />

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
              data={this.state.modules}
              paginationClick={this.fetchByOffset}
              pageSizedata={this.state.filters.limit}
              pageIndexdata={(this.state.filters.offset / this.state.filters.limit)}
              pageCountData={this.state.totalCount}
              reorder={this.reorder}
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
