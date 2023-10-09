import { Component } from 'react';
import { fetchAll, updateAdditional } from 'helpers/apiService';
import React from 'react'
import { FiSearch } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import SectionTitle from 'components/functional-ui/section-title'
import Widget from 'components/functional-ui/widget'
import define from 'src/json/worddefination.json'
import moment from 'moment'
import Datatable from 'components/functional-ui/datatable'
import Shimmer from 'components/website/shimmer/datatable'
import Filter from 'components/classical-ui/filters'
import PopupModel from 'components/functional-ui/modals/modal-popup'

//

export default class extends Component {
  state = {
    fetching: false,
    filters: {
      limit: 25,
      offset: 0
    },
    membershipDocuments: [

    ],
    modelTitle: 'users/membership-documents',
    queryTitle: 'user_membership_doucuments',
    baseTitle: 'Membership Requests',
    currentUrl: null,
  }


  fetchBase = async () => {
    var data = await fetchAll(this.state.modelTitle, { ...this.state.filters, 'forList': true });
    this.setState(data)
  }

  randerEditModal = (row) => {

    this.setState({
      showModel: false
    }, () => {
      this.setState({
        currentUrl: row.document,
      }, () => {
        this.setState({
          showModel: true
        })
      })
    })

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
        this.fetchBase();
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
      this.fetchBase();
    })

  }

  changeModalStatus = () => {

    if (this.state.showModel == true) {
      this.setState({
        showModel: false
      })
    } else {
      this.setState({
        showModel: true
      })
    }
  }

  changeApproveStatus = async (e, id) => {
    let body = {
      label: this.state.queryTitle,
      id: id,
      approved: e.target.value,
    };

    var data = await updateAdditional('approve', this.state.queryTitle, body)

    if (data.success == true) {
      toastr.success('Status Change Successfully ')
      this.fetchBase();
    } else {
      toastr.error('Something went wrong')
    }
  };

  // 
  componentDidMount() {
    this.fetchBase();
  }

  // 
  render() {
    let membershipDocuments = this.state.membershipDocuments

    let data = this.state.membershipDocuments
    const columns = [
      {
        Header: 'User',
        Cell: props => {
          return (
            <div className="flex justify-start items-start" >
              <div className="capitalize">
                {props.row.original.user_first_name}  {props.row.original.user_last_name}
              </div>
            </div>
          )
        },

      },
      {
        Header: 'Membership',
        Cell: props => {
          return (
            <div className="flex justify-start items-start" >
              <div className="capitalize">
                {props.row.original.membership_title}
              </div>
            </div>
          )
        },

      },
    
      {
        id: 'approvel',
        Header: "Approval",
        Cell: props => {
          var statusColor = 'bg-base text-white'

          if (props.row.original.approved == 1) {
            statusColor = 'bg-green-500 text-white'
          } else if (props.row.original.approved == -1) {
            statusColor = 'bg-red-500 text-white'
          }

          return (
            <>
              <select className={`${statusColor} text-white p-1 font-14 border-0 rounded`} onChange={(e) => this.changeApproveStatus(e, props.row.original.id)}>
                <option className="bg-green-500 text-white" selected={props.row.original.approved == 1 ? true : false} value="1" >Approved</option>
                <option className="bg-red-500 text-white" selected={props.row.original.approved == 0 ? true : false} value="0" classname="bg-red">Not Approved</option>
              </select>
            </>

          )
        },
        className: 'text-center',
        headerClassName: 'text-center'
      }
    ]

    const filterObjects = [
      {
        type: 'blank',
        content: <div className=" mb-0 mt-2 pl-2">
          <FiSearch size="16" />
        </div>
      },
      {
        name: 'search',
        type: 'text',
        effectedRows: [],
        className: " w-5/6 sm:w-5/6 mb-0",
        InputclassName: " border-0 px-0 focus:ring-transparent ring-transparent py-0",
        placeholder: 'Search Membership, User Name, Mobile Number, Email'
      }
    ]

    return (
      <>
        <SectionTitle title={this.props.parentName ? this.props.parentName : 'Dashbaord'} subtitle={`${this.state.baseTitle}`} onClick={this.changeModalStatus} hideButton={true} />

        {
          this.state.showModel && <PopupModel video={<iframe width="960" height="540" className=" " src={`${this.state.currentUrl}`} title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>} />
        }
        <Widget
          title=""
          description=''>
          <div className="sm:w-1/2 border mb-4">
            <Filter filterObjects={filterObjects} hideBtn={true} filterOnChange={true} onFilter={this.onFilter} />
            {/* <hr /> */}
          </div>

          {
            <Datatable
              columns={columns}
              deletable={false}
              data={this.state.membershipDocuments}
              paginationClick={this.fetchByOffset}
              pageSizedata={this.state.filters.limit}
              pageIndexdata={(this.state.filters.offset / this.state.filters.limit)}
              pageCountData={this.state.totalCount}
              sectionRow={true}
              baseTitle={this.state.baseTitle}
              modelTitle={this.state.modelTitle}
              queryTitle={this.state.queryTitle}
              randerEditModal={this.randerEditModal}
              fetchList={this.fetchBase}
              status={false}
              sectionRow={false}
              approvable={false}
              editable={false}
              modalView={true}
              modalBtnName={'View'}
              sortable={false}
            />
          }

        </Widget>


      </>

    )
  }

}
