import { Component } from "react";
import { fetchAll } from 'helpers/apiService';
import Select from 'react-select'
import MenuList from 'components/functional-ui/forms/reactSelectMenuList'


export default class Filter extends Component {

  state = {
    filterObject: {
      offLimit: true,
      forList: true
    },
    filterObjects: this.props.filterObjects,
    searchable: this.props.searchable ? this.props.searchable : false,
    defaultObject: [],
    items: [],
    selectdatas: [],
    showFilter: (this.props.hideBtn || window.innerWidth > 720) ? true : false
  }

  fetchData = async (effectedRows = null) => {
    let lists = this.state.filterObjects;
    var items = this.state.filterObject
    var selectdatasOotions = this.state.selectdatas

    lists.map(async (list) => {

      var item;
      if (!effectedRows || effectedRows.includes(list.name)) {

        delete items[list.name]
        let defaultValue = this.state.filterObject
        let defaultList = this.state.defaultObject


        items.listOnly = true


        if (!effectedRows && this.props.preFilters) {
          items = {
            ...items,
            ...this.props.preFilters
          }
        }
        if (list.type == 'select-multiple') {
          let data = await fetchAll(list.label, items);
          var values = []
          var defaults = []
          var lists = []
          let fetcher = data[list.fetchlabel ? list.fetchlabel : list.label]
          var selectdatas = this.state.selectdatas

          this.setState({
            selectdatas:
            {
              ...selectdatas,
              [`${list.label}`]: []
            }
          })


          fetcher && fetcher.map((value) => {
            let valueSingle = {
              value: value[list.idSelector],
              label: value[list.view]
            }

            values.push(valueSingle)

            if (this.state.filterObject != undefined && this.state.filterObject[list.name] != undefined && this.state.filterObject[list.name].includes(value[list.idSelector])) {
              defaults.push(valueSingle)
              lists.push(value[list.idSelector])
            }

            else if ((this.state.filterObject == undefined || this.state.filterObject[list.name] != undefined) && defaultValue[list.name] && defaultValue[list.name].includes(value[list.idSelector])) {
              defaults.push(valueSingle)
              lists.push(value[list.idSelector])
            }

            else if ((this.state.filterObject == undefined || this.state.filterObject[list.name] == undefined) && list.defaultValue && list.defaultValue.includes(value[list.idSelector])) {

              defaults.push(valueSingle)
              lists.push(value[list.idSelector])
            }




          })
          var selectdatas = this.state.selectdatas

          this.setState({
            filterObject: {
              ...this.state.filterObject,
              [`${list.name}`]: lists
            },
            defaultObject: {
              ...this.state.defaultObject,
              [`${list.name}`]: defaults
            },
            selectdatas:
            {
              ...selectdatas,
              [`${list.label}`]: values
            },

          })

        } else if (list.type == 'select') {
          var values = []
          var lists = []
          if (!list.options) {
            let data = await fetchAll(list.label, items);

            let fetcher = data[list.fetchlabel ? list.fetchlabel : list.label]
            
            fetcher && fetcher.map((value) => {
              let valueSingle = {
                value: value[list.idSelector],
                label: value[list.view]
              }

              if (this.state.filterObject[list.name] && (Array.isArray(this.state.filterObject[list.name]) ? this.state.filterObject[list.name].includes(value[list.idSelector]) : this.state.filterObject[list.name] == value[list.idSelector])) {
                lists.push(value[list.idSelector])
              }
              else if ((this.state.filterObject == undefined || this.state.filterObject[list.name] == undefined) && list.defaultValue && list.defaultValue == value[list.idSelector]) {

                // defaults.push(valueSingle)
                lists.push(value[list.idSelector])
              }

              values.push(valueSingle)


            })
          } else {
           let  fetcher = list.options

            fetcher && fetcher.map((value) => {
              let valueSingle = {
                value: value[list.idSelector] ? value[list.idSelector] : value['value'],
                label: value[list.view] ? value[list.view] : value['label']
              }
  
              values.push(valueSingle)
  
            })

            selectdatasOotions = {
              filterObject: {
                ...selectdatasOotions.filterObject,
                [`${list.name}`]: lists
              },
              selectdatas: {
                ...selectdatasOotions.selectdatas,
                [`${list.label}`]: values
              },
            }

          }

          var selectdatas = this.state.selectdatas

          this.setState({
            filterObject: {
              ...this.state.filterObject,
              [`${list.name}`]: lists
            },
            selectdatas:
            {
              ...selectdatas,
              [`${list.label}`]: values
            },
          })
        }
      }
    })


    this.setState({
      filterObject: {
        ...this.state.filterObject,
        ...selectdatasOotions.filterObject,
      },
      selectdatas:
      {
        ...this.state.selectdatas,
        ...selectdatasOotions.selectdatas
      },
    })


    if (this.props.filterOnChange) {
      this.onFilter()
    }


  }


