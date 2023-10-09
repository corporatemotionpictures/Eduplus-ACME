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
import SliderModel from 'components/functional-ui/modals/modal-status'
import Validation from 'components/functional-ui/forms/validation'
import { Badge } from 'components/functional-ui/badges'
import { getSettings } from 'helpers/apiService';
import { Vimeo } from 'vimeo';

//

export default class extends Component {
  state = {
    values: {},
    defaultValues: {},
    search: '',
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
    videos: [],
    storeFilter: {},
    imageLimits: {},
    baseTitle: define.video,
    startUpload: false,
    uploadPercentage: 0,
    startUploadMessage: 'Please Wait! Video Upload being processed....',
    modelTitle: 'videos',
    queryTitle: 'videos',
    hideHierarchy: this.props.hideHierarchy,
    hierarchyDefaultValues: {},
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

    let videoType = await getSettings('video_type')
    let allowQuickTest = await getSettings('allow_quick_test')
    this.setState({
      videoType: videoType ? videoType : 'VIDEO',
      allowQuickTest: allowQuickTest,
    })
    var data = await fetchAll(this.state.modelTitle, { ...this.state.filters, 'forList': true });
    this.setState(data)
    // data = await updateAdditional('count-all', this.state.queryTitle, {'is_active': true });
    // this.setState(data)

    var imageLimits = await fetchAll('image-size-limits', { 'label': this.state.queryTitle });
    imageLimits = imageLimits.success = true ? imageLimits.sizes : {}
    this.setState({ fetching: false, imageLimits: imageLimits })
    if (this.state.hideHierarchy && this.state.hideHierarchy <= 2 && this.state.hideHierarchy > 0) {
      var data = await fetchAll('exams', { 'limit': 1, offset: 1, 'forList': true });
      if (data && data.exams && data.exams[0]) {
        this.setState({
          hierarchyDefaultValues: {
            ...this.state.hierarchyDefaultValues,
            examID: data.exams[0].id
          }
        })

        if (this.state.hideHierarchy == 2) {
          data = await fetchAll('courses', { 'limit': 1, offset: 1, 'forList': true, examID: data.exams[0].id });
          if (data && data.courses && data.courses[0]) {
            this.setState({
              hierarchyDefaultValues: {
                ...this.state.hierarchyDefaultValues,
                examID: data.courses[0].id
              }
            })
          }
        }
      }
    }
  }

  buildAddModel = (lactureType) => {

    this.setState({
      displayModelTitle: `Add ${lactureType}`,
      lactureType: lactureType
    })


    let items = this.getItems(lactureType)
    return this.setState({
      storeFields: items,
      showModel: false
    })

  }

