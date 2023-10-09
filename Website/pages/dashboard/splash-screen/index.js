import { Component } from 'react';
import { fetchAll, deleteData, updateAdditional, splashUpload, edit } from 'helpers/apiService';
import React from 'react'
import SectionTitle from 'components/functional-ui/section-title'
import Widget from 'components/functional-ui/widget'
import toastr from 'toastr'
import define from 'src/json/worddefination.json'
import { UnderlinedTabs, VerticalTabs } from 'components/functional-ui/tabs'
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
            offset: 0,
            whereIn: ['SplashScreen']
        },
        storeFields: [], displayModelTitle: 'Add New',
        showModel: false,
        deleteModel: false,
        id: null,
        banners: {},
        storeFilter: {},
        imageLimits: {},
        baseTitle: 'Splash Screen',
        modelTitle: 'splash-screen',
        queryTitle: 'splash-screen',
        displayModelTitle: 'Add New Banner',
        img: '/cdn/splash/splash-screen.png'
    }

    static getInitialProps({ query }) {
        return query;
    }
    // Function for fetch data
    fetchList = async () => {

        var imageLimits = await fetchAll('image-size-limits', { 'label': this.state.queryTitle });
        imageLimits = imageLimits.success = true ? imageLimits.sizes : {}
        this.setState({ imageLimits: imageLimits })


        var data = await fetchAll('settings', { ...this.state.filters, 'forList': true });

        let items = {}
        let setting = data.settings[0]
        setting.childs = {}

        if (setting.type == 'radio') {

        }

        setting.childrens.map((child, i) => {
            let palatters = {}

            if (setting.key == 'palatters') {

                if (i > 0) {
                    palatters = {
                        ...JSON.parse(window.localStorage.getItem('palatters')),
                        [`${child.key}`]: child.value
                    }
                } else {
                    palatters = {
                        [`${child.key}`]: child.value
                    }
                }


                window.localStorage.setItem('palatters', JSON.stringify(palatters))
                window.dispatchEvent(new Event('storage'))
            }

            if (child.type == 'multiple-fields') {
                setting.childs[child.key] = {
                    label: child.label,
                    type: 'multiple-fields',
                    name: child.id,
                    fields: [{
                        // label: 'Title',
                        name: child.key,
                        type: 'text',
                        className: "w-5/6",
                        placeholder: `Enter ${child.key}`
                    }],
                    className: `${child.className} flex flex-row flex-wrap pb-2`,
                    extraclassName: " border-b-2  mb-5",
                    placeholder: 'Enter Description',
                    defaultValue: JSON.parse(child.value),
                    // btnName: child.label
                    btnType: 'icon',
                }
            }
            else {

                setting.childs[child.key] = {
                    label: child.label,
                    name: child.id,
                    type: child.type,
                    className: `${child.className}`,
                    defaultValue: child.value,
                    placeholder: `Enter ${child.label}`
                }


                if (child.type == 'radio') {
                    setting.childs[child.key].options = []
                    child.reference.split(',').map(ref => {
                        setting.childs[child.key].options.push({ value: ref, label: ref })
                    })

                }



                if (child.type == 'image') {
                    let img = this.state.imageTypes.length > 0 ? this.state.imageTypes : []
                    img = [...this.state.imageTypes, child.id]
                    this.setState({
                        imageTypes: img
                    })
                }
            }

            if (child.watch && child.watch != '') {
                let watch = JSON.parse(child.watch)
                setting.childs[child.key].watchBy = watch.watchBy
                setting.childs[child.key].watchValues = [watch.watchValues]
                // setting.childs[child.key].watchBy = "51"
                // setting.childs[child.key].watchValues = ['MSG91']


            }
        })

        setting.childs['file'] = {
            label: 'Image',
            name: 'file',
            ...imageLimits,
            fileTypes: ["png"],
            type: 'image',
            className: " justify-center  sm:w-1/3",
            defaultValue: "/uploads/splash/splash-screen.png",
            imageAftrClass: "sm:w-1/3 h-auto",
            imageprev: "after",
        }



        this.setState({ settings: [setting] })
        this.setState({ fetching: false })


    }


    onStoreSubmit = async (data) => {


        if (data.file && data.file[0]) {
            let splash = await splashUpload('splash', data.file)
        }
        delete data.file

        var setting;
        var message;
        var images = [];

        setting = await edit('settings', data, this.state.imageTypes);
        message = `${this.state.baseTitle} Updated Successfully`


        // check Response
        if (setting.updated) {
            toastr.success(message)
            this.fetchList()

            this.setState({
                showModel: false
            })
        }
        else {
            let error;
            if (setting.setting) {
                error = setting.setting.error
            }
            else if (setting.error) {
                error = setting.error.details ? setting.error.details[0].message : setting.error
            }
            toastr.error(error)
        }
    }


    // 
    componentDidMount() {
        this.fetchList();
        // this.fetchBase();
    }

    // 
    render() {
        const items = [
            {
                label: 'Image',
                name: 'file',
                error: { required: 'Please Choose an Image' },
                ...this.state.imageLimits,
                fileTypes: ["png"],
                type: 'image',
                className: " justify-center  sm:w-1/3",
                defaultValue: "/uploads/splash/splash-screen.png",
                imageAftrClass: "w-auto h-auto",
                imageprev: "after",
            }
        ]


        const settingsData = []


        this.state.settings && Object.values(this.state.settings).map((setting, index) => {
            let data = {
                index: index,
                title: (
                    <>
                        {/* <FiHeart size={18} className="stroke-current" /> */}
                        {/* <span className="">{setting.label}</span> */}
                    </>
                ),
                content: (
                    <div className="sm:px-4 w-full">
                        <Validation items={Object.values(setting.childs)} onSubmit={this.onStoreSubmit} alerts={false} />
                    </div>
                )
            }

            settingsData.push(data)
        })

        let data = this.state.settings

        return (
            <>
                <SectionTitle title={this.props.parentName ? this.props.parentName : 'Dashbaord'} subtitle={`${this.state.baseTitle}`} onClick={this.changeModalStatus} hideButton={true} />

                <Widget
                    title=""
                    description=''>
                    {screen.width <= 767 && <div className="block lg:hidden tab-border">
                        <UnderlinedTabs tabs={settingsData} />
                    </div>}
                    {screen.width > 767 && <div className="hidden lg:block tab-border">
                        <UnderlinedTabs tabs={settingsData} />
                    </div>}

                </Widget>


            </>

        )
    }

}