  // 
  selectChange = (selectedOption, name, effectedRows) => {

    var options = []


    if (selectedOption != null) {
      selectedOption.map(option => {
        options.push(option.value)
      })

    }

    var objects = this.state.filterObject

    if ('offlimit' in objects) {

    } else {
      objects.offLimit = true
    }



    this.setState({
      defaultObject: {
        ...this.state.defaultObject,
        [`${name}`]: selectedOption
      },
      filterObject: {
        ...objects,
        [`${name}`]: options
      }
    }, () => {
      this.fetchData(effectedRows);
      if (this.props.filterOnChange) {
        this.onFilter()
      }
    });



  };

  // 
  onChange = (e, effectedRows) => {

    var objects = this.state.filterObject

    if ('offlimit' in objects) {

    } else {
      objects.offLimit = true
    }
    this.setState({
      filterObject: {
        ...objects,
        [`${e.target.name}`]: e.target.value
      }
    }, () => {
      this.fetchData(effectedRows);
      if (this.props.filterOnChange) {
        this.onFilter()
      }
    });
  };

  // 
  onFilter = (e) => {

    var filters = this.state.filterObject
    delete filters['offLimit']
    delete filters['listOnly']
    delete filters['forList']

    filters.offset = 0
    filters.limit = this.props.limit ? this.props.limit : 10
    this.props.onFilter(filters)
  };

  randerHtml = (html) => {
    return html
  }

  componentDidMount() {

    if (this.props.preFilters) {
      this.setState({
        filterObject: {
          offLimit: true,
          forList: true,
          ...this.props.preFilters
        }
      }, () => {
        this.fetchData()
      })
    } else {
      this.fetchData()
    }

  }

  getAsyncOptions = (inputValue, stateOptions) => {
    return new Promise((resolve, reject) => {
      const filtered = _.filter(stateOptions, o =>
        _.startsWith(_.toLower(o.label), _.toLower(inputValue))
      );
      resolve(filtered.slice(0, 3));
    });
  }

