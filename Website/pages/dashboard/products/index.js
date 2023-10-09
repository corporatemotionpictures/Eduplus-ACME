import { Component } from 'react';
import { fetchAll, fetchByID, getSettings, add, edit } from 'helpers/apiService';
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


//

export default class extends Component {

  state = {
    values: {},
    search: '',
    id: null,
    freeType: null,
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
    products: [],
    storeFilter: {},
    imageLimits: {},
    baseTitle: 'Product',
    modelTitle: 'products',
    queryTitle: 'products',
    defaultValues: {},
    packageIds: [],
    attributes: [],
    imageRequired: 'YES',
    // filterAttributesSections: [],
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



    var imageRequired = await getSettings('productImageRequired')
    var productBasedOn = await getSettings('product_based_on')


    var attributes = await fetchAll('attributes', { forFilter: true })
    this.setState({
      filterAttributes: attributes.attributes,
      imageRequired: imageRequired,
      productBasedOn: productBasedOn,
    }, () => {

      let filterAttributesSections = [
        this.state.hideHierarchy >= 1 ? { type: 'blank' } : {
          label: `exams`,
          title: `${define.exams}`,
          name: 'examID',
          idSelector: 'id',
          view: 'name',
          type: 'select-multiple',
          effectedRows: ['courseID', 'subjectID', 'chapterID'],
        },
        this.state.hideHierarchy >= 2 ? { type: 'blank' } : {
          label: `courses`,
          title: `${define.courses}`,
          name: 'courseID',
          idSelector: 'id',
          view: 'name',
          type: 'select-multiple',
          effectedRows: ['subjectID', 'chapterID'],
        },
        {
          label: `subjects`,
          title: `${define.subjects}`,
          name: 'subjectID',
          idSelector: 'id',
          view: 'name',
          type: 'select-multiple',
          effectedRows: ['chapterID'],
        },
        {
          label: 'product-types',
          fetchlabel: 'productTypes',
          name: 'productType',
          idSelector: 'id',
          view: 'title',
          type: 'select-multiple',
          effectedRows: [],
        },
        {
          label: 'package-types',
          fetchlabel: 'packageTypes',
          name: 'packageType',
          idSelector: 'id',
          view: 'title',
          type: 'select-multiple',
          effectedRows: [],
        }]

      attributes.attributes && attributes.attributes.length > 0 && attributes.attributes.map(attr => {

        let fetcher = 'title'
        if (attr.referances) {
          fetcher = attr.referances.fetcher
        }

        filterAttributesSections.push({
          label: attr.slug,
          fetchlabel: fetcher,
          name: attr.slug,
          idSelector: 'id',
          view: fetcher,
          type: 'select',
          effectedRows: [],
          options: attr.values,
          className: "input-border sm:w-1/4"
        })
      })

      filterAttributesSections.push(
        {
          label: 'Search Product',
          name: 'search',
          type: 'text',
          effectedRows: [],
          className: "sm:w-full",
          placeholder: `Search product name here`
        })


      console.log(filterAttributesSections)

      this.setState({
        filterAttributesSections: filterAttributesSections
      })
    })

    data = await fetchAll('attributes', { offLimit: true });
    this.setState(data)


    var data = await fetchAll(this.state.modelTitle, { ...this.state.filters, 'forList': true });
    this.setState(data)

    // data = await updateAdditional('count-all', this.state.queryTitle, {});
    // this.setState(data)

    data = await fetchAll('product-types', { 'offLimit': true, forPackage: true });

    let packageIds = []
    data.productTypes.filter((productType) => {
      packageIds.push(JSON.stringify(productType.id))
    })

    let validities = await fetchAll('validities')
    validities = validities.validities



    this.setState({
      packageIds: packageIds,
      validities: validities
    })

    var imageLimits = await fetchAll('image-size-limits', { 'label': this.state.queryTitle });
    imageLimits = imageLimits.success = true ? imageLimits.sizes : {}
    this.setState({ fetching: false, imageLimits: imageLimits })

    if (this.state.hideHierarchy && this.state.hideHierarchy <= 2 && this.state.hideHierarchy > 0) {
      var data = await fetchAll('exams', { 'limit': 1, offset: 1, 'forList': true });
      if (data && data.exams && data.exams[0]) {
        this.setState({
          hierarchyDefaultValues: {
            ...this.state.hierarchyDefaultValues,
            examID: data.exams[0].id
          }
        })

        if (this.state.hideHierarchy == 2) {
          data = await fetchAll('courses', { 'limit': 1, offset: 1, 'forList': true, examID: data.exams[0].id });
          if (data && data.courses && data.courses[0]) {
            this.setState({
              hierarchyDefaultValues: {
                ...this.state.hierarchyDefaultValues,
                examID: data.courses[0].id
              }
            })
          }
        }
      }
    }
  }