  getItems = (lactureType) => {

    let examID = this.state.hideHierarchy >= 1 ? [this.state.hierarchyDefaultValues.examID] : null
    let courseID = this.state.hideHierarchy >= 2 ? [this.state.hierarchyDefaultValues.courseID] : null


    return {
      'lacture_type': {
        label: '',
        name: 'lacture_type',
        type: 'hidden',
        defaultValue: lactureType,
        onTab: 1,
      },
      'exam_ids': {
        datalabel: 'exams',
        dataname: 'examID',
        label: `${define.exam} Name`,
        error: { required: `Please select ${define.exam} Name` },
        name: 'exam_ids',
        idSelector: 'id',
        view: 'name',
        type: examID ? 'hidden' : 'select',
        className: examID ? '' : "sm:w-1/3",
        defaultValue: examID && `[${examID}]`,
        placeholder: 'Enter Exam Name',
        addNew: {
          baseTitle: define.exam,
          modelTitle: 'exams',
          queryTitle: 'exams',
        },
        isMultiple: true,
        effectedRows: ['courseID', 'subjectID', 'chapterID'],
        onTab: 1,
      },
      'course_ids': {
        datalabel: 'courses',
        dataname: 'courseID',
        label: `${define.course} Name`,
        error: { required: `Please select ${define.course} Name` },
        preFilters: { examID: examID ? examID : 'lock' },
        name: 'course_ids',
        idSelector: 'id',
        view: 'name',
        type: courseID ? 'hidden' : 'select',
        className: courseID ? '' : "sm:w-1/3",
        defaultValue: courseID && `[${courseID}]`,
        placeholder: 'Enter course Name',
        isMultiple: true,
        addNew: {
          baseTitle: define.course,
          modelTitle: 'courses',
          queryTitle: 'courses',
        },
        effectedRows: ['subjectID', 'chapterID'],
        onTab: 1,
      },
      'subject_ids': {
        datalabel: 'subjects',
        dataname: 'subjectID',
        label: `${define.subject} Name`,
        error: { required: `Please select ${define.subject} Name` },
        preFilters: { examID: examID ? examID : 'lock', courseID: courseID ? courseID : [] },
        name: 'subject_ids',
        idSelector: 'id',
        view: 'name',
        type: 'select',
        className: "sm:w-1/3",
        placeholder: 'Enter subject Name',
        isMultiple: true,
        addNew: {
          baseTitle: define.subject,
          modelTitle: 'subjects',
          queryTitle: 'subjects',
        },
        effectedRows: ['chapterID'],
        onTab: 1,
      },
      'chapter_ids': {
        datalabel: 'chapters',
        dataname: 'chapterID',
        label: `${define.chapter} Name`,
        error: { required: `Please select ${define.chapter} Name` },
        preFilters: { examID: examID ? examID : 'lock', courseID: courseID ? courseID : [], subjectID: [] },
        name: 'chapter_ids',
        idSelector: 'id',
        view: 'name',
        type: 'select',
        className: "sm:w-1/3",
        placeholder: 'Enter chapter Name',
        isMultiple: true,
        addNew: {
          baseTitle: define.chapter,
          modelTitle: 'chapters',
          queryTitle: 'chapters',
        },
        effectedRows: [],
        onTab: 1,
      },
      'title': {
        label: 'title',
        error: { required: 'Please enter a valid title' },
        name: 'title',
        type: 'text',
        className: "sm:w-1/3",
        placeholder: 'Enter Title',
        onTab: 1,
      },
      'mode': {
        datalabel: 'main_sections',
        dataname: 'mainSectionID',
        label: ' mode',
        name: 'mode',
        idSelector: 'value',
        view: 'label',
        error: { required: 'Please Select a Mode' },
        type: 'select',
        values: [{
          value: 'PAID',
          label: 'PAID'
        },
        {
          value: 'FREE',
          label: 'FREE'
        }
        ],
        className: "sm:w-1/3",
        placeholder: 'Enter  Type',
        isMultiple: false,
        onTab: 1,
      },
      'language_id': {
        datalabel: 'languages',
        dataname: 'languageID',
        label: 'Language',
        error: { required: 'Please enter a valid Language' },
        name: 'language_id',
        idSelector: 'id',
        view: 'title',
        type: 'select',
        className: "sm:w-1/3",
        placeholder: 'Enter Language',
        isMultiple: false,
        effectedRows: [],
        onTab: 1,
      },
      'tags': lactureType == 'TEST' ? { type: 'blank' } : {
        label: 'Tags',
        name: 'tags',
        type: 'text',
        className: "sm:w-1/3",
        placeholder: 'Enter Tags',
        onTab: 1,
      },
      'duration': lactureType == 'VIDEO' || lactureType == 'LINK'  ? { type: 'blank' } : {
        label: 'Duration',
        name: 'duration',
        type: 'text',
        className: "sm:w-1/3",
        placeholder: 'Enter duration',
        onTab: 1,
      },
      'video_id': lactureType == 'TEST' || lactureType == 'VIDEO' || lactureType == 'LINK'  ? { type: 'blank' } : {
        label: 'Video ID',
        name: 'video_id',
        type: 'text',
        className: "sm:w-1/3",
        placeholder: 'Enter Video ID',
        onTab: 1,
      },
      'video_url': lactureType == 'TEST' || lactureType == 'VIDEO' || lactureType == 'YOUTUBE'  ? { type: 'blank' } : {
        label: 'Video Url',
        name: 'video_url',
        type: 'text',
        className: "sm:w-1/3",
        placeholder: 'Enter Video Url',
        onTab: 1,
      },
      'description': {
        label: 'Description',
        error: { required: 'Please enter a valid description' },
        name: 'description',
        type: 'textarea',
        className: "w-full",
        placeholder: 'Enter description',
        onTab: 1,
      },
      'video': lactureType == 'TEST' || lactureType == 'YOUTUBE' || lactureType == 'LINK' ? { type: 'blank' } : {
        label: 'Video',
        name: 'video',
        width: 500,
        height: 500,
        maxfilesize: 500,
        fileTypes: [".mp4"],
        type: 'video',
        className: "sm:w-1/3",
        onTab: 1,
      },
      'thumbnail': lactureType == 'TEST' ? { type: 'blank' } : {
        label: 'Image',
        name: 'thumbnail',
        error: { required: 'Please Choose an Image' },
        ...this.state.imageLimits,
        fileTypes: ["jpg", "png", "jpeg"],
        type: 'image',
        className: "sm:w-1/3",
        onTab: 1,
      },
      'questions': lactureType == 'VIDEO' || lactureType == 'YOUTUBE' || lactureType == 'LINK' ? { type: 'blank' } : {
        label: 'Questions',
        type: 'multiple-fields',
        name: 'questions',
        fields: [
          {
            label: '',
            name: 'id',
            type: 'hidden',
            // defaultValue: row.id,
            onTab: 1,
          },
          {
            label: 'Question',
            name: 'question',
            type: 'text',
            error: { required: 'Please enter a valid Question' },
            className: "sm:w-full  pb-3",
            placeholder: 'Enter Question'
          },
          {
            label: 'Option 1',
            name: 'option1',
            type: 'text',
            error: { required: 'Please enter a valid Option 1' },
            className: "sm:w-1/4  pb-3",
            placeholder: 'Enter Option 1'
          },
          // {
          //   label: 'Option 1 Image',
          //   name: 'option1_image',
          //   fileTypes: ["jpg", "png", "jpeg"],
          //   type: 'image',
          //   className: "sm:w-1/4",
          // },
          {
            label: 'Option 2',
            name: 'option2',
            type: 'text',
            error: { required: 'Please enter a valid Option 2' },
            className: "sm:w-1/4  pb-3",
            placeholder: 'Enter Option 2 '
          },
          // {
          //   label: 'Option 2 Image',
          //   name: 'option2_image',
          //   type: 'image',
          //   fileTypes: ["jpg", "png", "jpeg"],
          //   className: "sm:w-1/4",
          //   placeholder: 'Enter Option 2'
          // },
          {
            label: 'Option 3',
            name: 'option3',
            type: 'text',
            error: { required: 'Please enter a valid Option 3' },
            className: "sm:w-1/4  pb-3",
            placeholder: 'Enter Option 3 '
          },
          // {
          //   label: 'Option 3 Image',
          //   name: 'option3_image',
          //   type: 'image',
          //   fileTypes: ["jpg", "png", "jpeg"],
          //   className: "sm:w-1/4",
          //   placeholder: 'Enter Option 3'
          // },
          {
            label: 'Option 4',
            name: 'option4',
            type: 'text',
            error: { required: 'Please enter a valid Option 4' },
            className: "sm:w-1/4  pb-3",
            placeholder: 'Enter Option 4  '
          },
          // {
          //   label: 'Option 4 Image',
          //   name: 'option4_image',
          //   type: 'image',
          //   fileTypes: ["jpg", "png", "jpeg"],
          //   className: "sm:w-1/4",
          //   placeholder: 'Enter Option 4'
          // },
          {
            label: 'Answer :',
            name: 'answer',
            error: { required: 'Please choose One' },
            type: 'radio',
            options: [
              { value: 'option1', label: 'Option 1' },
              { value: 'option2', label: 'Option 2' },
              { value: 'option3', label: 'Option 3' },
              { value: 'option4', label: 'Option 4' },
            ],
            className: "sm:w-full batch-radio",
            placeholder: 'Enter Description',
            showLabel: true
          },
          {
            label: 'Explaination',
            name: 'explaination',
            type: 'text',
            className: "sm:w-full  pb-3",
            placeholder: 'Enter Explaination'
          },
        ],
        className: "w-full flex flex-col lg:flex-row lg:flex-wrap pb-3",
        placeholder: 'Enter Description',
        onTab: 2,
        box: true,
        btnUp: true,
        btnName: 'Question',

      },

    }

  }

