import { Component } from 'react';
import { fetchAll, fetchAllFcmtoken, getUrl, updateAdditional, add, edit } from 'helpers/apiService';
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
import fetch from "isomorphic-unfetch";
import { getToken } from "helpers/auth";
import FormData from "isomorphic-form-data";
import moment from 'moment';


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
    bulkSms: [],
    storeFilter: {},
    imageLimits: {},
    baseTitle: 'Bulk Sms',
    modelTitle: 'bulk-sms',
    queryTitle: 'bulk_sms',
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

    var imageLimits = await fetchAll('image-size-limits', { 'label': this.state.queryTitle });
    imageLimits = imageLimits.success = true ? imageLimits.sizes : {}
    this.setState({ fetching: false, imageLimits: imageLimits })
  }

  buildAddModel = () => {

    this.setState({
      displayModelTitle: `Add ${this.state.baseTitle}`
    })

    let items = {
      'course_ids': {
        datalabel: 'courses',
        dataname: 'courseID',
        label: `${define.course} Name`,
        name: 'course_ids',
        idSelector: 'id',
        view: 'name',
        type: 'select',
        className: "sm:w-1/2",
        placeholder: 'Enter course Name',
        isMultiple: true,
        effectedRows: [],
      },
      'product_ids': {
        datalabel: 'products',
        dataname: 'productID',
        label: 'product Name',
        name: 'product_ids',
        idSelector: 'id',
        view: 'name',
        type: 'select',
        className: "sm:w-1/2",
        placeholder: 'Enter product Name',
        isMultiple: true,
        effectedRows: [],
      },
      'message': {
        label: 'Message',
        error: { required: 'Please enter a valid message' },
        name: 'message',
        type: 'textarea',
        className: "w-full",
        placeholder: 'Enter Message'
      },
    }
    return this.setState({
      storeFields: items,
      showModel: false
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

    let body;

    let query = {}

    if (data.course_ids && data.course_ids != '[]') {
      query.course_ids = data.course_ids
    }


    if (data.product_ids && data.product_ids != '[]') {
      query.product_ids = data.product_ids
    }

    query.forSMS = true

    // Fetch All Fcm Token
    let users = await fetchAllFcmtoken(query);
    var sendSms;
    users.user.map(async (user) => {

      body = {
        message: data.message,
        user_id: user.id,
      };

      sendSms = await add(`${this.state.modelTitle}`, body).then(res => { return res; });
    });

    toastr.success('Bulk SMS Sent Successfully')
    this.setState({
      showModel: false
    }, () => { this.fetchList() })

  }

  // 
  componentDidMount() {
    this.buildAddModel();
    this.fetchList();
    // this.fetchBase();
  }

  // 
  render() {
    let data = this.state.bulkSms
    const columns = [

      {
        Header: 'Message',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              <span className="pt-1">{props.row.original.message}</span>
            </div>
          )
        },
      },
      {
        Header: 'Created At',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              <span className="pt-1">{moment(props.row.original.created_at).format('MMMM Do YYYY, h:mm:ss a')}</span>
            </div>
          )
        },

      },

    ]

    return (
      <>
        <SectionTitle title={this.props.parentName ? this.props.parentName : 'Dashbaord'} subtitle={`${this.state.baseTitle}`} onClick={this.changeModalStatus} />

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
          {/* <Filter filterObjects={filterObjects}  filterOnChange ={true} onFilter={this.onFilter} /> */}
          {
            this.state.fetching &&

            <Shimmer /> ||
            <Datatable
              columns={columns}
              deletable={this.props.contentDeletable}
              data={this.state.bulkSms}
              paginationClick={this.fetchByOffset}
              pageSizedata={this.state.filters.limit}
              pageIndexdata={(this.state.filters.offset / this.state.filters.limit)}
              pageCountData={this.state.totalCount}
              baseTitle={this.state.baseTitle}
              modelTitle={this.state.modelTitle}
              queryTitle={this.state.queryTitle}
              editable={false}
              viewable={false}
              deletable={false}
              fetchList={this.fetchList}
              sectionRow={true}
              approvable={false}
              status={false}
              sectionRow={false}
              sortable={false}
            />
          }

        </Widget>


      </>

    )
  }

}
