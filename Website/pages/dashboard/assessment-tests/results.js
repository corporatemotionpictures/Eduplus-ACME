import { Component } from 'react';
import { fetchAll, get, updateAdditional, add, edit } from 'helpers/apiService';
import React from 'react'
import SectionTitle from 'components/functional-ui/section-title'
import Datatable from 'components/functional-ui/datatable'
import Shimmer from 'components/website/shimmer/datatable'
import Widget from 'components/functional-ui/widget'
import Filter from 'components/classical-ui/filters'
import toastr from 'toastr'
import define from 'src/json/worddefination.json'
import { FiMail, FiPhone, FiEdit, FiDelete, FiArrowRight } from 'react-icons/fi'
import Tooltip from 'components/functional-ui/tooltips'
import StoreModel from 'components/functional-ui/modals/modal-store'
import DeleteModel from 'components/functional-ui/modals/modal-confirmation'
import Validation from 'components/functional-ui/forms/validation'
import { FiX } from 'react-icons/fi'
import { Badge, CircularBadge } from 'components/functional-ui/badges'
import Switch from 'components/functional-ui/switch'
import Link from 'next/link'
import UserModel from 'components/functional-ui/modals/modal-user'


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
    assessments: [],
    storeFilter: {},
    imageLimits: {},
    userModel: false,
    baseTitle: 'assessment result',
    modelTitle: 'assessmentResults',
    queryTitle: 'assessmentResults',
    displayModelTitle: `Add New Assessments`
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
    var data = await get('assessment-tests/result', { ...this.state.filters, 'forList': true });
    this.setState(data)
    this.setState({ fetching: false })
  }

  openPopup = async (user) => {
    this.setState({
      userdata: user,
      userModel: true
    })
  }



  // 
  componentDidMount() {
    this.fetchList();
    // this.fetchBase();
  }

  // 
  render() {
    let data = this.state.assessmentResults
    const columns = [

      {
        Header: 'Users',
        Cell: props => {
          return (
            <div className="relative">
              <div className="capitalize userdata py-3 space-y-3"  >
                <div  className="capitalize userdata py-3 space-y-3" onMouseEnter={() => this.openPopup(props.row.original.user)}  >
                  <span  >{props.row.original.user ? `${props.row.original.user.first_name} ${props.row.original.user.last_name}` : ''}</span>
                </div>
              </div>

            </div>
          )
        },

      },
      {
        Header: 'Total Right Answer',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >

              <span className="pt-1">{props.row.original.rightAnswer}</span>
            </div>
          )
        },

      },
      {
        Header: 'Total Wrong Answer',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >

              <span className="pt-1">{props.row.original.totalQuestions - props.row.original.rightAnswer}</span>
            </div>
          )
        },

      },
      {
        Header: 'Total Questions',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >

              <span className="pt-1">{props.row.original.totalQuestions}</span>
            </div>
          )
        },

      },
      {
        Header: 'Action',
        Cell: props => {
          return (
            <a className="viewButton" title="View">
              <span className="h-8 w-8 bg-blue-100 text-primary flex items-center justify-center rounded-full text-lg font-display font-bold">
                <Link href={`/dashboard/users/${props.row.original.user.id}`} target="_blank"  >
                  <i className="fas fa-eye"></i>
                </Link>
              </span>
            </a>

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
        className: "sm:w-full",
        placeholder: 'Search Assessment'
      }
    ]

    return (
      <>
        <SectionTitle title={this.props.parentName ? this.props.parentName : 'Dashbaord'} subtitle={`${this.state.baseTitle}s`} hideButton={true} />
        {this.state.userModel && <UserModel
          user={this.state.userdata}
          closeModal={() => { this.setState({ userModel: false }) }}
        />
        }



        <Widget className="tble"
          title=""
          description=''>
          <Filter filterObjects={filterObjects} filterOnChange={true} onFilter={this.onFilter} />
          {
            this.state.fetching &&

            <Shimmer /> ||
            <Datatable
              columns={columns}
              deletable={this.props.contentDeletable}
              data={this.state.assessmentResults}
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
              viewable={false}
              editable={false}
              deletable={false}
              status={false}
            />
          }

        </Widget>


      </>

    )
  }

}