  render() {
    return (
      <>

        {

          this.state.filterObjects && this.state.filterObjects.length > 0 &&
          <>
            {(!(this.props.hideBtn || window.innerWidth > 720) && !this.props.showFilter && this.state.filterObjects.length > 1) && <button className="  btn btn-default btn-outlined bg-transparent text-base hover:text-blue-700 border-blue-500 hover:border-blue-700 md:mx-2 mb-2" onClick={() => {
              this.setState({
                showFilter: !this.state.showFilter
              })
            }} >
              <i class="fas fa-filter mr-1"></i>
              {this.state.showFilter == true ? ' Hide Filters' : ' Filters'}
            </button>}
            {(this.state.showFilter == true || this.props.showFilter || this.state.filterObjects.length == 1) && <div className={this.props.forRow ? `flex flex-row flex-wrap  row items-center ` : `flex flex-col md:flex-row md:flex-wrap  row`}>
              {this.state.filterObjects.map((item, i) => {
                if (item.type === 'checkbox') {
                  return (
                    <div className={`form-element w-full  sm:w-1/2 md:p-2 col ${item.className ? item.className : 'md:w-1/4'}`}>
                      {item.label && <label className="form-label capitalize capitalize text-capitalized color-inherit">{item.title ? item.title : item.label}</label>}
                      <div className="flex items-center justify-start space-x-2">
                        {item.options.map((option, j) => (
                          <label className="flex items-center justify-start space-x-2">
                            <input
                              ref={item.ref}
                              type="checkbox"
                              onChange={(e) => this.onChange(e)}
                              value={option.value}
                              name={item.name}

                              checked={option.value == this.state.filterObject[item.name] ? true : ''}
                              className={`form-checkbox h-4 w-4`}
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                }
                if (item.type === 'radio') {
                  return (
                    <div className={`form-element w-full  sm:w-1/2 md:p-2 col ${item.className ? item.className : 'md:w-1/4'} `}>
                      {item.label && <label className="form-label capitalize text-capitalized color-inherit">{item.title ? item.title : item.label}</label>}
                      <div className="flex items-center justify-start space-h5">
                        {item.options.map((option, j) => (
                          <label className="flex items-center justify-start space-x-2">
                            <input
                              type="radio"
                              onChange={(e) => this.onChange(e)}
                              value={option.value}
                              name={item.name}
                              defaultValue={this.state.defaultObject}
                              defaultChecked={option.value == this.state.filterObject[item.name] ? true : ''}
                              ref={register({ required: true })}
                              className={`form-radio h-4 w-4`}
                            />

                          </label>
                        ))}
                      </div>
                    </div>
                  )
                }
                if (item.type === 'select') {
                  return (
                    this.state.selectdatas[item.label] && <div className={`form-element w-full  sm:w-1/2 md:p-2 col ${item.className ? item.className : 'md:w-1/4'}`}>
                      {item.label && <label className="form-label capitalize text-capitalized color-inherit">{item.title ? item.title : item.label}</label>}
                      <select
                        ref={item.ref}
                        name={item.name}
                        onChange={(e) => this.onChange(e, item.effectedRows)}
                        defaultValue={this.state.filterObject[item.name] ? this.state.filterObject[item.name] : (item.defaultValue ? item.defaultValue : null)}
                        className={`form-select ? 'border border-red-500' : ''}`}>
                        <option key={null} value='' >
                          All
                        </option>
                        {this.state.selectdatas[item.label].map((option, j) => (
                          <option key={j} value={option.value} >
                            {option.label}
                          </option>
                        ))}
                      </select>

                    </div>
                  )
                }
                if (item.type === 'select-multiple') {
                  return (
                    this.state.selectdatas[item.label] &&
                    <div className={`form-element w-full  sm:w-1/2 md:p-2 col ${item.className ? item.className : 'md:w-1/4'} `}>
                      {item.label && <label className="form-label capitalize text-capitalized color-inherit">{item.title ? item.title : item.label}</label>}
                      <Select
                        // className={`form-select`}
                        theme={theme => ({
                          ...theme,
                          borderRadius: 0,
                        })}
                        isClearable={true}
                        ref={item.ref}
                        name={item.name}
                        value={this.state.defaultObject[item.name] != undefined ? this.state.defaultObject[item.name] : []}
                        options={this.state.selectdatas[item.label]}
                        isMulti={true}
                        components={this.state.selectdatas[item.label] && this.state.selectdatas[item.label].length > 500 ? { MenuList } : false}
                        onChange={(e) => this.selectChange(e, item.name, item.effectedRows)}
                        defaultValue={this.state.defaultObject[item.name] != undefined ? this.state.defaultObject[item.name] : []}
                        isLoading={!this.state.selectdatas || !this.state.selectdatas[item.label]}
                      />
                    </div>
                  )
                }

                if (item.type === 'blank') {
                  return this.randerHtml(item.content)
                }


                else {
                  return (<>
                    <div className={`form-element w-full  sm:w-1/2 md:p-2 col ${item.className ? item.className : 'md:w-1/4'} `}>

                      {item.label && <label className="form-label capitalize text-capitalized color-inherit"> <span>{item.labelIcon && item.labelIcon}</span> <span>{item.title ? item.title : item.label}</span></label>}
                      <div className="flex">
                        <input
                          ref={item.ref}
                          name={item.name}
                          type={item.type}
                          value={this.state.filterObject[item.name]}
                          onChange={(e) => this.onChange(e, item.effectedRows)}
                          className={`form-input ${item.InputclassName ? item.InputclassName : ''}`}
                          placeholder={item.placeholder}
                          id={item.name}
                        />
                        {item.clearButton && <button className="btn btn-default bg-base text-white " onClick={() => {
                          if (this.state.filterObject[item.name]) {
                            let filter = this.state.filterObject
                            filter[item.name] = ''
                            this.setState({
                              filterObject: filter
                            }, () => {
                              this.onFilter()
                              document.getElementById(item.name).value = ''
                            })
                          }
                        }}>X</button>}
                      </div>
                    </div>
                  </>)
                }
              })
              }
            </div>}

            {!this.props.filterOnChange && <button className="  btn btn-default btn-outlined bg-transparent text-base hover:text-blue-700 border-blue-500 hover:border-blue-700 float-right md:mx-2 mb-2" onClick={() => this.onFilter()}>
              Apply Filter
            </button>}
          </>
        }
      </>
    )
  }
}