  buildAddModel = () => {

    this.setState({
      displayModelTitle: `Add ${this.state.baseTitle}`,
      modelMode: null
    })

    let examID = this.state.hideHierarchy >= 1 ? [this.state.hierarchyDefaultValues.examID] : null
    let courseID = this.state.hideHierarchy >= 2 ? [this.state.hierarchyDefaultValues.courseID] : null


    let items = {
      'exam_ids': {
        datalabel: 'exams',
        dataname: 'examID',
        label: `${define.exam} Name`,
        error: { required: `Please select ${define.exam} Name` },
        name: 'exam_ids',
        idSelector: 'id',
        view: 'name',
        type: examID ? 'hidden' : 'select',
        className: examID ? '' : "sm:w-1/2",
        defaultValue: examID && `[${examID}]`,
        placeholder: 'Enter Exam Name',
        isMultiple: true,
        effectedRows: ['courseID', 'subjectID'],
        addNew: {
          baseTitle: define.exam,
          modelTitle: 'exams',
          queryTitle: 'exams',
        },
        onTab: 1
      },
      'course_ids': {
        datalabel: 'courses',
        dataname: 'courseID',
        label: `${define.course} Name`,
        error: { required: `Please select ${define.course} Name` },
        preFilters: { examID: examID ? examID : 'lock' },
        name: 'course_ids',
        idSelector: 'id',
        view: 'name',
        type: 'select',
        type: courseID ? 'hidden' : 'select',
        className: courseID ? '' : "sm:w-1/2",
        defaultValue: courseID && `[${courseID}]`,
        placeholder: 'Enter course Name',
        isMultiple: true,
        effectedRows: ['subjectID'],
        addNew: {
          baseTitle: define.course,
          modelTitle: 'courses',
          queryTitle: 'courses',
        },
        onTab: 1
      },
      'product_type_id': {
        datalabel: 'product-types',
        fetchlabel: 'productTypes',
        dataname: 'productTypeID',
        label: 'Product Type',
        error: { required: 'Please enter a valid Product Type' },
        name: 'product_type_id',
        idSelector: 'id',
        view: 'title',
        type: 'select',
        className: "sm:w-1/2",
        placeholder: 'Enter Product Type',
        isMultiple: false,
        effectedRows: [],
        onTab: 1,
        onChange: this.onProductTypeChange
      },
      'course_type_id': {
        datalabel: 'package-types',
        fetchlabel: 'packageTypes',
        dataname: 'packageTypeID',
        label: 'Package Type',
        error: { required: 'Please enter a valid Package Type' },
        name: 'course_type_id',
        idSelector: 'id',
        view: 'title',
        type: 'select',
        className: "sm:w-1/2",
        placeholder: 'Enter Package Type',
        isMultiple: false,
        effectedRows: [],
        onTab: 1,
        watchBy: "product_type_id",
        watchValues: this.state.packageIds
      },
      'subject_ids': {
        datalabel: 'subjects',
        dataname: 'subjectID',
        label: `${define.subject} Name`,
        error: { required: `Please select ${define.subject} Name` },
        preFilters: { examID: examID ? examID : 'lock', courseID: courseID ? courseID : [] },
        name: 'subject_ids',
        idSelector: 'id',
        view: 'name',
        type: 'select',
        className: "sm:w-1/2",
        placeholder: 'Enter subject Name',
        isMultiple: true,
        addNew: {
          baseTitle: define.subject,
          modelTitle: 'subjects',
          queryTitle: 'subjects',
        },
        effectedRows: ['chapterID'],
        onTab: 1,
        // watchBy: "product_type_id",
        // watchValues: this.state.packageIds
      },
      'chapter_ids': this.state.productBasedOn == 'CHAPTER' ? {
        datalabel: 'chapters',
        dataname: 'chapterID',
        label: `${define.chapter} Name`,
        preFilters: { examID: examID ? examID : 'lock', courseID: courseID ? courseID : [], subjectID: [] },
        name: 'chapter_ids',
        idSelector: 'id',
        view: 'name',
        type: 'select',
        className: "sm:w-1/2",
        placeholder: 'Enter chapter Name',
        isMultiple: true,
        effectedRows: [],
        addNew: {
          baseTitle: define.chapter,
          modelTitle: 'chapters',
          queryTitle: 'chapters',
        },
        onTab: 1,
        // watchBy: "product_type_id",
        // watchValues: this.state.packageIds
      } : {},
      'batch_ids': {
        datalabel: 'batches',
        dataname: 'batchID',
        label: `${define.batch} Name`,
        name: 'batch_ids',
        idSelector: 'id',
        view: 'title',
        type: 'select',
        className: "sm:w-1/2",
        placeholder: 'Enter batch Name',
        isMultiple: true,
        effectedRows: [],
        onTab: 1,
        watchBy: "product_type_id",
        watchValues: this.state.packageIds
      },

      // 'blank': {
      //   type: 'blank',
      //   content : <div className=""  ><div className=""></div></div >,
      'name': {
        label: 'Name',
        error: { required: 'Please enter a valid Name' },
        name: 'name',
        type: 'text',
        className: "sm:w-1/2",
        placeholder: 'Enter Name',
        onTab: 2
      },
      'slug': {
        label: 'Slug (Only letters with -)',
        name: 'slug',
        type: 'text',
        className: "sm:w-1/2",
        placeholder: 'Enter Slug',
        onTab: 2
      },

      'model': {
        label: 'Model',
        name: 'model',
        type: 'text',
        className: "sm:w-1/2",
        placeholder: 'Enter Name',
        onTab: 2
      },
      
      'cover_image': {
        label: 'Cover Image',
        name: 'cover_image',
        error: this.state.imageRequired == 'YES' ? { required: 'Please Choose an Image' } : null,
        ...this.state.imageLimits,
        fileTypes: ["jpg", "png", "jpeg"],
        type: 'image',
        className: "sm:w-1/3",
        onTab: 2,
        sizeRequired: true
      },
      'description': {
        label: 'Description',
        name: 'description',
        type: 'textarea',
        className: "w-full",
        placeholder: 'Enter Name',
        editor: true,
        onTab: 2
      },

      
      'details': {
        label: 'Details',
        type: 'multiple-fields',
        name: 'details',
        noError: true,
        fields: [
          {
            label: 'Label',
            name: 'label',
            type: 'text',
            // error: { required: 'Please enter a valid Label' },
            className: "sm:w-1/2 pb-3",
            placeholder: 'Enter label'
          },
          {
            label: 'Value',
            name: 'value',
            type: 'text',
            // error: { required: 'Please enter a valid Value' },
            className: "sm:w-1/3 pb-3",
            placeholder: 'Enter value'
          },
        ],
        className: "w-full flex flex-col lg:flex-row lg:flex-wrap  pb-5",
        placeholder: 'Enter Description',
        onTab: 2,
        box: true
      },
      'images': {
        label: 'Image',
        name: 'images',
        error: { required: 'Please Choose an Image' },
        ...this.state.imageLimits,
        fileTypes: ["jpg", "png", "jpeg"],
        type: 'multiple-image',
        className: "w-full",
        onTab: 4,
      },

    }

    items = this.randerAttr(items)

    return this.setState({
      storeFields: items,
      showModel: false
    })

  }

