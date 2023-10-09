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
        storeFields: [], displayModelTitle: 'Add New',
        showModel: false,
        deleteModel: false,
        id: null,
        webSliders: {},
        storeFilter: {},
        imageLimits: {},
        baseTitle: 'Web Sliders',
        modelTitle: 'web-sliders',
        queryTitle: 'web_sliders',
        displayModelTitle: 'Add New Banner'
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
            'upper_title': {
                label: 'Upper Title',
                name: 'upper_title',
                type: 'text',
                className: "sm:w-1/3",
                placeholder: 'Enter Upper Title'
            },
            'lower_title': {
                label: 'lower title',
                name: 'lower_title',
                type: 'text',
                className: "sm:w-1/3",
                placeholder: 'Enter lower title'
            },
            'sub_title': {
                label: 'sub title',
                name: 'sub_title',
                type: 'text',
                className: "sm:w-1/3",
                placeholder: 'Enter sub title'
            },
            'button_text': {
                label: 'button Text',
                name: 'button_text',
                type: 'text',
                className: "sm:w-1/3",
                placeholder: 'Enter Button Text'
            },
            'app_button': {
                label: 'Button redirect to play store',
                name: 'app_button',
                type: 'radio',
                options: [{ value: 1, label: 'Yes' }, { value: 0, label: 'No' }],
                className: "sm:w-1/3",
                placeholder: 'Enter Description',
                defaultValue: 0
            },
            'button_url': {
                label: 'Button Url',
                name: 'button_url',
                type: 'text',
                className: "sm:w-1/3",
                placeholder: 'Enter Button Url',
                watchBy: "app_button",
                watchValues: ["0"]
            },
            'banner_type': {
                label: 'Banner Type',
                name: 'banner_type',
                type: 'radio',
                options: [{ value: 'IMAGE', label: 'Image' }, { value: 'VIDEO', label: 'Video' }],
                className: "sm:w-1/3",
                placeholder: 'Enter Description',
                defaultValue: 'IMAGE'
            },
            'image': {
                label: 'Image',
                name: 'image',
                error: { required: 'Please Choose an Image' },
                ...this.state.imageLimits,
                fileTypes: ["jpg", "png", "jpeg"],
                type: 'image',
                className: "sm:w-1/3",
                watchBy: "banner_type",
                watchValues: ["IMAGE"]
            },
            'video': {
                label: 'Video',
                name: 'video',
                error: { required: 'Please Choose an Image' },
                ...this.state.imageLimits,
                maxfilesize: 500,
                fileTypes: [".mp4"],
                type: 'video',
                className: "sm:w-1/3",
                watchBy: "banner_type",
                watchValues: ["VIDEO"]
            }
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


        if (items.image) {
            delete items.image.error.required;

            items.image = {
                ...items.image,
                ...this.state.imageLimits
            }
        } if (items.video) {
            delete items.video.error.required;

            items.video = {
                ...items.video,
            }
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

        var banner;
        var message;


        var file = 'image'

        if (data.banner_type == 'VIDEO') {
            file = 'video'

            delete data.duration
        }

        if ('id' in data) {
            banner = await edit(this.state.modelTitle, data, file);
            message = `${this.state.baseTitle} Updated Successfully`
        } else {
            banner = await add(this.state.modelTitle, data, file);
            message = `${this.state.baseTitle} Added Successfully`
        }


        // check Response
        if (banner.updated) {
            toastr.success(message)
            this.fetchList()

            this.setState({
                showModel: false
            })
        }
        else {
            let error;
            if (banner.banner) {
                error = banner.banner.error
            }
            else if (banner.error) {
                error = banner.error.details ? banner.error.details[0].message : banner.error
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
        let data = this.state.webSliders
        const columns = [

            {
                Header: 'title',
                Cell: props => {
                    return (
                        <>
                            {
                                props.row.original.banner_type == 'IMAGE' && <div className="flex flex-wrap justify-start items-start" >
                                    <img
                                        key={props.row.original.id}
                                        src={props.row.original.image}
                                        alt={window.localStorage.getItem('defaultImageAlt')}
                                        className={`h-8  max-w-full mr-2 mb-2`}
                                    />
                                </div> ||
                                <div className="flex flex-wrap justify-start items-start" >
                                    <video controls className={`h-8  max-w-full mr-2 mb-2`}>
                                        <source src={props.row.original.video} type="video/mp4" />
                                    </video>
                                </div>


                            }
                        </>
                    )
                },

            },
            {
                Header: 'Upper title',
                Cell: props => {
                    return (
                        <div className="flex flex-wrap justify-start items-start" >
                            <span className="pt-1">{props.row.original.upper_title}</span>
                        </div>
                    )
                },

            },
            {
                Header: 'Lower title',
                Cell: props => {
                    return (
                        <div className="flex flex-wrap justify-start items-start" >
                            <span className="pt-1">{props.row.original.lower_title}</span>
                        </div>
                    )
                },

            },
            {
                Header: 'button text',
                Cell: props => {
                    return (
                        <div className="flex flex-wrap justify-start items-start" >
                            <span className="pt-1">{props.row.original.button_text}</span>
                        </div>
                    )
                },

            },
            {
                Header: 'button url',
                Cell: props => {
                    return (
                        <div className="flex flex-wrap justify-start items-start" >
                            <span className="pt-1">{props.row.original.app_button == 1 ? 'PlayStore Url' : props.row.original.button_url}</span>
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
                    {
                        this.state.fetching &&

                        <Shimmer /> ||
                        <Datatable
                            columns={columns}
                            data={this.state.webSliders}
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
                            approvable={true}
                        />
                    }

                </Widget>


            </>

        )
    }

}
