import { Component } from 'react';
import { fetchAll, deleteData, updateAdditional, add, edit, fileUpload } from 'helpers/apiService';
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
import moment from 'moment'
import { Badge, CircularBadge } from 'components/functional-ui/badges'

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
    gallery: [],
    storeFilter: {},
    imageLimits: {},
    baseTitle: define.gallery,
    modelTitle: 'gallery',
    queryTitle: 'gallery',
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
    //     data = await updateAdditional('count-all', this.state.queryTitle, {  }
    // );
    //     this.setState(data)

    var imageLimits = await fetchAll('image-size-limits', { 'label': this.state.queryTitle });
    imageLimits = imageLimits.success = true ? imageLimits.sizes : {}
    this.setState({ fetching: false, imageLimits: imageLimits })
  }

  buildAddModel = () => {

    this.setState({
      displayModelTitle: `Add ${this.state.baseTitle}`
    })


    let items = {
      'name': {
        label: 'name',
        error: { required: 'Please enter a valid name' },
        name: 'name',
        type: 'text',
        className: "sm:w-1/2",
        placeholder: 'Enter Title'
      },
      // 'supplier': {
      //   label: 'supplier',
      //   error: { required: 'Please enter a valid supplier' },
      //   name: 'supplier',
      //   type: 'text',
      //   className: "sm:w-1/2",
      //   placeholder: 'Enter Title'
      // },
      'date': {
        label: 'date',
        error: { required: 'Please enter a valid date' },
        name: 'date',
        type: 'date',
        className: "sm:w-1/2",
        placeholder: 'Enter Title'
      },
      'description': {
        label: 'Description',
        error: { required: 'Please enter a valid description' },
        name: 'description',
        type: 'textarea',
        className: "w-full",
        placeholder: 'Enter description'
      },
      'cover_image': {
        label: 'Cover Image',
        name: 'cover_image',
        error: { required: 'Please Choose an Image' },
        ...this.state.imageLimits,
        fileTypes: ["jpg", "png", "jpeg"],
        type: 'image',
        className: "sm:w-1/3",
      },
      'images': {
        label: 'Images',
        name: 'images',
        error: { required: 'Please Choose an Image' },
        ...this.state.imageLimits,
        fileTypes: ["jpg", "png", "jpeg"],
        type: 'multiple-image',
        className: "w-full",
      },
    }
    return this.setState({
      storeFields: items,
      showModel: false
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

    items.date.defaultValue = moment(row.date).format('YYYY-MM-DD')

    delete items.cover_image.error.required;
    delete items.images.error.required;

    items.cover_image = {
      ...items.cover_image,
      ...this.state.imageLimits
    }

    items.images.defaultValue = JSON.parse(row.images)

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

    delete items.video;

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

    var gallery;
    var message;
    var added = false;


    let images = data.images

    delete data.images

    if (images && images.length > 0) {

      let paths = []

      for (let i = 0; i < Object.values(images).length; i++) {
        let image = Object.values(images)[i]
        let path = await fileUpload(this.state.modelTitle, null, image, 'images')

        paths.push(path.path)
      }
      data.images = JSON.stringify(paths)

    }




    if ('id' in data) {
      gallery = await edit(this.state.modelTitle, data, 'cover_image');
      message = `${this.state.baseTitle} Updated Successfully`

    } else {

      gallery = await add(this.state.modelTitle, data, 'cover_image');
      message = `${this.state.baseTitle} Added Successfully`
      added = true
    }

    // check Response
    if (gallery.updated) {
      toastr.success(message)

      this.fetchList()

      this.setState({
        showModel: false
      })
    }
    else {
      let error;
      if (gallery.gallery) {
        error = gallery.gallery.error
      }
      else if (gallery.error.details) {
        error = gallery.error.details[0].message
      }
      else if (gallery.error) {
        error = gallery.error
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
    let data = this.state.gallery
    const columns = [
      {
        Header: 'Name',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              {props.row.original.name}
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
          {/* <Filter filterObjects={filterObjects} filterOnChange={true} onFilter={this.onFilter} /> */}
          {
            this.state.fetching &&

            <Shimmer /> ||
            <Datatable
              columns={columns}
              deletable={this.props.contentDeletable}
              data={this.state.gallery}
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
              viewable={true}
            />
          }

        </Widget>

      </>

    )
  }

}
