import { Component } from 'react';
import { fetchAll, deleteData, updateAdditional, add, edit, get } from 'helpers/apiService';
import React from 'react'
import SectionTitle from 'components/functional-ui/section-title'
import Datatable from 'components/functional-ui/datatable'
import Shimmer from 'components/website/shimmer/datatable'
import Widget from 'components/functional-ui/widget'
import Filter from 'components/classical-ui/filters'
import toastr from 'toastr'
import define from 'src/json/worddefination.json'
import { FiEdit, FiDelete } from 'react-icons/fi'
import Tooltip from 'components/functional-ui/tooltips'
import StoreModel from 'components/functional-ui/modals/modal-store'
import DeleteModel from 'components/functional-ui/modals/modal-confirmation'
import * as Section from 'components/website/sections/first'
import { FiX } from 'react-icons/fi'
import { Badge, CircularBadge } from 'components/functional-ui/badges'
import dynamic from 'next/dynamic'
import WebLayout from 'layouts/website'
import Navbar1 from 'components/functional-ui/navbar'
import LeftSidebar1 from 'components/functional-ui/left-sidebar'
import Validation from 'components/functional-ui/forms/validation'
import Router from 'next/router'
import * as Icon from 'react-icons/fi'
import * as IconMD from 'react-icons/md'
import * as IconGI from 'react-icons/gi'
import * as IconBI from 'react-icons/bi'
import Sortable from 'sortablejs';
import sortJsonArray from 'sort-json-array'
//

export default class extends Component {
  state = {
    pageSections: [],
    values: {},
    defaultValues: {},
    search: '',
    id: null,
    delete: false,
    fetching: true,
    url: 'components/website/sections/first',
    filters: {
      limit: 10,
      offset: 0
    },
    storeFields: [], displayModelTitle: 'Add New',
    showModel: false,
    deleteModel: false,
    id: null,
    storeFilter: {},
    pages: {},
    baseTitle: 'Page',
    modelTitle: 'pages',
    queryTitle: 'pages',

  }

  static getInitialProps({ query }) {
    return query;
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
      let data = await fetchAll(`search/dashboard-search?field=pages&&searchKey=${e.target.value}`)
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
    var data = await fetchAll('pages', this.state.filters);
    this.setState(data)
    this.setState({ fetching: false })

    let pageDetail = await get('pages/getBySlug', { slug: `${this.props.slug}`, forEdit: true })
    this.setState({
      page: pageDetail.page,
    }, () => {

    })

    let pageSections = pageDetail.page.sections

    data = await fetchAll('sections', this.state.filters);
    this.setState(data)
    this.setState({ sections: data.sections })

    if (data.sections) {
      data.sections.map(section => {

        let pageSection = pageSections.filter(pageSection => pageSection.section_id == section.id)

        console.log(pageSection)
        if (!pageSection || pageSection.length == 0) {
          let preSection = {
            section_id: section.id,
            is_active: 1,
            style: null,
            section: section,
            position: pageSections.length + 1
          }
          pageSections.push(preSection)
        }

      })
    }

    this.setState({
      pageSections: pageSections,
      fetching: false
    }, () => {
      Section.prerenderer()
      Section.asignDefaultvalue(pageDetail.page.sections)
    })

  }


  // Function for delete data
  reorder = async (data) => {
    var update = await updateAdditional('re-indexing', 'pages', data)

    if (update.success == true) {
      toastr.success('Re-Indexing Successfull')
    }
  }