  randerEditModal = (row) => {

    // this.buildAddModel(row.lacture_type);

    this.setState({
      displayModelTitle: `Edit ${row.lacture_type} - ${row.title ? row.title : row.name}`,
      lactureType: row.lacture_type
    })

    var items = this.getItems(row.lacture_type);

    Object.keys(items).map((key) => {
      items[key].defaultValue = row[key]
    })

    items.course_ids.preFilters = {
      examID: row.exam_ids && JSON.parse(row.exam_ids).length > 0 ? JSON.parse(row.exam_ids) : 'lock'
    }
    items.subject_ids.preFilters = {
      examID: row.exam_ids && JSON.parse(row.exam_ids).length > 0 ? JSON.parse(row.exam_ids) : 'lock',
      courseID: row.course_ids && JSON.parse(row.course_ids).length > 0 ? JSON.parse(row.course_ids) : 'lock'
    }
    items.chapter_ids.preFilters = {
      examID: row.exam_ids && JSON.parse(row.exam_ids).length > 0 ? JSON.parse(row.exam_ids) : 'lock',
      courseID: row.course_ids && JSON.parse(row.course_ids).length > 0 ? JSON.parse(row.course_ids) : 'lock',
      subjectID: row.subject_ids && JSON.parse(row.subject_ids).length > 0 ? JSON.parse(row.subject_ids) : 'lock'
    }

    if (items.thumbnail && items.thumbnail.error) {
      delete items.thumbnail.error.required;

    }

    items.thumbnail = {
      ...items.thumbnail,
      ...this.state.imageLimits
    }


    console.log(items)

    if ('id' in items) {
      items.id.defaultValue = row.id

    } else {
      items = {
        'id': {
          label: '',
          name: 'id',
          type: 'hidden',
          defaultValue: row.id,
          onTab: 1,
        },
        ...items
      }
    }

    if (items.video) {
      delete items.video;
    }



    if (row.lacture_type == 'VIDEO') {
      items = {
        ...items,
        'video_id': {
          label: 'Video ID',
          name: 'video_id',
          type: 'text',
          defaultValue: row.video_id,
          className: "w-full",
          placeholder: 'Enter Video ID'
        },

      }
    }


    this.setState({
      storeFields: items,

    }, () => {
      this.setState({
        showModel: true
      })
    })

  }