  onProductTypeChange = async (e) => {

    let productType = await fetchByID('product-types', e.value, { noLog: true, forActive: true })


    if (productType.productType && productType.productType.is_free == 1) {
      this.setState({ freeType: true })
    } else {
      this.setState({ freeType: false })
    }


    if (productType.productType && productType.productType.selling_on) {
      this.setState({ sellingOn: true })
    } else {
      this.setState({ sellingOn: false })
    }

    var items = this.state.storeFields;
    items = this.randerAttr(items, this.state.modelMode)

    this.setState({
      storeFields: items
    })

  }
  onAddSubmit = async (e) => {

    let data = await fetchAll('attributes', { offLimit: true });
    this.setState(data, async () => {
      var items = this.state.storeFields;
      items = await this.randerAttr(items, this.state.modelMode)

      this.setState({
        storeFields: items
      })
    })

  }

  randerAttr = (items, type = null) => {

    delete items.attributes

    let data = {};
    this.state.attributes.map((attribute, index) => {
      if (attribute.slug != 'batches') {
        if ((attribute.values && attribute.values.length > 0) || attribute.referance) {

          // if (attribute.slug == 'taxes') {
          //   attribute.title = 'Tax Type'
          // }

          var values = [];
          var attributeFetcher = [];

          attribute.values.map(value => {
            values.push({
              value: value.id,
              label: value.name ? value.name : value.title
            })
          })

          let addNew = null
          if (attribute.referances) {
            attributeFetcher = attribute.referances.fetcher ? attribute.referances.fetcher.split(',') : ['title']
            addNew = {
              baseTitle: attribute.title,
              modelTitle: attribute.referances.model == 'users' ? 'managements' :attribute.referances.model.replace('_', '-'),
              queryTitle: attribute.referances.model == 'users' ? 'managements' :attribute.referances.model,
              onSubmit: () => this.onAddSubmit().then(() => {
                return Object.values(this.state.storeFields)
              })
            }
          }

          let error = attribute.is_required == true ? { required: 'Please Select' } : null

          data = {
            ...data,
            [`${attribute.slug}`]: {
              datalabel: `${attribute.slug}`,
              dataname: type == 'edit' ? [`attributes[${attribute.slug}]`] : attribute.slug,
              error: error,
              label: attribute.title,
              name: type == 'edit' ? `attributes[${attribute.slug}][value_id]` : `${attribute.slug}[value_id]`,
              idSelector: 'id',
              view: attribute.referances ? attributeFetcher[0] : 'title',
              type: 'select',
              values: attribute.values,
              className: "sm:w-1/3  pb-3",
              placeholder: 'Enter Module Type',
              isMultiple: attribute.is_multiple == 0 ? false : true,
              onTab: 3,
              addNew: addNew,
              effectedRows: [],
            },
          }
        } else {
          if (attribute.applied_as == 'AUTOMATIC' && attribute.is_multiple == 0) {

            let error = attribute.is_required == true ? { required: 'Please Select' } : null
            data = {
              ...data,
              [`${attribute.slug}`]: {
                label: attribute.title,
                error: error,
                name: type == 'edit' ? `attributes[${attribute.slug}][value]` : `${attribute.slug}[value]`,
                type: 'text',
                className: "sm:w-1/3  pb-3",
                placeholder: `Enter ${attribute.title}`,
                isMultiple: attribute.is_multiple == 0 ? false : true,
                onTab: 3,
              },
            }
          } else {

            let error = attribute.is_required == true ? { required: 'Please Select' } : null
            data = {
              ...data,
              [`${attribute.slug}`]: {
                label: attribute.title,
                name: type == 'edit' ? `attributes[${attribute.slug}]` : `${attribute.slug}`,
                type: 'multiple-fields',
                error: error,
                fields: [
                  {
                    label: 'Label',
                    name: 'value',
                    type: 'text',
                    error: { required: 'Please enter a valid Label' },
                    className: "sm:w-1/3  pb-3",
                    placeholder: 'Enter label'
                  },
                ],
                className: "w-full flex flex-col lg:flex-row lg:flex-wrap",
                placeholder: 'Enter Description',
                onTab: 3,
              }
            }
          }
        }
      }
    })


    let validitiesData = []

    if (this.state.validities) {

      this.state.validities.map(branch => {
        validitiesData.push({
          label: branch.title,
          value: branch.id
        })
      })
    }

    data = {
      ...data,
      'amounthidden': {
        label: this.state.freeType ? 'Amount (Product type is free)' : 'Amount',
        name: 'amounthidden',
        type: this.state.freeType == true ? 'text' : 'hidden',
        className: this.state.freeType == true ? "sm:w-1/3  pb-3" : 'padding-0',
        placeholder: '0',
        onTab: 3,
        defaultValue: this.state.freeType == true ? null : 0,
        disabled: true,
      },
      'amount': {
        label: this.state.freeType ? 'Amount (Product type is free)' : 'Amount',
        error: this.state.freeType == true ? null : {
          required: 'Please enter a valid Amount',
          min: {
            value: 0,
            message: 'Amount count be minimum 1'
          },
        },
        name: 'amount',
        type: this.state.freeType == true ? 'hidden' : 'text',
        className: this.state.freeType == true ? '' : "sm:w-1/3  pb-3",
        placeholder: 'Enter Amount',
        onTab: 3,
        defaultValue: this.state.freeType == true ? 0 : null,
      },
      'tax_included': {
        label: 'Tax Included',
        name: 'tax_included',
        type: 'checkbox',
        className: "sm:w-1/3  pb-3",
        options: [
          {
            value: '1',
            label: 'Tax Included previously on amount'
          },
        ],
        placeholder: 'Enter Name',
        onTab: 3,
      },
      'is_upgradable': {
        label: 'Is Upgradable',
        name: 'is_upgradable',
        type: 'checkbox',
        className: "sm:w-1/3  pb-3",
        options: [
          {
            value: '1',
            label: 'Is This Product Upgradable'
          },
        ],
        placeholder: 'Enter Name',
        onTab: 3
      },
      'upgradable_details': {
        name: 'upgradable_details',
        label: 'Product Upgrade Variants',
        datalabel: 'upgradable_details',
        dataname: 'upgradable_details',
        type: 'multiple-fields',
        error: {},
        fields: [
          {
            label: 'Upgradable Amount',
            error: {
              required: 'Please enter a valid Amount',
              min: {
                value: 1,
                message: 'Upgradable Amount count be minimum 1'
              },
            },
            name: 'upgradable_amount',
            type: 'number',
            className: "sm:w-1/3  pb-3",
            placeholder: 'Enter Upgradable amount',
            onTab: 3,
          },
          {
            datalabel: 'upgradableDuration',
            dataname: 'upgradableDurationID',
            label: 'Upgradable Duration',
            error: { required: 'Please enter a valid validity' },
            name: 'upgradable_duration',
            idSelector: 'value',
            view: 'label',
            type: 'select',
            values: validitiesData,
            className: "sm:w-1/2  pb-3",
            placeholder: 'Enter validity',
            isMultiple: false,
            effectedRows: [],
            onTab: 3,
          },
        ],
        className: "w-full flex flex-col lg:flex-row lg:flex-wrap pb-3",
        placeholder: 'Enter Description',
        onTab: 3,
        watchBy: 'is_upgradable',
        watchValues: ['1'],
        btnName: 'Variant',
      },
      'product_url': this.state.sellingOn == true ? { type: "blank" } : {
        label: 'Product Redirect Url',
        name: 'product_url',
        type: 'text',
        className: "sm:w-1/3  pb-3",
        placeholder: 'Product Redirect url',
        onTab: 3,
      }

    }

    if (!type) {
      data = {
        'attributes': {
          label: 'Product Variant',
          type: 'multiple-fields',
          name: 'attributes',
          fields: [
            ...Object.values(data)
          ],
          className: "w-full flex flex-col lg:flex-row lg:flex-wrap  pb-5",
          placeholder: 'Enter Description',
          onTab: 3,
          box: true,
          btnName: 'Variant',
        }
      }
    }

    return items = {
      ...items,
      ...data
    }
  }

