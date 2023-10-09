import { Component } from 'react';
import { fetchAll, deleteData, updateAdditional, add, edit } from 'helpers/apiService';
import React from 'react'
import SectionTitle from 'components/functional-ui/section-title'
import Datatable from 'components/functional-ui/datatable'
import Shimmer from 'components/website/shimmer/datatable'
import Widget from 'components/functional-ui/widget'
import Filter from 'components/classical-ui/filters'
import { FiEdit, FiDelete, FiEye } from 'react-icons/fi'
import Link from 'next/link'

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
    modelTitle: 'tests',
    storeFields: [],
    displayModelTitle: 'Add New',
    showModel: false,
    deleteModel: false,
    id: null,
    completedTests: [],
    storeFilter: {},
    imageLimits: {},
    baseTitle: 'Completed Test',
    modelTitle: 'tests',
    queryTitle: 'completed_tests',
    hideHierarchy: this.props.hideHierarchy,
    hierarchyDefaultValues: {}
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


    this.setState({
      fetching: false
    })
  }

  // 
  componentDidMount() {
    this.fetchList();
    // this.fetchBase();
  }

  // 
  render() {
    let data = this.state.completedTests
    const columns = [

      {
        Header: 'User Name',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >

              <span >{props.row.original.first_name} {props.row.original.last_name}</span>
            </div>
          )
        },

      },
      {
        Header: 'Title',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              <span >{props.row.original.title}</span>
            </div>
          )
        },

      },
      {
        Header: 'Right Answer',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              <span >{props.row.original.right_answer_count}</span>
            </div>
          )
        },
      },
      {
        Header: 'Wrong Answer',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              <span >{props.row.original.wrong_answer_count}</span>
            </div>
          )
        },
      },
      {
        Header: 'Total Questions',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              <span >{props.row.original.testQuestions && props.row.original.testQuestions.length}</span>
            </div>
          )
        },
      },
      {
        Header: 'Marks',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              <span >{props.row.original.marks} %</span>
            </div>
          )
        },
      },
      {
        Header: '',
        Cell: props => {
          return (
            <a className="viewButton mb-1 lg:pl-2" title="View">
              <span className="h-8 w-8 bg-blue-100 text-primary flex items-center justify-center rounded-full text-lg font-display font-bold">
                <Link href={`/dashboard/completed-tests/[id]`} as={`/dashboard/completed-tests/${props.row.original.test_id}`} className="">
                  <a target="_blank"><FiEye size={16} className="stroke-current text-base" /></a>
                </Link>
              </span>
            </a>
          )
        },
      },

    ]


    const filterObjects = [
      {
        label: 'users',
        name: 'userID',
        idSelector: 'id',
        view: 'first_name',
        type: 'select-multiple',
        effectedRows: [],
      },
      {
        Header: 'Title',
        accessor: 'title'
      }
    ]

    return (
      <>
        <SectionTitle title={this.props.parentName ? this.props.parentName : 'Dashbaord'} subtitle={`${this.state.baseTitle}s`} hideButton={true} />

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
              data={this.state.completedTests}
              paginationClick={this.fetchByOffset}
              pageSizedata={this.state.filters.limit}
              pageIndexdata={(this.state.filters.offset / this.state.filters.limit)}
              pageCountData={this.state.totalCount}
              baseTitle={this.state.baseTitle}
              modelTitle={this.state.modelTitle}
              queryTitle={this.state.queryTitle}
              randerEditModal={this.randerEditModal}
              fetchList={this.fetchList}
              sectionRow={false}
              approvable={false}
              status={false}
              sortable={false}
              editable={false}
              deletable={false}
            />
          }

        </Widget>


      </>

    )
  }

}
