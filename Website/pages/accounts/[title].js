import Link from "next/link";
import { UnderlinedTabs } from 'components/functional-ui/tabs'
import { Component } from 'react';
import { deleteData, edit, post, fetchAll, add, getSettings, get, fileUpload } from 'helpers/apiService';
import toastr from 'toastr'
import moment from 'moment'
import { getUser } from 'helpers/auth';
import ValidationFront from 'components/functional-ui/forms/validationFront'
import Validation from 'components/functional-ui/forms/validation'
import Checkout from 'pages/payment'
import Router from 'next/router';
import define from 'src/json/worddefination.json'
import StoreModel from 'components/functional-ui/modals/modal-store'

export default class Layouts extends Component {
   state = {
      carts: {},
      membershipCarts: {},
      orders: [],
      membershipOrders: [],
      addedToCart: false,
      couponError: null,
      referralError: null,
      fecthCarts: false,
      upgradeModal: false,
      upgradeFields: {},
      addressModal: false,
      addAddressModal: false,
      addressFields: {},
      addAddressFields: {},
      addressOptions: {},
      error: null,
      user: getUser(),
      currentState: 'base',
      openCheckout: false,
      defaultAddress: false,
      buyMembership: false,
      upgradeOrderDaysBefore: null,
      upgradeOrderDaysAfter: null,
      invoiceID: null
   }

   static getInitialProps({ query }) {
      return query;
   }


   // Function For Login
   updateAccount = async (data) => {

      data.membership_documents = {}

      if (data.membership_id) {
         data.membership_documents.membership_id = data.membership_id
      }

      delete data.membership_id
      if (data.url && data.url[0]) {
         let file = await fileUpload('users', null, data.url[0], 'document')

         if (file.success == true) {
            data.membership_documents.document = file.path
         }
      }
      delete data.url

      let user = await edit('users', data, 'image');
      // check Response
      if (user.updated) {
         toastr.success('User Profile Updated')
      }
      else {
         let error;
         if (user.user) {
            error = user.user.error
         }
         else if (user.error) {
            error = user.error.details[0].message
         }
         toastr.error(error)
         this.setState({
            error: error
         })
      }
   }