  randerEditModal = async (row) => {
    this.buildAddModel();

    let product = await fetchByID('products', row.id, { noLog: true, forActive: true })

    let productTypeData = await fetchByID('product-types', product.product.product_type_id, { noLog: true })

    if (productTypeData.productType && productTypeData.productType.is_free == 1) {
      this.setState({ freeType: true })
    } else {
      this.setState({ freeType: false })
    }

    this.setState({
      displayModelTitle: `Edit ${this.state.baseTitle} - ${row.title ? row.title : row.name}`,
      modelMode: 'edit'
    })

    let productType = await fetchAll('product-types', { 'offLimit': true, forPackage: true });

    let packageIds = []
    productType.productTypes.filter((productType) => {
      packageIds.push(JSON.stringify(productType.id))
    })


    let data = await fetchAll('attributes', { offLimit: true });
    this.setState({
      ...data,
      packageIds: packageIds
    }, async () => {

      var items = this.state.storeFields;
      items = this.randerAttr(items, "edit")


      Object.keys(items).map((key) => {

        items[key].defaultValue = product.product[key]
      })

      items.course_type_id.watchValues = packageIds
      items.subject_ids.watchValues = packageIds
      if (items.chapter_ids) {
        items.chapter_ids.watchValues = packageIds
      }
      items.batch_ids.watchValues = packageIds

      items.batch_ids.defaultValue = product.product && product.product.batches

      items.course_ids.preFilters = {
        examID: row.exam_ids && JSON.parse(row.exam_ids).length > 0 ? JSON.parse(row.exam_ids) : 'lock'
      }


      items.subject_ids.preFilters = {
        examID: row.exam_ids && JSON.parse(row.exam_ids).length > 0 ? JSON.parse(row.exam_ids) : 'lock',
        courseID: row.course_ids && JSON.parse(row.course_ids).length > 0 ? JSON.parse(row.course_ids) : 'lock'
      }


      if (items.chapter_ids) {
        items.chapter_ids.preFilters = {
          examID: row.exam_ids && JSON.parse(row.exam_ids).length > 0 ? JSON.parse(row.exam_ids) : 'lock',
          courseID: row.course_ids && JSON.parse(row.course_ids).length > 0 ? JSON.parse(row.course_ids) : 'lock',
          subjectID: row.subject_ids && JSON.parse(row.subject_ids).length > 0 ? JSON.parse(row.subject_ids) : 'lock'
        }
      }

      items.amount.defaultValue = (productTypeData.productType && productTypeData.productType.is_free == 1) ? 0 : items.amount.defaultValue


      if (items.cover_image.error) {
        delete items.cover_image.error.required;
      }

      items.cover_image = {
        ...items.cover_image,
        ...this.state.imageLimits
      }

      if ('id' in items) {
        items.id.defaultValue = product.product.id
      } else {
        items = {
          'id': {
            label: '',
            name: 'id',
            type: 'hidden',
            defaultValue: product.product.id,
            onTab: 1,
          },
          ...items
        }
      }

      this.setState({
        storeFields: items,
        showModel: true,
      })
    })


  }

