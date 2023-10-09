import { useForm, useFieldArray } from 'react-hook-form'
import Alert from 'components/functional-ui/alerts'
import Select, { Option, ReactSelectProps } from 'react-select'
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { fetchAll, deleteData, updateAdditional, add, edit } from 'helpers/apiService';
import { isStarted } from 'nprogress';
import 'intl-tel-input/build/css/intlTelInput.css';
import intlTelInput from 'intl-tel-input';
import { FiMinus, FiPlus } from 'react-icons/fi';

// Fuction for get image file dimentions
const getDimension = async (file) => {
  let reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onerror = () => {
      reader.abort();
      reject(new DOMException("Problem parsing input file."));
    };
    reader.onload = () => {
      var image = new Image();
      image.src = reader.result;
      image.onload = function () {
        resolve({ width: this.width, height: this.height });
      };
    };
    reader.readAsDataURL(file);
  });
};

const ValidationFront = ({ items, onSubmit, alerts, steps = null, buttonText = "Save and Update Information", btnClass = null }) => {
  // use Form
  const { handleSubmit, errors, register, unregister, watch, getValues, setValue } = useForm({ shouldUnregister: true, })
  // define states
  const [fetchFirst, setFetchFirst] = useState(true)
  const [multipleFields, setMultipleFields] = useState([])
  const [multipleTableFields, setMultipleTableFields] = useState([])
  const [defaultvalues, setDefaultvalues] = useState({})
  const [selectedFile, setSelectedFile] = useState()
  const [preview, setPreview] = useState()
  const [filterObject, setFilterObject] = useState({ offLimit: true })
  const [filterPlaneObject, setFilterPlaneObject] = useState({})
  const [selectdatas, setSelectdatas] = useState({})
  const [defaultSelectObject, setDefaultSelectObject] = useState({})
  const [changed, setChanged] = useState([])
  const [effectedRows, setEffectedRows] = useState(false)
  const [defaultPlane, setDefaultPlane] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [videoDuration, setVideoDuration] = useState(null)
  const [openTab, setOpenTab] = useState(1)
  const [telError, settelError] = useState(true)
  const [stepData, setStepData] = useState({})
  const [additionaInput, setadditionaInput] = useState({})
  const watchAllFields = watch();
  // Call first time when component rander
  useEffect(() => {
    async function getInnerdata() {
      if (items != undefined && fetchFirst == true) {
        let fields = {}
        let tableFields = {}


        items.map(item => {
          if (item.type === 'multiple-fields') {
            {
              fields = {
                ...fields,
                [`${item.name}`]: item.defaultValue ? Array.from(Array(item.defaultValue.length).keys()) : [1]
              }
            }
          }
          if (item.type === 'multiple-table-fields') {
            {
              tableFields = {
                ...tableFields,
                [`${item.name}`]: item.defaultValue ? Array.from(Array(item.defaultValue.length).keys()) : [1]
              }
            }
          }
          if (item.type == 'tel') {


            // here, the index maps to the error code returned from getValidationError - see readme
            var errorMap = ["Invalid number", "Invalid country code", "Too short", "Too long", "Invalid number"]

            // window.intlTelInputGlobals.loadUtils("build/js/utils.js");

            const input = document.querySelector("#phone");
            var countryCode = intlTelInput(input, {
              separateDialCode: true,
              preferredCountries: ["in"],

              nationalMode: false,
              utilsScript:
                "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js?1613236686837",
              // any initialisation options go here
            });

            setadditionaInput({
              country_prefix: '91'
            })



            input.addEventListener("countrychange", function () {
              // do something with iti.getSelectedCountryData()
              var countryData = countryCode.getSelectedCountryData();

              setadditionaInput({
                ...additionaInput,
                country_prefix: countryData.dialCode
              })

              console.log(countryData)

              if(item.onChange){
                item.onChange(countryData.dialCode, countryData.name)
              }

            });


            $('#phone').change(() => {

              settelError(!countryCode.isValidNumber())
              // let value = getValues(item.name)

              // countryCode.setNumber(value)

            })
          }
        })
        await setMultipleFields(fields)
        await setMultipleTableFields(tableFields)
        await fetchData(items)
        // applyCkeditor()
      }
    }

    getInnerdata()

    return () => { setFetchFirst(false) }
    // free memory when ever this component is unmounted
  }, [fetchFirst])

  // Get data used by select fields
  const fetchData = async (items, effectedRows = null) => {

    var DataLists = selectdatas
    var Defalutvalues = defaultSelectObject
    var filterObjectParam = {
      ...filterObject
    }

    setChanged(false)

    let lists = items;
    var items = []
    lists.map(async (listarr) => {

      let array = []
      if (listarr.type == 'multiple-fields') {
        array = listarr.fields
      } else {
        array.push(listarr)
      }

      for (let i = 0; i < array.length; i++) {

        let list = array[i]
console.log(list)
        if (list.type == 'select') {
          if (!effectedRows || effectedRows.includes(list.dataname)) {

            var currentFilter = filterObject[list.dataname]

            var fetcher;

            if (filterObjectParam == {}) {
              filterObjectParam = null
            }

            console.log(list.values)

            if (list.values) {
              fetcher = list.values;

            } else {


              let finalFilter = {
                ...filterObject
              }

              if (list.preFilters) {
                finalFilter = {
                  ...list.preFilters,
                  ...filterObject
                }
              }

              if (finalFilter) {
                delete finalFilter[list.dataname]
              }

              finalFilter.offLimit = true

              let data = await fetchAll(list.datalabel, finalFilter);
              fetcher = data[list.fetchlabel] ? data[list.fetchlabel] : data[list.datalabel]
            }

            var values = []
            var defaults = []
            let objects = []

            if (list.isMultiple) {
              values.push({
                label: "Select all",
                value: "*"
              })
            } else {
              values.push({
                label: "None",
                value: ""
              })
            }

            let ids = fetcher.filter(fet => fet.id)

            if (DataLists == undefined) {
              DataLists = {
                [`${list.datalabel}`]: []
              }
            } else {
              DataLists = {
                ...DataLists,
                [`${list.datalabel}`]: []
              }
            }

            let multivalues = []

            fetcher && fetcher.map((value) => {

              let valueSingle = {
                value: value[list.idSelector],
                label: value[list.view],
              }


              values.push(valueSingle)

              DataLists = {
                ...DataLists,
                [`${list.datalabel}`]: values
              }

              if (listarr.type == 'multiple-fields' && listarr.defaultValue) {

                listarr.defaultValue.map((defaultAttr, i) => {
                  if (defaultAttr[list.name] &&
                    ((list.isMultiple == true && typeof defaultAttr[list.name] === "string" && (listarr[defaultAttr.name].includes('[') ? JSON.parse(listarr[defaultAttr.name]).indexOf(value[list.idSelector]) >= 0 : listarr[defaultAttr.name].includes(value[list.idSelector]))) || defaultAttr[list.name] == value[list.idSelector] || defaultAttr[list.name] == '*')) {

                    if (!filterObject[`${listarr.name}[key${i}]`]) {
                      filterObject[`${listarr.name}[key${i}]`] = {}
                    }
                    if (!defaultSelectObject[`${listarr.name}[key${i}]`]) {
                      defaultSelectObject[`${listarr.name}[key${i}]`] = {}
                    }
                    if (filterObject[`${listarr.name}[key${i}]`][`${list.dataname}`]) {
                      filterObject[`${listarr.name}[key${i}]`][`${list.dataname}`].push(value[list.idSelector])
                    } else {
                      filterObject[`${listarr.name}[key${i}]`][`${list.dataname}`] = [value[list.idSelector]]
                    }

                    if (defaultSelectObject[`${listarr.name}[key${i}]`][`${list.datalabel}`]) {
                      defaultSelectObject[`${listarr.name}[key${i}]`][`${list.datalabel}`].push(valueSingle)
                    } else {
                      defaultSelectObject[`${listarr.name}[key${i}]`][`${list.datalabel}`] = [valueSingle]
                    }

                  }
                })
              }


              if ((filterObjectParam == undefined || currentFilter == undefined) &&
                list.defaultValue &&
                ((list.isMultiple == true && typeof list.defaultValue === "string" && (list.defaultValue.includes('[') ? JSON.parse(list.defaultValue).indexOf(value[list.idSelector]) >= 0 : list.defaultValue.includes(value[list.idSelector]))) || list.defaultValue == value[list.idSelector] || list.defaultValue == '*')) {
                defaults.push(valueSingle)
                objects.push(value[list.idSelector])

              } else {

                if (currentFilter && currentFilter.includes(value[list.idSelector])) {

                  defaults.push(valueSingle)
                  objects.push(value[list.idSelector])

                }

              }
            })


            if (listarr.type == 'multiple-fields') {

              Defalutvalues = {
                ...Defalutvalues,
                ...defaultSelectObject
              }

              filterObjectParam = {
                ...filterObjectParam,
                ...filterObject
              }


            } else {

              Defalutvalues = {
                ...Defalutvalues,
                [`${list.datalabel}`]: defaults
              }

              filterObjectParam = {
                ...filterObjectParam,
                [`${list.dataname}`]: objects
              }
            }


            await setFilterObject(filterObjectParam)
            await setDefaultSelectObject(Defalutvalues)
            setSelectdatas(DataLists)
          }
        }
      }
    })

  }

  // Fuction performs on multiple select field change
  const selectChange = async (selectedOption, name, label, effectedRows, parent = null) => {
    var options = []
    var defaults = []

    if (selectedOption) {
      if (selectedOption.length != undefined && selectedOption != null) {

        if (selectedOption.filter(option => option.value == '*'))
          if (selectedOption.filter(option => option.value == '*').length > 0) {

            selectedOption = selectdatas[label].filter(option => option.value != '*')
          }


        selectedOption.map(option => {
          options.push(option.value)
        })
      } else {
        options.push(selectedOption.value)
      }
    }

    var objects = filterObject
    var SelectObject = defaultSelectObject

    if (parent) {
      setFilterObject({
        ...objects,
        [`${parent}`]: {
          ...objects[parent],
          [`${name}`]: options,
        }
      });

      setDefaultSelectObject({
        ...SelectObject,
        [`${parent}`]: {
          ...SelectObject[parent],
          [`${label}`]: selectedOption,
        }
      });


    }
    else {
      setFilterObject({
        ...objects,
        [`${name}`]: options,
      });

      setDefaultSelectObject({
        ...SelectObject,
        [`${label}`]: selectedOption,
      });
    }




    setEffectedRows(effectedRows)
    setChanged(true)
  };

  // Fuction performs on plane select field change
  const selectPlaneChange = async (selectedOption, name) => {
    var options = []
    if (selectedOption) {
      if (selectedOption.length != undefined && selectedOption != null) {
        selectedOption.map(option => {
          options.push(option.value)
        })
      } else {
        options.push(selectedOption.value)
      }
    }
    var objects = filterObject
    setFilterPlaneObject({
      ...objects,
      [`${name}`]: options,
    });
    setDefaultPlane({
      ...defaultPlane,
      [`${name}`]: selectedOption,
    })
  };

  // call when select field chnaged (for change depended fields data)
  useEffect(() => {
    if (changed == true) {
      return async () => { await fetchData(items, effectedRows) }
    }
    setEffectedRows([])
    return () => { setChanged(false) }
  }, [changed])

  // Reset value for on chnage multiple fileds
  useEffect(() => {
    items.map(data => {
      if (data.type == 'multiple-fields') {
        multipleFields[data.name] && multipleFields[data.name].length > 0 && multipleFields[data.name].map((j) => {
          data.fields.map(field => {
            let value = defaultvalues[`${data.name}`] != undefined && defaultvalues[`${data.name}`][`key${j}`] != undefined ? defaultvalues[`${data.name}`][`key${j}`][`${field.name}`] : (data.defaultValue != undefined && data.defaultValue[`${j}`] != undefined ? data.defaultValue[`${j}`][`${field.name}`] : '')
            let input = `${data.name}[key${j}][${field.name}]`
            setValue(input, value)
          })
        })
      }
    })

    return () => { console.log('true') }
  }, [defaultvalues])

  // call on  select file effect
  useEffect(() => {
    if (!selectedFile) {
      setPreview(undefined)
      return () => { console.log('true') }
    }
    const objectUrl = URL.createObjectURL(selectedFile)
    setPreview(objectUrl)
    // free memory when ever this component is unmounted
    return () => { URL.revokeObjectURL(objectUrl) }
  }, [selectedFile])

  // call on  select file effect
  const onSelectFile = async (e, width, height, name) => {
    let validate = true
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(undefined)
      return
    }
    // I've kept this example simple by using the first image instead of multiple
    await setSelectedFile(e.target.files[0])
  }

  // Append data for multiple fieds
  const append = (e, name) => {
    let array = multipleFields[name];
    e.preventDefault()
    let last = multipleFields[name][multipleFields[name].length - 1]
    last = last ? last : 0
    array.push(parseInt(last) + 1)
    setMultipleFields({
      ...multipleFields,
      [`${name}`]: array
    })
  }
  //Remove data for multiple fields
  const remove = (e, data, i) => {
    e.preventDefault()
    setDefaultvalues(getValues())
    data.fields.map(field => {
      unregister(`${data.name}[key${i}][${field.name}]`)
    })
    let last = multipleFields[data.name].filter(key => key != i);
    setMultipleFields({
      ...multipleFields,
      [`${data.name}`]: last ? last : 0
    })
    setDefaultvalues(getValues())
  }


  // Reset value for on chnage multiple fileds
  function applyCkeditor() {
    // var ckEditor = document.getElementById('ckEditor');
    // if (ckEditor != undefined && ckEditor != null) {
    //   ClassicEditor
    //     .create(document.querySelector('#ckEditor'))
    //     .catch(error => {
    //       console.error(error);
    //     });
    // }
  }
  // on form submit
  const onSubmitFn = async (data) => {
    if (steps != undefined && openTab != (steps.length)) {
      setStepData({
        ...stepData,
        ...data
      })
      setOpenTab(openTab + 1)
    } else {
      if (stepData && Object.keys(stepData).length > 0) {
        data = {
          ...stepData,
          ...data
        }
      }
      Object.keys(data).map(d => {
        if (data[d] == '')
          data[d] = null
      })
      if (onSubmit) {

        data = {
          ...additionaInput,
          ...data,
        }
        onSubmit(data)
      }
    }
  }
  // Register validation conditional
  items = items.map(item => {
    if (item.type == 'file') {

      item['error'].validate = async (value) => {
        if (value.length > 0) {
          const fileTypes = item.fileTypes ? item.fileTypes : null;
          const fileType = (value && value.length > 0 && value[0].name) ? value[0].name.split(".")[1] : '';
          if (fileTypes && !fileTypes.includes(fileType)) {
            return `please upload a valid file format. (${fileTypes})`;
          }
          var message = '';

          const fileSize = Math.round(value[0].size / 1024);
          if (item.maxfilesize && fileSize > item.maxfilesize) {
            return "file size must be lower than ".concat(item.maxfilesize).concat(' KB');
          }
        }
      }
    }
    if (item.type == 'image') {

      item['error'].validate = async (value) => {
        if (value.length > 0) {
          const fileTypes = item.fileTypes ? item.fileTypes : null;
          const fileType = (value && value.length > 0 && value[0].name) ? value[0].name.split(".")[1] : '';
          if (fileTypes && !fileTypes.includes(fileType)) {
            return `please upload a valid file format. (${fileTypes})`;
          }
          var message = '';
          const sizes = await getDimension(value[0]);
          if (item.maxWidth && sizes.width > item.maxWidth) {
            message += 'Image width must be less the'.concat(item.maxWidth).concat('. ')
          }
          if (item.maxHeight && sizes.height > item.maxHeight) {
            message += 'Image height must be less the'.concat(item.maxheight).concat('. ')
          }
          if (item.minWidth && sizes.width < item.minWidth) {
            message += 'Image width must be greater the'.concat(item.minWidth).concat('. ')
          }
          if (item.minHeight && sizes.height < item.minHeight) {
            message += 'Image height must be greater the'.concat(item.minHeight).concat('. ')
          }
          if (item.width && sizes.width != item.width) {
            message += 'Image width must be '.concat(item.width).concat('. ')
          }
          if (item.height && sizes.height != item.height) {
            message += 'Image height must be '.concat(item.height).concat('. ')
          }
          if (message != '') {
            return message;
          }
          const fileSize = Math.round(value[0].size / 1024);
          if (item.maxfilesize && fileSize > item.maxfilesize) {
            return "file size must be lower than ".concat(item.maxfilesize);
          }
        }
      }
    }

    if (item.type == 'select') {
      if (item['error'] == undefined) {
        item['error'] = {}
      }
      item['error'].validate = async (value) => {
        if (value == '[]') {
          return `This Field is required`;
        }
      }
    }

    if (item.type == 'tel' &&  item['error']) {
      item['error'].validate = async (value) => {
        if (telError) {
          return `Invalid Mobile Number`;
        }
      }
    }

    if (item.type == 'multiple-fields') {
      item.fields.map(field => {
        field['ref'] = register(field['error'])
      })
    }
    if (item.type == 'multiple-table-fields') {
      item.fields.map(field => {
        field['ref'] = register(field['error'])
      })
    }
    if (item.type == 'multiple-fields') {
      item.fields.map(field => {
        field['ref'] = register(field['error'])
      })
    }

    item['ref'] = register(item['error'])
    return item
  })

  function randerHtml(html) {
    return html
  }







  // Setup form
  return (
    <>
      <div className=" row">
        {steps && steps.map((tab, key) => (
          <div
            key={key}
            className="items-center justify-center">
            <button
              disabled={openTab < tab.index ? tab.disabled : false}
              onClick={() => {
                setValue(stepData)
                setOpenTab(tab.index)
              }}
              className={`btn btn-default btn-block ${openTab === tab.index
                ? 'bg-base text-white'
                : tab.valid
                  ? 'bg-green-500 text-white'
                  : ''
                }`}
              type="button">
              {tab.title}
            </button>
          </div>
        ))}
      </div>
      <form
        onSubmit={handleSubmit(onSubmitFn)}
        className="" encType="multipart/form-data">
        {/* conditin for if alert whood be shown */}
        {alerts &&
          items.map((item, i) => {
            if (!errors[item.name]) return null
            let msg = errors[item.name].message
            if (msg.length === 0) msg = `${item.label} is required`
            return (
              <div className="col-12 col-sm-12 col-md-12 form-group">
                {errors[item.name] && (
                  <div className="mb-2" key={i}>
                    <Alert
                      color="bg-transparent border-danger text-danger"
                      borderLeft
                      raised>
                      {msg}
                    </Alert>
                  </div>
                )}
              </div>
            )
          })}
        {/* Staart for fields */}
        <div className="row">
          {items.map((item, i) => {
            if (item.type === 'blank') {
              return randerHtml(item.content)
            }
            if (item.type === 'checkbox') {
              return (
                (item.watchBy == undefined || (watchAllFields[item.watchBy] && item.watchValues.includes(watchAllFields[item.watchBy]))) &&
                (!steps || (item.onTab && openTab === item.onTab)) &&
                <div className={` form-group ${item.className} `}>
                  {
                    item.breakTop &&
                    <hr className="mb-3">
                    </hr>
                  }
                  {item.label && <label><b>{item.label}</b></label>}
                  <div className="">
                    {item.options.map((option, j) => (
                      <label className="">
                        <input
                          ref={item.ref}
                          type="checkbox"
                          onChange={item.onChnage ? (e) => item.onChange(e) : null}
                          value={option.value}
                          name={item.name}
                          key={option.id}
                          defaultChecked={option.value == item.defaultValue}
                          className={`form-checkbox form-control ${errors[item.name] ? 'text-danger' : ''
                            }`}
                        />
                        <span
                          className={`${errors[item.name] ? 'text-danger' : ''
                            }`}>
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  {
                    item.breakBottom &&
                    <hr className="mb-3">
                    </hr>
                  }
                </div>
              )
            }
            if (item.type === 'radio') {
              return (
                (item.watchBy == undefined || (watchAllFields[item.watchBy] && item.watchValues.includes(watchAllFields[item.watchBy]))) &&
                (!steps || (item.onTab && openTab === item.onTab)) &&
                <div className={`  ${item.className} form-group`} >
                  {
                    item.breakTop &&
                    <hr className="mb-3">
                    </hr>
                  }
                  {item.label && <label className="form-label"><b>{item.label}</b></label>}
                  <div className="">
                    {item.options.map((option, j) => (
                      <label className={`${item.fullWidth ? 'w-full' : ''}`}>
                        <input
                          type="radio"
                          defaultChecked={option.value == item.defaultValue}
                          key={option.id}
                          onChange={item.onChange ? (e) => item.onChange(e) : null}
                          value={option.value}
                          name={item.name}
                          ref={item.ref}
                          className={`form-radio h-4 w-4 ${errors[item.name] ? 'text-danger' : ''
                            }`}
                        />
                        <span
                          className={`${errors[item.name] ? 'text-danger' : ''
                            }`}>
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  {
                    item.breakBottom &&
                    <hr className="mb-3">
                    </hr>
                  }
                </div>)
            }
            if (item.type === 'select') {
              return (
                (item.watchBy == undefined || (watchAllFields[item.watchBy] && item.watchValues.includes(watchAllFields[item.watchBy]))) &&
                (!steps || (item.onTab && openTab === item.onTab)) &&
                <div className={`  ${item.className} form-group`}>
                  {
                    item.breakTop &&
                    <hr className="mb-3">
                    </hr>
                  }
                  {item.label && <label className="form-label"><b>{item.label}</b></label>}
                  <input
                    ref={item.ref}
                    name={item.name}
                    type='text'
                    value={filterObject[item.dataname] && ((!filterObject[item.dataname].includes('[') && item.isMultiple == true) ? `[${filterObject[item.dataname]}]` : `${filterObject[item.dataname]}`)}
                    placeholder={item.placeholder}
                    hidden={true}
                    key={item.name}
                    readOnly={true}
                  />
                  <Select
                    className={`form-select ${errors[item.name] ? 'border border-danger' : ''}`}
                    value={defaultSelectObject ? defaultSelectObject[item.datalabel] : []}
                    options={selectdatas ? selectdatas[item.datalabel] : []}
                    isMulti={item.isMultiple}
                    placeholder={item.placeholder}
                    onChange={item.onChange ? (e) => { item.onChange; selectChange(e, item.dataname, item.datalabel, item.effectedRows) } : (e) => selectChange(e, item.dataname, item.datalabel, item.effectedRows)}
                    defaultValue={defaultSelectObject ? defaultSelectObject[item.datalabel] : []}
                    key={`${item.name} select`}
                  />
                  {!alerts && errors[item.name] && (
                    <div className="form-error text-danger">{errors[item.name].message}</div>
                  )}
                  {
                    item.breakBottom &&
                    <hr className="mb-3">
                    </hr>
                  }
                </div>
              )
            }
            if (item.type === 'select-plane') {
              return (
                (item.watchBy == undefined || (watchAllFields[item.watchBy] && item.watchValues.includes(watchAllFields[item.watchBy]))) &&
                (!steps || (item.onTab && openTab === item.onTab)) &&
                <div className={`  ${item.className} form-group`}>
                  {
                    item.breakTop &&
                    <hr className="mb-3">
                    </hr>
                  }
                  {item.label && <label className="form-label"><b>{item.label}</b></label>}
                  <input
                    ref={item.ref}
                    name={item.name}
                    type='text'
                    value={filterPlaneObject[item.dataname] ? filterPlaneObject[item.dataname] : (item.defaultValue ? item.defaultValue.value : '')}
                    placeholder={item.placeholder}
                    // value={(filterObject && filterObject[item.dataname] != undefined) ? ((!filterObject[item.dataname].includes('[') && item.isMultiple == true) ? `[${filterObject[item.dataname]}]` : `${filterObject[item.dataname]}`) : '' }
                    hidden={true}
                    key={item.name}
                  />
                  <Select
                    className={`form-select ${errors[item.name] ? 'border border-danger' : ''}`}
                    value={defaultPlane[item.dataname] ? defaultPlane[item.dataname] : item.defaultValue}
                    options={item.values ? item.values : []}
                    isMulti={item.isMultiple}
                    onChange={item.onChange ? (e) => { item.onChange; selectPlaneChange(e, item.dataname) } : (e) => { selectPlaneChange(e, item.dataname) }}
                    defaultValue={defaultPlane[item.dataname] ? defaultPlane[item.dataname] : item.defaultValue}
                    key={`${item.name}_select`}
                  />
                  {!alerts && errors[item.name] && (
                    <div className="form-error text-danger">{errors[item.name].message}</div>
                  )}
                  {
                    item.breakBottom &&
                    <hr className="mb-3">
                    </hr>
                  }
                </div>
              )
            }
            if (item.type === 'textarea') {
              return (
                (item.watchBy == undefined || (watchAllFields[item.watchBy] && item.watchValues.includes(watchAllFields[item.watchBy]))) &&
                (!steps || (item.onTab && openTab === item.onTab)) &&
                <>
                  <div className={`  ${item.className} form-group`}>
                    {
                      item.breakTop &&
                      <hr className="mb-3">
                      </hr>
                    }
                    {item.label && <label className="form-label"><b>{item.label}</b></label>}
                    <textarea
                      ref={item.ref}
                      name={item.name}
                      onChange={item.onChnage ? (e) => item.onChange(e) : null}
                      className={`form-textarea ${errors[item.name] ? 'border border-danger' : ''
                        }`}
                      rows="3"
                      id="ckEditor"
                      placeholder={item.placeholder}>{item.defaultValue}</textarea>
                    {!alerts && errors[item.name] && (
                      <div className="form-error text-danger">
                        {errors[item.name].message}
                      </div>
                    )}
                    {
                      // applyCkeditor()
                    }
                    {
                      item.breakBottom &&
                      <hr className="mb-3">
                      </hr>
                    }
                  </div>
                </>
              )
            }
            if (item.type === 'multiple-image') {
              return (
                (item.watchBy == undefined || (watchAllFields[item.watchBy] && item.watchValues.includes(watchAllFields[item.watchBy]))) &&
                (!steps || (item.onTab && openTab === item.onTab)) &&
                <>
                  <div className={`  ${item.className} form-group`}>
                    {
                      item.breakTop &&
                      <hr className="mb-3">
                      </hr>
                    }
                    {item.label && <label className="form-label"><b>{item.label}</b></label>}
                    <input
                      ref={item.ref}
                      name={item.name}
                      type="file"
                      className={`form-input form-control ${errors[item.name] ? 'border-danger' : ''}`}
                      placeholder={item.placeholder}
                      multiple={true}
                    />
                    {!alerts && errors[item.name] && (
                      <div className="form-error text-danger">{errors[item.name].message}</div>
                    )}
                  </div>
                  {
                    (item.defaultValue != undefined || selectedFile) &&
                    item.defaultValue.map(image => {
                      <div className={`  ${item.className} form-group`}>
                        Preview
                        <img src={image} className="h-32 rounded max-w-full mr-2 mb-2 w-32" />
                      </div>
                    })
                  }
                  {
                    item.breakBottom &&
                    <hr className="mb-3">
                    </hr>
                  }
                </>
              )
            }
            if (item.type === 'image') {
              return (
                (item.watchBy == undefined || (watchAllFields[item.watchBy] && item.watchValues.includes(watchAllFields[item.watchBy]))) &&
                (!steps || (item.onTab && openTab === item.onTab)) &&
                <>
                  <div className={`  ${item.className} form-group`}>
                    {
                      item.breakTop &&
                      <hr className="mb-3">
                      </hr>
                    }

                    {
                      (item.defaultValue != undefined || selectedFile) &&
                      (item.imageprev && item.imageprev == 'before') &&
                      <div className={` lg:p-2 ${item.className} form-element`}>
                        Preview
                        <img src={preview ? preview : item.defaultValue} className={`h-32 rounded max-w-full mr-2 mb-2 w-32 ${item.imagePrevClass}`} />
                      </div>
                    }
                    {item.label && <label className="form-label"><b>{item.label}</b></label>}
                    <div className="custom-file">
                      <input
                        ref={item.ref}
                        name={item.name}
                        type="file"
                        onChange={item.onChnage ? (e) => { item.onChange(e); onSelectFile(e, 100, 100, item.name) } : (e) => onSelectFile(e, 100, 100, item.name)}
                        className={`custom-file-input form-control ${errors[item.name] ? 'border-danger' : ''
                          }`}
                        placeholder={item.placeholder}
                        id={item.name}
                      />
                      <label className="custom-file-label">{item.labelWorn}</label>
                    </div>
                    {!alerts && errors[item.name] && (
                      <div className="form-error text-danger">{errors[item.name].message}</div>
                    )}
                  </div>
                  {
                    (item.defaultValue != undefined || selectedFile) &&
                    (!item.imageprev || item.imageprev == 'after') &&
                    <div className={` lg:p-2 ${item.className} form-element`}>
                      Preview
                      <img src={preview ? preview : item.defaultValue} className="h-32 rounded max-w-full mr-2 mb-2 w-32" />
                    </div>
                  }
                  {
                    item.breakBottom &&
                    <hr className="mb-3">
                    </hr>
                  }
                </>
              )
            }
            if (item.type === 'video') {
              return (
                (item.watchBy == undefined || (watchAllFields[item.watchBy] && item.watchValues.includes(watchAllFields[item.watchBy]))) &&
                (!steps || (item.onTab && openTab === item.onTab)) &&
                <>
                  <div className={`  ${item.className} form-group`}>
                    {
                      item.breakTop &&
                      <hr className="mb-3">
                      </hr>
                    }
                    {item.label && <label className="form-label"><b>{item.label}</b></label>}
                    <input
                      ref={item.ref}
                      name={item.name}
                      type="file"
                      onChange={item.onChnage ? (e) => { item.onChange(e); setSelectedVideo(URL.createObjectURL(e.currentTarget.files[0])) } : (e) => setSelectedVideo(URL.createObjectURL(e.currentTarget.files[0]))}
                      className={`form-input form-control ${errors[item.name] ? 'border-danger' : ''
                        }`}
                      placeholder={item.placeholder}
                    />
                    {!alerts && errors[item.name] && (
                      <div className="form-error text-danger">{errors[item.name].message}</div>
                    )}
                    {
                      item.breakBottom &&
                      <hr className="mb-3">
                      </hr>
                    }
                  </div>
                  <input
                    ref={item.ref}
                    name='duration'
                    type='text'
                    defaultValue={videoDuration}
                    hidden={true}
                    className={`form-input form-control ${errors[item.name] ? 'border-danger' : ''
                      }`}
                    placeholder={item.placeholder}
                  />
                  {
                    (item.defaultValue != undefined || selectedVideo) &&
                    <video width="100%" height="100%" controls data-reactid=".0.1.0.0.0" className="video" autoPlay
                      onLoadedMetadata={e => {
                        setVideoDuration(e.target.duration)
                      }}
                      onChange={e => {
                        setVideoDuration(e.target.duration)
                      }}
                    >
                      <source src={selectedVideo} data-reactid=".0.1.0.0.0" type="video/mp4" className="h-32 rounded max-w-full mr-2 mb-2" />
                    </video>
                  }
                  {
                    item.breakBottom &&
                    <hr className="mb-3">
                    </hr>
                  }
                </>
              )
            }
            if (item.type === 'file') {
              return (
                (item.watchBy == undefined || (watchAllFields[item.watchBy] && (item.watchValues ? item.watchValues.includes(watchAllFields[item.watchBy]) : (item.watchValuesLength && watchAllFields[item.watchBy].length >= item.watchValuesLength)))) &&
                (!steps || (item.onTab && openTab === item.onTab)) &&
                <>
                  <div className={`  ${item.className} form-group`}>
                    {
                      item.breakTop &&
                      <hr className="mb-3">
                      </hr>
                    }
                    {item.label && <label className="form-label"><b>{item.label}</b></label>}

                    <div className="custom-file">
                      <input
                        ref={item.ref}
                        name={item.name}
                        type="file"
                        value={item.defaultValue}
                        onChange={item.onChnage ? (e) => item.onChange(e) : null}
                        className={`custom-file-input form-control ${errors[item.name] ? 'border-danger' : ''
                          }`}
                        placeholder={item.placeholder}
                        id={item.name}
                      />
                      <label className="custom-file-label">{item.labelWorn}</label>
                    </div>
                    {!alerts && errors[item.name] && (
                      <div className="form-error text-danger">{errors[item.name].message}</div>
                    )}
                    {
                      item.breakBottom &&
                      <hr className="mb-3">
                      </hr>
                    }
                  </div>
                </>
              )
            }
            if (item.type === 'image2') {
              return (
                <>
                  <div className={`  ${item.className} form-group`}>
                    <ImageCrop />
                    {!alerts && errors[item.name] && (
                      <div className="form-error text-danger">{errors[item.name].message}</div>
                    )}
                  </div>
                </>
              )
            }
            if (item.type === 'multiple-fields') {
              return (
                (item.watchBy == undefined || (watchAllFields[item.watchBy] && item.watchValues.includes(watchAllFields[item.watchBy]))) &&
                (!steps || (item.onTab && openTab === item.onTab)) &&
                <>
                  <div className="w-full flex flex-row flex-wrap my-3 md:my-5 mx-3 items-center">
                    {item.label &&
                      <div className="form-label mr-2 font-base"><b>{item.label}</b></div>
                    }
                    {!item.btnBottom && <button id="reOrderBtn" className="dashboard-btn-light float-right "
                      onClick={(e) => append(e, item.name)}>
                      {
                        item.btnType == 'icon' && <FiPlus size={18} /> ||
                        (item.btnName ? `Add  new ${item.btnName }  ` : `Add Row`)
                      }<i class="fas fa-plus ml-1"></i>
                    </button>}
                    {
                      // Array.from(Array(multipleFields[item.name]).keys())
                      <div className={` md:my-3`}>
                        {multipleFields[item.name] &&
                          multipleFields[item.name].map((i) => {
                            const key = 'key' + i
                            return <div className={` ${item.className} ${item.box && item.box == true ? 'border px-0 mx-0 my-3' : ''}`} >
                              {item.fields.map((data) => {
                                return <div className={`form-group  ${data.className}`} style={{ marginBottom: 0 }} >
                                  <label>{data.label} {i + 1}</label>
                                  {(data.type == 'radio' || data.type == 'checkbox') &&
                                    <div className="">
                                      {data.options.map((option, j) => (
                                        <label className="">
                                          <input
                                            ref={data.ref}
                                            key={`${item.name}[${key}][${data.name}]`}
                                            name={`${item.name}[${key}][${data.name}]`}
                                            type={data.type}
                                            defaultChecked={item.defaultValue != undefined && item.defaultValue[i] != undefined && option.value == item.defaultValue[i][data.name]}
                                            key={`${option.id}_${key}`}
                                            onChange={data.onChange ? (e) => data.onChange(e) : null}
                                            value={option.value}
                                            className={`form-${data.type} h-4 w-4 ${errors[data.name] ? 'text-danger' : ''
                                              }`}
                                          />
                                          <span
                                            className={`${errors[`${item.name}[${key}][${data.name}]`] ? 'text-danger' : ''
                                              }`}>
                                            {option.label}
                                          </span>
                                        </label>
                                      ))}
                                      {!alerts && errors[item.name] && errors[item.name] && errors[item.name][key] && errors[item.name][key][data.name] && (
                                        <div className="form-error text-danger">{errors[item.name][key][data.name].message}</div>
                                      )}
                                    </div>
                                    ||
                                    (data.type == 'select') &&
                                    <div className="">
                                      <input
                                        key={`${item.name}[${key}][${data.name}]`}
                                        ref={item.ref}
                                        name={`${item.name}[${key}][${data.name}]`}
                                        type='text'
                                        value={filterObject[item.dataname] && ((!filterObject[item.dataname].includes('[') && item.isMultiple == true) ? `[${filterObject[item.dataname]}]` : `${filterObject[item.dataname]}`)}
                                        placeholder={item.placeholder}
                                        hidden={true}
                                      />
                                      <Select
                                        className={`form-select ${errors[`${item.name}[${key}][${data.name}]`] ? 'border border-danger' : ''}`}
                                        ref={data.ref}
                                        value={item.options}
                                        valueKey="id"
                                        options={selectdatas ? selectdatas[`${item.name}[${key}][${data.datalabel}]`] : []}
                                        isMulti={item.isMultiple}
                                        onChange={item.onChange ? (e) => { item.onChange; selectChange(e, item.dataname, `${item.name}[${key}][${data.datalabel}]`, item.effectedRows) } : (e) => selectChange(e, item.dataname, `${item.name}[${key}][${data.datalabel}]`, item.effectedRows)}
                                        defaultValue={defaultSelectObject ? defaultSelectObject[`${item.name}[${key}][${data.datalabel}]`] : []}
                                      />
                                      {!alerts && errors[item.name] && errors[item.name] && errors[item.name][key] && errors[item.name][key][data.name] && (
                                        <div className="form-error text-danger">{errors[item.name][key][data.name].message}</div>
                                      )}
                                    </div>
                                    ||
                                    <>
                                      <input
                                        ref={data.ref}
                                        key={`${item.name}[${key}][${data.name}]`}
                                        name={`${item.name}[${key}][${data.name}]`}
                                        type={data.type}
                                        defaultValue={(item.defaultValue != undefined && item.defaultValue[i] != undefined) ? item.defaultValue[i][data.name] : ''}
                                        hidden={data.hidden ? data.hidden : false}
                                        onChange={data.onChnage ? (e) => data.onChange(e) : null}
                                        className={`form-input form-control   ${errors[data.name] ? 'border-danger' : ''
                                          }`}
                                        placeholder={data.placeholder}
                                        key={`${key}`}
                                      />
                                      {!alerts && errors[item.name] && errors[item.name] && errors[item.name][key] && errors[item.name][key][data.name] && (
                                        <div className="form-error text-danger">{errors[item.name][key][data.name].message}</div>
                                      )}
                                    </>
                                  }
                                </div>
                              })}
                              {<button id="reOrderBtn" className=" btn btn-default btn-outlined bg-transparent text-danger hover:text-red-700 border-danger hover:border-red-700 float-right ml-3 mt-2 mb-3"
                                onClick={(e) => { remove(e, item, i) }}>
                                Remove
                              </button>
                              }
                              {item.btnBottom && (i + 1) == multipleFields[item.name].length && <button id="reOrderBtn" className=" btn btn-default btn-outlined bg-transparent text-primary hover:text-blue-700 border-primary hover:border-blue-700 float-right ml-2 m-2 "
                                onClick={(e) => append(e, item.name)}>
                                {
                                  item.btnType == 'icon' && <FiPlus size={18} /> ||
                                  (item.btnName ? `Add  new ${item.btnName}` : `Add Row`)
                                }
                              </button>
                              }
                            </div>
                          })}
                      </div>
                    }
                    {
                      item.breakBottom &&
                      <hr className="mb-3">
                      </hr>
                    }
                  </div>
                </>
              )
            }
            if (item.type === 'multiple-table-fields') {
              return (
                (item.watchBy == undefined || (watchAllFields[item.watchBy] && item.watchValues.includes(watchAllFields[item.watchBy]))) &&
                (!steps || (item.onTab && openTab === item.onTab)) &&
                <>
                  <div className="
col-12">
                    {item.label &&
                      <h5 className="mb-2  "><strong>{item.label}</strong></h5>
                    }
                    <table className="table table-bordered">
                      {randerHtml(item.thead)}
                      {
                        // Array.from(Array(multipleFields[item.name]).keys())

                        <tbody>
                          {multipleTableFields[item.name] &&
                            multipleTableFields[item.name].map((i) => {
                              const key = 'key' + i
                              return <tr>
                                <td><b>{i + 1}.</b></td>
                                {item.fields.map((data) => {
                                  return <td>
                                    <div >
                                      {(data.type == 'radio' || data.type == 'checkbox') &&
                                        <div className="">
                                          {data.options.map((option, j) => (
                                            <label className="">
                                              <input
                                                ref={data.ref}
                                                key={`${item.name}[${key}][${data.name}]`}
                                                name={`${item.name}[${key}][${data.name}]`}
                                                type={data.type}
                                                defaultChecked={item.defaultValue != undefined && item.defaultValue[i] != undefined && option.value == item.defaultValue[i][data.name]}
                                                key={`${option.id}_${key}`}
                                                onChange={data.onChange ? (e) => data.onChange(e) : null}
                                                value={option.value}
                                                className={`form-${data.type} h-4 w-4 ${errors[data.name] ? 'text-danger' : ''
                                                  }`}
                                              />
                                              <span
                                                className={`${errors[`${item.name}[${key}][${data.name}]`] ? 'text-danger' : ''
                                                  }`}>
                                                {option.label}
                                              </span>
                                            </label>
                                          ))}
                                          {!alerts && errors[item.name] && errors[item.name] && errors[item.name][key] && errors[item.name][key][data.name] && (
                                            <div className="form-error text-danger">{errors[item.name][key][data.name].message}</div>
                                          )}
                                        </div>
                                        ||
                                        (data.type == 'select') &&
                                        <div className="">
                                          <input
                                            key={`${item.name}[${key}][${data.name}]`}
                                            ref={item.ref}
                                            name={`${item.name}[${key}][${data.name}]`}
                                            type='text'
                                            value={filterObject[item.dataname] && ((!filterObject[item.dataname].includes('[') && item.isMultiple == true) ? `[${filterObject[item.dataname]}]` : `${filterObject[item.dataname]}`)}
                                            placeholder={item.placeholder}
                                            hidden={true}
                                          />
                                          <Select
                                            className={`form-select ${errors[`${item.name}[${key}][${data.name}]`] ? 'border border-danger' : ''}`}
                                            ref={data.ref}
                                            value={item.options}
                                            valueKey="id"
                                            options={selectratas ? selectdatas[`${item.name}[${key}][${data.datalabel}]`] : []}
                                            isMulti={item.isMultiple}
                                            onChange={item.onChange ? (e) => { item.onChange; selectChange(e, item.dataname, `${item.name}[${key}][${data.datalabel}]`, item.effectedRows) } : (e) => selectChange(e, item.dataname, `${item.name}[${key}][${data.datalabel}]`, item.effectedRows)}
                                            defaultValue={defaultSelectObject ? defaultSelectObject[`${item.name}[${key}][${data.datalabel}]`] : []}
                                          />
                                          {!alerts && errors[item.name] && errors[item.name] && errors[item.name][key] && errors[item.name][key][data.name] && (
                                            <div className="form-error text-danger">{errors[item.name][key][data.name].message}</div>
                                          )}
                                        </div>
                                        ||
                                        <>
                                          {
                                            data.desabled && data.desabled == true &&
                                            <label>{(item.defaultValue != undefined && item.defaultValue[i] != undefined) ? item.defaultValue[i][data.name] : ''}</label>
                                          }
                                          <input
                                            ref={data.ref}
                                            key={`${item.name}[${key}][${data.name}]`}
                                            name={`${item.name}[${key}][${data.name}]`}
                                            type={data.type}
                                            defaultValue={(item.defaultValue != undefined && item.defaultValue[i] != undefined) ? item.defaultValue[i][data.name] : ''}
                                            hidden={data.hidden ? data.hidden : (data.desabled && data.desabled == true ? true : false)}
                                            onChange={data.onChnage ? (e) => data.onChange(e) : null}
                                            className={`form-input form-control   ${errors[data.name] ? 'border-danger' : ''
                                              }`}
                                            placeholder={data.placeholder}
                                            key={`${key}`}
                                          />
                                          {!alerts && errors[item.name] && errors[item.name] && errors[item.name][key] && errors[item.name][key][data.name] && (
                                            <div className="form-error text-danger">{errors[item.name][key][data.name].message}</div>
                                          )}
                                        </>
                                      }
                                    </div>

                                  </td>
                                })}
                              </tr>
                            })}
                        </tbody>
                      }
                    </table>
                    {
                      item.breakBottom &&
                      <hr className="mb-3">
                      </hr>
                    }
                  </div>
                </>
              )
            }
            if (item.type == 'tel') {
              return (item.watchBy == undefined || (watchAllFields[item.watchBy] && item.watchValues.includes(watchAllFields[item.watchBy]))) &&
                (!steps || (item.onTab && openTab === item.onTab)) &&
                <>
                  <div className={`${item.type == 'hidden' ? '' : ''} ${item.className} form-group`}>
                    {
                      item.breakTop &&
                      <hr className="mb-3">
                      </hr>
                    }
                    {item.label && <label className="form-label"><b>{item.label}</b></label>}
                    <input
                      id="phone"
                      ref={item.ref}
                      name={item.name}
                      type={item.type}
                      defaultValue={item.defaultValue}
                      hidden={item.hidden ? item.hidden : false}
                      disabled={item.disabled ? item.disabled : false}
                      onChange={item.onChnage ? (e) => item.onChange(e) : null}
                      className={`form-input form-control ${errors[item.name] ? 'border-danger' : ''
                        }`}
                    // placeholder={item.placeholder}
                    />
                    {!alerts && errors[item.name] && (
                      <div className="form-error text-danger">{errors[item.name].message}</div>
                    )}
                    {
                      item.breakBottom &&
                      <hr className="mb-3">
                      </hr>
                    }

                    {

                    }
                  </div>
                </>

            }
            return (
              (item.watchBy == undefined || (watchAllFields[item.watchBy] && item.watchValues.includes(watchAllFields[item.watchBy]))) &&
              (!steps || (item.onTab && openTab === item.onTab)) &&
              <>
                <div className={`${item.type == 'hidden' ? '' : ''} ${item.className} form-group`}>
                  {
                    item.breakTop &&
                    <hr className="mb-3">
                    </hr>
                  }
                  {item.label && <label className="form-label"><b>{item.label}</b></label>}
                  <input
                    ref={item.ref}
                    name={item.name}
                    type={item.type}
                    defaultValue={item.defaultValue}
                    hidden={item.hidden ? item.hidden : false}
                    disabled={item.disabled ? item.disabled : false}
                    onChange={item.onChnage ? (e) => item.onChange(e) : null}
                    className={`form-input form-control ${errors[item.name] ? 'border-danger' : ''
                      }`}
                    placeholder={item.placeholder}
                    id={item.typeInput == 'tel' ? 'phone' : item.ref}
                  />
                  {!alerts && errors[item.name] && (
                    <div className="form-error text-danger">{errors[item.name].message}</div>
                  )}
                  {
                    item.breakBottom &&
                    <hr className="mb-3">
                    </hr>
                  }
                </div>
              </>
            )
          })}
        </div>
        <div className="col-12 col-sm-12 col-md-12 submit-btn text-center mt-3">
          {
            <button
              type="submit"
              className={`btn-submit text-center mt-0 ${btnClass ? btnClass : ''}`}
            >{steps && openTab < (steps.length) ? 'Next' : buttonText } <i class="fas fa-chevron-right ml-1"></i></button>
          }
        </div>
      </form>
    </>
  )
}
export default ValidationFront