   fetchData = async (id) => {
      // let id = this.props.id;
      let data = await fetchAll('carts')
      this.setState(data)

      data = await getSettings('contacts')
      this.setState({
         contactData: data
      })

      let memberCart = await fetchAll('membership-carts')
      this.setState({
         membershipCarts: memberCart,
      })

      if (this.props.title) {
         this.setState({
            currentState: this.props.title
         })
      }

      data = await fetchAll('orders')
      this.setState(data)

      data = await get('users/refer-and-earn')
      this.setState(data)

      data = await fetchAll('membership-orders')
      this.setState(data)

      data = await getSettings('upgradeOrderDaysBefore')
      this.setState({ upgradeOrderDaysBefore: data })

      data = await getSettings('upgradeOrderDaysAfter')
      this.setState({ upgradeOrderDaysAfter: data })

      let memberships = await fetchAll('memberships', { type: 'APPROVEABLE' })

      this.setState({
         memberships: memberships
      })

      let user = await getUser()
      this.setState({ user: user }, () => {
         let items = {
            id: {
               label: '',
               error: { required: 'Please enter ID' },
               name: 'id',
               type: 'hidden',
               placeholder: 'Enter you ID',
               className: '',
               defaultValue: this.state.user && this.state.user.id ? this.state.user.id : ''
            },
            image: {
               label: 'Image',
               name: 'image',
               error: {},
               ...this.state.imageLimits,
               fileTypes: ["jpg", "png", "jpeg"],
               type: 'image',
               className: "col-12 col-sm-12 col-md-4 text-center  offset-md-4",
               labelWorn: "Choose JPEG/JPG file only*",
               defaultValue: this.state.user && this.state.user.image ? this.state.user.image : '',
               imagePrevClass: " img-fluid ml-auto mr-auto rounded-circle user_img",
               imageprev: "before",
            },
            first_name: {
               label: 'First Name',
               error: { required: 'Please enter first name' },
               name: 'first_name',
               type: 'text',
               placeholder: 'Enter you first name',
               className: 'col-12 col-sm-12 col-md-6',
               defaultValue: this.state.user && this.state.user.first_name ? this.state.user.first_name : '',
               disabled: this.state.user && this.state.user.first_name
            },
            last_name: {
               label: 'Last Name',
               error: { required: 'Please enter last name' },
               name: 'last_name',
               type: 'text',
               placeholder: 'Enter you last name',
               className: 'col-12 col-sm-12 col-md-6',
               defaultValue: this.state.user && this.state.user.last_name ? this.state.user.last_name : '',
               disabled: this.state.user && this.state.user.last_name
            },
            mobile_number: {
               label: 'Mobile Number',
               error: {
                  required: 'Please enter mobile number',
               },
               name: 'mobile_number',
               disabled: false,
               type: 'number',
               placeholder: 'Enter Mobile Number',
               className: 'col-12 col-sm-12 col-md-4',
               defaultValue: this.state.user && this.state.user.mobile_number ? this.state.user.mobile_number : '',
               disabled: this.state.user && this.state.user.mobile_number
            },
            whatsapp_number: {
               label: 'Whatsapp Number',
               name: 'whatsapp_number',
               disabled: false,
               type: 'number',
               placeholder: 'Enter Whatsapp Number',
               className: 'col-12 col-sm-12 col-md-4',
               defaultValue: this.state.user && this.state.user.whatsapp_number ? this.state.user.whatsapp_number : '',
               disabled: this.state.user && this.state.user.whatsapp_number
            },
            email: {
               label: 'Email',
               error: { required: 'Please enter a valid email' },
               name: 'email',
               type: 'email',
               placeholder: 'Enter you email',
               className: 'col-12 col-sm-12 col-md-4',
               defaultValue: this.state.user && this.state.user.email ? this.state.user.email : '',
               disabled: this.state.user && this.state.user.email
            },
            dob: {
               label: 'Date Of Birth',
               name: 'dob',
               type: 'date',
               placeholder: 'Enter you Date Of Birth',
               className: 'col-12 col-sm-12 col-md-4',
               defaultValue: this.state.user && this.state.user.dob ? this.state.user.dob : ''
            },
            branch: {
               datalabel: 'courses',
               dataname: 'courseID',
               label: 'Branch',
               name: 'branch',
               idSelector: 'id',
               view: 'name',
               type: 'select',
               className: "col-12 col-sm-12 col-md-4",
               placeholder: 'Enter Branch Name',
               isMultiple: false,
               effectedRows: [],
               defaultValue: (this.state.user && this.state.user.branch) ? this.state.user.branch : '',

            },
            gender: {
               datalabel: 'gender',
               dataname: 'gender',
               label: 'Gender',
               name: 'gender',
               idSelector: 'value',
               view: 'label',
               type: 'select',
               values: [{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Transgender', label: 'Transgender' }
               ],
               className: "col-12 col-sm-12 col-md-4",
               placeholder: 'Enter  Type',
               isMultiple: false,
               defaultValue: this.state.user && this.state.user.gender ? this.state.user.gender : ''
            },
            category: {
               label: 'Category',
               name: 'category',
               type: 'text',
               idSelector: 'value',
               view: 'label',
               type: 'select',
               values: [{ value: 'General', label: 'GENERAL' }, { value: 'SC/ST', label: 'SC/ST' }, { value: 'OBC', label: 'OBC' }
               ],
               className: "col-12 col-sm-12 col-md-4",
               placeholder: 'Enter  Type',
               isMultiple: false,
               defaultValue: this.state.user && this.state.user.category ? this.state.user.category : '',
               disabled: this.state.user && this.state.user.category
            },
         }
         { console.log("user", user) }



         if (memberships && memberships.memberships && memberships.memberships.length > 0) {
            items = {
               ...items,
               // membership_id: {
               //    label: 'Select one of the group to avail discount',
               //    datalabel: 'memberships',
               //    dataname: 'membershipID',
               //    name: 'membership_id',
               //    idSelector: 'id',
               //    view: 'title',
               //    type: 'select',
               //    className: "col-12 col-sm-12 col-md-4",
               //    placeholder: 'Select one of the group to avail discount',
               //    isMultiple: false,
               //    effectedRows: [],
               //    preFilters: {
               //       type: 'APPROVEABLE'
               //    },
               //    onTab: 1,
               //    defaultValue: this.state.user && this.state.user.membership_documents && this.state.user.membership_documents.length > 0 ? this.state.user.membership_documents[0].membership_id : ''
               // },
               // url: {
               //    label: 'File',
               //    name: 'url',
               //    fileTypes: ["pdf"],
               //    maxfilesize: 1024,
               //    error: {},
               //    type: 'file',
               //    className: "col-12 col-sm-12 col-md-4",
               //    watchBy: 'membership_id',
               //    labelWorn: "Make sure that size is with in range of 1mb",
               //    watchValuesLength: 1,
               //    // defaultValue:this.state.user && this.state.user.membership_documents && this.state.user.membership_documents.length > 0 ? this.state.user.membership_documents[0].document : ''

               // },


            }

            this.setState({
               documentItems: {
                  id: {
                     label: '',
                     error: { required: 'Please enter ID' },
                     name: 'id',
                     type: 'hidden',
                     placeholder: 'Enter you ID',
                     className: '',
                     defaultValue: this.state.user && this.state.user.id ? this.state.user.id : ''
                  },
                  membership_id: {
                     label: 'Select one of the group to avail discount',
                     datalabel: 'memberships',
                     dataname: 'membershipID',
                     name: 'membership_id',
                     idSelector: 'id',
                     view: 'title',
                     type: 'select',
                     className: "col-12 col-sm-12 col-md-4",
                     placeholder: 'Select one of the group to avail discount',
                     isMultiple: false,
                     effectedRows: [],
                     preFilters: {
                        type: 'APPROVEABLE'
                     },
                     onTab: 1,
                     defaultValue: this.state.user && this.state.user.membership_documents && this.state.user.membership_documents.length > 0 ? this.state.user.membership_documents[0].membership_id : ''
                  },
                  url: {
                     label: 'File',
                     name: 'url',
                     fileTypes: ["pdf"],
                     maxfilesize: 1024,
                     error: {},
                     type: 'file',
                     className: "col-12 col-sm-12 col-md-4",
                     watchBy: 'membership_id',
                     labelWorn: "Make sure that size is with in range of 1mb",
                     watchValuesLength: 1,
                     // defaultValue:this.state.user && this.state.user.membership_documents && this.state.user.membership_documents.length > 0 ? this.state.user.membership_documents[0].document : ''

                  },
               }
            })
         }


         items = {
            ...items,

            'addresses': {
               label: 'Address',
               type: 'multiple-fields',
               name: 'addresses',
               fields: [
                  {
                     label: 'Address',
                     name: 'address',
                     type: 'text',
                     error: { required: 'Please enter a valid address' },
                     className: "col-12 mt-2",
                     placeholder: 'Enter address'
                  },
                  {
                     label: 'City',
                     name: 'city',
                     type: 'text',
                     error: { required: 'Please enter a valid city' },
                     className: "col-sm-3 col-12 mt-2",
                     placeholder: 'Enter city'
                  },
                  {
                     label: 'State',
                     name: 'state',
                     type: 'text',
                     error: { required: 'Please enter a valid state' },
                     className: "col-sm-3 col-12 mt-2",
                     placeholder: 'Enter state'
                  },
                  {
                     label: 'Zip Code',
                     name: 'zip_code',
                     type: 'text',
                     error: { required: 'Please enter a valid zip code' },
                     className: "col-sm-3 col-12 mt-2",
                     placeholder: 'Enter Zip Code'
                  },
                  {
                     label: 'Country',
                     name: 'country',
                     type: 'text',
                     className: "col-sm-3 col-12 mt-2 mb-2",
                     placeholder: 'Enter Country'
                  },
               ],
               className: "col-12 row",
               placeholder: 'Enter Description',
               btnName: 'Address',
               // btnBottom: true,
               box: true,
               defaultValue: this.state.user && this.state.user.addresses ? this.state.user.addresses : '',
            },

            [`guardians[0][guardian_relation]`]: {
               label: '',
               name: 'user_guardians[0][guardian_relation]',
               type: 'hidden',
               placeholder: 'Enter you Pin code',
               className: '',
               defaultValue: (this.state.user && this.state.user.user_guardians && this.state.user.user_guardians.length > 0) ? this.state.user.user_guardians[0]['guardian_relation'] : 'FATHER'
            },
            [`guardians[0][guardian_name]`]: {
               label: "Father's Name",
               name: 'user_guardians[0][guardian_name]',
               type: 'text',
               placeholder: "Enter you Father's Name",
               className: 'col-12 col-sm-12 col-md-12',
               defaultValue: this.state.user && this.state.user.user_guardians && this.state.user.user_guardians.length > 0 && this.state.user.user_guardians[0]['guardian_name']
            },
            [`guardians[0][guardian_occupation]`]: {
               label: "Father's Occupation",
               name: 'user_guardians[0][guardian_occupation]',
               type: 'text',
               placeholder: "Enter you Father's occupation",
               className: 'col-12 col-sm-12 col-md-4',
               defaultValue: this.state.user && this.state.user.user_guardians && this.state.user.user_guardians.length > 0 && this.state.user.user_guardians[0]['guardian_occupation']
            },
            [`guardians[0][guardian_mobile_number]`]: {
               label: "Father's mobile Number",
               name: 'user_guardians[0][guardian_mobile_number]',
               type: 'text',
               placeholder: "Enter you Father's mobile number",
               className: 'col-12 col-sm-12 col-md-4',
               defaultValue: this.state.user && this.state.user.user_guardians && this.state.user.user_guardians.length > 0 && this.state.user.user_guardians[0]['guardian_mobile_number']
            },
            [`guardians[0][guardian_email]`]: {
               label: "Father's email",
               name: 'user_guardians[0][guardian_email]',
               type: 'text',
               placeholder: "Enter you Father's email",
               className: 'col-12 col-sm-12 col-md-4',
               defaultValue: this.state.user && this.state.user.user_guardians && this.state.user.user_guardians.length > 0 && this.state.user.user_guardians[0]['guardian_email']
            },
            'academic_details': {
               label: 'Academic Information',
               type: 'multiple-table-fields',
               name: 'academic_details',
               thead: <thead>
                  <tr>
                     <th scope="col-1">#</th>
                     <th scope="col-2">Degree</th>
                     <th scope="col-5">Name of the Institute</th>
                     <th scope="col-2">Year of Passing</th>
                     <th scope="col-2">CGPA Marks</th>
                  </tr>
               </thead>,
               fields: [
                  {
                     label: 'Degree',
                     name: 'degree',
                     type: 'text',
                     error: { required: 'Please enter a valid degree' },
                     className: "col-3",
                     desabled: true,
                     placeholder: 'Enter Degree'
                  },
                  {
                     label: 'Institute',
                     name: 'institute',
                     type: 'text',
                     error: {},
                     className: "col-3",
                     placeholder: ''
                  },
                  {
                     label: 'Passing Year',
                     name: 'passing_year',
                     type: 'month',
                     className: "col-3",
                     placeholder: ''
                  },
                  {
                     label: 'Marks',
                     name: 'marks',
                     type: 'text',
                     className: "col-3",
                     placeholder: ''
                  },
               ],
               className: "col-12 row pb-5",
               placeholder: 'Enter Description',
               defaultValue: this.state.user && this.state.user.academic_details && this.state.user.academic_details.length > 0 ? this.state.user.academic_details :
                  [
                     {
                        degree: 'M.Tech',
                        institute: "",
                        passing_year: "",
                        marks: "",
                     },
                     {
                        degree: 'B.Tech',
                        institute: "",
                        passing_year: "",
                        marks: "",
                     },
                     {
                        degree: '12th',
                        institute: "",
                        passing_year: "",
                        marks: "",
                     },
                     {
                        degree: '10th',
                        institute: "",
                        passing_year: "",
                        marks: "",
                     },
                  ]
            },
         }

         this.setState({
            userItems: items
         })
      })


      if (user.addresses && user.addresses.length > 0) {
         this.setState({
            defaultAddress: user.addresses[0]
         })
      }

   }


   checkout = async (e) => {

      if (this.state.defaultAddress || !this.state.shipping) {

         this.setState({
            openCheckout: false,
         }, () => {
            this.setState({
               openCheckout: true
            })
         })
      } else {
         toastr.error('Please Add Shipping Address')
      }

   }

   buyMembership = async (e) => {

      this.setState({
         buyMembership: true,
         paymentType: true,
      })
   }

   // Function for delete data
   deleteCart = async (id) => {
      let deleteStatus = await deleteData(`carts`, JSON.stringify({ id: id }))
      if (deleteStatus.success == true) {
         toastr.success(`Product Deleted Successfully`)
         this.fetchData()
      }
      else {
         toastr.error('Can Not delete')
      }
   }

   // Function for delete data
   deleteMembershipCart = async (id) => {
      let deleteStatus = await deleteData(`membership-carts`, JSON.stringify({ id: id }))
      if (deleteStatus.success == true) {
         toastr.success(`Membership Deleted Successfully`)
         this.fetchData()
      }
      else {
         toastr.error('Can Not delete')
      }
   }

   // Function for delete data
   updateCart = async (data) => {
      let update = await edit('carts', data)
      if (update.success == true) {
         toastr.success(`You have updated product`)
         this.fetchData()
      }
      else {
         toastr.error('Can Not update')
      }
   }

   applyCoupon = async (e, code = null) => {
      e.preventDefault()
      let coupon;
      if (code) {
         coupon = code
      } else {
         coupon = document.getElementsByName('couponCode')[0].value

      }
      let data = {
         coupon_code: coupon
      }
      data = await post('carts/apply-coupon', data)
      // check Response
      if (data.success == true) {
         toastr.success('Coupon Applied')
         this.setState({
            showModel: false,
         })
         this.fetchData()
      }
      else {
         let error;
         if (data) {
            error = data.error
         }
         else if (data.error) {
            error = data.error.details[0].message
         }
         toastr.error(error)
         this.setState({
            couponError: error
         })
      }
   }

   applyReferral = async (e, code = null) => {
      e.preventDefault()
      let referral;
      if (code) {
         referral = code
      } else {
         referral = document.getElementsByName('referralCode')[0].value

      }
      let data = {
         referral_code: referral
      }
      data = await post('carts/apply-referral', data)
      // check Response
      if (data.success == true) {
         toastr.success('referral Applied')
         this.setState({
            showModel: false,
         })
         this.fetchData()
      }
      else {
         let error;
         if (data) {
            error = data.error
         }
         else if (data.error.details) {
            error = data.error.details[0].message
         }
         else if (data.error) {
            error = data.error
         }
         toastr.error(error)
         this.setState({
            referralError: error
         })
      }
   }

   deleteCoupon = async (e, deleteType = null) => {
      e.preventDefault()

      let data = await post(`carts/delete-coupon?deleteType=${deleteType}`)
      // check Response
      if (data.success == true) {
         toastr.success('Coupon deleted')
         this.fetchData();
      }
      else {
         let error;
         if (data) {
            error = data.error
         }
         else if (data.error) {
            error = data.error.details[0].message
         }
         toastr.error(error)
         this.setState({
            couponError: error
         })
      }
   }

   deleteReferral = async (e, deleteType = null) => {
      e.preventDefault()

      let data = await post(`carts/delete-referral?deleteType=${deleteType}`)
      // check Response
      if (data.success == true) {
         toastr.success('referral deleted')
         this.fetchData();
      }
      else {
         let error;
         if (data) {
            error = data.error
         }
         else if (data.error) {
            error = data.error.details[0].message
         }
         toastr.error(error)
         this.setState({
            referralError: error
         })
      }
   }


   changeAddressModal = () => {

      if (this.state.addressModal == true) {
         this.setState({
            addressModal: false,
         })
      } else {

         let validitiesData = []

         if (this.state.user.addresses) {

            this.state.user.addresses.map(address => {
               validitiesData.push({
                  label: `${address.address}, ${address.city}, ${address.state}, ${address.zip_code}, ${address.country}`,
                  value: address.id
               })
            })
         }

         let items = {
            validity_id: {
               label: 'Address',
               name: "address_id",
               idSelector: 'value',
               view: 'label',
               type: 'radio',
               options: validitiesData,
               className: "w-100",
               defaultValue: this.state.defaultAddress.id,
               byProduct: true,
               fullWidth: true,
               htmlcontent: <span className="py-2 btn btn-success " onClick={() => this.addAddressModal()}><small>Add New Address <i class="fas fa-plus ml-1"></i></small></span>
            },
         }

         this.setState({
            addressModal: true,
            addressFields: items,
         })
      }
   }

   addAddressModal = () => {

      if (this.state.addAddressModal == true) {
         this.setState({
            addAddressModal: false,
         })
      } else {

         $('.modal').css('z-index', 10)

         let items = {
            user_id: {
               label: '',
               name: "user_id",
               idSelector: 'value',
               view: 'label',
               type: 'hidden',
               className: "",
               defaultValue: this.state.user.id,
            },
            address: {
               label: 'Address',
               error: {},
               name: "address",
               idSelector: 'value',
               view: 'label',
               type: 'text',
               className: "w-full",
            },
            city: {
               label: 'City',
               error: {},
               name: "city",
               idSelector: 'value',
               view: 'label',
               type: 'text',
               className: "md:w-1/4",
            },
            state: {
               label: 'state',
               error: {},
               name: "state",
               idSelector: 'value',
               view: 'label',
               type: 'text',
               className: "md:w-1/4",
            },
            zip_code: {
               label: 'zip code',
               error: {},
               name: "zip_code",
               idSelector: 'value',
               view: 'label',
               type: 'text',
               className: "md:w-1/4",
            },
            country: {
               label: 'country',
               error: {},
               name: "country",
               idSelector: 'value',
               view: 'label',
               type: 'text',
               className: "md:w-1/4",
            },

         }

         this.setState({
            addAddressModal: true,
            addAddressFields: items,
         })
      }
   }

   upgradeModal = (product = null, cartID = null) => {

      if (this.state.upgradeModal == true) {
         this.setState({
            upgradeModal: false,
            upgardeProduct: null,
            upgradeFields: {}
         })
      } else {



         let validitiesData = []

         if (product.upgradable_details) {

            product.upgradable_details.map(branch => {
               validitiesData.push({
                  label: branch.title,
                  value: branch.id
               })
            })
         }

         let items = {
            validity_id: {
               datalabel: 'Validities',
               dataname: "validityId",
               error: {},
               label: 'validities',
               name: "validity_id",
               idSelector: 'value',
               view: 'label',
               type: 'select-plane',
               values: validitiesData,
               className: "w-full",
               placeholder: 'Enter Module Type',
               isMultiple: false,
               onTab: 1,
               effectedRows: [],
               byProduct: true,
               onChange: this.onupgradeValidityChange
            },
            upgraded_cart_id: {
               label: '',
               name: 'upgraded_cart_id',
               type: 'hidden',
               className: '',
               placeholder: 'Enter Amount',
               defaultValue: cartID,
            }
         }

         this.setState({
            upgradeModal: true,
            upgradeFields: items,
            upgardeProduct: product
         })
      }
   }


   onupgradeValidityChange = (e) => {

      let product = this.state.upgardeProduct
      let upgradeUption = product.upgradable_details.filter(detail => detail.id == e.value)
      upgradeUption = upgradeUption[0]


      let items = this.state.upgradeFields


      if (items.amount) {
         delete items.amount
      }
      this.setState({
         upgradeFields: items
      }, () => {
         if (upgradeUption) {

            items.amount = {
               label: 'Amount',
               name: 'amount',
               type: 'text',
               className: 'w-full rounded',
               placeholder: 'Enter Amount',
               defaultValue: upgradeUption.upgradable_amount,
               disabled: true
            }

         }

         this.setState({
            upgradeFields: items
         })
      })



   }


   addAddress = async (data) => {


      data = await post('users/add-address', data)

      // check Response
      if (data.success == true) {
         toastr.success('Address Added');

         let user = await getUser()

         this.setState({
            user: user
         }, () => {

            let validitiesData = []

            if (this.state.user.addresses) {

               this.state.user.addresses.map(address => {
                  validitiesData.push({
                     label: `${address.address}, ${address.city}, ${address.state}, ${address.zip_code}, ${address.country}`,
                     value: address.id
                  })
               })
            }

            let items = {
               validity_id: {
                  label: 'Address',
                  name: "address_id",
                  idSelector: 'value',
                  view: 'label',
                  type: 'radio',
                  options: validitiesData,
                  className: "w-100",
                  defaultValue: this.state.defaultAddress.id,
                  byProduct: true,
                  fullWidth: true,
                  htmlcontent: <span className=" py-2 btn btn-success" onClick={() => this.addAddressModal()}><small>Add New Address <i class="fas fa-plus ml-1"></i></small></span>
               },
            }

            this.setState({
               addressModal: true,
               addressFields: items,
               addAddressModal: false,
               addAddressFields: {},
            })

         })


      }
      else {
         let error;
         if (data.data) {
            error = data.data.error
         }
         else if (data.error.details) {
            error = data.error.details[0].message
         }
         else if (data.error) {
            error = data.error
         }
         toastr.error(error)
      }

   }


   upgradeOrder = async (body) => {

      let data = {
         upgradable_id: body.validity_id,
         upgraded_cart_id: body.upgraded_cart_id,
         product_id: this.state.upgardeProduct.id,
         type: 'UPGRADE'
      }

      data = await add('carts', data)

      // check Response
      if (data.updated) {
         // toastr.success('Added To cart');

         this.setState({
            addedToCart: true,
            upgradeModal: false,
            upgardeProduct: null,
            upgradeFields: {},
            currentState: 'cart'
         }, () => {

            Router.push('/accounts/cart')
            this.fetchData()
         })


      }
      else {
         let error;
         if (data.data) {
            error = data.data.error
         }
         else if (data.error.details) {
            error = data.error.details[0].message
         }
         else if (data.error) {
            error = data.error
         }
         toastr.error(error)
      }

   }

   // 
   componentDidMount() {
      this.fetchData();
   }


   render() {

      // Object.keys(items).map((key) => {
      //    items[key].defaultValue = items[key].defaultValue ? items[key].defaultValue : this.state.user[key]
      // })
      const tabs = [
         {
            index: 'board',
            title: 'User Board',
            onClick: () => {
               this.setState({ currentState: 'board' })
               Router.push('/accounts/board')
            },
            content: (
               <div className="account_name md:border-t">
                  <div className="col-md-12">
                     <div className="row">
                        <div className="col-sm-12 col-md-6 col-lg-6 md:border-r mt-3">
                           <h5>Hello,</h5>
                           {this.state.user.first_name !== undefined &&
                              <h3 className="font-saffron"><b>{this.state.user.first_name} {this.state.user.last_name}</b></h3> ||
                              <div className="comment  animateShimmer  p-3 w-75"></div>}
                           <p>Welcome to {window.localStorage.getItem('baseTitle')}, this is your account page. Manage your orders, account settings from this page.</p>
                           <p className="mt-5">Download the {window.localStorage.getItem('baseTitle')} app for Online Classes and Lecture</p>
                           <div className="row mt-3">
                              {
                                 this.state.contactData && this.state.contactData.playStore && this.state.contactData.playStore != '' &&
                                 JSON.parse(this.state.contactData.playStore).map(data => {
                                    if (data.playStore != '') {
                                       return <Link href={data.playStore}>
                                          <a target="_blank" className="col-4" >
                                             <img src="/website/assets/images/download/play.png" alt={window.localStorage.getItem('defaultImageAlt')} />
                                          </a>
                                       </Link>
                                    }
                                 })
                              }
                              {
                                 this.state.contactData && this.state.contactData.appStore && this.state.contactData.appStore != '' &&
                                 JSON.parse(this.state.contactData.appStore).map(data => {
                                    if (data.appStore != '') {
                                       return <Link href={data.appStore}>
                                          <a target="_blank" className="col-4">
                                             <img src="/website/assets/images/download/apple.png" style={{ width: '200px' }} alt={window.localStorage.getItem('defaultImageAlt')} />
                                          </a>
                                       </Link>

                                    }
                                 })
                              }
                              <Link href="/exe/Acme-Academy.exe">
                                 <a target="_blank">
                                    <img src="/website/assets/images/icons/windows.png" style={{ width: '200px' }} alt={window.localStorage.getItem('defaultImageAlt')} />
                                 </a>
                              </Link>
                           </div>
                        </div>
                        <div className="col-sm-12 col-md-6 col-lg-6">
                           <div className="accounts_box mt-3">
                              <div className="row">
                                 <div className="col-md-2">
                                    <i className="fa fa-cart-arrow-down icon-size" aria-hidden="true"></i>
                                 </div>
                                 <div className="col-md-10">
                                    <h5 className="account_link">
                                       <a onClick={() => {
                                          this.setState({ currentState: 'orders' })
                                       }}>
                                          My Orders
                                       </a>
                                    </h5>
                                    <p>Manage & track all your projects.</p>
                                 </div>
                              </div>
                           </div>
                           <div className="accounts_box border-top mb-3 mt-3">
                              <div className="row mt-3">
                                 <div className="col-md-2">
                                    <i className="fa fa-sliders-h icon-size" aria-hidden="true"></i>
                                 </div>
                                 <div className="col-md-10">
                                    <h5 className="account_link">
                                       <a onClick={() => {
                                          this.setState({ currentState: 'account-info' })
                                       }}>Account Settings</a>
                                    </h5>
                                    <p>Manage your account update address or passwords.</p>
                                 </div>
                              </div>
                           </div>
                           <div className="accounts_box border-top mb-3 mt-3">
                              <div className="row mt-3">
                                 <div className="col-md-2">
                                    <i className="fa fa-cart-plus icon-size" aria-hidden="true"></i>
                                 </div>
                                 <div className="col-md-10">
                                    <h5 className="account_link">
                                       <a onClick={() => {
                                          this.setState({ currentState: 'cart' })
                                       }}>My Cart</a>
                                    </h5>
                                    <p>Manage your Cart and Wishlist.</p>
                                 </div>
                              </div>
                           </div>
                           <div className="accounts_box border-top mb-3 mt-3">
                              <div className="row mt-3">
                                 <div className="col-md-2">
                                    <i className="fa fa-ticket-alt icon-size" aria-hidden="true"></i>
                                 </div>
                                 <div className="col-md-10">
                                    <h5 className="account_link">
                                       <Link href="#settings">
                                          <a >Raise a Ticket</a>
                                       </Link>
                                    </h5>
                                    <p>Facing any issue in purchase or in app? Create a ticket for faster resolution of the issue.</p>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            )
         },
         {
            index: 'cart',
            title: 'My Cart',
            onClick: () => {
               this.setState({ currentState: 'cart' })
               Router.push('/accounts/cart')
            },
            content: (
               <div className="cart_box">
                  <div className="">
                     <div className="container">
                        {(this.state.carts && this.state.carts.length > 0) &&
                           <div className="row">
                              <div className="col-md-7 border-right">

                                 {
                                    this.state.carts && this.state.carts.length > 0 &&
                                    this.state.carts.map(cart => {
                                       return (
                                          <div className="row cart_box_container">
                                             <div className="col-md-4 p-0">

                                                <div className="cart_box_img">
                                                   {cart.product.cover_image && <img src={cart.product.cover_image} className="img-fluid h-100 h-500 " />
                                                      ||
                                                      <div className="cart_img_sh animateShimmer"></div>}
                                                </div>
                                             </div>
                                             <div className="col-md-8 p-0">
                                                <div className="cart_box_mid p-3  bg-light pb-sm-0">
                                                   <button type="button" className="btn btn-danger float-right" onClick={() => this.deleteCart(cart.id)}>x</button>
                                                   <h5 className="font-saffron"><b>{cart.product.name}  ( {cart.product.product_type ? cart.product.product_type.title : ''})</b></h5>
                                                   <span className="badge badge-info mt-2 p-2">{cart.product.product_type.title}</span>

                                                   {
                                                      cart.fixed_discount_amount && cart.fixed_discount_amount != 0 &&
                                                      <span className="branch_name pt-2"> <span className="">{cart.fixed_discount_type == 'PERCENT' ? ` ${cart.fixed_discount_amount} %` : `₹ ${cart.fixed_discount_amount}`} Off</span></span>
                                                   }
                                                   {
                                                      cart.shipping_charge != 0 &&
                                                      <span className="text-primary float-right pt-2 text-right"> Shipping Charge ₹ <span className="">  {cart.shipping_charge}</span></span>
                                                   }

                                                   <hr className="mt-2 mb-2">
                                                   </hr>
                                                   <div className="row" >
                                                      <div className="col">
                                                         <p><i className="fa fa-calendar-alt mr-1"></i>
                                                            {
                                                               (cart.product.attributes && cart.product.attributes['validity'] &&
                                                                  cart.product.attributes['validity'].value)
                                                               &&
                                                               cart.product.attributes['validity'].values[0].title
                                                            }

                                                         </p>
                                                      </div>
                                                      <div className="col">
                                                         <span className="d-flex float-right">
                                                            <h4 className="font-saffron"><b>₹{cart.amount}</b>
                                                            </h4>
                                                            <p><small><del>₹{cart.base_price}</del></small></p>
                                                         </span>
                                                         <br />
                                                         <span className="float-right  w-100 text-right">{
                                                            cart.product.taxIncluded == true && <small>(Tax Included)</small>
                                                         }</span>

                                                      </div>
                                                   </div>
                                                   {cart.product && cart.product.product_type && !cart.product.product_type.is_package && <div className="qty_btn mb-2">
                                                      <p>Quantity &nbsp;</p>
                                                      <div className="value-button" id="decrease" value="Decrease Value" onClick={(e) => {
                                                         this.updateCart({
                                                            id: cart.id, quantity: cart.quantity - 1
                                                         })
                                                      }}><span>-</span>
                                                      </div>
                                                      <input id="number" value={cart.quantity} />
                                                      <div className="value-button" id="increase" value="Increase Value" onClick={(e) => {
                                                         this.updateCart({
                                                            id: cart.id, quantity: cart.quantity + 1
                                                         })
                                                      }}><span>+</span>
                                                      </div>
                                                   </div>}

                                                   {
                                                      cart.fixed_discount_amount && false &&
                                                      <p> Discount <span className="badge badge-success">{cart.fixed_discount_type == 'PERCENT' ? ` ${cart.fixed_discount_amount} %` : `₹ ${cart.fixed_discount_amount}`}</span></p>
                                                   }

                                                   {
                                                      cart.coupon_code && false &&
                                                      <p> Coupon Applied <span className="badge badge-success">{cart.coupon_code}</span></p>
                                                   }
                                                   {
                                                      cart.referral_code && false &&
                                                      <p> referral Applied <span className="badge badge-success">{cart.referral_code}</span></p>
                                                   }
                                                   {
                                                      false && <>
                                                         {
                                                            cart.discount_type == 'PERCENT' &&
                                                            <p>Coupon Discount <span className="badge badge-success"> {cart.discount_amount ? cart.discount_amount : 0} % {cart.discount_amount_upto ? `Upto ₹ ${cart.discount_amount_upto}` : ''}</span></p>
                                                            ||
                                                            <p>Coupon Discount <span className="badge badge-success">₹ {cart.discount_amount ? cart.discount_amount : 0} </span></p>
                                                         }
                                                      </>
                                                   }

                                                   <div className="row px-3" >
                                                      {
                                                         cart.product.attributes && Object.values(cart.product.attributes).map(attr => {
                                                            if (attr.applied_as == 'MANUAL') {
                                                               return <div className="form-group col px-0  pr-2 last:pr-0">
                                                                  <p>{attr.title}</p>
                                                                  <select className="form-control" id="attribSelect" onChange={(e) => {
                                                                     this.updateCart({
                                                                        id: cart.id, "attributes": [
                                                                           {
                                                                              "attribute_id": attr.attribute_id,
                                                                              "value_id": e.target.value
                                                                           }
                                                                        ]
                                                                     })
                                                                  }}>
                                                                     {
                                                                        attr.values.map(value => {
                                                                           return <option value={value.id}
                                                                              selected={attr.selectedValue && attr.selectedValue.includes(value.id) ? true : false}
                                                                           >{value.title}</option>
                                                                        })
                                                                     }
                                                                  </select>
                                                               </div>

                                                            }
                                                         })
                                                      }
                                                   </div>


                                                </div>
                                             </div>
                                          </div>
                                       )
                                    })
                                 }

                                 {this.state.memberships && this.state.memberships.memberships && this.state.memberships.memberships.length > 0 && <div className="col-md-12 p-0">
                                    <div className="">
                                       <div className="alert alert-warning d-flex">
                                          <i className="fas fa-exclamation-triangle pt-2"></i>
                                          <div className="">
                                             <Link href="/accounts/upload-document">
                                                <a target="_blank" className="pl-2">Update your documents to avail maximum discounts of products.</a>
                                             </Link>
                                             <br />
                                             <Link href="/accounts/upload-document">
                                                <a target="_blank" className=" pl-2 border-bottom">click here to upload documents</a>
                                             </Link>
                                          </div>

                                       </div>
                                    </div>
                                 </div>}


                              </div>
                              <div className="col-md-4 p-0 mx-3 mt-2">
                                 {/* <p>Base Price : ₹<span className="font-saffron">{this.state.amount}</span></p>
                                 <hr>
                                 </hr> */}

                                 {this.state.defaultAddress && this.state.shipping && <div className="md:p-2 mb-2 border-bottom">
                                    <h5 className="pb-1 "><span className="text-primary" > Shipping Address</span>
                                       <span className="px-y py-1 btn btn-danger mx-2" onClick={() => this.changeAddressModal()}><small>Change Address</small></span>

                                    </h5>
                                    <p className="text-gray-500">{this.state.defaultAddress.address},</p>
                                    <p className="text-gray-500"> {this.state.defaultAddress.city},  {this.state.defaultAddress.state}</p>
                                    <p className="text-gray-500"> {this.state.defaultAddress.zip_code}</p>
                                    <p className="text-gray-500"> {this.state.defaultAddress.country}</p>
                                 </div>}
                                 {!this.state.defaultAddress && this.state.shipping && <div className="md:p-2 mb-2 border-bottom">
                                    <h5 className="pb-1 "><span className="text-primary" > Shipping Address</span>
                                       <span className="px-y py-1 btn btn-danger mx-2" onClick={() => this.changeAddressModal()}><small>Add Address <i class="fas fa-plus ml-1"></i></small></span></h5>
                                 </div>}
                                 {!this.state.forUpgrade && <>{
                                    this.state.appliedCoupons && this.state.appliedCoupons.length > 0 &&

                                    <div>
                                       <h5 className="pb-1">Applied Coupon Code</h5>
                                       <div className="row mx-0 pb-1 md:px-2 px-0" >
                                          <div className="col-6">

                                             {
                                                this.state.appliedCoupons.map(coupon => {
                                                   return <span className="branch_name "> <span className="p-2"> {coupon}</span></span>
                                                })
                                             }
                                          </div>
                                          <div className="col-6 ">
                                             <button className="btn btn-danger float-right" onClick={(e) => this.deleteCoupon(e)}><i className="fa fa-trash-alt"></i></button>
                                             <button className="btn btn-success float-right mr-1" onClick={(e) => this.deleteCoupon(e, 'RESET')}>Reset</button>
                                          </div>
                                       </div>
                                    </div>
                                    ||
                                    <div className="cart_box_promo_code md:ml-2 mt-1">
                                       <p className="mb-2">Apply Coupon Code</p>
                                       <div className="form-group">
                                          <div className="row mx-0 px-0 md:px-2 px-md-0">
                                             <input type="text" className="form-control col-8" aria-describedby="CouponCode" name="couponCode" placeholder="Enter Coupon Code" />
                                             <button className=" btn-success float-right col-4 w-75" onClick={(e) => this.applyCoupon(e)}>Apply</button>
                                          </div>
                                          {this.state.couponError && <span className="text-sm text-danger">{this.state.couponError}
                                          </span>}
                                       </div>
                                       {/* {!this.state.coupon && this.state.suggestedCoupons && this.state.suggestedCoupons.length > 0 && <div className=" mt-2">
                                          <span className="text-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">View Letest Offers and Deals </span>
                                       </div>} */}
                                    </div>
                                 } </>}
                                 {!this.state.forUpgrade && <>{
                                    this.state.appliedReferrals && this.state.appliedReferrals.length > 0 &&

                                    <div>
                                       <h5 className="pb-1">Applied Referral Code</h5>
                                       <div className="row mx-0 pb-1 px-0 md:px-2 px-md-0" >
                                          <div className="col-6">

                                             {
                                                this.state.appliedReferrals.map(referral => {
                                                   return <span className="branch_name "> <span className="p-2"> {referral}</span></span>
                                                })
                                             }
                                          </div>
                                          <div className="col-6 ">
                                             <button className="btn btn-danger float-right" onClick={(e) => this.deleteReferral(e)}><i className="fa fa-trash-alt"></i></button>
                                          </div>
                                       </div>
                                    </div>

                                    ||
                                    <div className="cart_box_promo_code md:ml-2 mt-1">
                                       <p className="mb-2">Apply Referral Code</p>
                                       <div className="form-group">
                                          <div className="row mx-0 pb-1 md:px-2 px-0">
                                             <input type="text" className="form-control col-8" aria-describedby="ReferralCode" name="referralCode" placeholder="Enter referral Code" />
                                             <button className=" btn-success float-right col-4 w-75" onClick={(e) => this.applyReferral(e)}>Apply</button>
                                          </div>
                                          {this.state.referralError && <span className="text-sm text-danger">{this.state.referralError}
                                          </span>}
                                       </div>
                                    </div>
                                 }
                                    <hr />
                                 </>}

                                 <h5 className='md:px-2'>Price Details</h5>
                                 <div className="mt-3 md:px-2">

                                    {this.state.totalMembershipDiscount != 0 && <p>Membership Discount : <span className="float-right"><b>₹ {this.state.totalMembershipDiscount}</b></span></p>}
                                    {this.state.totalFixedDiscount != 0 && <p>Discount : <span className="float-right"><b>₹ {this.state.totalFixedDiscount}</b></span></p>}
                                    {this.state.totalCouponDiscount != 0 && <p>Coupon Discount <span className=" float-right"><b>₹ {this.state.totalCouponDiscount}</b></span></p>}
                                    {this.state.totalReferralDiscount != 0 && <p>Referral Discount <span className=" float-right"><b>₹ {this.state.totalReferralDiscount}</b></span></p>}
                                    {this.state.totalReferralDiscount != 0 && <p>My Account Balance<span className=" float-right"><b>₹ {this.state.totalReferralDiscount}</b></span></p>}
                                    {/* <p>Final Discount <span className=" float-right"><b>₹ {this.state.totalDiscount}</b></span></p> */}
                                    <hr className="py-2" />
                                    <p>Product Amount <span className=" float-right"><b>₹ {this.state.totalAmountWithoutGst}</b></span></p>
                                    {this.state.totalTax != 0 && <p> Tax Amount <span className=" float-right"><b>₹ {this.state.totalTax}</b></span></p>}
                                    {/* <p>Shipping Charges <span className=" float-right"><b>₹ {this.state.shippingCharges}</b></span></p> */}

                                    {/* <p>Final Amount : ₹<strong className="font-saffron float-right">{this.state.finalPrice}</strong></p> */}
                                 </div>

                                 <hr />

                                 <div className="mb-3 mt-4 md:px-2">

                                    <p>Amount to be paid <strong className="float-right"> <h4 className="font-saffron">₹ {this.state.finalPrice}</h4></strong></p>
                                 </div>

                                 <div className="checkout-btn mt-2 md:px-2 responsive_buy_button">
                                    {/* <Link href=""> */}
                                    <a type="button" className="btn btn-primary w-100  p-3" onClick={(e) => this.checkout(e)}>Proceed to Checkout &nbsp;<span><i className="fa fa-arrow-right"></i></span></a>
                                    {/* </Link> */}
                                 </div>
                                 {!this.state.coupon && this.state.suggestedCoupons && this.state.suggestedCoupons.length > 0 && !this.state.forUpgrade && <div className="mt-4 ">
                                    <span className="text-primary mt-4" data-bs-toggle="modal" data-bs-target="#exampleModal">View Letest Offers and Deals </span>
                                    <ul className="card-text px-2 py-2">
                                       {
                                          this.state.suggestedCoupons.map(coupon => {
                                             return (
                                                <li className=" border-bottom pt-2 pb-2">
                                                   <div className="">

                                                      <div className='' onClick={(e) => this.applyCoupon(e, coupon.code)}>
                                                         <p>
                                                            <span className="border bg-light text-dark p-1"> {coupon.code}</span>
                                                            <span><b>{coupon.discount_type == 'AMOUNT' && '₹'}  {coupon.amount} {coupon.discount_type == 'PERCENT' && '% '} off {coupon.amount_upto ? `upTo ₹ ${coupon.amount_upto}` : ''}
                                                            </b></span>

                                                         </p>

                                                         {(coupon.minimum_amount || coupon.maximum_amount) && <p>Applied on all the each cart with
                                                            {
                                                               !coupon.minimum_amount && ` maximum amount ₹ ${coupon.maximim_amount}` ||
                                                               !coupon.maximum_amount && ` minimum amount ₹ ${coupon.minimum_amount}` ||
                                                               ` minimum amount upto ₹ ${coupon.minimum_amount} - ₹ ${coupon.maximum_amount}`
                                                            }
                                                         </p> ||
                                                            <p>Applied on all the each cart</p>}
                                                         <p>
                                                            {
                                                               coupon.description
                                                            }
                                                         </p>
                                                         <p> {coupon.expiry_date &&
                                                            <b> Expired On {moment(coupon.expiry_date).format('DD-MM-YYYY')}</b>
                                                         }</p>
                                                      </div>


                                                   </div>
                                                </li>
                                             )
                                          })
                                       }
                                    </ul>
                                 </div>}

                              </div>


                           </div>



                           || <div className="empty_box">
                              <h2 className="text-center"><i className="fa fa-cart-plus"></i></h2>
                              <h5 className="text-center">Hey, {this.state.user.first_name !== undefined &&
                                 <b className="font-saffron"><b>{this.state.user.first_name} {this.state.user.last_name}</b></b> ||
                                 <b className="comment  animateShimmer px20"></b>} you have no product Added to cart.</h5>
                           </div>
                        }</div>
                  </div>
               </div >
            )
         },
         {
            index: 'orders',
            title: 'My Orders and Updates',
            onClick: () => {
               this.setState({ currentState: 'orders' })
               Router.push('/accounts/orders')
            },
            content: (
               <div className="container cart_box">
                  <div className="card-on-responsive">

                     {
                        this.state.orders && this.state.orders.length > 0 &&
                        <>
                           <div className="table-responsive">
                              <table className="table table-striped">
                                 <thead>
                                    <tr>
                                       <th scope="col">#</th>
                                       <th scope="col">Order ID</th>
                                       <th scope="col">Course Name</th>
                                       <th scope="col">Status</th>
                                       <th scope="col">Price</th>
                                       <th scope="col">Date</th>
                                       <th scope="col">Link</th>
                                    </tr>
                                 </thead>
                                 <tbody>
                                    {

                                       this.state.orders && this.state.orders.map((order, index) => {
                                          return <tr className="tr_mb">
                                             <th data-label="Index" scope="row">{index + 1}</th>
                                             <th data-label="Order ID" scope="row" >{order.order_number}</th>
                                             <td data-label="Course Details" className="Course">
                                                {
                                                   <table className="w-100">
                                                      <tbody>
                                                         {order.carts && order.carts.map((cart, index) => {
                                                            return <tr className="m-tb" style={{ backgroundColor: 'rgba(0,0,0,.05)' }}>
                                                               <td data-label="" className="w-50">
                                                                  {cart.product.name}
                                                                  {
                                                                     cart.upgraded_cart_id && cart.order_type == 'UPGRADE' && <span className="badge badge-danger ml-2">Upgraded Product</span>
                                                                  }
                                                               </td>
                                                               <td data-label="Activation Status" className="w-25" >
                                                                  {order.status == 'SUCCESS' && (((cart.activated && cart.activated == true) || cart.notStarted) ? <span className="text-success float-right">Activated</span> : <span className="text-danger float-right">Expired</span>)}

                                                               </td>
                                                               <td data-label="Expiry Status" className="w-25 text-right" >
                                                                  {order.status == 'SUCCESS' && (cart.activated && cart.activated == true ? (
                                                                     <>

                                                                        {cart.notStarted &&
                                                                           <>
                                                                              <span className="">{moment(cart.validity_start_from).format('MMMM Do YYYY')}</span>
                                                                              <br />
                                                                              <span className=""> to </span>
                                                                              <br />
                                                                              <span className="">{moment(cart.expDate).format('MMMM Do YYYY')}</span>
                                                                              <br />
                                                                           </>
                                                                           ||
                                                                           <>
                                                                              <span className="float-right">{cart.leftDays} Days Left ({moment(cart.expDate).format('DD-MM-YYYY')})</span>
                                                                              <br /></>
                                                                        }

                                                                        {cart.product.is_upgradable == 1 && !cart.upgraded_cart_id && this.state.upgradeOrderDaysBefore >= cart.leftDays && <span className="btn border border-danger mt-3 mt-md-1 float-right text-danger bg-transparent ml-1"><a title="" onClick={(e) => this.upgradeModal(cart.product, cart.id)}>Upgrade Order</a> </span>}
                                                                        {/* {cart.product.is_upgradable == 1 && cart.is_upgraded == 1 && <a className="btn border border-danger mt-3 float-right text-danger bg-transparent ml-1" title="" >Already Upgraded</a>} */}

                                                                     </>
                                                                  ) : (
                                                                     <>
                                                                        {cart.notStarted &&
                                                                           <>
                                                                              <span className="float-right">{moment(cart.validity_start_from).format('MMMM Do YYYY')}</span>
                                                                              <br />
                                                                              <span className="float-right"> to </span>
                                                                              <br />
                                                                           </>
                                                                        }
                                                                        <span className="float-right">{moment(cart.expDate).format('MMMM Do YYYY')}</span>
                                                                        <br />
                                                                        {cart.product.is_upgradable == 1 && !cart.upgraded_cart_id && (this.state.upgradeOrderDaysAfter + cart.leftDays) >= 0 && <a className="btn border border-danger mt-3 mt-md-1 float-right text-danger bg-transparent ml-1" title="" onClick={(e) => this.upgradeModal(cart.product, cart.id)}>Upgrade Order</a>}
                                                                        {/* {cart.product.is_upgradable == 1 && cart.is_upgraded == 1 && <a className="btn border border-danger mt-3 mt-md-1 float-right text-danger bg-transparent ml-1" title="" >Upgraded</a>} */}

                                                                     </>

                                                                  ))}
                                                               </td>
                                                            </tr>

                                                         })}
                                                      </tbody>
                                                   </table>
                                                }
                                             </td>
                                             <td data-label="Status" className="status">
                                                {
                                                   <span className={`badge ${order.status == 'SUCCESS' ? 'badge-success' : 'badge-danger'}`}>{order.status}</span>
                                                }
                                             </td>
                                             <td data-label="Price" className="heighlight-primary">₹ {order.final_price}</td>
                                             <td data-label="Date">{moment(order.created_at).format('MMMM Do YYYY, h:mm:ss a')}</td>
                                             <td data-label="">
                                                {order.status == 'SUCCESS' &&
                                                   <Link href="/invoice/[id]" as={`/invoice/${order.order_number}`}  >
                                                      <a type="button" className="btn btn-primary" target="_blank" >View Invoice</a>
                                                   </Link>
                                                }
                                             </td>
                                          </tr>
                                       })
                                    }
                                 </tbody>
                              </table>
                           </div>
                           <div className="notice_box text-white">
                              <h6 className="text-white"><i className="fa fa-exclamation-circle"></i>  In case your payment was successful and amount is debited. Please don't worry, It will be reflected within 24 hours.</h6>
                           </div>
                        </>
                        ||
                        <div className="empty_box">
                           <h5 className="text-center">Hey, {this.state.user.first_name !== undefined &&
                              <b className="font-saffron"><b>{this.state.user.first_name} {this.state.user.last_name}</b></b> ||
                              <b className="comment  animateShimmer  px20"></b>} you have no current orders.</h5>
                        </div>
                     }
                  </div>
               </div>
            )
         },
         {
            index: 'membership-orders',
            title: 'My Membership Order',
            onClick: () => {
               this.setState({ currentState: 'membership-orders' })
               Router.push('/accounts/membership-orders')
            },
            content: (
               <div className="container cart_box">
                  <div className="card-on-responsive">

                     {
                        this.state.membershipOrders && this.state.membershipOrders.length > 0 &&
                        <>
                           <div className="table-responsive">
                              <table className="table table-striped">
                                 <thead>
                                    <tr>
                                       <th scope="col">#</th>
                                       <th scope="col">Order ID</th>
                                       <th scope="col">Membership Name</th>
                                       <th scope="col">Status</th>
                                       <th scope="col">Price</th>
                                       <th scope="col">Date</th>
                                       <th scope="col">Link</th>
                                    </tr>
                                 </thead>
                                 <tbody>
                                    {

                                       this.state.membershipOrders && this.state.membershipOrders.map((order, index) => {
                                          return <tr>
                                             <th data-label="Index" scope="row">{index + 1}</th>
                                             <th data-label="Order ID" scope="row">{order.order_number}</th>
                                             <td data-label="Membership details">
                                                {
                                                   <table className="w-100">
                                                      <tbody>
                                                         {order.carts && order.carts.map((cart, index) => {
                                                            return <tr style={{ backgroundColor: 'rgba(0,0,0,.05)' }}>
                                                               <td>
                                                                  {cart.membership.title}
                                                               </td>
                                                               <td data-label="Status">
                                                                  {order.status == 'SUCCESS' && (cart.activated && cart.activated == true ? <span className="text-success">Activated</span> : <span className="text-danger">Expired</span>)}
                                                               </td>
                                                               <td data-label="Expiry Status">
                                                                  {order.status == 'SUCCESS' && (cart.activated && cart.activated == true ? (
                                                                     <>
                                                                        <span>{cart.leftDays} Days Left</span>
                                                                     </>
                                                                  ) : (
                                                                     <>
                                                                        <span>{moment(cart.expDate).format('MMMM Do YYYY, h:mm:ss a')}</span>
                                                                     </>

                                                                  ))}
                                                               </td>
                                                            </tr>

                                                         })}
                                                      </tbody>
                                                   </table>
                                                }
                                             </td>
                                             <td data-label="Status">
                                                {
                                                   <span className={`badge ${order.status == 'SUCCESS' ? 'badge-success' : 'badge-danger'}`}>{order.status}</span>
                                                }
                                             </td>
                                             <td data-label="Price" className="heighlight-primary">₹ {order.final_price}</td>
                                             <td data-label="Date">{moment(order.created_at).format('MMMM Do YYYY, h:mm:ss a')}</td>
                                             <td>
                                                <Link href="/invoice/[id]" as={`/invoice/${order.order_number}`}  >
                                                   <a type="button" className="btn btn-primary" target="_blank" >View Invoice</a>
                                                </Link>
                                             </td>
                                          </tr>
                                       })
                                    }
                                 </tbody>
                              </table>
                           </div>
                           <div className="notice_box text-white">
                              <h6 className="text-white"><i className="fa fa-exclamation-circle"></i>  In case your payment was successful and amount is debited. Please don't worry, It will be reflected within 24 hours.</h6>
                           </div>
                        </>
                        ||
                        <div className="empty_box">
                           <h5 className="text-center">Hey, {this.state.user.first_name !== undefined &&
                              <b className="font-saffron"><b>{this.state.user.first_name} {this.state.user.last_name}</b></b> ||
                              <b className="comment  animateShimmer  px20"></b>} you have no current orders.</h5>
                        </div>
                     }
                  </div>
               </div>
            )
         },
         {
            index: 'account-info',
            title: 'Account Info',
            onClick: () => {
               this.setState({ currentState: 'account-info' })
               Router.push('/accounts/account-info')
            },
            content: (
               <div className="setting_tab ">
                  <div className="">
                     <div className="admission_form">
                        <div className="">
                           <div className="contact_form_wrapper">

                              <hr className="mb-2">
                              </hr>
                              <div className="leave_comment">
                                 <div className="contact_form">
                                    <div className="ml-3">
                                       <h5 className="mb-2  font-saffron"><strong>Personal Information</strong></h5>
                                    </div>
                                    <hr className="mb-2">
                                    </hr>
                                    {this.state.userItems !== undefined && <div className="container">
                                       <ValidationFront items={Object.values(this.state.userItems)} onSubmit={this.updateAccount} />
                                    </div>
                                       ||
                                       <div className="container">
                                          <div className="p20 accounts rounded-sh h10 animateShimmer mt10 mb-3 mx-auto"></div>
                                          <div className="products pt-4 mx-auto">
                                             <div className="md-w-33 mr-3 comment p-3 animateShimmer mb-3"></div>
                                             <div className="md-w-33 mr-3 comment p-3 animateShimmer mb-3"></div>
                                             <div className="md-w-33 comment p-3 animateShimmer mb-3"></div>
                                          </div>
                                          <div className="products">
                                             <div className="md-w-33 mr-3 comment p-3 animateShimmer mb-3"></div>
                                             <div className="md-w-33 mr-3  comment p-3 animateShimmer mb-3"></div>
                                             <div className="md-w-33 comment p-3 animateShimmer mb-3 "></div>
                                          </div>
                                          <div className="products">
                                             <div className="md-w-33 mr-3 comment p-3 animateShimmer mb-3"></div>
                                             <div className="md-w-33 mr-3 comment p-3 animateShimmer mb-3"></div>
                                             <div className="md-w-33 comment p-3 animateShimmer mb-3 "></div>
                                          </div>
                                       </div>}
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            )
         },
         {
            index: 'refer-and-earn',
            title: 'Refer And Earn',
            onClick: () => {
               this.setState({ currentState: 'refer-and-earn' })
               Router.push('/accounts/refer-and-earn')
            },
            content: (

               <div className="setting_tab mt-5">
                  <div class="sign__shape d-none d-sm-block">
                     <img class="man-12 signBg" src="/images/background-images/man-1.png" alt=""></img>
                     <img class="man-2 mover" src="/images/background-images/man-2.png" alt=""></img>
                     <img class="circle2 rotation" src="/images/background-images/circle.png" alt=""></img>
                     <img class="zigzag2 signBg" src="/images/background-images/zigzag.png" alt=""></img>
                  </div>
                  <div className="">
                     <div className="admission_form">
                        <div className="">
                           <div className="contact_form_wrapper mb-2">

                              {this.state.referralCode && <div className="leave_comment">
                                 <div className="contact_form">
                                    <div className="container">
                                       <h5 className="my-2 font-bold text-center">Refer And Earn.</h5>
                                       <p className="mb-4 font-bold text-center text-gray-500">Send This Code to Your friends and earn discount upto {this.state.minReferrarAmount} {this.state.minReferrarAmount != this.state.maxReferrarAmount && `to ${this.state.maxReferrarAmount}`}</p>
                                       <button className="btn btn-default btn-rounded bg-base  text-white text-center m-auto d-block" ><h1 className="text-white">{this.state.referralCode.code}</h1></button>

                                    </div>
                                 </div>
                              </div>}
                              {
                                 this.state.userReferrals && this.state.userReferrals.length > 0 && <>
                                    <div className="card-on-responsive">
                                       <div className="table-responsive mt-4">
                                          <table className="table table-striped">
                                             <thead>
                                                <tr>
                                                   <th scope="col">#</th>
                                                   <th scope="col">User name</th>
                                                   <th scope="col">Course Name</th>
                                                   <th scope="col">Price</th>
                                                   <th scope="col">Referrar Discount</th>
                                                   <th scope="col">Date</th>
                                                   <th scope="col">Applied Status</th>
                                                </tr>
                                             </thead>
                                             <tbody>
                                                {

                                                   this.state.userReferrals && this.state.userReferrals.map((refererOrder, index) => {
                                                      return <tr>
                                                         <th data-label="Index" scope="row">{index + 1}</th>
                                                         <th data-label="User Name" scope="row">{refererOrder.order.user.first_name} {refererOrder.order.user.last_name}</th>
                                                         <td data-label="Product Details">

                                                            {
                                                               <table className="w-100">
                                                                  <tbody>
                                                                     {refererOrder.order.carts && refererOrder.order.carts.map((cart, index) => {
                                                                        return <tr style={{ backgroundColor: 'rgba(0,0,0,.05)' }}>
                                                                           <td>
                                                                              {cart.product.name}
                                                                           </td>
                                                                           <td data-label="Referal Discount" >
                                                                              {cart.referral_amount ? (cart.referral_discount_type == 'PERCENT' ? `₹ ${cart.finalReferralDiscount}  (${cart.referral_amount} % ${cart.referral_discount_amount_upto ? `Upto ₹ ${cart.referral_discount_amount_upto}` : ''})` : `₹ ${cart.referral_amount}`) : `₹ 0`}

                                                                           </td>
                                                                        </tr>

                                                                     })}
                                                                  </tbody>
                                                               </table>
                                                            }
                                                         </td>
                                                         <td data-label="Price" className="heighlight-primary">₹ {refererOrder.order.final_price}</td>
                                                         <td data-label="Referrar Discount">
                                                            {refererOrder.discount ? (refererOrder.discount_type == 'PERCENT' ? `₹ ${(refererOrder.order.amount * refererOrder.discount) / 100} ` : `₹ ${refererOrder.discount}`) : `₹ 0`}
                                                         </td>
                                                         <td data-label="Date">{moment(refererOrder.order.created_at).format('MMMM Do YYYY, h:mm:ss a')}</td>
                                                         <td data-label="Applied Status">{refererOrder.applied ? <h3 className="badge badge-success">Applied</h3> : <h3 className="badge badge-danger"> Not Applied</h3>}</td>

                                                      </tr>
                                                   })
                                                }
                                             </tbody>
                                          </table>
                                       </div>
                                    </div>
                                 </>
                              }
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            )
         },
      ];

      {
         this.state.memberships && this.state.memberships.memberships && this.state.memberships.memberships.length > 0 &&
            tabs.push({
               index: 'upload-document',
               title: 'Upload Document',
               onClick: () => {
                  this.setState({ currentState: 'upload-document' })
                  Router.push('/accounts/upload-document')
               },
               content: (
                  <div className="setting_tab">
                     <div className="">
                        <div className="admission_form">
                           <div className="">
                              <div className="contact_form_wrapper">

                                 <hr className="mb-2">
                                 </hr>
                                 <div className="leave_comment">
                                    <div className="contact_form">
                                       <div className="ml-3">
                                          <h5 className="mb-2  font-saffron"><strong>Upload Document to avail discount</strong></h5>
                                       </div>
                                       <hr className="mb-2">
                                       </hr>
                                       {this.state.user && this.state.user.membership_documents && this.state.user.membership_documents.length > 0 && <div className="container">
                                          <div className="row my-3 w-100">

                                             <h5 className="col-12 col-md-10"><b>{this.state.user.membership_documents[0].title}</b></h5>
                                             <h5 className="md:float-right col-12 col-md-2 md:text-right">{this.state.user.membership_documents[0].approved == 1 && <span className="badge badge-success">
                                                Approved</span> || <span className="badge badge-danger">Not Approved</span>
                                             }</h5>
                                          </div>
                                          <embed src={this.state.user.membership_documents[0].document} type="application/pdf" width="100%" height="600px" />
                                       </div>}
                                       {this.state.documentItems && this.state.user && (!this.state.user.membership_documents || this.state.user.membership_documents.length <= 0) && <div className="container">
                                          <ValidationFront items={Object.values(this.state.documentItems)} onSubmit={this.updateAccount} />
                                       </div>}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               )
            })
      }


      {
         this.state.membershipCarts && this.state.membershipCarts.carts && this.state.membershipCarts.carts.length > 0 &&
            tabs.push({
               index: 'membership-cart',
               title: 'Buy Membership',
               onClick: () => {
                  this.setState({ currentState: 'membership-cart' })
                  Router.push('/accounts/membership-cart')
               },
               content: (
                  <div className="cart_box">
                     <div className="">
                        <div className="container">
                           {(this.state.membershipCarts && this.state.membershipCarts.carts && this.state.membershipCarts.carts.length > 0) &&
                              <div className="row">
                                 <div className="col-md-7 border-right">
                                    {
                                       this.state.membershipCarts && this.state.membershipCarts.carts && this.state.membershipCarts.carts.length > 0 &&
                                       this.state.membershipCarts.carts.map(cart => {
                                          return (
                                             <div className="row cart_box_container">
                                                <div className="col-md-4 p-0">
                                                   <div className="cart_box_img">
                                                      {/* <img src={cart.product.cover_image} className="img-fluid h-100" /> */}
                                                   </div>
                                                </div>
                                                <div className="col-md-8 p-0">
                                                   <div className="cart_box_mid p-3  bg-light pb-sm-0">
                                                      <button type="button" className="btn btn-danger float-right" onClick={() => this.deleteMembershipCart(cart.id)}>x</button>
                                                      <h5 className="font-saffron"><b>{cart.membership.title}  </b></h5>



                                                      <hr className="mt-2 mb-2">
                                                      </hr>
                                                      <div className="row" >
                                                         <div className="col">
                                                            <p><i className="fa fa-calendar-alt mr-1"></i>
                                                               {
                                                                  (cart.membership.validity &&
                                                                     cart.membership.validity.title)
                                                                  &&
                                                                  cart.membership.validity.title
                                                               }

                                                            </p>
                                                         </div>

                                                         <div className="col">
                                                            <span className="d-flex float-right">
                                                               <h4 className="font-saffron"><b>₹{cart.amount}</b>
                                                               </h4>
                                                               <p><small><del>₹{cart.base_price}</del></small></p>
                                                            </span>
                                                            <br />
                                                            <span className="float-right  w-100 text-right">{
                                                               cart.membership.tax && <small>(Tax Included)</small>
                                                            }</span>

                                                         </div>
                                                      </div>
                                                   </div>
                                                </div>
                                             </div>
                                          )
                                       })
                                    }

                                 </div>
                                 <div className="col-md-4 p-0 mx-4 mt-2">

                                    <hr />
                                    <h5>Price Details</h5>
                                    <div className="mt-3">
                                       <hr className="py-2" />
                                       <p>Product Amount <span className=" float-right"><b>₹ {this.state.membershipCarts.totalAmountWithoutGst}</b></span></p>
                                       <p>Tax Amount <span className=" float-right"><b>₹ {this.state.membershipCarts.totalTax}</b></span></p>

                                       {/* <p>Final Amount : ₹<strong className="font-saffron float-right">{this.state.finalPrice}</strong></p> */}
                                    </div>

                                    <hr />

                                    <div className="mb-3 mt-4">

                                       <p>Amount to be paid <strong className="float-right"> <h4 className="font-saffron">₹ {this.state.membershipCarts.finalPrice}</h4></strong></p>
                                    </div>

                                    <div className="checkout-btn mt-2">
                                       {/* <Link href=""> */}
                                       <a type="button" className="btn btn-primary w-100  p-3" onClick={(e) => this.buyMembership(e)}>Proceed to Checkout &nbsp;<span><i className="fa fa-arrow-right"></i></span></a>
                                       {/* </Link> */}
                                    </div>
                                 </div>
                              </div>

                              || <div className="empty_box">
                                 <h2 className="text-center"><i className="fa fa-cart-plus"></i></h2>
                                 <h5 className="text-center">Hey, {this.state.user.first_name !== undefined &&
                                    <b className="font-saffron"><b>{this.state.user.first_name} {this.state.user.last_name}</b></b> ||
                                    <b className="comment  animateShimmer px20"></b>} you have no product Added to cart.</h5>
                              </div>
                           }</div>
                     </div>
                  </div>
               )
            })
      }


      return (
         <>
            {(this.state.openCheckout && this.state.openCheckout == true) && <Checkout callBack={this.fetchData} addressID={this.state.defaultAddress ? this.state.defaultAddress.id : null} />}
            {(this.state.buyMembership && this.state.buyMembership == true) && <Checkout callBack={this.fetchData} paymentType="MEMBERSHIP" />}
            {
               this.state.upgradeModal &&
               <StoreModel
                  title={this.state.displayModelTitle}
                  body={
                     <div>
                        {
                           this.state.upgradeFields && this.state.upgradeFields != {} && <Validation items={Object.values(this.state.upgradeFields)} onSubmit={this.upgradeOrder} alerts={false} />
                        }

                     </div>
                  }
                  useModel={this.state.upgradeModal}
                  hideModal={this.upgradeModal}

               />
            }
            {
               this.state.addressModal &&
               <StoreModel
                  title="Change Shipping Address"
                  body={
                     <div>
                        {
                           this.state.addressFields && this.state.addressFields != {} && <Validation items={Object.values(this.state.addressFields)}
                              onSubmit={(data) => {

                                 let addr = this.state.user.addresses.filter(address => address.id == data.address_id)

                                 if (addr) {
                                    addr = addr[0]

                                    this.setState({
                                       defaultAddress: addr
                                    }, () => {
                                       this.setState({
                                          addressModal: false,
                                          addressFields: {}
                                       })
                                    })
                                 }
                              }}
                              alerts={false} />
                        }

                     </div>
                  }
                  useModel={this.state.addressModal}
                  hideModal={this.changeAddressModal}

               />
            }
            {
               this.state.addAddressModal &&
               <StoreModel
                  title="Change Shipping Address"
                  body={
                     <div>
                        {
                           this.state.addAddressFields && this.state.addAddressFields != {} && <Validation items={Object.values(this.state.addAddressFields)}
                              onSubmit={this.addAddress}
                              alerts={false} />
                        }

                     </div>
                  }
                  useModel={this.state.addAddressModal}
                  hideModal={this.addAddressModal}

               />
            }
            {/* Breadcrumbs Start */}
            <header className="">
               {/* 
                  <Preloader />
               */}
               <div className="intro_wrapper admission_page">
                  <div className="container">
                     <div className="row">
                        <div className="col-sm-12 col-md-8 col-lg-8">
                           <div className="intro_text">
                              <h1 className="mt-3 mb-3">My Account</h1>
                              <hr></hr>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </header>

            {/* MId Content starts */}
            <section className="accounts_section" >
               <div className="accounts_ul">
                  <div className="container px-0">
                     {
                     }
                  </div>
               </div>
               <div className="container px-0 tab_pad mt-5">
                  {this.state.currentState &&
                     <UnderlinedTabs tabs={tabs} activeTab={this.state.currentState} />
                  }
               </div>
            </section>

            {this.state.currentState == 'base' &&
               <div className="row container mt-5 ml-5 ">
                  <div className="col-lg-5 mt-3 md-border-right">
                     <div className="comment br animateShimmer   mt-3 w-25"></div>
                     <div className="comment br animateShimmer  mt-3 w-50"></div>
                     <div className="comment br animateShimmer   mt-3 w-75"></div>
                     <div className="comment br animateShimmer mt-3 w80"></div>
                  </div>
                  <div className="col-lg-5 acc-spacing">
                     <div className="row  border-bottom display p-2 col-12 col-lg-10 mb-3">
                        <div className="p-4  rounded-sh h10 animateShimmer col-1 mt-2"></div>
                        <div className="col-9 ">
                           <div className="comment br animateShimmer mt-2 w-100"></div>
                           <div className="comment br animateShimmer mt-2 w-100  col-12 "></div>
                           <div className="comment br animateShimmer mt-2 w-100 col-lg-8 col-12 mr-2 mb-3"></div>
                        </div>
                     </div>
                     <div className="row border-bottom display p2 col-12 col-lg-10  mb3">
                        <div className="p-4  rounded-sh h10 animateShimmer col-1 mt2"></div>
                        <div className="col-9">
                           <div className="comment br animateShimmer mt-2 w-100"></div>
                           <div className="comment br animateShimmer mt-2 w-100 col-12 "></div>
                           <div className="comment br animateShimmer mt-2 w-100 col-lg-8 col-12 mr-2 mb-3"></div>
                        </div>
                     </div>
                     <div className="row  display p-2 col-12 col-lg-10  mb-3">
                        <div className="p-4  rounded-sh h10 animateShimmer  col-1 mt-2"></div>
                        <div className="col-9 ">
                           <div className="comment br animateShimmer mt-2 w-100"></div>
                           <div className="comment br animateShimmer mt-2 w-100  col-12 "></div>
                           <div className="comment br animateShimmer mt-2 w-100 col-lg-8 col-12  mr-2 mb-3"></div>
                        </div>
                     </div>
                  </div>
               </div>}
         </ >
      )
   }
}