  changeModalStatus = async () => {

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

    var product;
    var message;
    var added = false;

    if ('id' in data) {
      product = await edit(this.state.modelTitle, data, 'cover_image');
      message = `${this.state.baseTitle} Updated Successfully`
    } else {
      product = await add(this.state.modelTitle, data, 'cover_image');
      message = `${this.state.baseTitle} Added Successfully`
      added = true
    }


    // check Response
    if (product.updated) {
      toastr.success(message)

      if (added) {

        let body = {
          title: `New course is available for you ❤️`,
          body: `Open the app to check out the latest course ready for you!`,
          action: 'AllCourses'
        };

        let pushNotification = await add('push-notifications', body);
      }
      this.fetchList()

      this.setState({
        showModel: false
      })
    }
    else {
      let error;
      if (product.product) {
        error = product.product.error
      }
      else if (product.error.details) {
        error = product.error.details[0].message
      }
      else if (product.error) {
        error = product.error
      }
      toastr.error(error)
    }

  }

  // 
  componentDidMount() {
    this.fetchList();
    this.buildAddModel();
    // this.fetchBase();
  }

  // 
  render() {
    let data = this.state.products
    const columns = [
      {
        Header: 'Name',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              <span className="pt-1">{props.row.original.name}</span>
            </div>
          )
        },

      },
      {
        Header: 'Amount',
        Cell: props => {
          return (
            <div className="" >
              <span className="pt-1">₹ {props.row.original.amount}
              </span>
              <br />
              <Badge key={props.row.original.id} size='sm' color="bg-blue-400 text-white  mr-2 mb-2" rounded>
                {props.row.original.tax_included == 1 ? 'Tax Included' : 'Tax Excluded'}
              </Badge>
            </div>
          )
        },
      },
      {
        Header: 'Total Reviews',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              <span className="pt-1">{props.row.original.reviews ? props.row.original.reviews.length : 0}</span>
            </div>
          )
        },
      },
      {
        Header: 'Total Orders',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              <span className="pt-1">{props.row.original.orders ? props.row.original.orders : 0}</span>
            </div>
          )
        },
      },
    ]

    const filterObjects = this.state.filterAttributesSections

    // console.log(this.state.filterAttributes)




    // console.log(filterObjects)


    const steps = [
      {
        title: 'Categories',
        active: true,
        disabled: false,
        index: 1
      },
      {
        title: 'Details',
        active: false,
        disabled: true,
        index: 2
      },
      {
        title: 'Product Variant',
        active: false,
        disabled: true,
        index: 3
      },
      // {
      //   title: 'Images',
      //   active: false,
      //   disabled: false,
      //   index: 4
      // }
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
                  this.state.storeFields && this.state.storeFields != {} && <Validation items={Object.values(this.state.storeFields)} onSubmit={this.onStoreSubmit} alerts={false} steps={steps} />
                }

              </div>
            }
            useModel={this.state.showModel}
            hideModal={this.changeModalStatus}

          />
        }


        {console.log(this.state.filterAttributesSections)}

        <Widget
          title=""
          description=''>
          {this.state.filterAttributesSections && <Filter filterObjects={this.state.filterAttributesSections} filterOnChange={true} onFilter={this.onFilter} />}
          {
            this.state.fetching &&

            <Shimmer /> ||
            <Datatable
              columns={columns}
              deletable={this.props.contentDeletable}
              data={this.state.products}
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
              deletable={false}
              viewable={true}
            />
          }

        </Widget>


      </>

    )
  }

}
