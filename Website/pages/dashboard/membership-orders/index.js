import { Component } from 'react';
import { fetchAll, fetchByID, deleteData, updateAdditional, add, edit, post } from 'helpers/apiService';
import React from 'react'
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
import moment from 'moment'

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
    id: null,
    membershipOrders: [],
    storeFilter: {},
    imageLimits: {},
    baseTitle: 'Membership Order',
    modelTitle: 'membership-orders',
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
        className: "sm:w-1/2",
        placeholder: 'Enter User',
        isMultiple: false,
        effectedRows: [],
        // preFilters: { type: 'USER' },
        onTab: 1,
      },
      'membership_id': {
        datalabel: 'memberships',
        fetchlabel: 'memberships',
        dataname: 'membershipID',
        label: 'membership',
        error: { required: 'Please enter a valid membership' },
        name: 'membership_id',
        idSelector: 'id',
        view: 'title',
        type: 'select',
        className: "sm:w-1/2",
        placeholder: 'Enter membership',
        isMultiple: false,
        effectedRows: [],
        onTab: 1,
        onChange: this.onMembershipChange,
        preFilters:{type : 'BUYABLE'}
      },
      'pay_via': {
        label: 'Pay Via',
        error: { required: 'Please choose One' },
        name: 'pay_via',
        type: 'radio',
        options: [{ value: 'ONLINE', label: 'ONLINE' }, { value: 'RTGS/NEFT', label: 'RTGS/NEFT' }, { value: 'CASH', label: 'CASH' }, { value: 'FREE', label: 'FREE' }],
        className: "sm:w-1/3",
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


  onMembershipChange = async (e) => {

    let membership = await fetchByID('memberships', e.value , { noLog: true })
    membership = membership.membership

    var items = this.state.storeFields;

    Object.values(items).map((item, i) => {
      if (item.byMembership) {
        return delete items[item.name]
      }
    })
    this.setState({
      storeFields: items
    })


    items.amount = {
      label: 'Amount',
      name: 'amount',
      type: 'text',
      className: "sm:w-1/3",
      placeholder: 'Enter Amount',
      onTab: 1,
      byMembership: true,
      defaultValue: membership.amount,
      disabled: true
    }
    items.finalAmount = {
      label: 'Final Amount',
      name: 'finalAmount',
      type: 'text',
      className: "sm:w-1/3",
      placeholder: 'Enter Final Amount',
      onTab: 1,
      byMembership: true,
      defaultValue: membership.finalAmount,
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
      byMembership: true,
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
          body: `Thank you for purchasing ${order.membershipName}`,
          onlyOneUser: true,
          user_id: data.user_id,
          action:'OrderList'
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


  // 
  componentDidMount() {
    this.buildAddModel();
    this.fetchList();
    // this.fetchBase();
  }

  // 
  render() {
    let data = this.state.membershipOrders
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
            <span className="capitalize">{props.row.original.user ? `${props.row.original.user.first_name} ${props.row.original.user.last_name}` : ''}</span>
          )
        },
      },

      {
        Header: 'Membership',
        Cell: props => {
          return (
            <table className="w-full">
              <tbody>
                {props.row.original.carts.map(cart => {
                  return <tr style={{ borderBottom: '1px solid rgba(0,0,0,.05)' }}>
                    <td className="w-2/4">
                      <b>{cart.membership.title}</b>
                    </td>
                    <td className="lg:w-1/4">
                      {props.row.original.status == 'SUCCESS' && (cart.activated && cart.activated == true ? <span className="text-green-500"><b>Activated</b></span> : <span className="text-red-500">Expired</span>)}
                    </td>
                    <td className="lg:w-1/4">
                      <span className="text-red-500">
                        {props.row.original.status == 'SUCCESS' && (cart.activated && cart.activated == true ? (
                          <>
                            <span>{cart.leftDays} Days Left ({moment(cart.expDate).format('DD-MM-YYYY')})</span>
                          </>
                        ) : (
                          <>
                            <span>{moment(cart.expDate).format('MMMM Do YYYY')}</span><br />
                            <span>{moment(cart.expDate).format('h:mm:ss a')}</span>
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
        label: 'memberships',
        name: 'membershipID',
        idSelector: 'id',
        view: 'title',
        type: 'select-multiple',
        effectedRows: [],
      },
      {
        label: 'Status',
        name: 'status',
        type: 'select',
        options: [
          {
            value: '', 'label': 'Choose Status',
          },
          {
            value: 'SUCCESS', 'label': 'SUCCESS',
          },
          {
            value: 'FAILED', 'label': 'FAILED',
          }
        ],
        effectedRows: []
      },
      // {
      //   label: 'Date',
      //   name: 'date',
      //   type: 'date',
      //   effectedRows: [],
      // },
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
          <Filter filterObjects={filterObjects} filterOnChange={true} onFilter={this.onFilter} />
          {
            this.state.fetching &&

            <Shimmer /> ||
            <Datatable
              columns={columns}
              deletable={this.props.contentDeletable}
              data={this.state.membershipOrders}
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
