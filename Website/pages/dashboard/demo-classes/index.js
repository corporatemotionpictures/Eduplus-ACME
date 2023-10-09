import { Component } from 'react';
import { fetchAll, fetchAllFcmtoken, getUrl, updateAdditional, add, edit, fetchByID } from 'helpers/apiService';
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
import FormData, { defaultMaxListeners } from "isomorphic-form-data";
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
    schedule: [],
    storeFilter: {},
    imageLimits: {},
    baseTitle: 'Demo Classes',
    modelTitle: 'demo-classes',
    queryTitle: 'demo_classes',
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
      'user_id': {
        datalabel: 'users',
        fetchlabel: 'users',
        dataname: 'userID',
        label: 'user',
        error: { required: 'Please enter a valid user' },
        name: 'user_id',
        idSelector: 'id',
        view: 'name_with_mobile',
        type: 'select',
        className: "sm:w-1/2",
        placeholder: 'Enter user',
        isMultiple: false,
        effectedRows: [],
        onTab: 1,
      },
      'product_id': {
        datalabel: 'products',
        fetchlabel: 'products',
        dataname: 'productID',
        label: 'product',
        error: { required: 'Please enter a valid product' },
        name: 'product_id',
        idSelector: 'id',
        view: 'name',
        type: 'select',
        className: "sm:w-1/2",
        placeholder: 'Enter product',
        isMultiple: false,
        effectedRows: [],
        onTab: 1,
        onChange: this.onProductChange
      },
    }
    return this.setState({
      storeFields: items,
      showModel: false
    })

  }

  onProductChange = async (e) => {

    let product = await fetchByID('products', e.value , { noLog: true, forActive: true })
    product = product.product

    var items = this.state.storeFields;

    Object.values(items).map((item, i) => {
      if (item.byProduct) {
        return delete items[item.name]
      }
    })
    this.setState({
      storeFields: items
    })

    if (product.attributes) {

      let batches = product.attributes.filter(attr => attr.slug == 'batches')
      if (batches.length > 0) {
        batches = batches[0]
        var values = [];

        batches.values.map(value => {
          values.push({
            value: value.id,
            label: value.name ? value.name : value.title
          })
        })

        if (batches.referances) {
          batches.referances.fetcher = batches.referances.fetcher.split(',')
        }

        items.batch_id = {
          datalabel: `${batches.slug}`,
          dataname: "batchId",
          error: {},
          label: 'Batches',
          name: "batch_id",
          idSelector: 'value',
          view: 'label',
          type: 'select',
          values: values,
          className: "sm:w-1/2",
          placeholder: 'Enter Module Type',
          isMultiple: false,
          onTab: 1,
          effectedRows: [],
          byProduct: true,
          onChange: this.onBatchChange
        }


      }

    }

    this.setState({
      storeFields: items
    })

  }

  onBatchChange = async (e) => {

    let batch = await fetchByID('batches', e.value , { noLog: true })


    batch = batch.batch

    let lastdate = moment().format('YYYY-MM-DD')

    var items = this.state.storeFields;

    Object.values(items).map((item, i) => {
      if (item.byBatch) {
        return delete items[item.name]
      }
    })
    this.setState({
      storeFields: items
    })

    let dates = []
    let days = []

    batch.schedules.map(sch => {
      days.push(sch.day)
    })


    let i = 0;
    while (days.length > 0 && dates.length < 5) {

      lastdate = moment(lastdate, "YYYY-MM-DD").add(1, 'days').format('YYYY-MM-DD')
      if (days.includes(moment(lastdate, "YYYY-MM-DD").format('dddd'))) {

        let value = {
          label : lastdate,
          value : lastdate,
        }
        dates.push(value)
      }
      i++;
    }



    if (dates) {

      items.scheduled_at = {
        datalabel: 'scheduledus',
        dataname: "scheduledId",
        error: {},
        label: 'Scheduled AT',
        name: "scheduled_at",
        idSelector: 'value',
        view: 'label',
        type: 'select',
        values: dates,
        className: "sm:w-1/2",
        placeholder: 'Enter Module Type',
        isMultiple: false,
        onTab: 1,
        effectedRows: [],
      }

    }


    this.setState({
      storeFields: items
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


    var demoClass;
    var message;

    if ('id' in data) {
      demoClass = await edit(this.state.modelTitle, data);
      message = `${this.state.baseTitle} Updated Successfully`
    } else {
      demoClass = await add(this.state.modelTitle, data);
      message = `${this.state.baseTitle} Added Successfully`
    }


    // check Response
    if (demoClass.updated) {
      toastr.success(message)
      this.fetchList()

      this.setState({
        showModel: false
      })
    }
    else {
      let error;
      if (demoClass.demoClass) {
        error = demoClass.demoClass.error
      }
      else if (demoClass.error) {
        error = demoClass.error.details ? demoClass.error.details[0].message : demoClass.error
      }
      toastr.error(error)
    }
  }

  randerEditModal = (row) => {
    
    var items = {
      id: {
        label: 'Zoom Link',
        name: `id`,
        type: 'hidden',
        className: "",
        placeholder: 'Enter zoom Link',
        defaultValue: row.id,
        // hidden: true

      },
      product_id: {
        label: 'Product',
        type: 'text',
        className: "sm:w-1/2",
        placeholder: 'Enter zoom Link',
        defaultValue: row.product.name,
        disabled: true,
      },
      user_id: {
        label: 'Product',
        type: 'text',
        className: "sm:w-1/2",
        placeholder: 'Enter zoom Link',
        defaultValue: `${row.user.first_name} ${row.user.last_name}`,
        disabled: true,
      },
      batch_id: {
        label: 'Batch',
        type: 'text',
        className: "sm:w-1/2",
        placeholder: 'Enter zoom Link',
        defaultValue: row.batch.title,
        disabled: true,
      },
      scheduled_at: {
        label: 'Scheduled At',
        type: 'text',
        className: "sm:w-1/2",
        placeholder: 'scheduled_at',
        defaultValue: moment(row.scheduled_at).format('DD-MM-YYYY'),
        disabled: true,
      },
    };

    this.setState({
      storeFields: items,
      showModel: true
    })
  }

  // 
  componentDidMount() {
    this.buildAddModel();
    this.fetchList();
    // this.fetchBase();
  }

  // 
  render() {
    let data = this.state.schedule
    const columns = [

      {
        Header: 'User',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              <span className="pt-1">{props.row.original.user.first_name} {props.row.original.user.last_name}</span>
            </div>
          )
        },
      },
      {
        Header: 'Product',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              <span className="pt-1">{props.row.original.product.name}</span>
            </div>
          )
        },
      },
      {
        Header: 'Batch',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              <span className="pt-1">{props.row.original.batch.title}</span>
            </div>
          )
        },

      },
      {
        Header: 'scheduled at',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              <span className="pt-1">{moment(props.row.original.scheduled_at).format('DD-MM-YYYY')}</span>
            </div>
          )
        },

      },
      {
        Header: 'Link',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              <span className="pt-1">{props.row.original.zoom_link}</span>
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
              data={this.state.schedule}
              paginationClick={this.fetchByOffset}
              pageSizedata={this.state.filters.limit}
              pageIndexdata={(this.state.filters.offset / this.state.filters.limit)}
              pageCountData={this.state.totalCount}
              baseTitle={this.state.baseTitle}
              modelTitle={this.state.modelTitle}
              queryTitle={this.state.queryTitle}
              viewable={false}
              deletable={false}
              fetchList={this.fetchList}
              sectionRow={true}
              approvable={false}
              status={false}
              sectionRow={false}
              randerEditModal={this.randerEditModal}
            />
          }

        </Widget>


      </>

    )
  }

}