  changeModalStatus = (lactureType) => {

    if (this.state.showModel == true) {
      // this.buildAddModel();
      this.setState({
        showModel: false
      })
    } else {
      this.buildAddModel(lactureType);
      this.setState({
        showModel: true
      })
    }
  }

  onStoreSubmit = async (data) => {

    var video;
    var message;

    console.log(data)

    var image = data.lacture_type == 'VIDEO' || data.lacture_type == 'YOUTUBE' || data.lacture_type == 'LINK' ? 'thumbnail' : null

    if ('id' in data) {
      video = await edit(this.state.modelTitle, data, image);
      message = `${data.lacture_type} Updated Successfully`

      // check Response
      if (video.updated) {
        toastr.success(message)
        this.fetchList()
        // resetForm();
      }
      else {
        let error;
        if (video.video) {
          error = video.video.error
        }
        else if (video.error) {
          error = video.error.details ? video.error.details[0].message : video.error
        }
        toastr.error(error)
      }

      this.setState({
        showModel: false
      })
    } else {

      if (data.lacture_type == 'VIDEO') {
        this.setState({
          // showModel: false,
          startUpload: true,
          startUploadMessage: 'Please Wait! Video Upload being processed....'
        })

        var vimeoUploadApp = this;

        let vimeoAuth = await getSettings('vimeoAuth');

        let CLIENT_ID = vimeoAuth.CLIENT_ID;
        let CLIENT_SECRET = vimeoAuth.CLIENT_SECRET;
        let ACCESS_TOKEN = vimeoAuth.ACCESS_TOKEN;



        const client = new Vimeo(CLIENT_ID, CLIENT_SECRET, ACCESS_TOKEN);

        let file_name = data.video[0];


        let response = await client.upload(
          file_name,
          {
            'name': data.title,
            'description': data.description,
            'privacy': {
              'download': false,
              'embed': 'public',
              'comments': 'anybody',
              'view': "disable",

            }

          },
          async function (uri) {

            // Get the metadata response from the upload and log out the Vimeo.com url
            client.request(uri + '?fields=link', function (error, body, statusCode, headers) {
              if (error) {
                return
              }



              // Make an API call to see if the video is finished transcoding.
              client.request(
                uri + '?fields=transcode.status',
                function (error, body, statusCode, headers) {
                  if (error) {
                    return
                  }

                }
              )
            })
            // convert tags

            data.video_id = uri

            delete data.video

            if (vimeoUploadApp.state.uploadPercentage >= 100) {
              video = await add(vimeoUploadApp.state.modelTitle, data, image);
              message = `${vimeoUploadApp.state.baseTitle} Added Successfully`

              // check Response
              if (video.updated) {
                toastr.success(message)

                let body = {
                  title: `We have new ${define.video} ready for you 😍`,
                  body: `Please open the app to check out the latest ${data.title} ${define.video} ready`,
                  course_ids: data.mode == 'PAID' ? data.course_ids : null,
                  subject_ids: data.mode == 'PAID' ? data.subject_ids : null,
                  action: 'Videos'
                };

                let pushNotification = await add('push-notifications', body);

                vimeoUploadApp.fetchList()
                vimeoUploadApp.setState({
                  showModel: false
                })
                // resetForm();
              }
              else {
                let error;
                if (video.video) {
                  error = video.video.error
                }
                else if (video.error) {
                  error = video.error.details ? video.error.details[0].message : video.error
                }
                toastr.error(error)
              }

            }
          },
          function (bytes_uploaded, bytes_total) {
            var percentage = (bytes_uploaded / bytes_total * 100).toFixed(2)

            vimeoUploadApp.setState({
              uploadPercentage: percentage,
            })

            if (percentage >= 100) {
              vimeoUploadApp.setState({
                startUpload: false
              })
            }
          },
          function (error) {
            vimeoUploadApp.setState({
              startUploadMessage: error
            })
          }
        )
      }
      else {
        video = await add(this.state.modelTitle, data, image);
        message = `${data.lacture_type} Added Successfully`

        // check Response
        if (video.updated) {
          toastr.success(message)
          this.fetchList()

          this.setState({
            showModel: false
          })
          // resetForm();
        }
        else {
          let error;
          if (video.video) {
            error = video.video.error
          }
          else if (video.error) {
            error = video.error.details ? video.error.details[0].message : video.error
          }
          toastr.error(error)
        }

      }

    }

  }


