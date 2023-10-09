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
import Router from 'next/router'
import Link from 'next/link';

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
      offset: 0,
      // is_parent: 0
    },
    storeFields: [], displayModelTitle: 'Add New',
    showModel: false,
    deleteModel: false,
    id: null,
    storeFilter: {},
    pages: {},
    baseTitle: 'Page',
    modelTitle: 'pages',
    queryTitle: 'pages',

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
      let data = await fetchAll(`search/dashboard-search?field=pages&&searchKey=${e.target.value}`)
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
    var data = await fetchAll('pages', this.state.filters);
    this.setState(data)
    this.setState({ fetching: false })
  }


  // Function for delete data
  reorder = async (data) => {
    var update = await updateAdditional('re-indexing', 'pages', data)

    if (update.success == true) {
      toastr.success('Re-Indexing Successfull')
    }
  }

  buildAddModel = (type) => {


    if (type == 'parent') {
      this.setState({
        displayModelTitle: `Add Parent ${this.state.baseTitle}`
      })

    } else if (type == 'withLink') {
      this.setState({
        displayModelTitle: `Add a new Page Link`
      })
    } else {
      this.setState({
        displayModelTitle: `Add ${this.state.baseTitle}`
      })
    }

    let items = {
      'title': {
        label: 'Page Title',
        error: { required: 'Please enter a valid Page Title' },
        name: 'title',
        type: 'text',
        className: "sm:w-full",
        placeholder: 'Enter Page Title'
      },
      'page_url': {
        label: 'Redirect Link to (URL)',
        name: 'page_url',
        type: type != 'parent' && type != 'new' ? 'text' : 'hidden',
        className: type != 'parent' && type != 'new' ? 'sm:w-full ' : '',
        placeholder: 'https://www.eduplusapp.com'
      },
      'visibility': {
        datalabel: 'main_sections',
        dataname: 'visibility',
        label: 'Page Visibility',
        name: 'visibility',
        idSelector: 'value',
        view: 'label',
        type: 'select',
        values: [
          {
            value: 'TOPNAV',
            label: 'Navigation bar'
          },
          {
            value: 'HEADER',
            label: 'Website Header'
          },
          {
            value: 'FOOTER',
            label: 'Website Footer'
          },
          {
            value: 'NONE',
            label: 'Do not display'
          }
        ],
        className: "sm:w-full",
        placeholder: 'Enter Page Type',
        isMultiple: false,
        effectedRows: ['pagesID'],
      },
      'parent_id': {
        datalabel: 'pages',
        dataname: 'pagesID',
        label: 'Parent Page',
        name: 'parent_id',
        idSelector: 'id',
        view: 'title',
        type: 'select',
        className: "sm:w-full",
        placeholder: 'Enter Parent Page',
        isMultiple: false,
        addNew: {
          baseTitle: 'Parent',
          modelTitle: 'pages',
          queryTitle: 'pages',
        },
        preFilters: { is_parent: 1 },
      },

      'slug': {
        label: 'Page slug',
        error: type != 'withLink' && type != 'parent' ? { required: 'Please enter a valid slug' } : null,
        name: 'slug',
        type: type != 'withLink' && type != 'parent' ? 'text' : 'hidden',
        className: type != 'withLink' && type != 'parent' ? "sm:w-full" : '',
        placeholder: 'Enter slug'
      },
      'target_blank': {
        label: 'Open page in new Tab',
        name: 'target_blank',
        options: [{ value: 1, label: 'Open Page in new Page' }],
        type: type != 'parent' ? 'checkbox' : 'hidden',
        className: type != 'parent' ? 'sm:w-full ' : '',
      },
      'login_required': {
        label: 'Login Required',
        name: 'login_required',
        options: [{ value: 1, label: 'user Login Required for show page' }],
        type: type != 'withLink' && type != 'parent' ? 'checkbox' : 'hidden',
        className: type != 'withLink' && type != 'parent' ? 'sm:w-full ' : '',
      },
      'short_description': {
        label: 'Page short description',
        name: 'short_description',
        type: type != 'withLink' && type != 'parent' ? 'text' : 'hidden',
        className: type != 'withLink' && type != 'parent' ? 'sm:w-1/2' : '',
      },

      'keyword': {
        label: 'Page keyword',
        name: 'keyword',
        type: type != 'withLink' && type != 'parent' ? 'text' : 'hidden',
        className: type != 'withLink' && type != 'parent' ? 'sm:w-full ' : '',
        placeholder: 'Enter keyword'
      },
      'description': {
        label: 'Page description',
        name: 'description',
        type: type != 'withLink' && type != 'parent' ? 'textarea' : 'hidden',
        className: type != 'withLink' && type != 'parent' ? 'sm:w-full ' : '',
        placeholder: 'Enter description'
      },
      'image': {
        label: 'Image',
        name: 'image',
        ...this.state.imageLimits,
        fileTypes: ["jpg", "png", "jpeg"],
        type: type != 'withLink' && type != 'parent' ? 'image' : 'hidden',
        className: type != 'withLink' && type != 'parent' ? 'sm:w-1/3' : '',
      }
    }
    return this.setState({
      storeFields: items,
      showModel: false
    })

  }

  randerEditModal = (row) => {


    if (row.is_parent == 0 && !row.page_url) {
      this.randerEditPage(row)
    }
    else {

      if (row.is_parent) {
        this.buildAddModel(parent)

        this.setState({
          displayModelTitle: `Edit Parent ${this.state.baseTitle} - ${row.title ? row.title : row.name}`
        })
      }
      else if (row.page_url) {
        this.buildAddModel('withLink')

        this.setState({
          displayModelTitle: `Edit ${this.state.baseTitle} Link - ${row.title ? row.title : row.name}`
        })
      } else {
        this.setState({
          displayModelTitle: `Edit ${this.state.baseTitle} - ${row.title ? row.title : row.name}`
        })
      }



      var items = this.state.storeFields;

      Object.keys(items).map((key) => {
        items[key].defaultValue = row[key]
      })

      items.image = {
        ...items.image,
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



  }

  changeModalStatus = (type) => {

    if (this.state.showModel == true) {
      // this.buildAddModel();
      this.setState({
        showModel: false
      })
    } else {
      this.buildAddModel(type);
      this.setState({
        showModel: true
      })
    }
  }

  onStoreSubmit = async (data) => {

    var pages;
    var message;

    data.parent_id = data.parent_id == '' ? null : data.parent_id
    data.icon = data.icon == '' ? null : data.icon

    if ('id' in data) {
      pages = await edit('pages', data, 'image');
      message = 'Page Updated Successfully'
    } else {
      pages = await add('pages', data, 'image');
      message = 'Page Added Successfully'
    }


    // check Response
    if (pages.updated) {
      toastr.success(message)
      this.fetchList()

      this.setState({
        showModel: false
      })
    }
    else {
      let error;
      if (pages.pages) {
        error = pages.pages.error
      }
      else if (pages.error) {
        error = pages.error.details[0].message
      }
      toastr.error(error)
    }
  }

  // Function for delete data
  delete = async () => {
    let deleteStatus = await deleteData('pages', JSON.stringify({ id: this.state.id }))
    if (deleteStatus.success == true) {
      toastr.success('Page Deleted Successfully')
      this.fetchList()
    }
    else {
      toastr.info("You can't delete this pages. To delete this, you first need to delete the associated components with the this Page.", 'Oops Sorry !',)
    }

    this.setState({ deleteModel: false })

  }

  randerEditPage = (row) => {
    Router.push(`/dashboard/pages/edit/${row.slug}`)
  }

  // 
  componentDidMount() {
    this.buildAddModel('withLink');
    this.fetchList();
    // this.fetchBase();
  }

  // 
  render() {
    let data = this.state.pages
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
        Header: 'Visibility',
        accessor: 'visibility'
      },
      {
        Header: 'Link Type',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              <Badge size='sm' color="bg-base text-white mr-2 mb-2" rounded>
                {props.row.original.is_parent ? 'Category' : 'Page'}
              </Badge>
            </div>
          )
        },
      },
      {
        Header: 'Link',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              {props.row.original.is_parent == 0 &&
                <Link href={props.row.original.page_url ? props.row.original.page_url : `/${props.row.original.slug}`}>
                  <a className="" target={"_blank"}>{props.row.original.page_url ? props.row.original.page_url : `/${props.row.original.slug}`}</a>
                </Link>}
            </div>
          )
        },
      },
    ]

    const filterObjects = [
      {
        title: 'Categories',
        label: 'pages',
        name: 'parentID',
        idSelector: 'id',
        view: 'title',
        type: 'select-multiple',
        effectedRows: [],
        preFilters: { is_parent: 1 }
      },
      {
        label: 'Visibility',
        name: 'visibility',
        type: 'select',
        options: [
          {
            value: 'TOPNAV',
            label: 'Navigation bar'
          },
          {
            value: 'HEADER',
            label: 'Website Header'
          },
          {
            value: 'FOOTER',
            label: 'Website Footer'
          },
        ],
        effectedRows: []
      },

    ]

    const div = <div>

      <button
        className="btn btn-default btn-rounded bg-base hover:bg-blue-600 text-white  mr-2"
        type="button"
        onClick={() => this.changeModalStatus('withLink')}>
        Add a page link
      </button>
      <button
        className="btn btn-default btn-rounded bg-base hover:bg-blue-600 text-white  mr-2"
        type="button"
        onClick={() => Router.push('/dashboard/pages/add')}>
        Create a page
      </button>
    </div>

    return (
      <>
        {/* <div id="editorjs"></div> */}
        <SectionTitle title="Settings" subtitle="pages" onClick={() => Router.push('/dashboard/pages/add')} hideButton={true} html={div} />

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
            className="width-25"
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
              data={this.state.pages}
              paginationClick={this.fetchByOffset}
              pageSizedata={this.state.filters.limit}
              pageIndexdata={(this.state.filters.offset / this.state.filters.limit)}
              pageCountData={this.state.totalCount}
              reorder={this.reorder}
              baseTitle={this.state.baseTitle}
              modelTitle={this.state.modelTitle}
              queryTitle={this.state.queryTitle}
              // randerEditModal={this.randerEditPage}
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
