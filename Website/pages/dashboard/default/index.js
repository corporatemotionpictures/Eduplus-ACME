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
    storeFields: [],     displayModelTitle: 'Add New',
    showModel: false,
    deleteModel: false,
    id: null,
    courses: [],
    storeFilter: {},
    baseTitle: 'Course',
    modelTitle: 'courses',
    queryTitle: 'courses',
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
      let data = await fetchAll(`search/dashboard-search?field=courses&&searchKey=${e.target.value}`)
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
    var data = await fetchAll('courses', { ...this.state.filters, 'forList': true });
    this.setState(data)
    data = await updateAdditional('count-all', 'courses', {'is_active': true });
    this.setState(data)
    this.setState({ fetching: false })
  }


  // Function for delete data
  reorder = async (data) => {

    var update = await updateAdditional('re-indexing', 'courses', data)

    if (update.success == true) {
      toastr.success('Re-Indexing Successfull')
    }
  }

  // Function for delete data
  changeStatus = async (ids, status) => {

    var data = {
      id: ids,
      is_active: status,
    }

    var update = await updateAdditional('change-status', 'courses', data)

    if (update.success == true) {
      toastr.success('Status change Successfull')
    }

    if (ids.length != undefined) {
      this.fetchList();
    }
  }

 buildAddModel = () => {

    this.setState({
      displayModelTitle: `Add ${this.state.baseTitle}`
    })

    let items = {
      'exam_ids': {
        datalabel: 'exams',
        dataname: 'examID',
        label: `${define.exam} Name`,
        error: { required: `Please select ${define.exam} Name` },
        name: 'exam_ids',
        idSelector: 'id',
        view: 'name',
        type: 'select',
        className: "sm:w-1/2",
        placeholder: 'Enter Exam Name',
        isMultiple: true,
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
        error: { required: 'Please Choose an Image' },
        width: 500,
        height: 500,
        maxfilesize: 500,
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
      course = await edit('courses', data, 'thumbnail');
      message = `${this.state.baseTitle} Updated Successfully`
    } else {
      course = await add('courses', data, 'thumbnail');
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
      else if (course.error) {
        error = course.error.details[0].message
      }
      toastr.error(error)
    }

  }

  // Function for delete data
  delete = async () => {
    let deleteStatus = await deleteData('courses', JSON.stringify({ id: this.state.id }))
    if (deleteStatus.success == true) {
      toastr.success(`${this.state.baseTitle} Deleted Successfully`)
      this.fetchList()
    }
    else {
      toastr.info(`You can't delete this ${this.state.baseTitle}. To delete this, you first need to delete the associated components with the this ${this.state.baseTitle}.`, 'Oops Sorry !',)
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
    let data = this.state.courses
    const columns = [
      {
        Header: 'ID',
        accessor: 'id',
      },
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
      {
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
      {
        Header: 'Status',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              <Switch initialState={props.row.original.is_active == 1 ? true : false} color='green' offColor="red" id={props.row.original.id} onChange={this.changeStatus} />
            </div>
          )
        },

      },
      {
        Header: 'Action',
        Cell: props => {
          return (
            <div className="flex flex-col lg:flex-row lg:flex-wrap items-start lg:items-center justify-start space-y-2 lg:space-y-0 lg:space-x-2">
              <a className="editButton" title="Edit" onClick={() => this.randerEditModal(props.row.original)}>
                <span className="h-8 w-8 bg-blue-100 text-white flex items-center justify-center rounded-full text-lg font-display font-bold">
                  <Tooltip placement='top' content="Edit Detail">
                    <FiEdit size={16} className="stroke-current text-base" />
                  </Tooltip>
                </span>
              </a>
              <span className=""
                onClick={() => this.setState({ id: props.row.original.id, deleteModel: true })}
              >
                <a title="Delete">
                  <span className="h-8 w-8 bg-red-100 text-white flex items-center justify-center rounded-full text-lg font-display font-bold">
                    <Tooltip placement='top' content="Delete Row">
                      <FiDelete size={16} className="stroke-current text-red-500" />
                    </Tooltip>
                  </span>
                </a>
              </span>
            </div>
          )
        },
      }
    ]

    const filterObjects = [
      {
        label: `exams`,
        title: `${define.exams}`,
        name: 'examID',
        idSelector: 'id',
        view: 'name',
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

        {
          this.state.deleteModel &&
          <DeleteModel
            title="Delete"
            icon={
              <span className="h-10 w-10 bg-red-100 text-white flex items-center justify-center rounded-full text-lg font-display font-bold">
                <FiX size={18} className="stroke-current text-red-500" />
              </span>
            }
            body={
              <div className="text-sm text-gray-500">
                Are you sure you want to delete ?
            </div>
            }
            buttonTitle="Delete"
            buttonClassName="btn btn-default btn-rounded bg-red-500 hover:bg-red-600 text-white"
            useModel={this.state.deleteModel}
            hideModal={() => this.setState({ deleteModel: false })}
            onClick={this.delete}
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
            />
          }

        </Widget>


      </>

    )
  }

}
