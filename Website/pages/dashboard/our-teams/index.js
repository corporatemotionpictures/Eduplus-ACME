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
    ourTeams: [],
    storeFilter: {},
    imageLimits: {},
    baseTitle: 'Our Team',
    modelTitle: 'our-teams',
    queryTitle: 'our_teams',
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
        label: 'Name',
        error: { required: 'Please enter a valid name' },
        name: 'name',
        type: 'text',
        className: "sm:w-1/2",
        placeholder: 'Enter name'
      },
      'designation': {
        label: 'designation',
        error: { required: 'Please enter a valid designation' },
        name: 'designation',
        type: 'text',
        className: "sm:w-1/2",
        placeholder: 'Enter designation'
      },
      'contact_url': {
        label: 'Contact Url',
        name: 'contact_url',
        type: 'text',
        className: "w-full",
        placeholder: 'Enter Contact Url'
      },
      'image': {
        label: 'image',
        error: { required: 'Please enter a valid image' },
        name: 'image',
        type: 'image',
        className: "sm:w-1/3",
        placeholder: 'Enter image'
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

    delete items.image.error.required;

    Object.keys(items).map((key) => {
      items[key].defaultValue = row[key]
    })

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

    var ourTeam;
    var message;


    if ('id' in data) {
      ourTeam = await edit(this.state.modelTitle, data , 'image');
      message = `${this.state.baseTitle} Updated Successfully`
    } else {
      ourTeam = await add(this.state.modelTitle, data , 'image');
      message = `${this.state.baseTitle} Added Successfully`
    }


    // check Response
    if (ourTeam.updated) {
      toastr.success(message)
      this.fetchList()

      this.setState({
        showModel: false
      })
    }
    else {
      let error;
      if (ourTeam.ourTeam) {
        error = ourTeam.ourTeam.error
      }
      else if (ourTeam.error) {
        error = ourTeam.error.details ? ourTeam.error.details[0].message : ourTeam.error
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
    let data = this.state.ourTeams
    const columns = [

      {
        Header: 'Name',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
            <img
              key={props.row.original.id}
              src={props.row.original.image}
              alt={window.localStorage.getItem('defaultImageAlt')}
              className={`h-8 rounded-full max-w-full mr-2 mb-2`}
            />
            <span className="pt-1">{props.row.original.name}</span>
          </div>
          )
        },

      },
      {
        Header: 'Designation',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              <span className="pt-1">{props.row.original.designation}</span>
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
              data={this.state.ourTeams}
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
            />
          }

        </Widget>


      </>

    )
  }

}
