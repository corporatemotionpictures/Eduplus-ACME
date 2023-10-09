import { Component } from 'react';
import { fetchAll, deleteData, fetchByID, add, edit } from 'helpers/apiService';
import React from 'react'
import SectionTitle from 'components/functional-ui/section-title'
import Datatable from 'components/functional-ui/datatable'
import Shimmer from 'components/website/shimmer/datatable'
import Widget from 'components/functional-ui/widget'
import Filter from 'components/classical-ui/filters'
import toastr from 'toastr'
import define from 'src/json/worddefination.json'
import Tooltip from 'components/functional-ui/tooltips'
import StoreModel from 'components/functional-ui/modals/modal-store'
import Validation from 'components/functional-ui/forms/validation'
import { Badge, CircularBadge } from 'components/functional-ui/badges'
import moment from 'moment';
import Link from 'next/link';
import { genrateToken } from 'helpers/zoom';
import PopupModel from 'components/functional-ui/modals/modal-popup'

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
    downloadModel: false,
    id: null,
    events: [],
    storeFilter: {},
    imageLimits: {},
    baseTitle: define.liveEvent,
    modelTitle: 'live-events',
    queryTitle: 'live_events',
    access: 'ZOOM',
    hideHierarchy: this.props.hideHierarchy,
    hierarchyDefaultValues: {}
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
    this.setState({ fetching: false, imageLimits: imageLimits, jwtToken: await genrateToken() })

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

  buildAddModel = () => {

    this.setState({
      displayModelTitle: `Add ${this.state.baseTitle}`
    })

    let  examID =  this.state.hideHierarchy >= 1 ? [this.state.hierarchyDefaultValues.examID] : null
    let  courseID =  this.state.hideHierarchy >= 2 ? [this.state.hierarchyDefaultValues.courseID] : null


    let items = {
      'exam_ids': {
        datalabel: 'exams',
        dataname: 'examID',
        label: `${define.exam} Name`,
        name: 'exam_ids',
        idSelector: 'id',
        view: 'name',
        type: examID ? 'hidden' : 'select',
        className: examID ? '' : "sm:w-1/4",
        defaultValue: examID && `[${examID}]`,
        placeholder: 'Enter Exam Name',
        addNew: {
          baseTitle: define.exam,
          modelTitle: 'exams',
          queryTitle: 'exams',
        },
        isMultiple: true,
        effectedRows: ['courseID', 'subjectID', 'chapterID'],
      },
      'course_ids': {
        datalabel: 'courses',
        dataname: 'courseID',
        label: `${define.course} Name`,
        preFilters: { examID: examID ? examID : 'lock' },
        name: 'course_ids',
        idSelector: 'id',
        view: 'name',
        type: courseID ? 'hidden' : 'select',
        className: courseID ? '' : "sm:w-1/4",
        defaultValue: courseID && `[${courseID}]`,
        placeholder: 'Enter course Name',
        addNew: {
          baseTitle: define.course,
          modelTitle: 'courses',
          queryTitle: 'courses',
        },
        isMultiple: true,
        effectedRows: ['subjectID', 'chapterID']
      },
      'subject_ids': {
        datalabel: 'subjects',
        dataname: 'subjectID',
        label: `${define.subject} Name`,
        name: 'subject_ids',
        idSelector: 'id',
        view: 'name',
        type: 'select',
        className: "lg:w-1/4",
        placeholder: 'Enter subject Name',
        isMultiple: true,
        effectedRows: ['chapterID', 'languageID'],
        addNew: {
          baseTitle: define.subject,
          modelTitle: 'subjects',
          queryTitle: 'subjects',
        },
        preFilters: { examID: examID ? examID : 'lock', courseID: courseID ? courseID : [] },
      },
      'chapter_ids': {
        datalabel: 'chapters',
        dataname: 'chapterID',
        label: `${define.chapter} Name`,
        name: 'chapter_ids',
        idSelector: 'id',
        view: 'name',
        type: 'select',
        className: "lg:w-1/4",
        placeholder: 'Enter chapter Name',
        isMultiple: true,
        effectedRows: [],
        addNew: {
          baseTitle: define.chapter,
          modelTitle: 'chapters',
          queryTitle: 'chapters',
        },
        preFilters: { examID: examID ? examID : 'lock', courseID: courseID ? courseID : [], subjectID: [] },
      },
      'batch_ids': {
        datalabel: 'batches',
        dataname: 'batchID',
        label: 'batch Name',
        name: 'batch_ids',
        idSelector: 'id',
        view: 'title',
        type: 'select',
        className: "lg:w-1/4",
        placeholder: 'Enter batch Name',
        isMultiple: true,
        addNew: {
          baseTitle: define.batch,
          modelTitle: 'batches',
          queryTitle: 'batches',
        },
        effectedRows: [],
      },

      'title': {
        label: 'title',
        error: { required: 'Please enter a valid title' },
        name: 'title',
        type: 'text',
        className: "sm:w-1/4",
        placeholder: 'Enter Title'
      },
      'base_type': {
        datalabel: 'base_types',
        dataname: 'baseTypeID',
        label: ' Base Type',
        name: 'base_type',
        idSelector: 'value',
        error: { required: 'Please Select a base_type' },
        view: 'label',
        type: 'select',
        values: [
          {
            value: 'ZOOM',
            label: 'ZOOM'
          },
          {
            value: 'YOUTUBE',
            label: 'YOUTUBE'
          },
        ],
        className: "lg:w-1/4  ",
        placeholder: 'Enter  Type',
        isMultiple: false,
        defaultValue: "ZOOM",
        effectedRows: [],
        onChange: (e) => {

          this.setState({
            access: e.value
          }, () => {
            this.buildAddModel()
            this.setState({
              showModel: true,
            })
          })
        }
      },
      'type': {
        datalabel: 'zoom-meeting-types',
        dataname: 'zoomMeetingTypes',
        label: 'Class Type',
        name: 'type',
        idSelector: 'value',
        fetchlabel: 'zoomMeetingTypes',
        error: this.state.access != 'ZOOM' ? null : { required: 'Please Select a type' },
        view: 'label',
        type: this.state.access != 'ZOOM' ? 'hidden' : 'select',
        className: this.state.access == 'ZOOM' && "lg:w-1/4  ",
        placeholder: 'Enter  Type',
        isMultiple: false,
        disabled: this.state.access != 'ZOOM',
        effectedRows: [],
        removeError: this.state.access != 'ZOOM',
        onChange: this.onTypeChange
      },
      'mode': {
        datalabel: 'main_sections',
        dataname: 'mainSectionID',
        label: ' mode',
        name: 'mode',
        idSelector: 'value',
        error: { required: 'Please Select a Mode' },
        view: 'label',
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
        className: "lg:w-1/4",
        placeholder: 'Enter  Type',
        isMultiple: false,
        effectedRows: [],
        onChange: this.onTypeChange
      },


      'schedule_at': {
        label: 'Schedule At',
        error: this.state.access == 'ZOOM' ? null : { required: 'Please enter a valid Schedule At' },
        name: 'schedule_at',
        type: this.state.access == 'ZOOM' ? 'hidden' : 'datetime-local',
        className: this.state.access != 'ZOOM' && "lg:w-1/4",
        placeholder: 'Enter Schedule At',
        removeError: this.state.access == 'ZOOM',
        disabled: this.state.access == 'ZOOM',
        minValue: moment().format('YYYY-MM-DDTHH:mm')
      },

      'start_time': {
        label: 'Start Time',
        error: this.state.access != 'ZOOM' ? null : { required: 'Please enter a valid start_time' },
        name: 'start_time',
        type: this.state.access != 'ZOOM' ? 'hidden' : 'datetime-local',
        className: this.state.access == 'ZOOM' && "lg:w-1/4",
        placeholder: 'Enter start time',
        watchBy: 'type',
        watchValues: ['2', '8', '5', '9'],
        disabled: this.state.access != 'ZOOM',
        minValue: moment().format('YYYY-MM-DDTHH:mm')
      },
      'duration': {
        label: 'duration',
        error: this.state.access != 'ZOOM' ? null : { required: 'Please enter a valid duration' },
        name: 'duration',
        type: 'hidden',
        className: '',
        placeholder: 'Enter duration',
        watchBy: 'type',
        watchValues: ['2', '8', '5', '9'],
        disabled: this.state.access != 'ZOOM',
        defaultValue: 60
      },
      'schedule_for': {
        label: 'schedule_for',
        name: 'schedule_for',
        type: true ? 'hidden' : 'text',
        className: '',
        placeholder: 'Enter scheduled for',
        disabled: true
      },
      'timezone': {
        label: 'timezone',
        name: 'timezone',
        type: true ? 'hidden' : 'text',
        className: '',
        placeholder: 'Enter timezone',
        disabled: true
      },
      'password': {
        label: 'password',
        error: this.state.access != 'ZOOM' ? null : {
          required: 'Please enter a valid password',
          maxLength: {
            value: 10,
            message: 'Your password can have maximum 10 charactors'
          },
        },
        name: 'password',
        type: 'hidden',
        className: '',
        placeholder: 'Enter password',
        disabled: this.state.access != 'ZOOM',
        defaultValue: "eduplus@23"
      },
      'url': {
        label: 'Video URL',
        error: (this.state.access == 'ZOOM' || this.state.access == 'YOUTUBE') ? null : { required: 'Please enter a valid url' },
        name: 'url',
        type: (this.state.access == 'ZOOM' || this.state.access == 'YOUTUBE') ? 'hidden' : 'text',
        className: (this.state.access != 'ZOOM' && this.state.access != 'YOUTUBE') && "sm:w-1/4",
        placeholder: 'Enter URL',
        disabled: (this.state.access == 'ZOOM' || this.state.access == 'YOUTUBE')
      },
      'youtube_link': {
        label: 'YouTube Video ID ( Oyt0a******)',
        error: (this.state.access == 'ZOOM') ? null : { required: 'Please enter a valid ID' },
        name: 'youtube_link',
        type: (this.state.access == 'ZOOM') ? 'hidden' : 'text',
        className: this.state.access != 'ZOOM' && "sm:w-1/4",
        placeholder: 'Enter ID',
        removeError: this.state.access == 'ZOOM',
        disabled: (this.state.access == 'ZOOM')
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
        className: "lg:w-1/4",
        placeholder: 'Enter Language',
        isMultiple: false,
        effectedRows: [],
        preFilters: {},
      },
      // 'tags': {
      //   label: 'Tags',
      //   name: 'tags',
      //   type: 'text',
      //   className: "sm:w-1/2",
      //   placeholder: 'Enter Tags'
      // },

      'host_video': {
        label: 'Start Video when the host joins the meeting',
        name: 'host_video',
        type: 'hidden',
        options: [{ value: true, label: 'Host Video' }],
        className: '',
        placeholder: 'Enter Description',
        disabled: this.state.access != 'ZOOM',
        defaultValue: true
      },
      'participant_video': {
        label: 'Start Video when the participant joins the meeting',
        name: 'participant_video',
        type: 'hidden',
        options: [{ value: true, label: 'participant Video' }],
        className: '',
        placeholder: 'Enter Description',
        disabled: this.state.access != 'ZOOM',
        watchBy: 'type',
        watchValues: ['1', '2', '3', '8'],
        defaultValue: true
      },
      'panelists_video': {
        label: 'Start Video when the participant joins the meeting',
        name: 'panelists_video',
        type: 'hidden',
        options: [{ value: true, label: 'participant Video' }],
        className: '',
        placeholder: 'Enter Description',
        disabled: this.state.access != 'ZOOM',
        watchBy: 'type',
        watchValues: ['5', '6', '9'],
        defaultValue: true
      },
      'join_before_host': {
        label: 'Allow participants to join the meeting before host.',
        name: 'join_before_host',
        type: 'hidden',
        options: [{ value: true, label: 'Join before host' }],
        className: '',
        placeholder: 'Enter Description',
        watchBy: 'type',
        watchValues: ['2'],
        disabled: this.state.access != 'ZOOM',
        defaultValue: true
      },
      'jbh_time': {
        label: 'Allow participants to join the meeting before host.',
        name: 'jbh_time',
        type: 'hidden',
        options: [{ value: 0, label: 'Allow participant to join anytime' }, { value: 5, label: 'Allow participant to join 5 minutes before metting start' }, { value: 10, label: 'Allow participant to join 10 minutes before metting start' }],
        className: '',
        placeholder: 'Enter Description',
        watchBy: 'join_before_host',
        watchValues: ["true"],
        disabled: this.state.access != 'ZOOM',
        defaultValue: 0
      },
      'waiting_room': {
        label: 'Waiting Room',
        name: 'waiting_room',
        type: 'hidden',
        options: [{ value: true, label: 'enable waiting room' }],
        className: '',
        placeholder: 'Enter Description',
        disabled: this.state.access != 'ZOOM',
        defaultValue: false
      },
      'mute_upon_entry': {
        label: 'Mute participant upon entry.',
        name: 'mute_upon_entry',
        type: 'hidden',
        options: [{ value: true, label: 'Mute upon entry' }],
        className: '',
        placeholder: 'Enter Description',
        disabled: this.state.access != 'ZOOM',
        defaultValue: true
      },
      'watermark': {
        label: 'Add Watermark viewing a shared screen.',
        name: 'watermark',
        type: 'hidden',
        options: [{ value: true, label: 'Mute upon entry' }],
        className: '',
        placeholder: 'Enter Description',
        disabled: true

      },
      'alternative_hosts': {
        label: 'Alternative host’s emails or IDs',
        name: 'alternative_hosts',
        type: true ? 'hidden' : 'text',
        className: '',
        placeholder: 'multiple values separated by a comma',
        disabled: true

      },
      'approval_type': {
        label: 'Approval type',
        name: 'approval_type',
        type: 'hidden',
        options: [{ value: 0, label: 'Automatically approve' }, { value: 1, label: 'Manually approve' }, { value: 2, label: 'No registration required' }],
        className: '',
        placeholder: 'Enter Description',
        disabled: this.state.access != 'ZOOM',
        defaultValue: 2
      },
      'registration_type': {
        label: 'Approval type',
        name: 'registration_type',
        type: 'hidden',
        options: [{ value: 1, label: 'Attendees register once and can attend any of the occurrences. ' }, { value: 2, label: ' Attendees need to register for each occurrence to attend.' }, { value: 3, label: ' Attendees register once and can choose one or more occurrences to attend.' }],
        className: '',
        placeholder: 'Enter Description',
        disabled: this.state.access != 'ZOOM',
        watchBy: 'type',
        watchValues: ['8']
      },
      'audio': {
        label: 'Determine how participants can join the audio portion of the meeting',
        name: 'audio',
        type: 'hidden',
        options: [{ value: 'both', label: 'Both Telephony and VoIP.' }, { value: 'telephony', label: ' Telephony only' }, { value: 'voip', label: ' VoIP only.' }],
        className: '',
        placeholder: 'Enter Description',
        disabled: this.state.access != 'ZOOM',
        defaultValue: 'both'
      },
      'auto_recording': {
        label: 'Automatic recording',
        name: 'auto_recording',
        type: 'hidden',
        options: [{ value: 'local', label: 'Record on local.' },
        // { value: 'cloud', label: ' Record on cloud' },
        { value: 'none', label: ' Disabled.' }],
        className: '',
        placeholder: 'Enter Description',
        disabled: this.state.access != 'ZOOM',
        defaultValue: 'local'
      },
      'practice_session': {
        label: 'practice session',
        name: 'practice_session',
        type: true ? 'hidden' : 'checkbox',
        options: [{ value: true, label: 'practice session' }],
        className: '',
        placeholder: 'Enter Description',
        disabled: true,
        watchBy: 'type',
        watchValues: ['5', '6', '9']
      },
      'hd_video': {
        label: 'HD Video',
        name: 'hd_video',
        type: true ? 'hidden' : 'checkbox',
        options: [{ value: true, label: 'HD Video' }],
        className: '',
        placeholder: 'Enter Description',
        disabled: true,
        watchBy: 'type',
        watchValues: ['5', '6', '9']
      },
      'allow_multiple_devices': {
        label: 'allow multiple devices',
        name: 'allow_multiple_devices',
        type: 'hidden',
        options: [{ value: true, label: 'allow multiple devices' }, { value: false, label: 'not  multiple devices' }],
        className: '',
        placeholder: 'Enter Description',
        disabled: this.state.access != 'ZOOM',
        defaultValue: false
      },
      'recurrence_type': {
        datalabel: 'Recurrence Type',
        dataname: 'recurrenceTypeID',
        label: 'recurrence_type',
        error: { required: 'This field is required' },
        name: 'recurrence_type',
        idSelector: 'value',
        error: { required: 'Please Select a Mode' },
        view: 'label',
        type: this.state.access != 'ZOOM' ? 'hidden' : 'select',
        values: [{
          value: 1,
          label: 'Daily'
        },
        {
          value: 2,
          label: 'Weekly'
        },
        {
          value: 3,
          label: 'Monthly'
        }
        ],
        className: this.state.access == 'ZOOM' && "sm:w-1/3",
        placeholder: 'Enter  Type',
        isMultiple: false,
        watchBy: 'type',
        watchValues: ['8', '9'],
        disabled: this.state.access != 'ZOOM',
        effectedRows: [],
      },
      'repeat_interval': {
        label: 'repeat interval',
        name: 'repeat_interval',
        type: this.state.access != 'ZOOM' ? 'hidden' : 'text',
        className: this.state.access == 'ZOOM' && "sm:w-1/3",
        placeholder: 'Enter repeat_interval',
        disabled: this.state.access != 'ZOOM',
        watchBy: 'type',
        watchValues: ['8', '9'],
      },
      'weekly_days': {
        datalabel: 'days',
        dataname: 'days',
        label: ' Weekly days',
        error: { required: 'This field is required' },
        name: 'weekly_days',
        idSelector: 'id',
        fetchlabel: 'zoomMeetingTypes',
        error: { required: 'Please Select a type' },
        view: 'day',
        type: this.state.access != 'ZOOM' ? 'hidden' : 'select',
        className: this.state.access == 'ZOOM' && "sm:w-1/3",
        placeholder: 'Enter  Type',
        isMultiple: true,
        disabled: this.state.access != 'ZOOM',
        watchBy: 'recurrence_type',
        watchValues: ['2'],
        effectedRows: [],
      },
      'monthly_day': {
        label: 'Description',
        name: 'monthly_day',
        type: this.state.access != 'ZOOM' ? 'hidden' : 'number',
        className: this.state.access == 'ZOOM' && "sm:w-1/3",
        placeholder: 'Enter description',
        disabled: this.state.access != 'ZOOM',
        watchBy: 'recurrence_type',
        watchValues: ['3']
      },
      'monthly_week': {
        datalabel: 'monthly_week',
        dataname: 'monthlyWeekID',
        error: { required: 'This field is required' },
        label: ' monthly_week',
        name: 'monthly_week',
        idSelector: 'value',
        view: 'label',
        type: 'select',
        values: [
          {
            value: -1,
            label: 'Last week of the month.'
          },
          {
            value: 1,
            label: 'First week of the month.'
          },
          {
            value: 2,
            label: 'sSecond week of the month'
          },
          {
            value: 3,
            label: 'Third week of the month'
          },
          {
            value: 3,
            label: 'Fourth week of the month'
          }
        ],
        className: this.state.access == 'ZOOM' && "sm:w-1/3",
        placeholder: 'Enter  Type',
        isMultiple: false,
        watchBy: 'recurrence_type',
        effectedRows: [],
        watchValues: ['3']
      },
      'monthly_week_day': {
        datalabel: 'days',
        dataname: 'days',
        label: 'Monthly Weekly days',
        name: 'monthly_week_day',
        error: { required: 'This field is required' },
        idSelector: 'id',
        fetchlabel: 'zoomMeetingTypes',
        error: { required: 'Please Select a type' },
        view: 'day',
        type: this.state.access != 'ZOOM' ? 'hidden' : 'select',
        className: this.state.access == 'ZOOM' && "sm:w-1/3",
        placeholder: 'Enter  Type',
        isMultiple: true,
        disabled: this.state.access != 'ZOOM',
        disabled: this.state.access != 'ZOOM',
        watchBy: 'recurrence_type',
        watchValues: ['3'],
        effectedRows: [],
      },
      'end_times': {
        label: 'end times',
        name: 'end_times',
        type: this.state.access != 'ZOOM' ? 'hidden' : 'number',
        className: this.state.access == 'ZOOM' && "sm:w-1/3",
        placeholder: 'Enter description',
        disabled: this.state.access != 'ZOOM',
        watchBy: 'type',
        watchValues: ['8', '9'],
      },
      'end_date_time': {
        label: 'end date time',
        name: 'end_date_time',
        type: this.state.access != 'ZOOM' ? 'hidden' : 'datetime-local',
        className: this.state.access == 'ZOOM' && "sm:w-1/3",
        placeholder: 'Enter description',
        disabled: this.state.access != 'ZOOM',
        watchBy: 'type',
        watchValues: ['8', '9'],
      },
      'description': {
        label: 'Description',
        error: { required: 'Please enter a valid description' },
        name: 'description',
        type: 'textarea',
        className: "w-full  ",
        placeholder: 'Enter description'
      },
      // 'thumbnail': {
      //   label: 'Image',
      //   name: 'thumbnail',
      //   error: { required: 'Please Choose an Image' },
      //   fileTypes: ["jpg", "png", "jpeg"],
      //   type: 'image',
      //   className: "sm:w-1/2",
      // },


    }
    return this.setState({
      storeFields: items,
      showModel: false
    })

  }


  onTypeChange = (e) => {

    let items = this.state.storeFields
    if (e.value == 'PAID') {

      delete items.exam_ids.removeError
      delete items.course_ids.removeError
      delete items.subject_ids.removeError

      items.language_id.preFilters.module = 'live-events'

      items.exam_ids.error = { required: `Please select ${define.exam} Name` }
      items.course_ids.error = { required: `Please select ${define.course} Name` }
      items.subject_ids.error = { required: `Please select ${define.subject} Name` }
    } else {
      if (items.language_id.preFilters.module) {
        delete items.language_id.preFilters.module
      }

      delete items.exam_ids.error
      delete items.course_ids.error
      delete items.subject_ids.error

      items.exam_ids.removeError = true
      items.course_ids.removeError = true
      items.subject_ids.removeError = true
    }

    this.setState({ storeFields: items })
  }

  randerEditModal = async (row) => {

    let event = await fetchByID('live-events', row.id, { noLog: true })
    row = event.event

    this.setState({
      displayModelTitle: `Edit ${this.state.baseTitle} - ${row.title ? row.title : row.name}`
    })


    this.setState({
      access: row.base_type
    }, () => {
      this.buildAddModel();
    })


    var items = this.state.storeFields;

    Object.keys(items).map((key) => {
      items[key].defaultValue = row[key]
    })

    // delete items.thumbnail.error.required;

    // items.thumbnail = {
    //   ...items.thumbnail,
    //   ...this.state.imageLimits
    // }
    items.base_type.defaultValue = row.base_type

    items.base_type.disabled = true

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
    items.language_id.preFilters = {
      // module: "live-events",
      examID: row.exam_ids && JSON.parse(row.exam_ids).length > 0 ? JSON.parse(row.exam_ids) : 'lock',
      courseID: row.course_ids && JSON.parse(row.course_ids).length > 0 ? JSON.parse(row.course_ids) : 'lock',
      courseID: row.course_ids && JSON.parse(row.course_ids).length > 0 ? JSON.parse(row.course_ids) : 'lock',
      subjectID: row.subject_ids && JSON.parse(row.subject_ids).length > 0 ? JSON.parse(row.subject_ids) : 'lock'
    }

    if (row.zoom_type == 'meetings') {
      items.language_id.preFilters.module = 'live-events'

      items.exam_ids.error = { required: `Please select ${define.exam} Name` }
      items.course_ids.error = { required: `Please select ${define.course} Name` }
      items.subject_ids.error = { required: `Please select ${define.subject} Name` }
    }


    if (row.exam_ids)


      if (row.base_type == 'ZOOM' && row.zoomDetails) {

        items.type.defaultValue = row.zoomDetails.type
        items.start_time.defaultValue = row.schedule_at
        items.duration.defaultValue = row.zoomDetails.duration
        items.schedule_for.defaultValue = row.zoomDetails.schedule_for
        items.timezone.defaultValue = row.zoomDetails.timezone
        items.password.defaultValue = row.zoomDetails.password


        if (row.zoomDetails.settings) {
          items.host_video.defaultValue = row.zoomDetails.settings.host_video
          items.participant_video.defaultValue = row.zoomDetails.settings.participant_video
          items.join_before_host.defaultValue = row.zoomDetails.settings.join_before_host
          items.mute_upon_entry.defaultValue = row.zoomDetails.settings.mute_upon_entry
          items.watermark.defaultValue = row.zoomDetails.settings.watermark
          // items.use_pmi.defaultValue = row.zoomDetails.settings.use_pmi
          items.approval_type.defaultValue = row.zoomDetails.settings.approval_type
          items.registration_type.defaultValue = row.zoomDetails.settings.registration_type
          items.audio.defaultValue = row.zoomDetails.settings.audio
          items.auto_recording.defaultValue = row.zoomDetails.settings.auto_recording
          items.alternative_hosts.defaultValue = row.zoomDetails.settings.alternative_hosts
          items.waiting_room.defaultValue = row.zoomDetails.settings.waiting_room
          items.jbh_time.defaultValue = row.zoomDetails.settings.jbh_time
          items.practice_session.defaultValue = row.zoomDetails.settings.practice_session
          items.hd_video.defaultValue = row.zoomDetails.settings.hd_video
          items.allow_multiple_devices.defaultValue = row.zoomDetails.settings.allow_multiple_devices

        }

        items.type.disabled = true



        if (row.zoomDetails.recurrence) {
          items.recurrence_type.defaultValue = row.zoomDetails.recurrence.type
          items.repeat_interval.defaultValue = row.zoomDetails.recurrence.repeat_interval
          items.weekly_days.defaultValue = row.zoomDetails.recurrence.weekly_days
          items.monthly_day.defaultValue = row.zoomDetails.recurrence.monthly_day
          items.monthly_week.defaultValue = row.zoomDetails.recurrence.monthly_week
          items.monthly_week_day.defaultValue = row.zoomDetails.recurrence.monthly_week_day
          items.end_times.defaultValue = row.zoomDetails.recurrence.end_times
          items.end_date_time.defaultValue = row.zoomDetails.recurrence.end_date_time

          items.recurrence_type.disabled = true
          items.repeat_interval.disabled = true
          items.weekly_days.disabled = true
          items.monthly_day.disabled = true
          items.monthly_week.disabled = true
          items.monthly_week_day.disabled = true
          items.end_times.disabled = true
          items.end_date_time.disabled = true


          if ([8, 9].includes(row.zoomDetails.type)) {
            items.start_time.disabled = true
          }

          delete items.weekly_days.error

        }


      }


    if ('id' in items && items.id) {
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

    delete items.video;

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

  changeDownloadModalStatus = async (id) => {

    if (this.state.downloadModel == true) {
      // this.buildAddModel();
      this.setState({
        downloadModel: false
      })
    } else {


      let zoomDetails = null

      var data = await fetchByID(this.state.modelTitle, id, { noLog: true });

      if (data.event.base_type == 'ZOOM' && data.event.zoomDetails) {
        zoomDetails = data.event.zoomDetails
      }
      this.setState({ recordTitle: data.event.title, passcode: zoomDetails && zoomDetails.recording && zoomDetails.recording.password, recordings: zoomDetails && zoomDetails.recording && zoomDetails.recording.recording_files ? zoomDetails.recording.recording_files : [], }, () => {
        this.setState({
          downloadModel: true
        })
      })


    }
  }

  onStoreSubmit = async (data) => {

    var liveEvent;
    var message;
    var added = false;
    if (data.url) {
      let type = data.url.includes("event/") ? 'RECURRING' : 'ONE-TIME';
      var event_id = null;
      var video_id = null;

      if (type == 'RECURRING') {
        event_id = data.url.substring(data.url.lastIndexOf('/') + 1);

        if (data.url.includes("videos/")) {
          video_id = data.url.substring(data.url.indexOf('videos/') + 1);
        }

      }
      else {
        video_id = data.url.substring(data.url.lastIndexOf('/') + 1);
      }

      data.video_id = video_id
      data.event_id = event_id
      data.type = type
    }

    if (this.state.access == 'ZOOM') {

      data = {
        id: 'id' in data ? data.id : null,
        exam_ids: data.exam_ids,
        course_ids: data.course_ids,
        subject_ids: data.subject_ids,
        chapter_ids: data.chapter_ids,
        batch_ids: data.batch_ids,
        language_id: data.language_id,
        schedule_at: data.start_time,
        tags: data.tags,
        mode: data.mode,
        title: data.title,
        description: data.description,
        // thumbnail: data.thumbnail,

        zoomAttributes: {
          "topic": data.title,
          "type": data.type,
          "start_time": data.start_time,
          "duration": data.duration,
          "schedule_for": data.schedule_for,
          "timezone": data.timezone,
          "password": data.password,
          "agenda": data.description,
          "recurrence": {
            "type": data.recurrence_type,
            "repeat_interval": data.repeat_interval,
            "weekly_days": data.weekly_days && data.weekly_days.includes('[') ? data.weekly_days.replace('[', '').replace(']', '') : data.weekly_days,
            "monthly_day": data.monthly_day,
            "monthly_week": data.monthly_week,
            "monthly_week_day": data.monthly_week_day && data.monthly_week_day.includes('[') ? data.monthly_week_day.replace('[', '').replace(']', '') : data.monthly_week_day,
            "end_times": data.end_times,
            "end_date_time": data.end_date_time,
          },
          "settings": {
            "host_video": data.host_video,
            "participant_video": data.participant_video,
            "join_before_host": data.join_before_host,
            "mute_upon_entry": data.mute_upon_entry,
            "watermark": data.watermark,
            "use_pmi": data.use_pmi,
            "approval_type": data.approval_type,
            "registration_type": data.registration_type,
            "audio": data.audio,
            "auto_recording": data.auto_recording,
            "alternative_hosts": data.alternative_hosts,
            "waiting_room": data.waiting_room,
            "jbh_time": data.jbh_time,
            "practice_session": data.practice_session,
            "hd_video": data.hd_video,
            "allow_multiple_devices": data.allow_multiple_devices,
          },
        }
      }


      if (data.zoomAttributes && data.zoomAttributes.recurrence == {}) {
        delete data.zoomAttributes.recurrence
      }

    }


    if ('id' in data && data.id) {
      liveEvent = await edit(this.state.modelTitle, data);
      message = `${this.state.baseTitle} Updated Successfully`

    } else {

      liveEvent = await add(this.state.modelTitle, data);
      message = `${this.state.baseTitle} Added Successfully`
      added = true
    }

    // check Response
    if (liveEvent.updated) {
      toastr.success(message)


      if (added) {

        let body = {
          title: `We have new ${this.state.baseTitle} ready for you 😍`,
          body: `New ${data.title}, to be held on ${moment(data.schedule_at).format('MMMM Do YYYY, hh:mm A')} `,
          course_ids: data.mode == 'PAID' ? data.course_ids : null,
          subject_ids: data.mode == 'PAID' ? data.subject_ids : null,
          action: 'Videos'
        };

        let pushNotification = await add('push-notifications', body);
      }


      this.fetchList()

      this.setState({
        showModel: false
      })
      // resetForm();
    }
    else {
      let error;
      if (liveEvent.event) {
        error = liveEvent.event.error
      }
      else if (liveEvent.error.details) {
        error = liveEvent.error.details[0].message
      }
      else if (liveEvent.error) {
        error = liveEvent.error
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
    let data = this.state.events
    const columns = [
      {
        Header: 'Title',
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              {props.row.original.title}
            </div>
          )
        },
      },
      this.state.hideHierarchy >= 1 ? { Header: ``, } :  {
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
      this.state.hideHierarchy >= 2 ? { Header: ``, } :  {
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
        }
      },
      // {
      //   Header: `${define.subjects}`,
      //   Cell: props => {
      //     return (
      //       <div className="flex flex-wrap justify-start items-start" >
      //         {props.row.original.subjects && props.row.original.subjects.map((item) => {
      //           return <Badge key={item.id} size='sm' color="bg-base text-white mr-2 mb-2" rounded>
      //             {item.name}
      //           </Badge>
      //         })}
      //       </div>
      //     )
      //   },

      // },
      // {
      //   Header: `${define.chapters}`,
      //   Cell: props => {
      //     return (
      //       <div className="flex flex-wrap justify-start items-start" >
      //         {props.row.original.chapters && props.row.original.chapters.map((item) => {
      //           return <Badge key={item.id} size='sm' color="bg-yellow-500 text-white mr-2 mb-2" rounded>
      //             {item.name}
      //           </Badge>
      //         })}
      //       </div>
      //     )
      //   },
      // },

      {
        Header: 'Meeting',
        Cell: props => {
          return (
            <>
              {props.row.original.base_type == 'ZOOM' && <a className="viewButton" title="View">

                {(props.row.original.event_status == 'NOT_STARTED') && moment(props.row.original.schedule_at).isSame(moment().format('YYYY-MM-DD'), 'day') && <span className="bg-base text-primary flex items-center justify-center rounded text-white p-2 text-bold">
                  <Link href={`/dashboard/${this.state.modelTitle}/zoom/[meetingID]`} as={`/dashboard/${this.state.modelTitle}/zoom/${props.row.original.id}`} className="">
                    <a target="_blank"> {
                      props.row.original.event_status == 'STARTED' ? 'JOIN MEETING' : 'START MEETING'
                    }</a>
                  </Link>
                </span>}
                {(props.row.original.event_status == 'STARTED') && <span className="bg-green-500 text-primary flex items-center justify-center rounded text-white p-2 text-bold">
                  <Link href={`/dashboard/${this.state.modelTitle}/zoom/[meetingID]`} as={`/dashboard/${this.state.modelTitle}/zoom/${props.row.original.id}`} className="">
                    <a target="_blank"> {
                      props.row.original.event_status == 'STARTED' ? 'JOIN MEETING' : 'START MEETING'
                    }</a>
                  </Link>
                </span>}
                {props.row.original.event_status == 'ENDED' && <span className="bg-red-500 text-primary flex items-center justify-center rounded text-white p-2 text-bold">
                  <a target="_blank"> {
                    'ENDED'
                  }</a>
                </span>}
                {props.row.original.event_status == 'NOT_STARTED' && !moment(props.row.original.schedule_at).isSame(moment().format('YYYY-MM-DD'), 'day') && <span className="bg-red-500 text-primary flex items-center justify-center rounded text-white p-2 text-bold">
                  <a target="_blank">Start At {
                    moment(props.row.original.schedule_at).format('DD-MM-YYYY hh:mm A')
                  }</a>
                </span>}
              </a>}
            </>
          )
        },
      },
      {
        Header: `Recordings`,
        Cell: props => {
          return (
            <div className="flex flex-wrap justify-start items-start" >
              <a className="border rounded p-2 text-blue-500" onClick={() => {
                this.changeDownloadModalStatus(props.row.original.id)
              }}>Recording</a>
            </div>
          )
        },
      },
    ]

    const filterObjects = [
      this.state.hideHierarchy >= 1 ? { type : 'blank'} : {
        label: `exams`,
        title: `${define.exams}`,
        name: 'examID',
        idSelector: 'id',
        view: 'name',
        type: 'select-multiple',
        effectedRows: ['courseID', 'subjectID', 'chapterID']
      },
      this.state.hideHierarchy >= 2 ? { type : 'blank'} : {
        label: `courses`,
        title: `${define.courses}`,
        name: 'courseID',
        idSelector: 'id',
        view: 'name',
        type: 'select-multiple',
        effectedRows: ['subjectID', 'chapterID']
      },
      {
        label: `subjects`,
        title: `${define.subjects}`,
        name: 'subjectID',
        idSelector: 'id',
        view: 'name',
        type: 'select-multiple',
        effectedRows: ['chapterID']
      },
      {
        label: `chapters`,
        title: `${define.chapters}`,
        name: 'chapterID',
        idSelector: 'id',
        view: 'name',
        type: 'select-multiple',
        effectedRows: []
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
        <SectionTitle title={this.props.parentName ? this.props.parentName : 'Dashbaord'} subtitle={`${define.liveEvents}`} onClick={this.changeModalStatus} />
        {
          this.state.downloadModel && <PopupModel noWidthLimit={true} html={
            <div className=" w-full border-bottom p-4">
              <h5 className="border-bottom w-full text-left mb-2 pl-2">
                {this.state.recordTitle}
                {/* <span className="float-right">
                <small>  Passcode For download : {this.state.passcode}</small>
                </span> */}
              </h5>
              {this.state.recordings && this.state.recordings.length > 0 && <table className="table w-full overflow-auto">
                <thead>
                  <tr>
                    <th>Recording Type</th>
                    <th>Recording Start</th>
                    <th>Recording End</th>
                    <th></th></tr>
                </thead>
                <tbody>
                  {
                    this.state.recordings && this.state.recordings.map(recording => {
                      return <tr>
                        <td className="capitalize">{recording.recording_type.replaceAll('_', '')}</td>
                        <td>{moment(recording.recording_start).format('YYYY-MM-DD hh:mm A')}</td>
                        <td>{moment(recording.recording_end).format('YYYY-MM-DD hh:mm A')}</td>
                        <td><a href={`${recording.download_url}?access_token=${this.state.jwtToken}`} className="text-blue-500" download> Download</a></td>
                      </tr>
                    })
                  }
                </tbody>
              </table> ||
                <div className="border p-3 text-center">
                  No Recording available
                </div>
              }
            </div>
          } />
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
              data={this.state.events}
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
      </>
    )
  }

}