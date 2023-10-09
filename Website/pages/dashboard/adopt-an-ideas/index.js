import { Component } from 'react';
import { fetchAll, edit } from 'helpers/apiService';
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
      limit: 10,
      offset: 0,
     
      type: 'Adopt-An-Idea'
    },
    queries: [

    ],
    modelTitle: 'queries',
    queryTitle: 'queries',
    baseTitle: 'queries',
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
    let queries = this.state.queries

    let data = this.state.queries
    const columns = [
      {
        Header: 'Name',
        Cell: props => {
          return (
            <div className="flex justify-start items-start" >
              {<div className="capitalize">
                {props.row.original.name}
              </div>}
            </div>
          )
        },

      },
      {
        Header: 'mobile number',
        Cell: props => {
          return (
            <div className="flex justify-start items-start" >
              {<div className="capitalize">
                {props.row.original.mobile_number}
              </div>}
            </div>
          )
        },

      },
      {
        Header: 'linkedin url',
        Cell: props => {
          return (
            <div className="flex justify-start items-start" >
              {<div className="capitalize">
                {props.row.original.linked_in}
              </div>}
            </div>
          )
        },

      },
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
          

          {
            <Datatable
              columns={columns}
              deletable={false}
              data={this.state.queries}
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
