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
import PopupModel from 'components/functional-ui/modals/modal-popup'
import { Badge, CircularBadge } from 'components/functional-ui/badges'
import moment from 'moment'
import { FiLink, FiX, FiMail, FiPhone, FiArrowRight } from 'react-icons/fi'
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
            offset: 0,
            status: 'ADDED',
            applyLimit: true,
            forList: true,
        },
        modelImage: null,
        userModel: false,
        modelTitle: 'carts',
        storeFields: [],
        displayModelTitle: 'Add New',
        showModel: false,
        deleteModel: false,
        id: null,
        carts: [],
        storeFilter: {},
        imageLimits: {},
        baseTitle: 'Products In Cart',
        modelTitle: 'carts',
        queryTitle: 'carts',
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
        this.setState({ fetching: false })
    }

    openPopup = async (user) => {
        this.setState({
            userdata: user,
            userModel: true
        })
    }




    // 
    componentDidMount() {
        this.fetchList();
        // this.fetchBase();
    }

    // 
    render() {
        let data = this.state.carts
        const columns = [

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
                Header: 'Product Name',
                Cell: props => {
                    return <div> {props.row.original.product.name} </div>
                },
            },
            {
                Header: 'Amount',
                Cell: props => {
                    return <div> ₹{props.row.original.amount} </div>
                },
            },
            {
                Header: 'Payment Initation Status',
                Cell: props => {
                    return <div>
                        {
                            props.row.original.payment_initiated_on && <span className='text-white border-0 text-center rounded w-20 p-1 bg-red-500 text-white'>Payment Initiated</span>
                            || <span className='text-white border-0 text-center rounded w-20 p-1 bg-green-500 text-white'>Not Initiated</span>
                        }
                    </div>
                },
            },
            {
                Header: 'Payment Initiated On',
                Cell: props => {
                    return <div>
                        {props.row.original.payment_initiated_on}
                    </div>
                },
            },
            {
                Header: 'Added To Cart At',
                Cell: props => {
                    var date = moment(props.row.original.created_at).format('MMMM Do YYYY, h:mm:ss a')
                    return <div> {date} </div>
                },
            },
        ]


        const filterObjects = [

            {
                label: 'users',
                name: 'userIDs',
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
                label: 'Payment Initiatiation Status',
                name: 'paymentIntiation',
                type: 'select',
                options: [

                    {
                        value: "YES", 'label': 'Payment Initiated Products',
                    },
                    {
                        value: 'NO', 'label': 'Not Payment Initiated Products',
                    },

                ],
                effectedRows: []
            },
        ]

        return (
            <>
                <SectionTitle title={this.props.parentName ? this.props.parentName : 'Dashbaord'} subtitle={`${this.state.baseTitle}`} onClick={this.changeModalStatus} hideButton={true} />

                {this.state.userModel && <UserModel
                    user={this.state.userdata}
                    closeModal={() => { this.setState({ userModel: false }) }}
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

                {
                    this.state.modelOpen && this.state.modelImage && <PopupModel image={this.state.modelImage} link={null} />
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
                            data={this.state.carts}
                            paginationClick={this.fetchByOffset}
                            pageSizedata={this.state.filters.limit}
                            pageIndexdata={(this.state.filters.offset / this.state.filters.limit)}
                            pageCountData={this.state.totalCount}
                            baseTitle={this.state.baseTitle}
                            modelTitle={this.state.modelTitle}
                            queryTitle={this.state.queryTitle}
                            randerEditModal={this.randerEditModal}
                            fetchList={this.fetchList}
                            sectionRow={false}
                            approvable={false}
                            status={false}
                            sortable={false}
                            editable={false}
                            deletable={false}

                        />
                    }

                </Widget>


            </>

        )
    }

}
