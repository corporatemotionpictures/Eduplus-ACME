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
import StoreModel from 'components/functional-ui/modals/modal-store'
import Validation from 'components/functional-ui/forms/validation'
import { Badge, CircularBadge } from 'components/functional-ui/badges'
import moment from 'moment'


//

export default class extends Component {

  state = {
    values: {},
    search: '',
    id: null,
    delete: false,
    fetching: true,
    filters: {
      limit: 10,
      offset: 0
    },
    storeFields: [], displayModelTitle: 'Add New',
    showModel: false,
    deleteModel: false,
    id: null,
    referrals: [],
    storeFilter: {},
    imageLimits: {},
    baseTitle: 'referral',
    modelTitle: 'referrals',
    queryTitle: 'referrals',
    defaultValues: {},
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
    // data = await updateAdditional('count-all', this.state.queryTitle, { 'is_active': true });
    // this.setState(data)
    var imageLimits = await fetchAll('image-size-limits', { 'label': this.state.queryTitle });
    imageLimits = imageLimits.success = true ? imageLimits.sizes : {}
    this.setState({ fetching: false, imageLimits: imageLimits })
  }


  getItems = () => {

    let items = {
      'referance_type': {
        label: 'Applied On',
        name: 'referance_type',
        type: 'radio',
        options: [
          {
            value: 'product',
            label: 'Products'
          },
        ],
        className: "sm:w-1/3",
        placeholder: 'Enter  Type',
        defaultValue: "product",
      },
      'exam_ids': {
        datalabel: 'exams',
        dataname: 'examID',
        label: `${define.exam} Name`,
        error: { required: `Please select ${define.exam} Name` },
        name: 'exam_ids',
        idSelector: 'id',
        view: 'name',
        type: 'select',
        className:  "sm:w-1/3",
        placeholder: 'Enter Exam Name',
        isMultiple: true,
        effectedRows: [],
        watchBy: "referance_type",
        watchValues: ["exam"]
      },

      'course_ids': {
        datalabel: 'courses',
        dataname: 'courseID',
        label: `${define.course} Name`,
        error: { required: `Please select ${define.course} Name` },
        name: 'course_ids',
        idSelector: 'id',
        view: 'name',
        type: 'select',
        className:  "sm:w-1/3",
        placeholder: 'Enter course Name',
        isMultiple: true,
        effectedRows: [],
        watchBy: "referance_type",
        watchValues: ["course"]
      },
      'product_ids': {
        datalabel: 'products',
        dataname: 'productID',
        label: 'product Name',
        error: { required: 'Please enter a valid product Name' },
        name: 'product_ids',
        idSelector: 'id',
        view: 'name',
        type: 'select',
        className:  "sm:w-1/3",
        placeholder: 'Enter product Name',
        isMultiple: true,
        effectedRows: [],
        watchBy: "referance_type",
        watchValues: ["product"]
      },
      'user_amount': {
        label: 'User Amount',
        error: {
          required: 'Please enter a valid Amount',
          min: {
            value: 1,
            message: 'Amount count be minimum 1'
          },
        },
        name: 'user_amount',
        type: 'number',
        className: "sm:w-1/3",
        placeholder: 'Enter Amount'
      },
      'user_discount_type': {
        label: 'User Amount Type',
        error: { required: 'Please Choose a valid Amount Type' },
        name: 'user_discount_type',
        type: 'radio',
        options: [{ value: 'AMOUNT', label: 'Amount' }, { value: 'PERCENT', label: 'Percent' }],
        className: "sm:w-1/3",
        placeholder: 'Enter Amount Type',
        defaultValue: 'PERCENT',
        disabled:  false
      },
      'user_minimum_amount': {
        label: 'User Minimum Product Amount',
        name: 'user_minimum_amount',
        type:  'number',
        className:  "sm:w-1/3",
        placeholder: 'Enter Minimum Amount'
      },
      'user_maximum_amount': {
        label: 'User Maximum product  Amount',
        name: 'user_maximum_amount',
        type:  'number',
        className:  "sm:w-1/3",
        placeholder: 'Enter Maximum Amount'
      },
      'user_amount_upto': {
        label: 'User Maximum Product Discount',
        name: 'user_amount_upto',
        type:  'number',
        className:  "sm:w-1/3",
        placeholder: 'Enter Maximum Product Discount'
      },
      'referrar_amount': {
        label: 'referrar Amount',
        error: {
          required: 'Please enter a valid Amount',
          min: {
            value: 1,
            message: 'Amount count be minimum 1'
          },
        },
        name: 'referrar_amount',
        type: 'number',
        className: "sm:w-1/3",
        placeholder: 'Enter Amount'
      },
      'referrar_discount_type': {
        label: 'referrar Amount Type',
        error: { required: 'Please Choose a valid Amount Type' },
        name: 'referrar_discount_type',
        type: 'radio',
        options: [{ value: 'AMOUNT', label: 'Amount' }, { value: 'PERCENT', label: 'Percent' }],
        className: "sm:w-1/3",
        placeholder: 'Enter Amount Type',
        defaultValue: 'PERCENT',
        disabled:  false
      },
      // 'referrar_minimum_amount': {
      //   label: 'referrar Minimum Product Amount',
      //   name: 'referrar_minimum_amount',
      //   type:  'number',
      //   className:  "w-1/3",
      //   placeholder: 'Enter Minimum Amount'
      // },
      // 'referrar_maximum_amount': {
      //   label: 'referrar Maximum product  Amount',
      //   name: 'referrar_maximum_amount',
      //   type:  'number',
      //   className:  "w-1/3",
      //   placeholder: 'Enter Maximum Amount'
      // },
      // 'referrar_amount_upto': {
      //   label: 'referrar Maximum Product Discount',
      //   name: 'referrar_amount_upto',
      //   type:  'number',
      //   className:  "w-1/3",
      //   placeholder: 'Enter Maximum Product Discount'
      // },
      'referrar_order_amount_usage': {
        label: 'referrar Order Amount Usage Percent',
        error: {
        },
        name: 'referrar_order_amount_usage',
        type:  'number',
        className:  "sm:w-1/3",
        placeholder: 'referrar Order Amount Usage Percent'
      },
      'start_date': {
        label: 'Start date',
        error: {},
        name: 'start_date',
        type: 'date',
        className: "sm:w-1/3  date",
        placeholder: 'Enter Start date'
      },
      'expiry_date': {
        label: 'End Date',
        error: {},
        name: 'expiry_date',
        type: 'date',
        className: "sm:w-1/3  date",
        placeholder: 'Enter End Date'
      },

    }


    if (!this.state.hideHierarchy || this.state.hideHierarchy < 1) {
      items.referance_type.options.push({
        value: 'exam',
        label: 'Exams'
      })
    }
    if (!this.state.hideHierarchy || this.state.hideHierarchy < 2) {
      items.referance_type.options.push({
        value: 'course',
        label: 'Courses'
      })
    }

    return items;
  }

