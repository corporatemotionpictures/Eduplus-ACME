import { useForm, useFieldArray } from 'react-hook-form'
import Alert from 'components/functional-ui/alerts'
import Select, { Option, ReactSelectProps, createFilter } from 'react-select'
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { fetchAll, deleteData, updateAdditional, add, edit } from 'helpers/apiService';
import { FiMinus, FiPlus, FiImage } from 'react-icons/fi';
import Validation from 'components/functional-ui/forms/validation'
import { addFields } from 'components/functional-ui/forms/AddNewFilds'
import StoreModel from 'components/functional-ui/modals/modal-store'
import MenuList from 'components/functional-ui/forms/reactSelectMenuList'


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

function isJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}


const FormValidation = ({ items, onSubmit, alerts, steps = null, buttonText = "Save and Update Information", btnClass = '', SecondUpon = true }) => {

  // use Form
  const { handleSubmit, errors, register, unregister, watch, getValues, setValue } = useForm({ shouldUnregister: true, })

  // define states
  const [fetchFirst, setFetchFirst] = useState(true)
  const [multipleFields, setMultipleFields] = useState([])
  const [multipleChildFields, setMultipleChildFields] = useState([])
  const [defaultvalues, setDefaultvalues] = useState({})
  const [selectedFile, setSelectedFile] = useState({})
  const [preview, setPreview] = useState({})
  const [filterObject, setFilterObject] = useState({ offLimit: true, forList: true, listOnly: true })
  const [filterPlaneObject, setFilterPlaneObject] = useState({})
  const [selectdatas, setSelectdatas] = useState({})
  const [defaultSelectObject, setDefaultSelectObject] = useState({})
  const [changed, setChanged] = useState([])
  const [effectedRows, setEffectedRows] = useState(false)
  const [addNewModal, setAddNewModal] = useState(false)
  const [defaultPlane, setDefaultPlane] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [selectedImages, setSelectedImages] = useState(null)
  const [videoDuration, setVideoDuration] = useState(null)
  const [openTab, setOpenTab] = useState(1)
  const [stepData, setStepData] = useState({})
  const [storeFields, setStoreFields] = useState({})
  const [AddNewSection, setAddNewSection] = useState({})
  const [editorApplied, setEditorApplied] = useState(true)
  const watchAllFields = watch();


  // Call first time when component rander
  useEffect(() => {
    async function getInnerdata() {
      if (items != undefined && fetchFirst == true) {

        let fields = {}
        let childfields = {}
        items.map(item => {
          if (item.type === 'multiple-fields') {
            {
              fields = {
                ...fields,
                [`${item.name}`]: item.defaultValue && item.defaultValue.length > 0 ? Array.from(Array(item.defaultValue.length).keys()) : [1]
              }

              item.fields.map(childField => {
                if (childField.type == 'multiple-fields') {

                  childfields = {
                    ...childfields,
                    [`${item.name}`]: [{
                      ...childfields[item.name],
                      [`${childField.name}`]: childField.defaultValue && childField.defaultValue.length > 0 ? Array.from(Array(childField.defaultValue.length).keys()) : [1]
                    }]
                  }
                }
              })
            }
          }
        })

        await setMultipleFields(fields)
        await setMultipleChildFields(childfields)

        await fetchData(items)
      }
    }

    getInnerdata()

    return () => setFetchFirst(false)

    // free memory when ever this component is unmounted

  }, [fetchFirst])

  // Get data used by select fields
  const fetchData = async (items, effectedRows = null) => {

    Object.keys(stepData).map(data => {
      setValue(data, stepData[data])
    })

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

      array.map(async (list) => {
        if (list.type == 'select') {
          if (!effectedRows || effectedRows.includes(list.dataname)) {

            var currentFilter = filterObject[list.dataname]

            var fetcher;

            if (filterObjectParam == {}) {
              filterObjectParam = null
            }

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
      })
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


  // call on  select file effect
  const onSelectFile = async (e, width, height, name) => {

    let validate = true
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile({
        ...selectedFile,
        [`image${name}`]: undefined
      })
      return
    }


    // I've kept this example simple by using the first image instead of multiple
    await setSelectedFile({
      ...selectedFile,
      [`image${name}`]: e.target.files[0]
    })

  }

  // call on  select file effect
  useEffect(() => {

    Object.keys(selectedFile).map((index) => {

      const objectUrl = URL.createObjectURL(selectedFile[index])

      setPreview({
        ...preview,
        [`${index}`]: objectUrl
      })

    })


    // free memory when ever this component is unmounted
    return () => { console.log('true') }
  }, [selectedFile])


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


  // Append data for multiple fieds child
  const appendChild = (e, name, parent, i) => {


    let childParent = multipleChildFields[parent]

    if (!childParent[i]) {
      childParent[i] = {
        [`${name}`]: [1]
      }
    }
    let array = childParent[i][name]

    e.preventDefault()
    let last = childParent[i][name][childParent[i][name].length - 1]

    last = last ? last : 0
    array.push(parseInt(last) + 1)

    let parentdata = childParent

    setMultipleChildFields({
      ...multipleChildFields,
      [`${parent}`]: parentdata

    })


  }

  //Remove data for multiple fields child
  const removeChild = (e, data, j, parent, i) => {

    e.preventDefault()
    setDefaultvalues(getValues())

    data.fields.map(field => {
      unregister(`${parent}[key${i}]${data.name}[key${j}][${field.name}]`)
    })

    let last = multipleChildFields[parent][i][data.name].filter(key => key != j);

    last = last ? last : 0
    multipleChildFields[parent][i][data.name] = last

    let parentdata = multipleChildFields[parent]

    setMultipleChildFields({
      ...multipleChildFields,
      [`${parent}`]: parentdata

    })

    setDefaultvalues(getValues())
  }

  //Remove data for multiple fields
  const changeModalStatus = async (addNew = null) => {



    if (addNewModal == false) {
      let filds = await addFields(addNew)
      $('.modal').css('z-index', 10)
      setAddNewSection(addNew)
      setStoreFields(filds)
      setAddNewModal(true)
    } else {
      setStoreFields({})
      setAddNewModal(false)
    }
  }

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

  // Reset value for on chnage multiple fileds
  useEffect(() => {

    Object.keys(stepData).map(data => {
      setValue(data, stepData[data])
    })


    console.log(getValues())

    return () => { console.log('true') }

  }, [openTab])

  // Reset value for on chnage multiple fileds
  function applyEditor(input, defaultValue) {

    let finalEditor;


    console.log('applydata')
    var ckEditor = document.getElementsByClassName('editor');


    if (ckEditor != undefined && ckEditor != null && ckEditor.length > 0 && editorApplied) {
      var EDITOR_JS_TOOLS = require('components/featured/functions/tools').default
      EDITOR_JS_TOOLS = EDITOR_JS_TOOLS()
      var ClassicEditor = require('public/custom-packages/ckeditor5/build/ckeditor')

      ClassicEditor
        .create(document.querySelector('.editor'), EDITOR_JS_TOOLS)
        .then(editor => {
          // setEditorApplied(false)
          window.editor = editor;
          finalEditor = editor


          editor.model.document.on('change:data', () => {
            const editorData = editor.getData();
            setValue(input, editorData)
          });
        })

        .catch(error => {
          console.error('Oops, something went wrong!');
          console.error(error);
        });

      document.querySelector('#editor').addEventListener("change", function () {
        if (finalEditor) {
          const editorData = editor.getData();
          setValue(input, editorData)
        }
      });



      setEditorApplied(false)
    }



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
        onSubmit(data)
      }

    }

  }

  // Register validation conditional
  items = items.map(item => {

    if (item.type == 'image' && (item['error'] || item.sizeRequired)) {


      if (!item['error'] && item.sizeRequired) {
        item['error'] = {}
      }
      item['error'].validate = async (value) => {

        if (value && value.length > 0) {

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
            item.noteMessage = message
            return message;
          }

          const fileSize = Math.round(value[0].size / 1024);
          if (item.maxfilesize && fileSize > item.maxfilesize) {
            item.noteMessage = "file size must be lower than ".concat(item.maxfilesize)
            return "file size must be lower than ".concat(item.maxfilesize);
          }
        }
      }

      let noteMessage = ''

      if (item.maxWidth) {
        noteMessage += 'Image width must be less the'.concat(item.maxWidth).concat('. ')
      }
      if (item.maxHeight) {
        noteMessage += 'Image height must be less the'.concat(item.maxheight).concat('. ')
      }
      if (item.minWidth) {
        noteMessage += 'Image width must be greater the'.concat(item.minWidth).concat('. ')
      }
      if (item.minHeight) {
        noteMessage += 'Image height must be greater the'.concat(item.minHeight).concat('. ')
      }

      if (item.width && item.height) {
        noteMessage += 'Image dimension should be '.concat(item.width)
          .concat(' X ').concat(item.height).concat('px. ')
      } else {
        if (item.width) {
          noteMessage += 'Image dimension should be '.concat(item.width).concat('. ')
        }
        if (item.height) {
          noteMessage += 'Image height must be '.concat(item.height).concat('. ')
        }
      }

      if (item.maxfilesize) {
        noteMessage += "file size must be lower than ".concat(item.maxfilesize)
      }

      if (noteMessage != '') {
        item.noteMessage = noteMessage
      }

    }

    if (item.type == 'select') {
      let error = item['error']
      // if (item['error'] == undefined) {
      //   item['error'] = {}
      // }
      if (item['error'] != undefined) {
        item['error'].validate = async (value) => {

          if (value == '[]') {
            return `This Field is required`;
          }
        }
      }
    }

    if (item.type == 'multiple-fields' && !item.noError) {
      item.fields.map(field => {

        if (field.type == 'multiple-fields' && !field.noError) {

          field.fields.map(childField => {
            childField['ref'] = register(childField['error'])
          })

        } else {
          field['ref'] = register(field['error'])
        }
      })
    }


    if (item.removeError) {
      unregister(item.name)
    }

    item['ref'] = register(item['error'])

    return item
  })

  function randerHtml(html, refers) {
    return html
  }

  async function onAddnew(data) {

    var submit;
    var message;

    var image = null


    if (data.thumbnail) {
      image = 'thumbnail'
    }
    if (data.image) {
      image = 'image'
    }
    if (image) {
      submit = await add(AddNewSection.modelTitle, data, image);
    } else {
      submit = await add(AddNewSection.modelTitle, data);
    }
    message = `${AddNewSection.baseTitle} Added Successfully`


    // check Response
    if (submit.updated) {

      if (AddNewSection.onSubmit) {
        let itemsData = await AddNewSection.onSubmit()
        fetchData(itemsData)
      } else {
        fetchData(items)
      }
      toastr.success(message)
      setStoreFields({})
      setAddNewModal(false)
      // 

    }
    else {
      let error;
      if (submit.exam) {
        error = submit.exam.error
      }
      else if (submit.error.details) {
        error = submit.error.details[0].message
      } else if (submit.error) {
        error = submit.error
      }
      toastr.error(error)
    }
  }


  // Setup form
  return (
    <>

      {steps && <div className="flex flex-row w-full mb-8 whitespace-nowrap overflow-y-scroll border radius-none">
        {steps && steps.map((tab, key) => (
          <div
            key={key}
            className="flex w-full items-center justify-center last:border-r-0 border-r">
            <button
              disabled={openTab < tab.index ? tab.disabled : false}
              onClick={() => {
                setEditorApplied(true)

                // setValue(stepData)
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
      </div>}

      <form
        onSubmit={handleSubmit(onSubmitFn)}
        className="form flex flex-wrap w-full" encType="multipart/form-data">
        {/* conditin for if alert whood be shown */}
        {alerts &&
          items.map((item, i) => {
            if (!errors[item.name]) return null
            let msg = errors[item.name].message
            if (msg.length === 0) msg = `${item.label} is required`
            return (
              <div className="flex flex-col w-full">
                {errors[item.name] && (
                  <div className="mb-2" key={i}>
                    <Alert
                      color="bg-transparent border-red-500 text-red-500"
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
        <div className="w-full flex flex-col lg:flex-row lg:flex-wrap">
          {items.map((item, i) => {
            if (item.type === 'checkbox') {
              return (
                (item.watchBy == undefined || (watchAllFields[item.watchBy] && item.watchValues.includes(watchAllFields[item.watchBy]))) &&
                (!steps || (item.onTab && openTab === item.onTab)) &&
                <div className={` lg:p-2 ${item.className}  input-background form-element`}>
                  {item.label && <div className="capitalize form-label">{item.label}</div>}
                  <div className="flex items-center justify-start space-x-2">
                    {item.options.map((option, j) => (
                      <label className="flex items-center justify-start space-x-2">
                        <input
                          ref={item.ref}
                          type="checkbox"
                          onChange={item.onChnage ? (e) => item.onChange(e) : null}
                          value={option.value}
                          name={item.name}
                          key={option.id}
                          disabled={item.disabled == true ? true : false}
                          defaultChecked={option.value == item.defaultValue}
                          className={`form-checkbox h-4 w-4 ${errors[item.name] ? 'text-red-500' : ''
                            }`}
                        />
                        <span
                          className={`capitalize ${errors[item.name] ? 'text-red-500' : ''
                            }`}>
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )
            }
            if (item.type === 'radio') {
              return (
                (item.watchBy == undefined || (watchAllFields[item.watchBy] && item.watchValues.includes(watchAllFields[item.watchBy]))) &&
                (!steps || (item.onTab && openTab === item.onTab)) &&
                <div className={` lg:p-2 ${item.className}  input-background form-element`} >
                  {item.label && <div className="capitalize form-label">{item.label}</div>}
                  <div className={`${item.fullWidth ? '' : 'flex flex-wrap'} items-center justify-start md:space-x-2`}>

                    {item.options.map((option, j) => (
                      <label className={`${item.fullWidth ? 'border-bottom mb-2 pb-2 mr-2' : ''} flex items-center justify-start space-x-2 mr-2 pt-1`}>
                        <input
                          type="radio"
                          defaultChecked={option.value == item.defaultValue}
                          key={option.id}
                          onChange={item.onChange ? (e) => item.onChange(e) : null}
                          value={option.value}
                          name={item.name}
                          ref={item.ref}
                          disabled={item.disabled == true ? true : false}
                          className={`form-radio h-4 w-4 ${errors[item.name] ? 'text-red-500' : ''
                            }`}
                        />
                        <span
                          className={`capitalize ${errors[item.name] ? 'text-red-500' : ''
                            }`}>
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>

                  {item.htmlcontent &&
                    randerHtml(item.htmlcontent)
                  }
                </div>)
            }

            if (item.type === 'select-plane') {
              return (

                (item.watchBy == undefined || (watchAllFields[item.watchBy] && item.watchValues.includes(watchAllFields[item.watchBy]))) &&
                (!steps || (item.onTab && openTab === item.onTab)) &&
                <div className={` lg:p-2 ${item.className}  input-background form-element`}>
                  {item.label && <div className="capitalize form-label">{item.label}</div>}

                  <input
                    ref={item.ref}
                    name={item.name}
                    type='text'
                    value={filterPlaneObject[item.dataname]}
                    placeholder={item.placeholder}
                    hidden={true}
                    disabled={item.disabled == true ? true : false}
                    key={item.name}
                  />
                  <Select
                    className={`form-select ${errors[item.name] ? 'border border-red-500' : ''}`}
                    value={defaultPlane[item.dataname] ? defaultPlane[item.dataname] : item.defaultValue}
                    components={item.values && item.values.length > 500 ? { MenuList } : false}
                    isClearable={true}
                    options={item.values ? item.values : []}
                    isMulti={item.isMultiple}
                    isDisabled={item.disabled == true ? true : false}
                    onChange={item.onChange ? (e) => { selectPlaneChange(e, item.dataname); item.onChange(e); } : (e) => { selectPlaneChange(e, item.dataname) }}
                    defaultValue={defaultPlane[item.dataname] ? defaultPlane[item.dataname] : item.defaultValue}
                  />

                  {!alerts && errors[item.name] && (
                    <div className="form-error">{errors[item.name].message}</div>
                  )}

                  {!alerts && errors['attributes'] && errors['attributes'][item.dataname] && (
                    <div className="form-error">
                      {errors['attributes'][item.dataname].message}
                    </div>
                  )}
                </div>
              )
            }

            if (item.type === 'select') {
              return (
                (item.watchBy == undefined || (watchAllFields && watchAllFields[item.watchBy] && item.watchValues.includes(watchAllFields[item.watchBy]))) &&
                (!steps || (item.onTab && openTab === item.onTab)) &&
                <div className={` lg:p-2 ${item.className}  input-background form-element`}>
                  {item.label && <div className="capitalize form-label" >{item.label}
                    {item.addNew && SecondUpon && <a className="pl-2 text-blue-500 cursor-pointer text-primary" onClick={() => changeModalStatus(item.addNew)}>Add New</a>}
                  </div>}

                  <input
                    ref={item.ref}
                    name={item.name}
                    type='text'
                    value={filterObject[item.dataname] && ((!filterObject[item.dataname].includes('[') && item.isMultiple == true) ? `[${filterObject[item.dataname]}]` : `${filterObject[item.dataname]}`)}
                    placeholder={item.placeholder}
                    hidden={true}
                    disabled={item.disabled == true && !item.valueNotDisabled ? true : false}
                    key={item.name}
                    onChange={item.onChange ? (e) => item.onChange(e) : ''}
                  />
                  <Select
                    className={`form-select ${errors[item.name] ? 'border border-red-500' : ''}`}
                    value={defaultSelectObject ? defaultSelectObject[item.datalabel] : []}
                    components={selectdatas && selectdatas[item.datalabel] && selectdatas[item.datalabel].length > 500 ? { MenuList } : false}
                    isClearable={true}
                    options={selectdatas ? selectdatas[item.datalabel] : []}
                    isMulti={item.isMultiple}
                    isDisabled={item.disabled == true ? true : false}
                    onChange={item.onChange ? (e) => { selectChange(e, item.dataname, item.datalabel, item.effectedRows); item.onChange(e); } : (e) => selectChange(e, item.dataname, item.datalabel, item.effectedRows)}
                    defaultValue={defaultSelectObject ? defaultSelectObject[item.datalabel] : []}
                    isLoading={!selectdatas || !selectdatas[item.datalabel]}
                    menuPortalTarget={document.body}
                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}

                  />

                  {!alerts && errors[item.name] && (
                    <div className="form-error">
                      {errors[item.name].message}

                    </div>
                  )}

                  {!alerts && errors['attributes'] && errors['attributes'][item.datalabel] && errors['attributes'][item.datalabel]['value_id'] && (
                    <div className="form-error">
                      {errors['attributes'][item.datalabel]['value_id'].message}
                    </div>
                  )}
                </div>
              )
            }
            if (item.type === 'textarea') {
              return (
                (item.watchBy == undefined || (watchAllFields[item.watchBy] && item.watchValues.includes(watchAllFields[item.watchBy]))) &&
                (!steps || (item.onTab && openTab === item.onTab)) &&
                <>

                  <div className={` lg:p-2 ${item.className}  input-background form-element`}>
                    {item.label && <div className="capitalize form-label">{item.label} </div>}
                    <textarea
                      ref={item.ref}
                      name={item.name}
                      onChange={item.onChnage ? (e) => { item.onChange(e); } : null}
                      className={`form-textarea editor ${errors[item.name] ? 'border border-red-500' : ''
                        }`}
                      rows="3"
                      id="editor"
                      placeholder={item.placeholder}>{item.defaultValue}</textarea>

                    {!alerts && errors[item.name] && (
                      <div className="form-error">
                        {errors[item.name].message}
                      </div>
                    )}
                    {/* <div id="editor" className="border border-black border-solid my-2" ></div> */}

                    {
                      item.editor &&
                      applyEditor(item.name, item.defaultValue)
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
                  <div className={` lg:p-2 ${item.className}  input-background form-element`}>
                    {item.label && <div className="capitalize form-label">{item.label}</div>}
                    <input
                      ref={item.ref}
                      name={item.name}
                      type="file"
                      onChange={item.onChnage ? (e) => {
                        item.onChange(e); {
                          var total_file = e.currentTarget.files.length;
                          var images = [];
                          for (var i = 0; i < total_file; i++) {
                            images.push(URL.createObjectURL(event.target.files[i]));
                          }
                          setSelectedImages(images)
                        }
                      } : (e) => {
                        var total_file = e.currentTarget.files.length;
                        var images = [];
                        for (var i = 0; i < total_file; i++) {
                          images.push(URL.createObjectURL(event.target.files[i]));
                        }
                        setSelectedImages(images)
                      }}
                      className={`form-input ${errors[item.name] ? 'border-red-500' : ''}`}
                      placeholder={item.placeholder}
                      multiple={true}
                    />
                    {!alerts && errors[item.name] && (
                      <div className="form-error">{errors[item.name].message}</div>
                    )}
                  </div>
                  {

                    (item.defaultValue != undefined || selectedImages) &&

                    ((selectedImages && selectedImages.length > 0) && selectedImages.map(image => {
                      return <img src={image} className="h-32 rounded max-w-full mx-2 mb-2 " />
                    })

                      ||
                      (item.defaultValue && item.defaultValue.length > 0) && item.defaultValue.map(image => {
                        return <img src={image} className="h-32 rounded max-w-full mx-2 mb-2 " />
                      })

                    )
                  }
                </>
              )
            }
            if (item.type === 'image') {

              return (
                (item.watchBy == undefined || (watchAllFields[item.watchBy] && item.watchValues.includes(watchAllFields[item.watchBy]))) &&
                (!steps || (item.onTab && openTab === item.onTab)) &&
                <>
                  {
                    (item.defaultValue != undefined || selectedFile) &&
                    (item.imageprev && item.imageprev == 'before') &&
                    <div className={` lg:p-2 ${item.className}  form-element`}>
                      {item.label && item.disabled ? <div className="capitalize form-label">{item.label}</div> : "Preview"}
                      <img src={preview && preview[`image${item.name}`] ? preview[`image${item.name}`] : item.defaultValue} className={`h-32 rounded max-w-full  mb-2  ${item.imagePrevClass}`} onClick={item.onImgeClick ? () => item.onImgeClick(preview && preview[`image${item.name}`] ? preview[`image${item.name}`] : item.defaultValue) : (e) => e.preventDefault()} />
                    </div>
                  }
                  {!item.disabled && <div className={` lg:p-2 ${item.className}  form-element`}>
                    {item.label && <div className="capitalize form-label">{item.label}</div>}
                    <div className=''>
                      {
                        (item.defaultValue != undefined || selectedFile) &&
                        (!item.imageprev || item.imageprev == 'after') && ((preview && preview[`image${item.name}`]) || item.defaultValue) &&
                        (<div className={` text-center  form-element`} onClick={item.onImageClick ? () => item.onImageClick(preview && preview[`image${item.name}`] ? preview[`image${item.name}`] : item.defaultValue) : (e) => e.preventDefault()} >
                          {item.label && item.disabled ? <div className="capitalize form-label ">{item.label}</div> : "Preview"}
                          <img src={preview && preview[`image${item.name}`] ? preview[`image${item.name}`] : item.defaultValue} className={`self-center h-32 rounded max-w-full mt-1 mb-2  ${item.imageAftrClass}`} />
                        </div>)
                        ||
                        <i class="fas fa-image w-full text-center text-5xl pt-3 mt-5 pt-5"></i>
                      }

                      {/* <p className='w-full text-center mb-5'>Click Here! For Upload Your Image</p> */}
                      <div className='border-secondary height-350'>
                       
                        <p className='w-full text-center mb-5'>Click Here! For Upload Your Image</p>
                        <input
                          ref={item.ref}
                          name={item.name}
                          id={item.name}
                          type="file"
                          onChange={item.onChnage ? (e) => { item.onChange(e); onSelectFile(e, 100, 100, item.name) } : (e) => onSelectFile(e, 100, 100, item.name)}
                          className={`form-input custom-file-input display-none d-none ${errors[item.name] ? 'border-red-500' : ''}`}
                          placeholder={item.placeholder}
                          disabled={item.disabled ? item.disabled : false}
                        />
                         <label className='form-input custom-file-input display-flex' for={item.name} ></label>
                      </div>

                    </div>

                    {!alerts && errors[item.name] && (
                      <div className="form-error text-center">{errors[item.name].message}</div>
                    )}
                    {!errors[item.name] && item.noteMessage && (
                      <p className=" mt-2 form-hint text-center"><small>{item.noteMessage}</small></p>
                    )}
                  </div>
                  }


                </>
              )
            }
            if (item.type === 'video') {

              return (
                (item.watchBy == undefined || (watchAllFields[item.watchBy] && item.watchValues.includes(watchAllFields[item.watchBy]))) &&
                (!steps || (item.onTab && openTab === item.onTab)) &&
                <>
                  <div className={` lg:p-2 ${item.className}   form-element`}>
                    {item.label && <div className="capitalize form-label">{item.label}</div>}
                    <div className='row'>
                      {!(item.disabled) && <div className='col-12 col-sm-12 col-lg-12 pt-1'>
                        <div className='border-secondary height-350'>
                          <i class="fas fa-video w-full text-center text-5xl pt-3 mt-5 pt-5"></i>
                          <p className='w-full text-center mb-5'>Click Here! For Upload Your Video</p>
                          <input
                            ref={item.ref}
                            name={item.name}
                            id={item.name}
                            type="file"
                            onChange={item.onChnage ? (e) => { item.onChange(e); setSelectedVideo(URL.createObjectURL(e.currentTarget.files[0])) } : (e) => setSelectedVideo(URL.createObjectURL(e.currentTarget.files[0]))}
                            className={`form-input custom-file-input  d-none display-none ${errors[item.name] ? 'border-red-500' : ''
                              }`}
                            placeholder={item.placeholder}
                            disabled={item.disabled ? item.disabled : false}
                          />
                          <label className='form-input custom-file-input display-flex' for={item.name} ></label>
                        </div>
                      </div>}
                      <div className='col-12 col-sm-12 col-lg-12 pt-1'>
                        {
                          (item.defaultValue != undefined || selectedVideo) &&
                          <video width="100%" height="100%" controls data-reactid=".0.1.0.0.0" className="video sm:w-full mt-4" autoPlay
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
                      </div>

                      {!alerts && errors[item.name] && (
                        <div className="form-error text-center">{errors[item.name].message}</div>
                      )}

                    </div>
                  </div>

                  <input
                    ref={item.ref}
                    name='duration'
                    type='text'
                    defaultValue={videoDuration}
                    hidden={true}
                    className={`form-input ${errors[item.name] ? 'border-red-500' : ''
                      }`}
                    placeholder={item.placeholder}
                  />

                </>
              )
            }
            if (item.type === 'file') {
              return (
                (item.watchBy == undefined || (watchAllFields[item.watchBy] && item.watchValues.includes(watchAllFields[item.watchBy]))) &&
                (!steps || (item.onTab && openTab === item.onTab)) &&
                <>
                  {!(item.disabled) && <div className={` lg:p-2 ${item.className}  input-background form-element`}>
                    {item.label && <div className="capitalize form-label">{item.label}</div>}


                    {<div className='border-secondary height-small-100'>
                      <i class="fas fa-folder  w-full text-center text-5xl pt-1"></i>
                      <p className='w-full text-center mb-5'>Click Here! For Upload Your File</p>
                      <input
                        ref={item.ref}
                        name={item.name}
                        id={item.name}
                        type="file"
                        onChange={item.onChnage ? (e) => item.onChange(e) : (e) => onSelectFile(e, 100, 100, item.name)}
                        className={`form-input custom-file-input display-none d-none ${errors[item.name] ? 'border-red-500' : ''
                          }`}
                        placeholder={item.placeholder}
                      />
                       <label className='form-input custom-file-input display-flex' for={item.name} ></label>
                    </div>}
                    {!alerts && errors[item.name] && (
                      <div className="form-error text-center">{errors[item.name].message}</div>
                    )}
                  </div>}



                  {
                    (item.defaultValue != undefined || selectedFile) &&
                    (!item.imageprev || item.imageprev == 'after') && ((preview && preview[`image${item.name}`]) || item.defaultValue)
                    &&
                    <div className={` lg:p-2 ${item.className}  input-background form-element`}  >
                      {item.label && item.disabled ? <div className="capitalize form-label">{item.label}</div> : "Preview"}
                      <embed src={preview && preview[`image${item.name}`] ? preview[`image${item.name}`] : item.defaultValue}
                        type="application/pdf" width="500" height="375" ></embed>
                      {/* <img src={preview && preview[`image${item.name}`] ? preview[`image${item.name}`] : item.defaultValue} className="h-32 rounded max-w-full mr-2 mb-2 " /> */}
                    </div>
                  }
                </>
              )
            }
            if (item.type === 'image2') {
              return (
                <>
                  <div className={` lg:p-2 ${item.className}  input-background form-element`}>
                    <ImageCrop />
                    {!alerts && errors[item.name] && (
                      <div className="form-error">{errors[item.name].message}</div>
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
                  <div className={`w-full flex  flex-row flex-wrap justify-between items-center  ${item.baseClassName}`}>
                    {item.label && <div className="form-label lg:ml-2">{item.label}</div>}
                    {!item.fixNumber && <button id="reOrderBtn" className="flex btn px-2 py-1.5 md:px-2 lg:py-1.5 btn-outlined bg-transparent text-xs text-blue-600 bg-blue border-blue-500 hover:border-blue-700 float-right mb-2 sm:w-auto lg:mr-2 items-baseline"
                      onClick={(e) => append(e, item.name)}> <i class="fas fa-plus mr-1"></i>
                      {
                        item.btnType == 'icon' && '' ||
                        (item.btnName ? `Add  new ${item.btnName}` : `Add New`)
                      }
                    </button>
                    }

                    {
                      // Array.from(Array(multipleFields[item.name]).keys())
                      <div className={`${item.className} ${item.extraclassName}`}>
                        {multipleFields[item.name] &&
                          multipleFields[item.name].map((i, indexItem) => {

                            const key = 'key' + i

                            let arrayCHild = multipleChildFields[`${item.name}`] ? (multipleChildFields[`${item.name}`][i] ? multipleChildFields[`${item.name}`][i] : multipleChildFields[`${item.name}`][0]) : []
                            return <>
                              {indexItem > 0 && <hr />}
                              {item.box && item.box == true && <div className="mt-4 flex w-full">

                                {item.box && item.box == true && <h5 className=" pb-2 md:p-2 text-eduplus-base text-sm text-bold">{item.label} {indexItem + 1}</h5>}
                                {
                                  item.btnUp && (indexItem + 1) == multipleFields[item.name].length && <button id="reOrderBtn" className="btn btn-default p-2 mb-2 btn-outlined bg-transparent text-base hover:text-blue-700 border-blue-500 hover:border-blue-700 float-right ml-2  sm:w-auto"
                                    onClick={(e) => append(e, item.name)}>
                                    {
                                      item.btnType == 'icon' && <FiPlus size={18} /> ||
                                      (item.btnName ? `Add  new ${item.btnName}` : `Add Row`)
                                    }
                                  </button>
                                }
                              </div>}
                              <div className={` ${item.className} ${item.box && item.box == true ? 'border-b last:border-0' : ''}`} >
                                {item.fields.map((data) => {

                                  return <>

                                    {
                                      (data.watchBy == undefined || (watchAllFields[item.name] && watchAllFields[item.name][key] && watchAllFields[item.name][key][data.watchBy] && data.watchValues.includes(watchAllFields[item.name][key][data.watchBy]))) &&
                                      <div className={` input-background form-element lg:p-2 ${data.className}`} style={{ marginBottom: 0 }} >
                                        {(data.type == 'radio' || data.type == 'checkbox') &&
                                          <div className="flex items-center justify-start md:space-x-2">

                                            {data.showLabel && <label>{data.label}</label>}
                                            {data.options.map((option, j) => (
                                              <label className="flex items-center justify-start space-x-2">
                                                <input
                                                  ref={data.ref}
                                                  key={`${item.name}[${key}][${data.name}]`}
                                                  name={`${item.name}[${key}][${data.name}]`}
                                                  type={data.type}
                                                  defaultChecked={item.defaultValue != undefined && item.defaultValue[i] != undefined && option.value == item.defaultValue[i][data.name]}
                                                  onChange={data.onChange ? (e) => data.onChange(e) : null}
                                                  value={option.value}
                                                  className={`form-${data.type} h-4 w-4 ${errors[data.name] ? 'text-red-500' : ''
                                                    }`}
                                                />
                                                <span
                                                  className={`capitalize ${errors[`${item.name}[${key}][${data.name}]`] ? 'text-red-500' : ''
                                                    }`}>
                                                  {option.label}
                                                </span>
                                              </label>
                                            ))}

                                            {!alerts && errors[item.name] && errors[item.name] && errors[item.name][key] && errors[item.name][key][data.name] && (
                                              <div className="form-error">{errors[item.name][key][data.name].message}</div>
                                            )}
                                          </div>
                                          ||
                                          data.type == 'image' &&
                                          <div className="flex items-center justify-start space-x-2">

                                            <input
                                              ref={data.ref}
                                              name={`${item.name}[${key}][${data.name}]`}
                                              type="file"
                                              onChange={data.onChnage ? (e) => { data.onChange(e); onSelectFile(e, 100, 100, `${item.name}[${key}][${data.name}]`) } : (e) => onSelectFile(e, 100, 100, `${item.name}[${key}][${data.name}]`)}
                                              className={`form-input ${errors[`${item.name}[${key}][${data.name}]`] ? 'border-red-500' : ''}`}
                                              placeholder={data.placeholder}
                                              disabled={data.disabled ? data.disabled : false}
                                            />

                                            {!alerts && errors[item.name] && errors[item.name] && errors[item.name][key] && errors[item.name][key][data.name] && (
                                              <div className="form-error">{errors[item.name][key][data.name].message}</div>
                                            )}
                                          </div>
                                          ||
                                          (data.type == 'select') &&
                                          <div className=" items-center justify-start space-x-2">
                                            {data.addNew && SecondUpon && <a className="pl-2 text-blue-500 cursor-pointer text-primary w-full text-right" onClick={() => changeModalStatus(data.addNew)}>Add New</a>}

                                            <input
                                              key={`${item.name}[${key}][${data.name}]`}
                                              ref={data.ref}
                                              name={`${item.name}[${key}][${data.name}]`}
                                              type='text'
                                              // value={filterObject[`${item.datalabel}`] && filterObject[`${item.datalabel}`][`${key}`] && filterObject[`${item.datalabel}`][`${key}`][data.dataname] && ((!filterObject[`${item.datalabel}`][`${key}`][data.dataname].includes('[') && data.isMultiple == true) ? `[${filterObject[`${item.datalabel}`][`${key}`][data.dataname]}]` : `${filterObject[`${item.datalabel}`][`${key}`][data.dataname]}`)}
                                              value={filterObject[`${item.name}[${key}]`] && filterObject[`${item.name}[${key}]`][data.dataname] && ((!filterObject[`${item.name}[${key}]`][data.dataname].includes('[') && data.isMultiple == true) ? `[${filterObject[`${item.name}[${key}]`][data.dataname]}]` : `${filterObject[`${item.name}[${key}]`][data.dataname]}`)}
                                              placeholder={item.placeholder}
                                              hidden={true}
                                            />
                                            <Select
                                              className={`form-select ${errors[`${item.name}[${key}][${data.name}]`] ? 'border border-red-500' : ''}`}
                                              // value={defaultSelectObject && defaultSelectObject[`${item.datalabel}`] && defaultSelectObject[`${item.datalabel}`][key] ? defaultSelectObject[`${item.datalabel}`][key][`${data.datalabel}`] : []}
                                              value={defaultSelectObject && defaultSelectObject[`${item.name}[${key}]`] ? defaultSelectObject[`${item.name}[${key}]`][`${data.datalabel}`] : []}
                                              valueKey="id"
                                              components={selectdatas && selectdatas[`${data.datalabel}`] && selectdatas[`${data.datalabel}`].length > 500 ? { MenuList } : false}
                                              isClearable={true}
                                              placeholder={<div>Select {data.label} ( Type to search)</div>}
                                              options={selectdatas ? selectdatas[`${data.datalabel}`] : []}
                                              isMulti={data.isMultiple}
                                              onChange={data.onChange ? (e) => { data.onChange; selectChange(e, data.dataname, data.datalabel, data.effectedRows, `${item.name}[${key}]`) } : (e) => selectChange(e, data.dataname, data.datalabel, data.effectedRows, `${item.name}[${key}]`)}
                                              // defaultValue={defaultSelectObject && defaultSelectObject[`${item.datalabel}`] && defaultSelectObject[`${item.datalabel}`][key] ? defaultSelectObject[`${item.datalabel}`][key][`${data.datalabel}`] : []}
                                              defaultValue={defaultSelectObject && defaultSelectObject[`${item.name}[${key}]`] ? defaultSelectObject[`${item.name}[${key}]`][`${data.datalabel}`] : []}
                                            />

                                            {!alerts && errors[item.name] && errors[item.name][key] && errors[item.name][key][data.dataname] && (
                                              <div className="form-error">{errors[item.name][key][data.dataname]['value_id'].message}</div>
                                            )}
                                          </div>
                                          ||

                                          (data.type == 'multiple-fields') &&
                                          <>
                                            <div className="w-full flex  flex-row flex-wrap justify-between">
                                              {data.label && <div className="form-label ml-2">{data.label}</div>}
                                              <button id="reOrderBtn" className="btn btn-default p-2 btn-outlined bg-transparent text-base hover:text-blue-700 border-blue-500 hover:border-blue-700 float-right ml-2  sm:w-auto"
                                                onClick={(e) => appendChild(e, data.name, item.name, i)}>
                                                {
                                                  data.btnType == 'icon' && <FiPlus size={18} /> ||
                                                  (data.btnName ? `Add  new ${data.btnName}` : `Add Row`)
                                                }
                                              </button>

                                              {
                                                // Array.from(Array(multipleFields[data.name]).keys())
                                                <div className={` ${data.className} ${data.extraclassName}`}>
                                                  {multipleChildFields[item.name] && arrayCHild[data.name] &&
                                                    arrayCHild[data.name].map((j, indexItem) => {

                                                      const keychild = 'key' + j
                                                      return <>
                                                        {indexItem > 0 && <hr />}
                                                        {data.box && data.box == true && <h5 className="sm:pt-4 sm:pb-4 text-eduplus-base text-bold">{data.label} {indexItem + 1}</h5>}

                                                        <div className={` ${data.className} ${data.box && data.box == true ? 'border-b last:border-0' : ''}`} >
                                                          {data.fields.map((dataCHild) => {

                                                            return <>

                                                              {
                                                                <div className={` input-background form-element lg:p-2 ${dataCHild.className}`} style={{ marginBottom: 0 }} >
                                                                  {
                                                                    (dataCHild.type == 'select') &&
                                                                    <div className=" items-center justify-start space-x-2">
                                                                      <select
                                                                        ref={dataCHild.ref}
                                                                        key={`${item.name}[${key}][${data.name}][${keychild}][${dataCHild.name}]`}
                                                                        name={`${item.name}[${key}][${data.name}][${keychild}][${dataCHild.name}]`}
                                                                        defaultValue={(dataCHild.defaultValue != undefined && dataCHild.defaultValue[i] != undefined) ? dataCHild.defaultValue[i][dataCHild.name] : ''}
                                                                        hidden={dataCHild.hidden ? dataCHild.hidden : false}
                                                                        onChange={dataCHild.onChnage ? (e) => dataCHild.onChange(e) : null}
                                                                        className={`form-input   ${errors[dataCHild.name] ? 'border-red-500' : ''
                                                                          }`}
                                                                        placeholder={data.placeholder}

                                                                      >

                                                                        {dataCHild.values.map((option, j) => (
                                                                          <option key={j} value={option.value}
                                                                            selected={(dataCHild.defaultValue != undefined && dataCHild.defaultValue[i] != undefined) ? dataCHild.defaultValue[i][dataCHild.name] == option.value : false}
                                                                          >
                                                                            {option.label}
                                                                          </option>
                                                                        ))}
                                                                      </select>

                                                                      {!alerts && errors[data.name] && errors[data.name][key] && errors[data.name][key][data.dataname] && (
                                                                        <div className="form-error">{errors[data.name][key][data.dataname]['value_id'].message}</div>
                                                                      )}
                                                                    </div>
                                                                    ||
                                                                    <>
                                                                      <input
                                                                        ref={dataCHild.ref}
                                                                        key={`${item.name}[${key}][${data.name}][${keychild}][${dataCHild.name}]`}
                                                                        name={`${item.name}[${key}][${data.name}][${keychild}][${dataCHild.name}]`}
                                                                        type={dataCHild.type}
                                                                        defaultValue={(dataCHild.defaultValue != undefined && dataCHild.defaultValue[i] != undefined) ? dataCHild.defaultValue[i][dataCHild.name] : ''}
                                                                        hidden={dataCHild.hidden ? dataCHild.hidden : false}
                                                                        onChange={dataCHild.onChnage ? (e) => dataCHild.onChange(e) : null}
                                                                        className={`form-input   ${errors[dataCHild.name] ? 'border-red-500' : ''
                                                                          }`}
                                                                        placeholder={data.placeholder}
                                                                      />
                                                                      {!alerts && errors[data.name] && errors[data.name] && errors[data.name][key] && errors[data.name][key][dataCHild.name] && (
                                                                        <div className="form-error">{errors[data.name][key][dataCHild.name].message}</div>
                                                                      )}
                                                                    </>

                                                                  }
                                                                </div>}

                                                            </>

                                                          })}


                                                          {<button id="reOrderBtn" className=" btn btn-default p-1 lg:p-2 btn-outlined bg-transparent text-red-500 hover:text-red-700 border-red-500 hover:border-red-700 float-right ml-2 lg:m-2"
                                                            onClick={(e) => { removeChild(e, data, j, item.name, i) }}>
                                                            {

                                                              data.btnType == 'icon' && <FiMinus size={18} /> ||
                                                              (data.btnName ? `Remove ${data.btnName}` : `Remove Row`)}
                                                          </button>
                                                          }


                                                        </div>

                                                      </>

                                                    })}
                                                </div>
                                              }
                                            </div>

                                          </>

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
                                              className={`form-input   ${errors[data.name] ? 'border-red-500' : ''}`}
                                              placeholder={data.placeholder}
                                            />
                                            {!alerts && errors[item.name] && errors[item.name] && errors[item.name][key] && errors[item.name][key][data.name] && (
                                              <div className="form-error">{errors[item.name][key][data.name].message}</div>
                                            )}
                                          </>

                                        }
                                      </div>}

                                  </>

                                })}


                                {!item.fixNumber && <button id="reOrderBtn" className=" btn px-2.5 py-1 btn-outlined bg-transparent text-red-500 hover:text-red-700 border-red-500 hover:border-red-700 float-right md:ml-2 lg:m-2 text-sm transform-none"
                                  onClick={(e) => { remove(e, item, i) }}>
                                  {

                                    item.btnType == 'icon' && <FiMinus size={18} /> ||
                                    (item.btnName ? `Remove ${item.btnName}` : `Remove Row`)}
                                </button>
                                }


                              </div>

                            </>

                          })}
                      </div>
                    }
                  </div>

                </>
              )
            }

            if (item.type === 'blank') {
              return randerHtml(item.content)
            }

            return (
              (item.watchBy == undefined || (watchAllFields[item.watchBy] && item.watchValues.includes(watchAllFields[item.watchBy]))) &&
              (!steps || (item.onTab && openTab === item.onTab)) &&
              <>
                <div className={`${item.type == 'hidden' ? 'mb-0mb-0' : 'lg:p-2'} ${item.className}   input-background form-element`}>
                  {item.label && item.type != 'hidden' && <div className="capitalize form-label">{item.label}</div>}
                  <input
                    ref={item.ref}
                    name={item.name}
                    type={item.type}
                    defaultValue={item.defaultValue}
                    hidden={item.hidden ? item.hidden : false}
                    disabled={item.disabled ? item.disabled : false}
                    onChange={item.onChnage ? (e) => item.onChange(e) : null}
                    className={`form-input  ${errors[item.name] ? 'border-red-500' : ''} ${item.disabled ? 'bg-gray-100' : ''} `}
                    placeholder={item.placeholder}
                    min={item.minValue ? item.minValue : null}
                  />
                  {!alerts && errors[item.name] && (
                    <div className="form-error">{errors[item.name].message}</div>
                  )}
                </div>
              </>
            )
          })}
        </div>
        <div className="w-full text-center md:px-2 mt-3">
          {
            <button
              type="submit"
              className={`btn btn-default eduplus-bg  text-white text-center  py-8 float-right button_size ${btnClass}`}
            >{steps && openTab < (steps.length) ? 'Next' : buttonText} <i class="fas fa-chevron-right ml-1"></i></button>
          }

        </div>
      </form>

      {
        addNewModal && addNewModal == true && SecondUpon && storeFields && storeFields != {} &&
        <StoreModel
          title={`Add New ${AddNewSection.baseTitle}`}
          body={
            <div>
              {
                storeFields && storeFields != {} && <Validation items={Object.values(storeFields)} SecondUpon={false} onSubmit={onAddnew} alerts={false} />
              }

            </div>
          }
          useModel={addNewModal}
          hideModal={changeModalStatus}
        />
      }

    </>
  )
}


export default FormValidation