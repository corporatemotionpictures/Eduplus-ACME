import { Component } from 'react';
import { fetchAll, deleteData, updateAdditional, add, edit } from 'helpers/apiService';
import React from 'react'
import SectionTitle from 'components/functional-ui/section-title'
import Datatable from 'components/functional-ui/datatable'
import Shimmer from 'components/website/shimmer/datatable'
import Widget from 'components/functional-ui/widget'
import toastr from 'toastr'
import define from 'src/json/worddefination.json'
import StoreModel from 'components/functional-ui/modals/modal-store'
import Validation from 'components/functional-ui/forms/validation'


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
        popupModels: {},
        storeFilter: {},
        imageLimits: {},
        baseTitle: 'Popup Model',
        modelTitle: 'popup-models',
        queryTitle: 'popup_models',
        displayModelTitle: 'Add New Popup'
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
        // data = await updateAdditional('count-all', this.state.queryTitle, {}
        // );
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
            displayModelTitle: `Add New banner`
        })

        

        let items = {
            // 'page_url': {
            //     label: 'Page Url',
            //     error: { required: 'Please enter a Page URL' },
            //     name: 'page_url',
            //     type: 'text',
            //     className: "w-full",
            //     placeholder: 'Enter Page URL'
            // },
            'page_url': {
                datalabel: 'pages',
                dataname: 'pageID',
                label: `Page `,
                error: { required: `Please select Page ` },
                name: 'page_url',
                idSelector: 'page_url',
                view: 'title',
                type: 'select',
                className: "sm:w-1/2",
                placeholder: 'Enter Exam Name',
                isMultiple: false,
                effectedRows: [],
                preFilters: { forSelectList: true },
              },
            'link': {
                label: 'Redirect Link',
                name: 'link',
                type: 'text',
                className: "sm:w-1/2",
                placeholder: 'Enter Page URL'
            },
            'image': {
                label: 'Image',
                name: 'image',
                error: { required: 'Please Choose an Image' },
                ...this.state.imageLimits,
                fileTypes: ["jpg", "png", "jpeg"],
                type: 'image',
                className: "sm:w-1/3",
            }
        }
        return this.setState({
            storeFields: items,
            showModel: false
        })

    }

    randerEditModal = (row) => {

        this.setState({
            displayModelTitle: `Edit ${this.state.baseTitle} - ${row.page_url}`

        })

        var items = this.state.storeFields;

        Object.keys(items).map((key) => {
            items[key].defaultValue = row[key]
        })

        delete items.image.error.required;

        items.image = {
            ...items.image,
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

        var pageModel;
        var message;

        if ('id' in data) {
            pageModel = await edit(this.state.modelTitle, data, 'image');
            message = `${this.state.baseTitle} Updated Successfully`
        } else {
            pageModel = await add(this.state.modelTitle, data, 'image');
            message = `${this.state.baseTitle} Added Successfully`
        }


        // check Response
        if (pageModel.updated) {
            toastr.success(message)
            this.fetchList()

            this.setState({
                showModel: false
            })
        }
        else {
            let error;
            if (pageModel.pageModel) {
                error = pageModel.pageModel.error
            }
            else if (pageModel.error.details) {
                error = pageModel.error.details[0].message
            }
            else if (pageModel.error) {
                error = pageModel.error
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
        let data = this.state.popupModels
        const columns = [

            {
                Header: 'Page URL',
                Cell: props => {
                    return (
                        <div className="flex flex-wrap justify-start items-start" >
                            <img
                                key={props.row.original.id}
                                src={props.row.original.image}
                                alt={window.localStorage.getItem('defaultImageAlt')}
                                className={`h-8 rounded-full max-w-full mr-2 mb-2`}
                            />
                            <span className="pt-1">{props.row.original.page_url}</span>
                        </div>
                    )
                },

            },
            {
                Header: 'Link',
                Cell: props => {
                    return (
                        <div className="flex flex-wrap justify-start items-start" >
                            <span className="pt-1">{props.row.original.link}</span>
                        </div>
                    )
                },

            },
        ]

        // const filterObjects = [
        //     {
        //         label: 'popupModels',
        //         name: 'bannerID',
        //         idSelector: 'id',
        //         view: 'name',
        //         type: 'select-multiple'
        //     }
        // ]

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
                    {
                        this.state.fetching &&

                        <Shimmer /> ||
                        <Datatable
                            columns={columns}
                            data={this.state.popupModels}
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
                            sortable={false}
                        />
                    }

                </Widget>


            </>

        )
    }

}