  // 
  componentDidMount() {
    this.buildAddModel(this.state.videoType);
    this.fetchList();

    console.log(this.state.videoType)

    // this.fetchBase();
  }

  // 
  render() {
    let data = this.state.videos

    const steps = [
      {
        title: 'Basic Details',
        active: true,
        disabled: false,
        index: 1
      },
      {
        title: 'Questions',
        active: false,
        disabled: true,
        index: 2
      },
    ]

    const div = <div>

      <button
        className="btn btn-default btn-rounded bg-base hover:bg-blue-600 text-white float-right mb-2  mr-2"
        type="button"
        onClick={() => this.changeModalStatus(this.state.videoType)}>
        <i class="fas fa-plus mr-1"></i> Add New Video
      </button>
      {this.state.allowQuickTest == 'YES' && <button
        className="btn btn-default btn-rounded bg-base hover:bg-blue-600 text-white float-right mr-2"
        type="button"
        onClick={() => this.changeModalStatus('TEST')}>
        <i class="fas fa-plus mr-1"></i> Add New Test
      </button>}
    </div>

    const columns = [

      {
        Header: 'Title',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              <span className="pt-1">{props.row.original.title}</span>
            </div>
          )
        },
      },
      this.state.hideHierarchy >= 1 ? { Header: ``, } : {
        Header: `${define.exams}`,
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              {props.row.original.exams && props.row.original.exams.map((item) => {
                return <Badge key={item.id} size='sm' color="bg-base text-white mr-2 mb-2" rounded>
                  {item.name}
                </Badge>
              })}
            </div>
          )
        },

      },
      this.state.hideHierarchy >= 2 ? { Header: ``, } : {
        Header: `${define.courses}`,
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              {props.row.original.courses && props.row.original.courses.map((item) => {
                return <Badge key={item.id} size='sm' color="bg-yellow-500 text-white mr-2 mb-2" rounded>
                  {item.name}
                </Badge>
              })}
            </div>
          )
        },

      },
      {
        Header: `${define.subjects}`,
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              {props.row.original.subjects && props.row.original.subjects.map((item) => {
                return <Badge key={item.id} size='sm' color="bg-base text-white mr-2 mb-2" rounded>
                  {item.name}
                </Badge>
              })}
            </div>
          )
        },
      },
      {
        Header: `${define.chapters}`,
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              {props.row.original.chapters && props.row.original.chapters.map((item) => {
                return <Badge key={item.id} size='sm' color="bg-base text-white mr-2 mb-2" rounded>
                  {item.name}
                </Badge>
              })}
            </div>
          )
        },
      },
      {
        Header: `Lacture Type`,
        Cell: props => {

          let color = 'bg-green-500 text-white'
          if (props.row.original.lacture_type == 'VIDEO') {
            color = 'bg-green-500 text-white'
          }
          if (props.row.original.lacture_type == 'TEST') {
            color = 'bg-red-500 text-white'
          }
          if (props.row.original.lacture_type == 'YOUTUBE') {
            color = 'bg-blue-500 text-white'
          }
          if (props.row.original.lacture_type == 'LINK') {
            color = 'bg-purple-500 text-white'
          }
          return (
            <div className="flex flex-wrap justify-start items-start" >
              <div className={` text-white border-0 text-center rounded w-20 py-1 ${color}`} >
                {props.row.original.lacture_type}
              </div>
            </div>
          )
        },

      },
    ]

    const filterObjects = [
      this.state.hideHierarchy >= 1 ? { type: 'blank' } : {
        label: `exams`,
        title: `${define.exams}`,
        name: 'examID',
        idSelector: 'id',
        view: 'name',
        type: 'select-multiple',
        effectedRows: ['courseID', 'subjectID', 'chapterID'],
      },
      this.state.hideHierarchy >= 2 ? { type: 'blank' } : {
        label: `courses`,
        title: `${define.courses}`,
        name: 'courseID',
        idSelector: 'id',
        view: 'name',
        type: 'select-multiple',
        effectedRows: ['subjectID', 'chapterID'],
      },
      {
        label: `subjects`,
        title: `${define.subjects}`,
        name: 'subjectID',
        idSelector: 'id',
        view: 'name',
        type: 'select-multiple',
        effectedRows: ['chapterID'],
      },
      {
        label: `chapters`,
        title: `${define.chapters}`,
        name: 'chapterID',
        idSelector: 'id',
        view: 'name',
        type: 'select-multiple',
        effectedRows: [],
      },
      {
        label: `Search ${this.state.baseTitle}s`,
        name: 'search',
        type: 'text',
        effectedRows: [],
        className: "sm:w-full",
        placeholder: `Search ${this.state.baseTitle} name here`
      }
    ]

    return (
      <>


        <SectionTitle title={this.props.parentName ? this.props.parentName : 'Dashbaord'} subtitle={`${this.state.baseTitle}s`} hideButton={true} html={div} />


        {
          this.state.showModel &&
          <StoreModel
            title={this.state.displayModelTitle}
            body={
              <div>
                {
                  this.state.storeFields && this.state.storeFields != {} && <Validation items={Object.values(this.state.storeFields)} onSubmit={this.onStoreSubmit} alerts={false} defaultValues={this.state.defaultValues} steps={this.state.lactureType == 'TEST' ? steps : null} />
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
          <Filter filterObjects={filterObjects} filterOnChange={true} onFilter={this.onFilter} />
          {
            this.state.fetching &&

            <Shimmer /> ||
            <Datatable
              columns={columns}
              deletable={this.props.contentDeletable}
              data={this.state.videos}
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

        {/* <SliderModel color="bg-base" defaultValue={this.state.uploadPercentage} title={this.state.startUploadMessage} /> */}
        {
          (this.state.startUpload == true || (this.state.uploadPercentage > 0 && this.state.uploadPercentage < 100)) && <SliderModel color="bg-base" defaultValue={this.state.uploadPercentage} title={this.state.startUploadMessage} />
        }


      </>

    )
  }

}
