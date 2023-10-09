import { Component } from 'react';
import { fetchAll } from 'helpers/apiService';
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
    tutorials: [

    ],
    modelTitle: 'tutorials',
    queryTitle: 'tutorials',
    baseTitle: 'Tutorials',
    currentUrl: null,
  }


  fetchBase = async () => {
    var data = await fetchAll(this.state.modelTitle, { ...this.state.filters, 'forList': true });
    this.setState(data)
  }

  randerEditModal = (row) => {

    this.setState({
      currentUrl: row.url,
    }, () => {
      this.setState({
        showModel: true
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

  // 
  componentDidMount() {

    this.fetchBase();
  }

  // 
  render() {
    let tutorials = this.state.tutorials

    let data = this.state.tutorials
    const columns = [

      {
        Header: 'Title',
        Cell: props => {
          return (
            <div className="md:flex justify-start items-start" >
              <iframe width="400" className="p-4 pb-2 rounded-3xl w-full sm:w-1/3" src={`${props.row.original.url}?controls=0&showinfo=0`} title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
              <div className="">
                <h5 className="px-5 font-bold pt-2">{props.row.original.title}</h5>
                <p className="px-5 pt-2 text-justify">{props.row.original.description}</p>
              </div>
            </div>
          )
        },

      },
    ]

    const filterObjects = [
      {
        type: 'blank',
        content: <div className="mr-2  mb-0 pl-2">
          <FiSearch size="16" />
        </div>
      },
      {
        name: 'search',
        type: 'text',
        effectedRows: [],
        className: " w-5/6 sm:w-5/6 mb-0 padding-0",
        InputclassName: " border-0 rounded-md px-0 focus:ring-transparent ring-transparent",
        placeholder: 'Search Module'
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


          <div className="w-full mb-5">
            <img src="https://eduplusapp.com/find-institute/admin-panel-banner.jpg" className="w-full rounded" />
          </div>

          <div className='sm:w-1/2 md:float-right flex justify-between md:justify-end'>
            <a className="  btn p-2 text-sm btn-outlined bg-base text-white hover:text-blue-700 hover:border-blue-700 md:float-right  mb-2 lg:ml-2 rounded items-center" target="_blank" href="https://www.etherealcorporate.com/contact"><i class="fas fa-phone fa-rotate-90 mr-1"></i>
              Contact Us
            </a>

            <a className="  btn btn-default btn-outlined bg-transparent text-base hover:text-blue-700 border-blue-500 hover:border-blue-700 float-right lg:mx-2 mb-2 whats-app  flex rounded items-center" target="_blank" href="https://api.whatsapp.com/send?phone=917049903333">
              <FaWhatsapp size="18" /> <span className="pl-1 align-center ">Chat With Us</span>
            </a>
          </div>
          <div className="sm:w-1/2 border mt-3 mb-3">
            <Filter filterObjects={filterObjects} hideBtn={true} filterOnChange={true} onFilter={this.onFilter}  forRow={true} />
            {/* <hr /> */}
          </div>

          {
            <Datatable
              columns={columns}
              deletable={false}
              data={this.state.tutorials}
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
              sortable={false}
            />
          }

        </Widget>


      </>

    )
  }

}
