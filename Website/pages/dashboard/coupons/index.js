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
    coupons: [],
    storeFilter: {},
    imageLimits: {},
    baseTitle: 'Coupon',
    modelTitle: 'coupons',
    queryTitle: 'coupons',
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


  getItems = (type) => {

    let items = {
      'type': {
        label: 'Amount Type',
        error: { required: 'Please Choose a valid Amount Type' },
        name: 'type',
        type: 'hidden',
        defaultValue: type,
        hidden: true,
        className: "mb-0 ",
        placeholder: 'Enter Amount Type'
      },
      'membership_id': {
        datalabel: 'memberships',
        dataname: 'membershipID',
        label: `membership Name`,
        error: { required: `Please select membership Name` },
        name: 'membership_id',
        idSelector: 'id',
        view: 'title',
        type: 'select',
        className: "sm:w-1/3",
        placeholder: 'Enter membership Name',
        isMultiple: false,
        effectedRows: [],
        watchBy: "type",
        watchValues: ["MEMBERSHIP"]
      },

      'on_bulk': {
        label: 'Coupon Generation',
        name: 'on_bulk',
        type: (type == 'DISCOUNT' || type == 'MEMBERSHIP') ? 'hidden' : 'radio',
        options: [{ value: 1, label: 'Bulk Coupons' }, { value: 0, label: 'Single Coupons' }],
        className: (type == 'DISCOUNT' || type == 'MEMBERSHIP') ? 'mb-0' : "sm:w-1/3",
        defaultValue: "0",
        placeholder: 'Enter Description',

      },
      'referance_type': {
        label: 'Applied On',
        name: 'referance_type',
        type: 'radio',
        options: [
          {
            value: 'product',
            label: 'Products'
          },

          {
            value: 'product_type',
            label: 'Product Types'
          }
        ],
        className: "sm:w-1/3",
        placeholder: 'Enter  Type',
        defaultValue: "product",
      },
      'applied_on': {
        label: 'Applied As',
        name: 'applied_on',
        type: (type == 'DISCOUNT' || type == 'MEMBERSHIP') ? 'hidden' : 'radio',
        options: [
          {
            value: 'AUTOMATIC',
            label: 'Automatic'
          },
          {
            value: 'MANUAL',
            label: 'Manual'
          },
        ],
        className: (type == 'DISCOUNT' || type == 'MEMBERSHIP') ? 'mb-0' : "sm:w-1/3",
        placeholder: 'Enter  Type',
        defaultValue: (type == 'DISCOUNT' || type == 'MEMBERSHIP') ? 'AUTOMATIC' : 'MANUAL',
      },
      'code': {
        label: 'Code',
        error: (type == 'DISCOUNT' || type == 'MEMBERSHIP') ? {} : { required: 'Please enter a valid code' },
        name: 'code',
        type: (type == 'DISCOUNT' || type == 'MEMBERSHIP') ? 'hidden' : 'text',
        className: (type == 'DISCOUNT' || type == 'MEMBERSHIP') ? 'mb-0' : "sm:w-1/2",
        placeholder: 'Enter code',
        watchBy: "on_bulk",
        watchValues: ["0"]
      },
      'bulk_count': {
        label: 'Number of bulk coupons',
        error: {
          required: 'Please enter a valid Number',
          min: {
            value: 1,
            message: 'Bulk Count count must be minimum 1'
          },
        },
        name: 'bulk_count',
        type: 'number',
        className: "lg:w-1/4",
        placeholder: 'Enter Count',
        watchBy: "on_bulk",
        watchValues: ["1"],
      },
      'word_limit': {
        label: 'Number of Words in Coupon',
        error: {
          required: 'Please enter a valid Number',
          min: {
            value: 1,
            message: 'Bulk Count count must be minimum 1'
          },
        },
        name: 'word_limit',
        type: 'number',
        className: "lg:w-1/4",
        placeholder: 'Enter Count',
        watchBy: "on_bulk",
        watchValues: ["1"],
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
        className: (type == 'DISCOUNT' || type == 'MEMBERSHIP') ? 'sm:w-1/3' : "sm:w-1/2",
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
        className: (type == 'DISCOUNT' || type == 'MEMBERSHIP') ? 'sm:w-1/3' : "sm:w-1/2",
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
        className: (type == 'DISCOUNT' || type == 'MEMBERSHIP') ? 'sm:w-1/3' : "sm:w-1/2",
        placeholder: 'Enter product Name',
        isMultiple: true,
        effectedRows: [],
        watchBy: "referance_type",
        watchValues: ["product"]
      },
      'product_type_ids': {
        datalabel: 'product-types',
        fetchlabel: 'productTypes',
        dataname: 'productTypeID',
        label: 'Product Type',
        error: { required: 'Please enter a valid Product Type' },
        name: 'product_type_ids',
        idSelector: 'id',
        view: 'title',
        type: 'select',
        className: (type == 'DISCOUNT' || type == 'MEMBERSHIP') ? 'sm:w-1/3' : "sm:w-1/2",
        placeholder: 'Enter Product Type',
        isMultiple: true,
        effectedRows: [],
        onTab: 1,
        watchBy: "referance_type",
        watchValues: ["product_type"]
      },
      'amount': {
        label: 'Amount',
        error: {
          required: 'Please enter a valid Amount',
          min: {
            value: 1,
            message: 'Amount count be minimum 1'
          },
        },
        name: 'amount',
        type: 'number',
        className: "sm:w-1/3",
        placeholder: 'Enter Amount'
      },
      'discount_type': {
        label: 'Amount Type',
        error: { required: 'Please Choose a valid Amount Type' },
        name: 'discount_type',
        type: 'radio',
        options: [{ value: 'AMOUNT', label: 'Amount' }, { value: 'PERCENT', label: 'Percent' }],
        className: "sm:w-1/3",
        placeholder: 'Enter Amount Type',
        defaultValue: 'PERCENT',
        // disabled: (type == 'DISCOUNT' || type == 'MEMBERSHIP') ? true : false
      },
      'suggested': {
        label: 'Suggest on Cart',
        name: 'suggested',
        type: (type == 'DISCOUNT' || type == 'MEMBERSHIP') ? 'hidden' : 'checkbox',
        options: [
          {
            value: 1,
            label: 'View on Coupon List'
          },
        ],
        className: (type == 'DISCOUNT' || type == 'MEMBERSHIP') ? 'mb-0' : "sm:w-1/3",
        placeholder: 'Enter  Type',
        watchBy: "applied_on",
        watchValues: ["MANUAL"]
      },
      'first_order': {
        label: 'First Order',
        name: 'first_order',
        type: (type == 'DISCOUNT' || type == 'MEMBERSHIP') ? 'hidden' : 'checkbox',
        options: [
          {
            value: 1,
            label: 'Apply on only First Order'
          },
        ],
        className: (type == 'DISCOUNT' || type == 'MEMBERSHIP') ? '' : "sm:w-1/3",
        placeholder: 'Enter  Type',
        watchBy: "applied_on",
        watchValues: ["MANUAL"]
      },
      'usage_limit': {
        label: 'Usage Limit',
        error: {
          min: {
            value: 1,
            message: 'Limit be minimum 1'
          },
        },
        name: 'usage_limit',
        type: (type == 'DISCOUNT' || type == 'MEMBERSHIP') ? 'hidden' : 'number',
        className: (type == 'DISCOUNT' || type == 'MEMBERSHIP') ? 'mb-0' : "sm:w-1/3",
        placeholder: 'Enter Usage Limit'
      },
      'minimum_amount': {
        label: 'Minimum Product Amount',
        error: {
        },
        name: 'minimum_amount',
        type: (type == 'DISCOUNT' || type == 'MEMBERSHIP') ? 'hidden' : 'number',
        className: (type == 'DISCOUNT' || type == 'MEMBERSHIP') ? 'mb-0' : "sm:w-1/3",
        placeholder: 'Enter Minimum Amount'
      },
      'maximum_amount': {
        label: 'Maximum product  Amount',
        error: {
        },
        name: 'maximum_amount',
        type: (type == 'DISCOUNT' || type == 'MEMBERSHIP') ? 'hidden' : 'number',
        className: (type == 'DISCOUNT' || type == 'MEMBERSHIP') ? 'mb-0' : "sm:w-1/3",
        placeholder: 'Enter Maximum Amount'
      },
      'amount_upto': {
        label: 'Maximum Product Discount',
        error: {
        },
        name: 'amount_upto',
        type: (type == 'DISCOUNT' || type == 'MEMBERSHIP') ? 'hidden' : 'number',
        className: (type == 'DISCOUNT' || type == 'MEMBERSHIP') ? 'mb-0' : "sm:w-1/3",
        placeholder: 'Enter Maximum Product Discount'
      },
      'email_restrictions': {
        datalabel: 'users',
        dataname: 'userID',
        label: 'Email restrictions',
        name: 'email_restrictions',
        idSelector: 'id',
        view: 'name_with_mobile',
        type: (type == 'DISCOUNT' || type == 'MEMBERSHIP') ? 'hidden' : 'select',
        className: (type == 'DISCOUNT' || type == 'MEMBERSHIP') ? 'mb-0' : "sm:w-1/3",
        placeholder: 'Enter Exam Name',
        isMultiple: true,
        effectedRows: []
      },

      'restricted_user_types': {
        datalabel: 'restrictedUserTypes',
        dataname: 'restrictedUserTypes',
        label: `Restricted User Types`,
        name: 'restricted_user_types',
        idSelector: 'value',
        view: 'label',
        type: (type == 'DISCOUNT' || type == 'MEMBERSHIP') ? 'hidden' : 'select',
        className: (type == 'DISCOUNT' || type == 'MEMBERSHIP') ? 'mb-0' : "sm:w-1/3",
        values: [
          { value: 'USER', label: 'USER' }, { value: 'MANAGEMENT', label: 'MANAGEMENT' }, { value: 'FACULTY', label: 'FACULTY' }
        ],
        placeholder: 'Enter Restricted User Types',
        isMultiple: true,
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
      'automatic_discount_type_id': {
        datalabel: 'discount-types',
        fetchlabel: 'discountTypes',
        dataname: 'discountTypeID',
        label: 'Discount Types',
        error: { required: 'Please enter a valid Discount Types' },
        name: 'automatic_discount_type_id',
        idSelector: 'id',
        view: 'title',
        type: 'select',
        className: "sm:w-1/3",
        placeholder: 'Enter Exam Name',
        isMultiple: false,
        effectedRows: [],
        watchBy: "applied_on",
        watchValues: ["AUTOMATIC"]
      },
      'description': {
        label: 'Description',
        name: 'description',
        type: 'textarea',
        className: "w-full",
        placeholder: 'Enter Description'
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

  buildAddModel = (type) => {

    this.setState({
      displayModelTitle: `Add ${type.toLowerCase()} ${type == 'MEMBERSHIP' ? 'Discount' : ''}`
    })

    let items = this.getItems(type)

    return this.setState({
      storeFields: items,
      showModel: false
    }, () => console.log('abcd'))

  }

  randerEditModal = (row) => {


    this.buildAddModel(row.type)

    this.setState({
      displayModelTitle: `Edit ${row.type.toLowerCase()} ${row.type == 'MEMBERSHIP' ? 'Discount' : ''} - ${row.code}`

    })


    let items = this.getItems(row.type)
    // var items = this.state.storeFields;

    Object.keys(items).map((key) => {
      items[key].defaultValue = row[key]
    })

    items.on_bulk.label = ''
    items.on_bulk.type = 'hidden'
    items.on_bulk.defaultValue = 0
    items.on_bulk.className = ''
    

    items.start_date.defaultValue = moment(items.start_date.defaultValue).format('DD-MM-YYYY')
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

  changeModalStatus = (type) => {

    if (this.state.showModel == true) {
      // this.buildAddModel();
      this.setState({
        showModel: false
      })
    } else {
      this.buildAddModel(type);
      this.setState({
        showModel: true
      })
    }
  }

  onStoreSubmit = async (data) => {

    var coupon;
    var message;



    if ('id' in data) {
      coupon = await edit(this.state.modelTitle, data);
      message = `${this.state.baseTitle} Updated Successfully`
    } else {
      coupon = await add(this.state.modelTitle, data);
      message = `${this.state.baseTitle} Added Successfully`
    }


    // check Response
    if (coupon.updated) {
      toastr.success(message)
      this.fetchList()

      this.setState({
        showModel: false
      })
    }
    else {
      let error;
      if (coupon.coupon) {
        error = coupon.coupon.error
      }
      else if (coupon.error) {
        error = coupon.error.details ? coupon.error.details[0].message : coupon.error
      }
      toastr.error(error)
    }

  }

  // 
  componentDidMount() {
    this.buildAddModel('COUPON');
    this.buildAddModel('DISCOUNT');
    this.fetchList();
    // this.fetchBase();
  }

  // 
  render() {
    let data = this.state.coupons
    const columns = [
      {
        Header: 'Code',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              <span className="pt-1">{props.row.original.code}</span>
            </div>
          )
        },

      },
      {
        Header: 'Amount',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              <span className="pt-1">{props.row.original.monyfiedAmount}</span>
            </div>
          )
        },
      },
      {
        Header: 'Referance Type',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start " >
              <span className="pt-1 capitalize">{`${props.row.original.referance_type.replace('_', ' ')}s`}</span>
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
        Header: 'Applied As',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              {props.row.original.applied_on}
            </div>
          )
        },

      },
      {
        Header: 'Discount Type',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              {props.row.original.automatic_discount_type ? props.row.original.automatic_discount_type.title : ''}
            </div>
          )
        },
      },
      {
        Header: 'Usage Limit',
        accessor: 'usage_limit'
      },
      {
        Header: 'Minimum Amount',
        accessor: 'minimum_amount'
      },
      {
        Header: 'Maximum Amount',
        accessor: 'maximum_amount'
      },
    ]

    const filterObjects = [
      {
        label: 'Filter by Type',
        name: 'type',
        type: 'select',
        className: 'sm:w-full',
        options: [
          {
            value: '', 'label': 'Choose Type',
          },
          {
            value: 'DISCOUNT', 'label': 'DISCOUNT',
          },
          {
            value: 'COUPON', 'label': 'COUPON',
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
        className="btn btn-default btn-rounded bg-base hover:bg-blue-600 text-white float-right mb-2 ml-2 "
        type="button"
        onClick={() => this.changeModalStatus('MEMBERSHIP')}>
        <i class="fas fa-plus mr-1"></i> Add New Membership Discount
      </button>
      <button
        className="btn btn-default btn-rounded bg-base hover:bg-blue-600 text-white float-right mb-2 ml-2"
        type="button"
        onClick={() => this.changeModalStatus('DISCOUNT')}>
        <i class="fas fa-plus mr-1"></i> Add New Discount
      </button>
      <button
        className="btn btn-default btn-rounded bg-base hover:bg-blue-600 float-right text-white ml-2"
        type="button"
        onClick={() => this.changeModalStatus('COUPON')}>
        <i class="fas fa-plus mr-1"></i> Add New Coupon
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
              data={this.state.coupons}
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
