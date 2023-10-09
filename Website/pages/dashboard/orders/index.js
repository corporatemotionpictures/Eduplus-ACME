import { Component } from 'react';
import { fetchAll, fetchByID, deleteData, updateAdditional, add, edit, post } from 'helpers/apiService';
import React from 'react'
import { FiLink, FiX, FiMail, FiPhone, FiArrowRight } from 'react-icons/fi'
import SectionTitle from 'components/functional-ui/section-title'
import Datatable from 'components/functional-ui/datatable'
import Shimmer from 'components/website/shimmer/datatable'
import Widget from 'components/functional-ui/widget'
import toastr from 'toastr'
import define from 'src/json/worddefination.json'
import StoreModel from 'components/functional-ui/modals/modal-store'
import Validation from 'components/functional-ui/forms/validation'
import Filter from 'components/classical-ui/filters'
import { Badge, CircularBadge } from 'components/functional-ui/badges'
import Link from 'next/link'
import DeleteModel from 'components/functional-ui/modals/modal-confirmation'
import moment from 'moment'
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
    storeFields: [], displayModelTitle: 'Add New',
    showModel: false,
    deleteModel: false,
    userModel: false,
    setHidden: true,
    id: null,
    orders: [],
    userdata: [],
    storeFilter: {},
    imageLimits: {},
    baseTitle: 'Order',
    modelTitle: 'orders',
    queryTitle: 'orders',
    displayModelTitle: 'Add New Order'

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
    console.log("aa", data)




    // data = await updateAdditional('count-all', this.state.queryTitle, {});
    // this.setState(data)

    var imageLimits = await fetchAll('image-size-limits', { 'label': this.state.queryTitle });
    imageLimits = imageLimits.success = true ? imageLimits.sizes : {}
    this.setState({ fetching: false, imageLimits: imageLimits })
  }



  buildAddModel = () => {

    this.setState({
      displayModelTitle: `Add ${this.state.baseTitle}`
    })

    this.setState({
      displayModelTitle: `Add New Order`
    })

    let items = {
      'user_id': {
        datalabel: 'users',
        fetchlabel: 'users',
        dataname: 'userID',
        label: 'User',
        error: { required: 'Please enter a valid User' },
        name: 'user_id',
        idSelector: 'id',
        view: 'name_with_mobile',
        type: 'select',
        className: "sm:w-1/4",
        placeholder: 'Enter User',
        isMultiple: false,
        effectedRows: [],
        // preFilters: { type: 'USER' },
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
        className: "sm:w-1/4",
        placeholder: 'Enter product',
        isMultiple: false,
        effectedRows: [],
        onTab: 1,
        onChange: this.onProductChange
      },
      'pay_via': {
        label: 'Pay Via',
        error: { required: 'Please choose One' },
        name: 'pay_via',
        type: 'radio',
        options: [{ value: 'ONLINE', label: 'ONLINE' }, { value: 'RTGS/NEFT', label: 'RTGS/NEFT' }, { value: 'CASH', label: 'CASH' }, { value: 'FREE', label: 'FREE' }],
        className: "sm:w-1/2",
        placeholder: 'Enter Description',
        defaultValue: "ONLINE"
      },
      'transaction_order_id': {
        label: 'Order ID',
        name: 'transaction_order_id',
        type: 'text',
        className: "sm:w-1/3",
        placeholder: 'Enter Order ID',
        onTab: 1,
        watchBy: "pay_via",
        watchValues: ["ONLINE", "RTGS/NEFT", "CASH", ""],
      },
      'transaction_id': {
        label: 'Transaction ID',
        name: 'transaction_id',
        type: 'text',
        className: "sm:w-1/3",
        placeholder: 'Enter Transaction ID',
        onTab: 1,
        watchBy: "pay_via",
        watchValues: ["ONLINE", "RTGS/NEFT", "CASH", ""],
      },
    }
    return this.setState({
      storeFields: items,
      showModel: false
    })

  }

  onProductChange = async (e) => {

    let product = await fetchByID('products', e.value, { noLog: true })
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

      product.attributes.map(attr => {
        if (attr.applied_as == 'MANUAL') {

          var values = [];

          attr.values.map(value => {
            values.push({
              value: value.id,
              label: value.name ? value.name : value.title
            })
          })

          if (attr.referances) {
            attr.referances.fetcher = attr.referances.fetcher.split(',')
          }


          items[`attributes[${attr.attribute_id}]`] = {
            datalabel: `${attr.slug}`,
            dataname: attr.attribute_id,
            error: { required: `Please select ${attr.slug}` },
            label: attr.title,
            name: `attributes[${attr.attribute_id}]`,
            idSelector: 'id',
            view: attr.referances ? attr.referances.fetcher[0] : 'title',
            type: 'select-plane',
            values: values,
            className: "sm:w-1/3",
            placeholder: 'Enter Module Type',
            isMultiple: false,
            onTab: 1,
            effectedRows: [],
            byProduct: true
          }
        }
      })

    }

    items.amount = {
      label: 'Amount',
      name: 'amount',
      type: 'text',
      className: "sm:w-1/3",
      placeholder: 'Enter Amount',
      onTab: 1,
      byProduct: true,
      defaultValue: product.amount,
      disabled: true
    }
    items.discount = {
      label: 'discount',
      name: 'discount',
      type: 'text',
      className: "sm:w-1/3",
      placeholder: 'Enter discount',
      onTab: 1,
      byProduct: true,
      defaultValue: product.fixedCoupon ? `${product.fixedCoupon.amount} %` : '',
      disabled: true
    }
    items.coupon = {
      label: 'coupon',
      name: 'coupon',
      type: 'text',
      className: "sm:w-1/3",
      placeholder: 'Enter coupon',
      onTab: 1,
      byProduct: true,
      defaultValue: product.coupon ? product.coupon.code : '',
      disabled: true
    }
    items.finalAmount = {
      label: 'Final Amount',
      name: 'finalAmount',
      type: 'text',
      className: "sm:w-1/3",
      placeholder: 'Enter Final Amount',
      onTab: 1,
      byProduct: true,
      defaultValue: product.finalAmount,
      watchBy: "pay_via",
      watchValues: ["ONLINE", "RTGS/NEFT", "CASH", ""],

    }
    items.freeAmount = {
      label: 'Final Amount',
      name: 'finalAmount',
      type: 'text',
      className: "sm:w-1/3",
      placeholder: 'Enter Final Amount',
      onTab: 1,
      byProduct: true,
      defaultValue: 0,
      watchBy: "pay_via",
      watchValues: ["FREE"]
    }


    this.setState({
      storeFields: items
    })


  }

  randerEditModal = (row) => {

    this.setState({
      displayModelTitle: `Edit ${this.state.baseTitle} - ${row.title ? row.title : row.name}`

    })

    var items = this.state.storeFields;

    Object.keys(items).map((key) => {
      items[key].defaultValue = row[key]
    })

    delete items.thumbnail.error.required;

    items.thumbnail = {
      ...items.thumbnail,
      ...this.state.imageLimits
    }

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
      showModel: true
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


    var order;
    var message;
    var added = false;

    if ('id' in data) {
      order = await edit(this.state.modelTitle, data, 'thumbnail');
      message = `${this.state.baseTitle} Updated Successfully`
    } else {
      order = await add(this.state.modelTitle, data);
      message = `${this.state.baseTitle} Added Successfully`
      added = true
    }


    // check Response
    if (order.updated) {
      toastr.success(message)

      if (added) {
        let notification = {
          title: `Thank you for your order! 🎉`,
          body: `Thank you for purchasing ${order.productName}`,
          onlyOneUser: true,
          user_id: data.user_id,
          action: 'OrderList'
        };

        let pushNotification = await add('push-notifications', notification);
      }
      this.fetchList()

      this.setState({
        showModel: false
      })
    }
    else {
      let error;
      if (order.order) {
        error = order.order.error
      }
      else if (order.error) {
        error = order.error.details ? order.error.details[0].message : order.error
      }

      toastr.error(error)
    }

  }

  onChange = async (e, id, status) => {

    let body = {
      id: id,
      status: status
    }

    let order = await post('orders/change-status', body);

    if (order.success) {
      toastr.success('Order Status Update')
    }

    this.fetchList();
  }

  resetCart = async () => {

    let cart = await post('carts/reset');

    if (cart.success) {
      toastr.success('Cart reset Succesfully')
      this.setState({
        deleteModel: false
      })
    }
  }


  exportToCsv = async function () {


    let filter = this.state.filters

    let length = this.state.totalCount > 100 ? parseInt(this.state.totalCount / 100) + 1 : 1


    for (let i = 0; i < length; i++) {

      filter.limit = 100
      filter.offset = 100 * (i)

      var exportData = await fetchAll(this.state.modelTitle, { ...filter, 'forList': true, forExport: true });
      this.setState({
        ordersExport: exportData.orders
      }, () => {

        let orders = []

        this.state.ordersExport.map(order => {
          let productname = ''
          order.carts.map((cart, i) => {
            productname += i > 0 ? `, ${cart.product.name}` : cart.product.name
          })

          orders.push({
            'Order ID': order.order_number,
            'Transection ID': order.transection ? order.transection.transaction_id : '',
            'User Name': order.user ? `${order.user.first_name} ${order.user.last_name}` : '',
            'User Email': order.user ? `${order.user.email}` : '',
            'User Mobile Number': order.user ? `${order.user.mobile_number}` : '',
            'Product Name': productname,
            'Status': order.status,
            'Amount': order.amount,
            'Shipping Charges': order.shipping_charges,
            'Total tax': order.total_tax,
            'Total Discount': order.total_discount,
            'Final Amount': order.final_price,
            'Order Type': order.order_type,
            // 'Coupon': order.coupon,
            // 'Referral': order.referral,
            'Address': order.address,
            'City': order.city,
            'State': order.state,
            'Zip code': order.zip_code,
            'country': order.country,
            'Date': moment(order.created_at).format('MMMM Do YYYY'),
          })
        })
        const jsonexport = require('jsonexport');



        jsonexport(orders, function (err, csv) {
          if (err) return console.error(err);

          csv = "data:application/csv, " + encodeURIComponent(csv);
          var x = document.createElement("A");
          x.setAttribute("href", csv);
          x.setAttribute("download", "orders.csv");
          document.body.appendChild(x);
          x.click();
        });

      })

    }


  }

  showTooltip = () => {
    this.setState({
      setHidden: false
    })
  }

  hideTooltip = () => {
    this.setState({
      setHidden: true
    })
  }

  openPopup = async (user) => {
    this.setState({
      userdata: user,
      userModel: true
    })
  }



  // 
  componentDidMount() {
    this.buildAddModel();
    this.fetchList();
    // 
    // this.exportToCsv()


    // this.fetchBase();


  }

  // 
  render() {
    let data = this.state.orders
    const columns = [

      {
        Header: '#Order',
        Cell: props => {
          return (
            <span className="">{props.row.original.order_number}</span>
          )
        },
      },
      {
        Header: 'User',
        Cell: props => {
          return (
            <div className="relative">
              <div className="capitalize userdata py-3 space-y-3" onMouseEnter={() => this.openPopup(props.row.original.user)}  >
                <span  >{props.row.original.user ? `${props.row.original.user.first_name} ${props.row.original.user.last_name}` : ''}</span>

              </div>

            </div>

          )
        },
      },

      {
        Header: 'Product',
        Cell: props => {
          return (
            <table className="w-full">
              <tbody>
                {props.row.original.carts.map(cart => {
                  return <tr className='w-full' style={{ borderBottom: '1px solid rgba(0,0,0,.05)' }}>
                    <td className="w-1/2" style={{ whiteSpace: 'normal' }}>
                      <b className="mb-1">{cart.product.name}</b>
                      <br />
                      {cart.upgraded_cart_id && cart.order_type == 'UPGRADE' && <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-indigo-600 bg-indigo-200 uppercase last:mr-0 mr-1">  {cart.old_order ? cart.old_order.order_number : ''} <small>(Upgraded Product)</small></span>}
                    </td>
                    <td className="w-1/4">
                      {props.row.original.status == 'SUCCESS' && (cart.activated && cart.activated == true ? <span className="text-green-500 float-right"><b>Activated</b></span> : <span className="text-red-500 float-right">Expired</span>)}
                    </td>
                    <td className="w-1/4">
                      <span className="text-red-500 text-right">
                        {props.row.original.status == 'SUCCESS' && (cart.activated && cart.activated == true ? (
                          <>
                            {cart.notStarted &&
                              <div className="float-right">
                                <span className="">{moment(cart.validity_start_from).format('MMMM Do YYYY')}</span>
                                <br />
                                <span className=""> to </span>
                                <br />
                                <span className="">{moment(cart.expDate).format('MMMM Do YYYY')}</span>
                                <br />
                              </div>
                              ||
                              <>
                                <span className="float-right">{cart.leftDays} Days Left ({moment(cart.expDate).format('DD-MM-YYYY')})</span>
                                <br /></>
                            }
                            {/* {cart.is_upgraded == 1 && <a className="border border-red-500 mt-1 float-right text-red-500  p-1 btn-outlined ml-1" title="" >Upgraded</a>} */}
                          </>
                        ) : (
                          <>
                            <span>{moment(cart.expDate).format('MMMM Do YYYY')}</span><br />
                            <span className="float-right">{moment(cart.expDate).format('h:mm:ss a')}</span><br />
                            {cart.is_upgraded == 1 && <a className="border border-red-500 mt-1 float-right text-red-500 p-2 btn-outlined ml-1" title="" >Upgraded</a>}


                          </>

                        ))}
                      </span>
                    </td>
                  </tr>
                })}
              </tbody>
            </table >

          )
        },

      },
      {
        Header: 'Status',
        Cell: props => {
          return (

            <div className={`form-element form-element-inline `}>
              <select className={` text-white border-0 text-center rounded ${props.row.original.status == 'SUCCESS' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`} onChange={(e) => this.onChange(e, props.row.original.id, e.target.value)}>
                <option className="bg-green-500 text-white" selected={props.row.original.status == 'SUCCESS'} value="SUCCESS">SUCCESS</option>
                <option className="bg-red text-white" selected={props.row.original.status == 'FAILED'} value="FAILED">FAILED</option>
              </select>
            </div>
          )
        },
      },
      {
        Header: 'Amount',
        Cell: props => {
          return (
            <span className="">₹ {props.row.original.final_price}</span>
          )
        },
      },
      {
        Header: 'Date',
        Cell: props => {
          return (
            <span className="">{moment(props.row.original.created_at).format('MMMM Do YYYY')}</span>
          )
        },
      },
      {
        Header: 'Action',
        Cell: props => {
          return (
            <a className="viewButton" title="View">
              <span className="h-8 w-8 bg-blue-100 text-primary flex items-center justify-center rounded-full text-lg font-display font-bold">
                <Link href="/dashboard/orders/invoice/[id]" as={`/dashboard/orders/invoice/${props.row.original.order_number}`}  >
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
        label: 'users',
        name: 'userID',
        idSelector: 'id',
        view: 'name_with_mobile',
        type: 'select-multiple',
        effectedRows: [],
      },
      {
        label: 'products',
        name: 'productID',
        idSelector: 'id',
        view: 'name',
        type: 'select-multiple',
        effectedRows: [],
      },

      {
        label: 'type',
        name: 'orderType',
        type: 'select',
        options: [
          {
            value: 'UPGRADE', 'label': 'Upgraded',
          },
          {
            value: 'NEW', 'label': 'New',
          }
        ],
        effectedRows: [],
        className: "input-border sm:w-1/4"
      },
      {
        label: 'status',
        name: 'status',
        type: 'select',
        options: [
          {
            value: 'SUCCESS', 'label': 'SUCCESS',
          },
          {
            value: 'FAILED', 'label': 'FAILED',
          }
        ],
        effectedRows: [],
        className: "input-border sm:w-1/4"
      },

      {
        label: 'Start Date',
        name: 'start_date',
        type: 'date',
        clearButton: true,
        className: "date sm:w-1/4 input-border"
      },
      {
        label: 'End Date',
        name: 'end_date',
        type: 'date',
        clearButton: true,
        className: "date sm:w-1/4 input-border"
      },
      {
        label: `Search `,
        name: 'search',
        type: 'text',
        effectedRows: [],
        className: "sm:w-1/2",
        placeholder: 'Search Order by Order ID, User Name, Email, Mobile Number'
      }
    ]



    const div = <div className="ml-14 flex flex-col md:flex-row">
      <div>
        <button
          className="btn btn-default btn-rounded bg-base hover:bg-blue-600 text-white float-right mb-2"
          type="button"
          onClick={() => this.changeModalStatus()}>
          <i class="fas fa-plus mr-1"></i> Add Order
        </button>
      </div>
      <div>
        <button
          className="btn btn-default btn-outlined bg-transparent text-base hover:bg-blue-600 hover:text-white ml-2 float-right md:float-none text-white mb-2 rounded-lg"
          type="button"
          onClick={() => {
            this.setState({
              deleteModel: true
            })
          }}>
          Reset Carts
        </button>
        <button
          className="btn btn-default btn-outlined bg-transparent text-base hover:bg-blue-600 hover:text-white ml-2 float-right md:float-none text-white mb-2 rounded-lg"
          type="button"
        >
          <Link href="/dashboard/carts" >
            <a target="_blank">  Products In Carts</a>
          </Link>
        </button>
        {<button
          className="btn btn-default btn-outlined bg-transparent text-base hover:bg-blue-600 hover:text-white float-right text-white  ml-2 rounded-lg"
          type="button"
          onClick={() =>
            this.exportToCsv()}>
          Export Orders
        </button>}</div>
    </div>

    return (
      <>
        <SectionTitle title={this.props.parentName ? this.props.parentName : 'Dashbaord'} subtitle={`${this.state.baseTitle}s`} onClick={this.changeModalStatus} hideButton={true} html={div} />

        {this.state.deleteModel && <DeleteModel
          title="Reset Carts"
          icon={
            <span className="h-10 w-10 bg-red-100 text-white flex items-center justify-center rounded-full text-lg font-display font-bold">
              <FiX size={18} className="stroke-current text-red-500" />
            </span>
          }
          body={
            <div className="text-sm text-gray-500">
              Are you sure you want to delete all carts ?
            </div>
          }
          buttonTitle="Delete"
          buttonClassName="btn btn-default btn-rounded bg-red-500 hover:bg-red-600 text-white"
          useModel={this.state.deleteModel}
          hideModal={() => {
            this.setState({
              deleteModel: false
            })
          }}
          onClick={this.resetCart}
        />
        }
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
        {this.state.userModel && <UserModel
          user={this.state.userdata}
          closeModal={() => { this.setState({ userModel: false }) }}
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
              data={this.state.orders}
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
              sectionRow={false}
              approvable={false}
              viewable={false}
              editable={false}
              deletable={false}
              status={false}
              sortable={false}
            />
          }

        </Widget>


      </>

    )
  }

}
