import { Component } from 'react';
import { fetchAll, edit  } from 'helpers/apiService';
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
import Link  from 'next/link'

//

export default class extends Component {
  state = {
    fetching: false,
    filters: {
      limit: 10,
      offset: 0
    },
    pitches: [

    ],
    modelTitle: 'pitches',
    queryTitle: 'pitches',
    baseTitle: 'Pitches',
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
        currentUrl: row.elevator_video,
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
      id: id,
      status: e.target.value,
    };

    var data = await edit(this.state.modelTitle, body)

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
    let pitches = this.state.pitches

    let data = this.state.pitches
    const columns = [
      {
        Header: 'User',
        Cell: props => {
          return (
            <div className="flex justify-start items-start" >
              {props.row.original.user && <div className="capitalize">
                {props.row.original.user.first_name}  {props.row.original.user.last_name}
              </div>}
            </div>
          )
        },

      },
      {
        Header: 'Company Name',
        Cell: props => {
          return (
            <div className="flex justify-start items-start" >
              <div className="capitalize">
                {props.row.original.company_name}
              </div>
            </div>
          )
        },

      },
      {
        Header: 'Contact Person Name',
        Cell: props => {
          return (
            <div className="flex justify-start items-start" >
              <div className="capitalize">
                {props.row.original.contact_person_name}
              </div>
            </div>
          )
        },

      },
      {
        Header: 'Contact Number',
        Cell: props => {
          return (
            <div className="flex justify-start items-start" >
              <div className="capitalize">
                {props.row.original.contact_number}
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

          if (props.row.original.status == 'APPLIED') {
            statusColor = 'bg-green-500 text-white'
          } else if (props.row.original.status == 'ON-PROCESS') {
            statusColor = 'bg-blue-500 text-white'
          }

          return (
            <>
              <select className={`${statusColor} text-white p-1 font-14 border-0 rounded`} onChange={(e) => this.changeApproveStatus(e, props.row.original.id)}>
                <option className="bg-green-500 text-white" selected={props.row.original.status == 'APPLIED' ? true : false} value="APPLIED" >Applied</option>
                <option className="bg-red-500 text-white" selected={props.row.original.status == 'ON-PROCESS' ? true : false} value="ON-PROCESS" classname="bg-red">On Process</option>
              </select>
            </>

          )
        },
        className: 'text-center',
        headerClassName: 'text-center'
      },
      {
        Header: 'Is Company Registerd',
        Cell: props => {
          return (
            <div className="flex justify-start items-start" >
              <div className="capitalize">
                {props.row.original.is_company_registered ? 'Registered' : 'Not Registered'}
              </div>
            </div>
          )
        },

      },
      {
        Header: 'Is Product Launched',
        Cell: props => {
          return (
            <div className="flex justify-start items-start" >
              <div className="capitalize">
                {props.row.original.is_product_launched ? 'Product Launched' : 'Not Launched'}
              </div>
            </div>
          )
        },

      },
      {
        Header: 'File',
        Cell: props => {
          return (
            <div className="flex justify-start items-start" >
              {props.row.original.file && <div className="capitalize">
                <Link href={props.row.original.file}><a target="_blank">File</a></Link>
              </div>}
            </div>
          )
        },

      },
      {
        Header: 'Elevator video',
        Cell: props => {
          return (
            <div className="flex justify-start items-start" >
              {props.row.original.elevator_video && <div className="capitalize">
                <Link href={props.row.original.elevator_video}><a target="_blank">Video</a></Link>
              </div>}
            </div>
          )
        },

      },
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
        placeholder: 'Search Pitch, User Name, Mobile Number, Email'
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
            {/* <Filter filterObjects={filterObjects} hideBtn={true} filterOnChange={true} onFilter={this.onFilter} /> */}
            {/* <hr /> */}
          </div>

          {
            <Datatable
              columns={columns}
              deletable={false}
              data={this.state.pitches}
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
              modalView={false}
              sortable={false}
            />
          }

        </Widget>


      </>

    )
  }

}