  buildAddModel = () => {

    this.setState({
      displayModelTitle: `Add ${this.state.baseTitle}`
    })

    let items = this.getItems()

    return this.setState({
      storeFields: items,
      showModel: false
    }, () => console.log('abcd'))

  }

  randerEditModal = (row) => {


    this.buildAddModel()

    this.setState({
      displayModelTitle: `Edit ${this.state.baseTitle} - ${row.code}`

    })


    let items = this.getItems()
    // var items = this.state.storeFields;

    Object.keys(items).map((key) => {
      items[key].defaultValue = row[key]
    })

    items.start_date.defaultValue = moment(items.start_date.defaultValue).format('YYYY-MM-DD')
    items.expiry_date.defaultValue = moment(items.expiry_date.defaultValue).format('YYYY-MM-DD')

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
      showModel: true,

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

    var referral;
    var message;



    if ('id' in data) {
      referral = await edit(this.state.modelTitle, data);
      message = `${this.state.baseTitle} Updated Successfully`
    } else {
      referral = await add(this.state.modelTitle, data);
      message = `${this.state.baseTitle} Added Successfully`
    }


    // check Response
    if (referral.updated) {
      toastr.success(message)
      this.fetchList()

      this.setState({
        showModel: false
      })
    }
    else {
      let error;
      if (referral.referral) {
        error = referral.referral.error
      }
      else if (referral.error) {
        error = referral.error.details ? referral.error.details[0].message : referral.error
      }
      toastr.error(error)
    }

  }

  // 
  componentDidMount() {
    this.buildAddModel();
    this.fetchList();
    // this.fetchBase();
  }

  // 
  render() {
    let data = this.state.referrals
    const columns = [
      {
        Header: 'User Amount',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              <span className="pt-1">{props.row.original.userMonyfiedAmount}</span>
            </div>
          )
        },
      },
      {
        Header: 'referrar Amount',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              <span className="pt-1">{props.row.original.referrarMonyfiedAmount}</span>
            </div>
          )
        },
      },
      {
        Header: 'Referance Type',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start " >
              <span className="pt-1 capitalize">{`${props.row.original.referance_type}s`}</span>
            </div>
          )
        },
      },
      {
        Header: 'Referances',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              {props.row.original.referances && props.row.original.referances.map((item) => {
                return <Badge key={item.id} size='sm' color="bg-blue-200 text-blue mr-2 mb-2" rounded>
                  {item.name ? item.name : item.title}
                </Badge>
              })}
            </div>
          )
        },

      },
      {
        Header: 'user Minimum Amount',
        accessor: 'user_minimum_amount'
      },
      {
        Header: 'user Maximum Amount',
        accessor: 'user_maximum_amount'
      },
      {
        Header: 'Referrar Order Amount Maximum Usage Percent',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              {props.row.original.referrar_order_amount_usage} %
            </div>
          )
        },
      },
    ]

    const filterObjects = [
      {
        label: 'Type',
        name: 'type',
        type: 'select',
        className: "sm:w-full",
        options: [
          {
            value: '', 'label': 'Choose Type',
          },
          {
            value: 'DISCOUNT', 'label': 'DISCOUNT',
          },
          {
            value: 'referral', 'label': 'referral',
          },
          {
            value: 'MEMBERSHIP', 'label': 'MEMBERSHIP DISCOUNT',
          }
        ],
        effectedRows: []
      },
    ]


    const div = <div>

      <button
        className="btn btn-default btn-rounded bg-base hover:bg-blue-600 text-white"
        type="button"
        onClick={() => this.changeModalStatus()}>
        <i class="fas fa-plus mr-1"></i> Add New referral
      </button>
    </div>

    return (
      <>
        <SectionTitle title={this.props.parentName ? this.props.parentName : 'Dashbaord'} subtitle={`${this.state.baseTitle}s`} hideButton={true} html={div} />

        {
          this.state.showModel &&
          <StoreModel
            title={this.state.displayModelTitle}
            body={
              <div>
                {
                  this.state.storeFields && this.state.storeFields != {} && <Validation items={Object.values(this.state.storeFields)} onSubmit={this.onStoreSubmit} alerts={false} />
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
          <Filter filterObjects={filterObjects} filterOnChange={true} onFilter={this.onFilter} />
          {
            this.state.fetching &&

            <Shimmer /> ||
            <Datatable
              columns={columns}
              deletable={this.props.contentDeletable}
              data={this.state.referrals}
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
            />
          }

        </Widget>


      </>

    )
  }

}
