import { Component } from 'react';
import { fetchAll, fetchByID, updateAdditional, add, edit, getSettings } from 'helpers/apiService';
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
import fetch from 'isomorphic-unfetch';
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
      offset: 0,
      type: 'USER'
    },
    storeFields: [],
    displayModelTitle: 'Add New',
    showModel: false,
    deleteModel: false,
    id: null,
    users: [],
    storeFilter: {},
    imageLimits: {},
    baseTitle: 'User',
    modelTitle: 'users',
    queryTitle: 'users',
    otsBranches: [],
    otsSubscriptions: [],
    otsStoreFields: [],
    showOtsModel: false,
    videoLimit: getSettings('defaultVideoViewLimit')
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

    let otsIntigration = process.env.NEXT_PUBLIC_OTS_INTIGRATION

    this.setState({
      otsIntigration: otsIntigration
    })

    var data = await fetchAll(this.state.modelTitle, { ...this.state.filters, 'forList': true });
    this.setState(data)
    // data = await updateAdditional('count-all', this.state.queryTitle, {});
    // this.setState(data)

    var imageLimits = await fetchAll('image-size-limits', { 'label': this.state.queryTitle });
    imageLimits = imageLimits.success = true ? imageLimits.sizes : {}
    this.setState({ fetching: false, imageLimits: imageLimits })

    if (otsIntigration == "true") {
      let otsUrl = process.env.NEXT_PUBLIC_TEST_SERIES_URL
      let url = otsUrl.concat('/branches')

      let ots = await fetch(url);
      if (ots && ots.status == 200) {
        ots = await ots.json()

        this.setState({
          otsBranches: ots.branches
        })
      }


      url = otsUrl.concat('/subscriptions')

      ots = await fetch(url);
      if (ots && ots.status == 200) {
        ots = await ots.json()

        this.setState({
          otsSubscriptions: ots.subscriptions
        })
      }

    }
  }

  buildAddModel = () => {

    this.setState({
      displayModelTitle: `Add ${this.state.baseTitle}`
    })

    let items = {
      first_name: {
        label: 'First Name',
        error: { required: 'Please enter first name' },
        name: 'first_name',
        type: 'text',
        placeholder: 'Enter you first name',
        className: 'sm:w-1/2',
        onTab: 1
      },
      last_name: {
        label: 'Last Name',
        error: { required: 'Please enter last name' },
        name: 'last_name',
        type: 'text',
        placeholder: 'Enter you last name',
        className: 'sm:w-1/2',
        onTab: 1
      },
      email: {
        label: 'Email',
        error: { required: 'Please enter a valid email' },
        name: 'email',
        type: 'email',
        placeholder: 'Enter you email',
        className: 'sm:w-1/3',
        onTab: 1
      },
      country_prefix: {
        datalabel: 'countries',
        dataname: 'countries',
        error: { required: 'Please Select Country Prefix' },
        label: 'Country Prefix',
        name: 'country_prefix',
        idSelector: 'code',
        view: 'country',
        type: 'select',
        className: "sm:w-1/3",
        placeholder: 'Enter  Type',
        isMultiple: false,
        onTab: 1,
        defaultValue: '91'
      },
      mobile_number: {
        label: 'Mobile Number',
        error: {
          required: 'Please enter mobile number',
        },
        name: 'mobile_number',
        type: 'number',
        placeholder: 'Enter your Mobile Number',
        className: 'sm:w-1/3',
        onTab: 1
      },
      registration_number: {
        label: 'Registration Number',
        error: { required: 'Please enter a valid Registration Number' },
        name: 'registration_number',
        type: 'text',
        placeholder: 'Enter you Registration Number',
        className: 'sm:w-1/3',
        onTab: 1
      },
      dob: {
        label: 'Date Of Birth',
        name: 'dob',
        type: 'date',
        placeholder: 'Enter your Date Of Birth',
        className: 'sm:w-1/3  date',
        onTab: 1

      },
      video_view_limit: {
        label: 'Video View Limit',
        name: 'video_view_limit',
        type: 'number',
        placeholder: 'Enter you Video View Limit',
        className: 'sm:w-1/3',
        defaultValue: this.state.videoLimit,
        onTab: 1

      },

      branch_id: {
        datalabel: 'courses',
        dataname: 'courseID',
        label: 'Branch Name',
        name: 'branch',
        idSelector: 'id',
        view: 'name',
        type: 'select',
        className: "sm:w-1/3",
        placeholder: 'Enter Branch Name',
        isMultiple: false,
        effectedRows: [],
        onTab: 1
      },

      password: {
        label: 'Password',
        error: {
          required: 'Password is required',
          minLength: {
            value: 4,
            message: 'Your password should have at least 4 characters'
          },
        },
        name: 'password',
        type: 'password',
        placeholder: 'Enter your password',
        className: "sm:w-1/3",
        onTab: 1
      },
      confirm_password: {
        label: 'Confirm Password',
        error: {
          required: 'Confirm Password is required',
          minLength: {
            value: 4,
            message: 'Your password should have at least 4 characters'
          },
        },
        name: 'confirm_password',
        type: 'password',
        placeholder: 'Enter your Confirm password',
        className: "sm:w-1/3",
        onTab: 1
      },
      'image': {
        label: 'Image',
        name: 'image',
        error: { required: 'Please Choose an Image' },
        ...this.state.imageLimits,
        fileTypes: ["jpg", "png", "jpeg"],
        type: 'image',
        className: "sm:w-1/3",
        onTab: 1
      },
      'user_guardians': {
        label: 'User Guardians',
        type: 'multiple-fields',
        name: 'user_guardians',
        fields: [
          {
            label: 'Guardian Relation',
            name: 'guardian_relation',
            type: 'text',
            className: "sm:w-1/3 pb-3",
            placeholder: 'Enter Guardian Relation'
          },
          {
            label: 'Guardian name',
            name: 'guardian_name',
            type: 'text',
            className: "sm:w-1/3 pb-3",
            placeholder: 'Enter Guardian name'
          },
          {
            label: 'Guardian occupation',
            name: 'guardian_occupation',
            type: 'text',
            className: "sm:w-1/3 pb-3",
            placeholder: 'Enter Guardian occupation'
          },
          {
            label: 'Guardian mobile number',
            name: 'guardian_mobile_number',
            type: 'number',
            className: "sm:w-1/3 pb-3",
            placeholder: 'Enter Guardian mobile_number'
          },
          {
            label: 'Guardian email',
            name: 'guardian_email',
            type: 'email',
            className: "sm:w-1/3 pb-3",
            placeholder: 'Enter Guardian email'
          },
        ],
        className: "w-full flex flex-col lg:flex-row lg:flex-wrap pb-5 ",
        placeholder: 'Enter Description',
        onTab: 4,
        box: true
      },
      'addresses': {
        label: 'Addresses',
        type: 'multiple-fields',
        name: 'addresses',
        fields: [
          {
            label: 'address',
            name: 'address',
            type: 'text',
            className: "sm:w-1/3 pb-3",
            placeholder: 'Enter address'
          },
          {
            label: 'city',
            name: 'city',
            type: 'text',
            className: "sm:w-1/3 pb-3",
            placeholder: 'Enter city'
          },
          {
            label: 'state',
            name: 'state',
            type: 'text',
            className: "sm:w-1/3 pb-3",
            placeholder: 'Enter state'
          },
          {
            label: 'Zip Code',
            name: 'zip_code',
            type: 'text',
            className: "sm:w-1/3 pb-3",
            placeholder: 'Enter Zip Code'
          },
          {
            label: 'Country',
            name: 'country',
            type: 'text',
            className: "sm:w-1/3 pb-3",
            placeholder: 'Enter Country'
          },
        ],
        className: "w-full flex flex-col lg:flex-row lg:flex-wrap pb-5 ",
        placeholder: 'Enter Description',
        onTab: 2,
        box: true
      },
      'academic_details': {
        label: 'Academic Details',
        type: 'multiple-fields',
        name: 'academic_details',
        fields: [
          {
            label: 'Degree',
            name: 'degree',
            type: 'text',
            className: "sm:w-1/3 pb-3",
            placeholder: 'Enter Degree'
          },
          {
            label: 'Institute',
            name: 'institute',
            type: 'text',
            className: "sm:w-1/3 pb-3",
            placeholder: 'Enter Institute'
          },
          {
            label: 'Passing Year',
            name: 'passing_year',
            type: 'month',
            className: "sm:w-1/3 pb-3",
            placeholder: 'Enter Passing Year'
          },
          {
            label: 'Marks',
            name: 'marks',
            type: 'text',
            className: "sm:w-1/3 pb-3",
            placeholder: 'Enter Marks'
          },
        ],
        className: "w-full flex flex-col lg:flex-row lg:flex-wrap pb-5 ",
        placeholder: 'Enter Description',
        onTab: 3,
        box: true
      },
    }
    return this.setState({
      storeFields: items,
      showModel: false
    })

  }

  buildOtsModel = (user) => {

    let otsBranches = []
    this.state.otsBranches.map(branch => {
      otsBranches.push({
        label: branch.name,
        value: branch.id
      })
    })

    let subscriptions = []
    this.state.otsSubscriptions.map(subscription => {
      subscriptions.push({
        label: subscription.name,
        value: subscription.id
      })
    })


    let items = {
      name: {
        label: 'Name',
        error: { required: 'Please enter Name' },
        name: 'name',
        defaultValue: `${user.first_name} ${user.last_name}`,
        type: 'text',
        placeholder: 'Enter you Name',
        className: 'w-1/3',
      },

      mobile_number: {
        label: 'Mobile Number',
        error: {
          required: 'Please enter mobile number',
        },
        defaultValue: `${user.mobile_number}`,
        name: 'mobile_number',
        type: 'text',
        placeholder: 'Enter your Mobile Number',
        className: 'w-1/3',
      },
      email: {
        label: 'Email',
        error: { required: 'Please enter a valid email' },
        name: 'email',
        type: 'email',
        defaultValue: `${user.email}`,
        placeholder: 'Enter you email',
        className: 'w-1/3',
        onTab: 1
      },
      branch: {
        datalabel: 'branches',
        dataname: 'branches',
        label: 'OTS Branch',
        name: 'branch',
        idSelector: 'value',
        view: 'label',
        type: 'select',
        values: otsBranches,
        className: "sm:w-1/3",
        placeholder: 'Enter  Type',
        isMultiple: false,
      },
      gender: {
        datalabel: 'gender',
        dataname: 'gender',
        error: { required: 'Please Select Gender' },
        label: 'Gender',
        name: 'gender',
        idSelector: 'value',
        view: 'label',
        type: 'select',
        values: [{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Transgender', label: 'Transgender' }
        ],
        className: "sm:w-1/3",
        placeholder: 'Enter  Type',
        isMultiple: false,
      },
      subscription_id: {
        datalabel: 'Subscription ',
        dataname: 'Subscription ',
        label: 'Subscription',
        name: 'subscription_id',
        idSelector: 'value',
        view: 'label',
        type: 'select',
        values: subscriptions,
        className: "sm:w-1/2",
        placeholder: 'Enter  Type',
        isMultiple: false,
        // defaultValue: this.state.user && this.state.user.gender ? { value: this.state.user.gender, label: this.state.user.gender } : ''
      },
    }

    return this.setState({
      otsStoreFields: items,
      showOtsModel: true
    })

  }

  randerEditModal = async (row) => {


    this.setState({
      displayModelTitle: `Edit User - ${row.first_name} ${row.last_name}`

    })

    let user = await fetchByID('users', row.id)
    var items = this.state.storeFields;

    Object.keys(items).map((key) => {
      items[key].defaultValue = user.user[key]
    })

    items.dob.defaultValue = moment(row.dob, 'DD-MM-YYYY').format('YYYY-MM-DD')


    delete items.image.error.required;
    delete items.password.error.required;
    delete items.confirm_password.error.required;
    delete items.registration_number.error;


    items.password.defaultValue = null
    items.confirm_password.defaultValue = null

    items.image = {
      ...items.image,
      ...this.state.imageLimits
    }

    if ('id' in items) {
      items.id.defaultValue = user.user.id
    } else {
      items = {
        'id': {
          label: '',
          name: 'id',
          type: 'hidden',
          defaultValue: user.user.id,
          onTab: 1,
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

  changeOtsModelStatus = () => {

    if (this.state.showOtsModel == true) {
      // this.buildAddModel();
      this.setState({
        showOtsModel: false
      })
    } else {
      this.buildAddModel();
      this.setState({
        showOtsModel: true
      })
    }
  }

  onStoreSubmit = async (data) => {

    var user;
    var message;


    if ('id' in data) {
      user = await edit(this.state.modelTitle, data, 'image');
      message = `${this.state.baseTitle} Updated Successfully`
    } else {
      user = await add(this.state.modelTitle, data, 'image');
      message = `${this.state.baseTitle} Added Successfully`
    }


    // check Response
    if (user.updated) {
      toastr.success(message)
      this.fetchList()

      this.setState({
        showModel: false
      })
    }
    else {
      let error;
      if (user.user) {
        error = user.user.error
      }
      else if (user.error) {
        error = user.error.details ? user.error.details[0].message : user.error
      }
      toastr.error(error)
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
        usersExport: exportData.users
      }, () => {

        let users = []

        this.state.usersExport.map(user => {

          users.push({
            'User Name': `${user.first_name} ${user.last_name}` ,
            'User Email': `${user.email}` ,
            'User Mobile Number': `${user.mobile_number}` ,
            'Registration Number': `${user.registration_number}` ,
            'Date Of Birth': `${user.dob}` ,
            'Branch': `${user.branch && user.branchDetail ? user.branchDetail.name : ''}` ,
            'Gender': `${user.gender}` ,
            'Category': `${user.category}` ,
            'Whatsapp Connect': `${user.whatsapp_number}` ,
            'Device ID': `${user.uuid}` ,
            'Device Brand': `${user.device_brand}` ,
            'Device Model': `${user.device_model}` ,
            'System Device ID': `${user.machine_id}` ,
            'Video Consumed': `${user.video_view_limit}` ,
            'Video View Limit': `${user.video_count}` ,
            'Date': moment(user.created_at).format('MMMM Do YYYY'),
          })
        })
        const jsonexport = require('jsonexport');



        jsonexport(users, function (err, csv) {
          if (err) return console.error(err);

          csv = "data:application/csv, " + encodeURIComponent(csv);
          var x = document.createElement("A");
          x.setAttribute("href", csv);
          x.setAttribute("download", "users.csv");
          document.body.appendChild(x);
          x.click();
        });

      })

    }


  }

  // 
  componentDidMount() {
    this.buildAddModel();
    this.fetchList();
    // this.fetchBase();
  }


  syncUser = async (value) => {

    let otsUrl = process.env.NEXT_PUBLIC_TEST_SERIES_URL
    let body = {
      email: value.email,
      subscription_id: value.subscription_id,
    }


    let url = otsUrl.concat('/assignSubscription')

    let data = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })


    if (data.status != 200) {

      body = {
        name: value.name,
        email: value.email,
        mobile_number: value.mobile_number,
        subscription_id: value.subscription_id,
        // branch_id: data.branch_id,
      }


      url = otsUrl.concat('/syncUser')

      data = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (data.status == 200) {
        toastr.success('Syncroniztion successfull')
        this.setState({
          showOtsModel: false
        })
      } else {
        toastr.error('Something wont wrong')
      }


    } else {
      toastr.success('Syncroniztion successfull')
      this.setState({
        showOtsModel: false
      })
    }

  }

  // 
  render() {
    let data = this.state.users
    const columns = [

      {
        Header: 'Name',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              <span className="pt-1">{props.row.original.first_name} {props.row.original.last_name}</span>
            </div>
          )
        },

      },

      {
        Header: 'Email',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              <span className="pt-1">{props.row.original.email}</span>
            </div>
          )
        },

      },

      {
        Header: 'Mobile Number',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              <span className="pt-1">{props.row.original.mobile_number}</span>
            </div>
          )
        },

      },

    ]


    // if (this.state.otsIntigration == "true") {
    //   columns.push({
    //     Header: 'Sync user to ots',
    //     Cell: props => {
    //       return (
    //         <div className="flex flex-wrap justify-start items-start" >
    //           <button className="" onClick={() => this.buildOtsModel(props.row.original)}>Sync User</button>
    //         </div>
    //       )
    //     },

    //   })
    // }

    const filterObjects = [
      {
        name: 'search',
        type: 'text',
        effectedRows: [],
          className: "sm:w-full",
        placeholder: 'Search Name, Mobile Number Or Email'
      }
    ]
    const steps = [
      {
        title: 'Basic Details',
        active: true,
        disabled: false,
        index: 1
      },
      {
        title: 'Addresses',
        active: false,
        disabled: true,
        index: 2
      },
      {
        title: 'Academic Details',
        active: false,
        disabled: true,
        index: 3
      },
      {
        title: 'Parents Details',
        active: false,
        disabled: true,
        index: 4
      }
    ]

    const div = <div className="ml-14 flex flex-col md:flex-row">
      <div>
        <button
          className="btn btn-default btn-rounded bg-base hover:bg-blue-600 text-white float-right mb-2"
          type="button"
          onClick={() => this.changeModalStatus()}>
          <i class="fas fa-plus mr-1"></i> Add User
        </button>
      </div>
      <div>
        {<button
          className="btn btn-default btn-outlined bg-transparent text-base hover:bg-blue-600 hover:text-white float-right text-white  ml-2 rounded-lg"
          type="button"
          onClick={() =>
            this.exportToCsv()}>
          Export Users
        </button>}</div>
    </div>

    return (
      <>
        <SectionTitle title={this.props.parentName ? this.props.parentName : 'Dashbaord'} subtitle={`${this.state.baseTitle}s`} onClick={this.changeModalStatus} hideButton={true} html={div} />

        {
          this.state.showModel &&
          <StoreModel
            title={this.state.displayModelTitle}
            body={
              <div>
                {
                  this.state.storeFields && this.state.storeFields != {} && <Validation items={Object.values(this.state.storeFields)} onSubmit={this.onStoreSubmit} alerts={false} defaultValues={this.state.defaultValues} steps={steps} />
                }
              </div>
            }
            useModel={this.state.showModel}
            hideModal={this.changeModalStatus}
          />

        }

        {
          this.state.showOtsModel &&
          <StoreModel
            title="Sync User"
            body={
              <div>
                {
                  this.state.otsStoreFields && this.state.otsStoreFields != {} && <Validation items={Object.values(this.state.otsStoreFields)} onSubmit={this.syncUser} alerts={false} />
                }

              </div>
            }
            useModel={this.state.showOtsModel}
            hideModal={this.changeOtsModelStatus}
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
              data={this.state.users}
              paginationClick={this.fetchByOffset}
              pageSizedata={this.state.filters.limit}
              pageIndexdata={(this.state.filters.offset / this.state.filters.limit)}
              pageCountData={this.state.totalCount}
              baseTitle={this.state.baseTitle}
              modelTitle={this.state.modelTitle}
              queryTitle={this.state.queryTitle}
              randerEditModal={this.randerEditModal}
              fetchList={this.fetchList}
              sectionRow={true}
              approvable={false}
              deletable={false}
              sortable={false}
              viewable={true}
            />
          }

        </Widget>


      </>

    )
  }

}