  buildAddModel = () => {

    this.setState({
      displayModelTitle: `Edit ${this.state.baseTitle} - ${this.state.page.title ? this.state.page.title : this.state.page.name}`
    })

    let items = {
      'id': {
        label: '',
        name: 'id',
        type: 'hidden',
        onTab: 1,
        defaultValue: this.state.page.id,
      },
      'title': {
        label: 'Page Title',
        error: { required: 'Please enter a valid Page Title' },
        name: 'title',
        type: 'text',
        className: "sm:w-1/2",
        placeholder: 'Enter Page Title',
        onTab: 1,
        defaultValue: document.getElementById(`pageTitleInput`) ? document.getElementById(`pageTitleInput`).value : this.state.page.title
      },
      'visibility': {
        datalabel: 'main_sections',
        dataname: 'visibility',
        label: 'Page visibility',
        name: 'visibility',
        idSelector: 'value',
        view: 'label',
        type: 'select',
        values: [
          {
            value: 'TOPNAV',
            label: 'Navigation bar'
          },
          {
            value: 'HEADER',
            label: 'Website Header'
          },
          {
            value: 'FOOTER',
            label: 'Website Footer'
          },
          {
            value: 'NONE',
            label: 'Do not display'
          }
        ],
        className: "sm:w-1/2",
        placeholder: 'Enter Page Type',
        isMultiple: false,
        effectedRows: ['pagesID'],
        defaultValue: this.state.page.visibility,
        onTab: 2
      },
      'parent_id': {
        datalabel: 'pages',
        dataname: 'pagesID',
        label: 'Parent Page',
        name: 'parent_id',
        idSelector: 'id',
        view: 'title',
        type: 'select',
        className: "sm:w-1/2",
        placeholder: 'Enter Parent Page',
        isMultiple: false,
        addNew: {
          baseTitle: 'Parent',
          modelTitle: 'pages',
          queryTitle: 'pages',
        },
        preFilters: { is_parent: 1 },
        defaultValue: this.state.page.parent_id,
        onTab: 2
      },

      'slug': {
        label: 'Page slug',
        // error: { required: 'Please enter a valid slug' },
        name: 'slug',
        type: 'text',
        className: "sm:w-1/2",
        placeholder: 'Enter slug (Ex : landing-page)',
        defaultValue: this.state.page.slug,
        onTab: 1
      },
      'target_blank': {
        label: 'Open page in new Tab',
        name: 'target_blank',
        type: 'checkbox',
        options: [{ value: 1, label: 'Open Page in new Page' }],
        className: 'sm:w-1/2',
        defaultValue: this.state.page.target_blank,
        onTab: 2
      },
      'login_required': {
        label: 'Login Required',
        name: 'login_required',
        type: 'checkbox',
        options: [{ value: 1, label: 'user Login Required for show page' }],
        className: 'sm:w-1/2',
        defaultValue: this.state.page.login_required,
        onTab: 2
      },
      // 'short_description': {
      //   label: 'Page short description',
      //   name: 'short_description',
      //   type: 'text',
      //   className: "sm:w-1/2",
      //   placeholder: 'Enter short_description',
      //   defaultValue: this.state.page.short_description
      // },
      // 'page_url': {
      //   label: 'Page Url (In case you have pre build Url)',
      //   name: 'page_url',
      //   type: 'text',
      //   className: "sm:w-1/2",
      //   placeholder: 'Enter page_url',
      //   defaultValue:this.state.page.page_url
      // },
      'keyword': {
        label: 'Page keyword',
        name: 'keyword',
        type: 'text',
        className: "w-full",
        placeholder: 'Enter keyword',
        defaultValue: this.state.page.keyword,
        onTab: 1
      },
      'description': {
        label: 'Page description',
        name: 'description',
        type: 'textarea',
        className: "w-full",
        placeholder: 'Enter description',
        defaultValue: this.state.page.description,
        onTab: 1
      },
      'image': {
        label: 'Image',
        name: 'image',
        ...this.state.imageLimits,
        fileTypes: ["jpg", "png", "jpeg"],
        type: 'image',
        className: "sm:w-1/2",
        defaultValue: this.state.page.image,
        onTab: 1
      }
    }
    return this.setState({
      storeFields: items,
      showModel: false
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

    var pages;
    var message;

    let pageSections = this.onStore()

    data.parent_id = data.parent_id == '' ? null : data.parent_id
    data.icon = data.icon == '' ? null : data.icon

    data.pageSections = pageSections

    console.log(pageSections)

    if ('id' in data) {
      pages = await edit('pages', data, 'image');
      message = 'Page Updated Successfully'
    } else {
      pages = await add('pages', data, 'image');
      message = 'Page Added Successfully'
    }


    // check Response
    if (pages.updated) {
      toastr.success(message)

      this.setState({
        showModel: false
      })

      // Router.push('/dashboard/pages')
    }
    else {
      let error;
      if (pages.pages) {
        error = pages.pages.error
      }
      else if (pages.error.details) {
        error = pages.error.details[0].message
      }
      else if (pages.error) {
        error = pages.error
      }
      toastr.error(error)
    }
  }

  onStore = () => {


    let pageSections = this.state.pageSections

    pageSections.map(pageSection => {

      delete pageSection.sectionData

      document.querySelectorAll(`[data-section-id='${pageSection.section_id}'][data-position='${pageSection.position}']`).forEach(section => {
        let section_id = pageSection.section_id
        let position = section.getAttribute('data-position')
        section.querySelectorAll("[contenteditable=true]").forEach(edit => {
          let type = edit.getAttribute('data-type')
          let id = edit.getAttribute('id')

          let data = ''
          let redirect_url = {}

          if (!type || type == 'textarea') {
            data = edit.innerHTML
          }
          if (type == 'image' && !edit.getAttribute('src-value')) {
            data = edit.src ? edit.src.replace(process.env.NEXT_PUBLIC_DOMAIN_URL, '') : null

            let parent = edit.parentElement

            if (parent.nodeName == 'A') {
              redirect_url = {
                url: parent.getAttribute('href'),
                target_blank: parent.getAttribute('target') ? 1 : 0
              }
            }
          }

          if (type == 'bg-image') {
            data = edit.style.backgroundImage ? edit.style.backgroundImage.replace(process.env.NEXT_PUBLIC_DOMAIN_URL, '') : null
          }

          else{
            
            let parent = edit.parentElement

            if (parent.nodeName == 'A') {
              redirect_url = {
                url: parent.getAttribute('href'),
                target_blank: parent.getAttribute('target') ? 1 : 0
              }
            }
          }

          // 
          let sectionData = {
            item_id: id,
            value: data,
            style: edit.getAttribute('data-styles'),
            redirect_url: redirect_url.url ? JSON.stringify(redirect_url) : null
          }

          if (pageSection) {

            // pageSections.position = position

            if (pageSection.sectionData) {
              pageSection.sectionData.push(sectionData)
            } else {
              pageSection.sectionData = [sectionData]
            }


            console.log(pageSections)

            this.setState({
              pageSections: pageSections
            })

          }

        })
      })

    })


    return pageSections
  }

  // Function for delete data
  delete = async () => {
    let deleteStatus = await deleteData('pages', JSON.stringify({ id: this.state.id }))
    if (deleteStatus.success == true) {
      toastr.success('Page Deleted Successfully')
      this.fetchList()
    }
    else {
      toastr.info("You can't delete this pages. To delete this, you first need to delete the associated components with the this Page.", 'Oops Sorry !',)
    }

    this.setState({ deleteModel: false })

  }

  // 
  componentDidMount() {
    // this.buildAddModel();
    this.fetchList();

    let thisRef = this

    Sortable.create(rootSection, {
      group: "sorting",
      sort: true,
      handle: ".sort-button",
      animation: 150,
      // draggable: ".section-base",
      dataIdAttr: 'section-index',
      store: {
        set: function (sortable) {
          var order = sortable.toArray();
          let pageSections = thisRef.onStore()
          order = order.map((value, key) => {
            pageSections[value].position = parseInt(key) + 1
          })

          thisRef.setState({
            pageSections: pageSections
          }, () => {
            Section.asignDefaultvalue(pageSections)

          })
        },
      },
    });


    // this.fetchBase();
  }



  // 
  render() {
    let data = this.state.pages

    const steps = [
      {
        title: 'Meta Information',
        active: true,
        disabled: false,
        index: 1
      },
      {
        title: 'Page Linking',
        active: false,
        disabled: true,
        index: 2
      },
    ]



    return (
      <>


        <Navbar1 />
        {/* <div id="editorjs"></div> */}
        {/* <SectionTitle title="Settings" subtitle="pages" onClick={this.changeModalStatus} /> */}

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
            className="w-50"
          />
        }


        {this.state.deleteModel && <DeleteModel
          title="Discard Changes"
          icon={
            <span className="h-10 w-10 bg-red-100 text-white flex items-center justify-center rounded-full text-lg font-display font-bold">
              <FiX size={18} className="stroke-current text-red-500" />
            </span>
          }
          body={
            <div className="text-sm text-gray-500">
              Are you sure you want to exit without saving the changes?
            </div>
          }
          buttonTitle="Discard"
          buttonClassName="btn btn-default btn-rounded bg-red-500 hover:bg-red-600 text-white"
          useModel={this.state.deleteModel}
          hideModal={() => this.setState({
            deleteModel: false
          })}
          onClick={() => {
            Router.push('/dashboard/pages')
          }}
        />
        }


        <div className="row border-bottom">

          <div className="button-submit bg-white col-5 offset-1  pl-5">
            <input type="text" className=" border-bottom-2 form-control border-top-0 border-left-0 border-right-0 mt-3 ml-5 w-75 title-input" id="pageTitleInput" placeholder="Page Title" defaultValue={this.state.page && this.state.page.title} />
          </div>
          <div className="col-3  mt-4 text-right float-right">
            <p onClick={() => {
              this.setState({
                deleteModel: true
              })
            }}><span className="border-bottom">Discard changes</span></p>
          </div>
          <div className="button-submit bg-white col-3 "><button className="my-2" onClick={() => this.changeModalStatus()}>Update Information And Publish</button></div>

        </div>

        <div>

          {/* {sortJsonArray(this.state.pageSections, 'position', 'asc')} */}
          <div className="root-section" id="rootSection">
            {this.state.pageSections && this.state.pageSections.map((preSection, i) => {


              let Import = Section[preSection.section.url]

              let inputTypes = {
                headingSecond: 'text',
                body: 'textarea'
              }

              return <>
                <div className="section-dynamic" section-index={`${i}`}>
                  <div className="shadow-sm px-3 py-1 bg-primary mb-1 rounded section-edi-option" >
                    <div className="row">

                      <div className="col p-2 text-white" onClick={() => {

                        // let newSection = preSection

                        let pageSections = this.onStore()

                        let newSection = this.state.sections.filter(section => section.id == preSection.section_id)
                        newSection = {
                          section_id: newSection[0].id,
                          is_active: 1,
                          style: null,
                          section: newSection[0],
                          position: pageSections.length + 1
                        }
                        pageSections.push(newSection)
                        this.setState({
                          pageSections: pageSections
                        }, () => {
                          Section.asignDefaultvalue(pageSections)
                          // this.reIndexing()

                          let elmnt = document.querySelector(`[section-index='${this.state.pageSections.length - 1}']`)
                          elmnt.scrollIntoView();
                        })
                      }}>
                        <IconBI.BiDuplicate size={18} />
                      </div>
                      <div className="col p-2 text-white sort-button">
                        <Icon.FiMove size={18} />
                      </div>
                      <div className="col p-2 text-white" onClick={() => {

                        let pageSections = this.onStore()

                        pageSections[i].is_active = pageSections[i].is_active == 1 ? 0 : 1
                        this.setState({
                          pageSections: pageSections
                        })
                      }}>
                        {preSection.is_active == 1 && <IconBI.BiShow size={18} /> || <IconBI.BiHide size={18} />}
                      </div>
                      {/* <div className="col p-2 text-white">
              <IconBI.BiFontColor size={18} />
            </div> */}
                      <div className="col p-2 text-white d-flex">
                        <IconBI.BiColorFill size={20} onClick={() => {

                          $(`#${`fontColorButton${preSection.section_id}${preSection.position}`}`).click();

                        }} />
                        <input type="color" id={`fontColorButton${preSection.section_id}${preSection.position}`} className="color-text" title="Change Font Color"
                          onChange={(e) => {
                            let element = document.querySelector(`[data-section-id='${preSection.section_id}'][data-position='${preSection.position}']`)
                            element.style.backgroundColor = e.target.value

                            let pageSections = this.onStore()

                            pageSections[i].style = JSON.stringify({
                              ...JSON.parse(pageSections[i].style),
                              'background-color': e.target.value
                            })

                            this.setState({
                              pageSections: pageSections
                            })

                            // element.setAttribute('data-styles', style)
                          }}
                        />

                      </div>
                      {/* <div className="col p-2 text-white">
              <IconGI.GiResize size={18} />
            </div> */}
                    </div>

                  </div>



                  <Import editable="true" sectionID={`${preSection.section_id}`} position={`${preSection.position}`} inputTypes={inputTypes} />
                </div>
              </>
            })}
          </div>

          {/* <div className="button-submit bg-white"><button className="my-2" onClick={() => this.changeModalStatus()}>Update Page</button></div> */}
        </div>


      </>

    )
  }

}
