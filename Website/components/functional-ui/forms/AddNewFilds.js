
import { fetchAll, getSettings } from 'helpers/apiService';
import define from 'src/json/worddefination.json'

export const addFields = async (titles) => {


  var imageLimits = await fetchAll('image-size-limits', { 'label': titles.queryTitle });
  imageLimits = imageLimits.success = true ? imageLimits.sizes : {}

  let hideHierarchy = await getSettings('hide_website')
  let hierarchyDefaultValues = {}

  if (hideHierarchy && hideHierarchy <= 2 && hideHierarchy > 0) {
    var data = await fetchAll('exams', { 'limit': 1, offset: 1, 'forList': true });
    if (data && data.exams && data.exams[0]) {
      hierarchyDefaultValues = {
        ...hierarchyDefaultValues,
        examID: data.exams[0].id
      }

      if (hideHierarchy == 2) {
        data = await fetchAll('courses', { 'limit': 1, offset: 1, 'forList': true, examID: data.exams[0].id });
        if (data && data.courses && data.courses[0]) {
          hierarchyDefaultValues = {
            ...hierarchyDefaultValues,
            examID: data.courses[0].id
          }
        }
      }
    }
  }

  let examID = hideHierarchy >= 1 ? [hierarchyDefaultValues.examID] : null
  let courseID = hideHierarchy >= 2 ? [hierarchyDefaultValues.courseID] : null


  if (titles.modelTitle == 'exams') {
    return {
      'name': {
        label: 'Name',
        error: { required: 'Please enter a valid Name' },
        name: 'name',
        type: 'text',
        className: "w-full",
        placeholder: 'Enter Name'
      },
      'description': {
        label: 'Description',
        error: { required: 'Please enter a valid Description' },
        name: 'description',
        type: 'textarea',
        className: "w-full",
        // editor: true,
        placeholder: 'Enter Description'
      },
      'thumbnail': {
        label: 'Image',
        name: 'thumbnail',
        error: imageLimits.is_required !== 0 ? { required: 'Please Choose an Image' } : null,
        sizeRequired: imageLimits.is_required == 0,
        ...imageLimits,
        fileTypes: ["jpg", "png", "jpeg"],
        type: 'image',
        className: "sm:w-1/3",
      }
    }
  }
  else if (titles.modelTitle == 'courses') {
    return {
      'exam_ids': {
        datalabel: 'exams',
        dataname: 'examID',
        label: `${define.exam} Name`,
        error: { required: `Please select ${define.exam} Name` },
        name: 'exam_ids',
        idSelector: 'id',
        view: 'name',
        type: examID ? 'hidden' : 'select',
        className: examID ? '' : "sm:w-1/2",
        defaultValue: examID && `[${examID}]`,
        placeholder: 'Enter Exam Name',
        isMultiple: true,
        effectedRows: [],
      },
      'name': {
        label: 'Name',
        error: { required: 'Please enter a valid Name' },
        name: 'name',
        type: 'text',
        className: "sm:w-1/2",
        placeholder: 'Enter Name'
      },
      'description': {
        label: 'Description',
        error: { required: 'Please enter a valid Description' },
        name: 'description',
        type: 'textarea',
        className: "w-full",
        placeholder: 'Enter Description'
      },
      'thumbnail': {
        label: 'Image',
        name: 'thumbnail',
        error: imageLimits.is_required !== 0 ? { required: 'Please Choose an Image' } : null,
        sizeRequired: imageLimits.is_required == 0,
        ...imageLimits,
        fileTypes: ["jpg", "png", "jpeg"],
        type: 'image',
        className: "sm:w-1/3",
      }
    }
  }
  else if (titles.modelTitle == 'subjects') {
    return {
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
        isMultiple: true,
        effectedRows: ['courseID'],
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
        effectedRows: [],
      },
      'name': {
        label: 'Name',
        error: { required: 'Please enter a valid Name' },
        name: 'name',
        type: 'text',
        className: "sm:w-1/3",
        placeholder: 'Enter Name',
      },
      'thumbnail': {
        label: 'Image',
        name: 'thumbnail',
        error: imageLimits.is_required !== 0 ? { required: 'Please Choose an Image' } : null,
        sizeRequired: imageLimits.is_required == 0,
        ...imageLimits,
        fileTypes: ["jpg", "png", "jpeg"],
        type: 'image',
        className: "sm:w-1/3",
      }
    }
  }
  else if (titles.modelTitle == 'chapters') {
    return {
      'exam_ids': {
        datalabel: 'exams',
        dataname: 'examID',
        label: `${define.exam} Name`,
        error: { required: `Please select ${define.exam} Name` },
        name: 'exam_ids',
        idSelector: 'id',
        view: 'name',
        type: examID ? 'hidden' : 'select',
        className: examID ? '' : "sm:w-1/2",
        defaultValue: examID && `[${examID}]`,
        placeholder: 'Enter Exam Name',
        isMultiple: true,
        effectedRows: ['courseID', 'subjectID'],
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
        className: courseID ? '' : "sm:w-1/2",
        defaultValue: courseID && `[${courseID}]`,
        placeholder: 'Enter course Name',
        isMultiple: true,
        effectedRows: ['subjectID'],
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
        className: "sm:w-1/2",
        placeholder: 'Enter subject Name',
        isMultiple: true,
        effectedRows: [],
      },
      'name': {
        label: 'Name',
        error: { required: 'Please enter a valid Name' },
        name: 'name',
        type: 'text',
        className: "sm:w-1/2",
        placeholder: 'Enter Name'
      },
    }
  }
  else if (titles.modelTitle == 'batches') {

    let data = await fetchAll('days', { 'forList': true });

    let days = []
    data.days.map(day => {
      let d = {
        label: day.day,
        value: day.day,
      }
      days.push(d)
    })

    return {
      'faculty_id': {
        datalabel: 'users',
        dataname: 'facultyID',
        label: 'Facuty Name',
        error: { required: 'Please enter a valid Facuty Name' },
        name: 'faculty_id',
        idSelector: 'id',
        view: 'name_with_mobile',
        type: 'select',
        className: "sm:w-1/2",
        placeholder: 'Enter Facuty Name',
        isMultiple: false,
        preFilters: { type: 'FACULTY' },
        effectedRows: [],

      },
      'title': {
        label: 'Title',
        error: { required: 'Please enter a valid Title' },
        name: 'title',
        type: 'text',
        className: "sm:w-1/2",
        autoFocus: true,
        placeholder: 'Enter Title'
      },
      'schedules': {
        label: 'Schedules',
        type: 'multiple-fields',
        name: 'schedules',
        fields: [{
          label: 'Days',
          name: 'day',
          error: { required: 'Please choose One' },
          type: 'radio',
          options: days,
          className: "md:w-3/5 batch-radio pb-3 pt-3",
          placeholder: 'Enter Description'

        },
        {
          label: 'start time',
          error: { required: 'Please enter a valid start time' },
          name: 'start_time',
          type: 'time',
          className: "md:w-1/5 pb-3  ",
          placeholder: 'Enter start time'
        },
        {
          label: 'end time',
          error: { required: 'Please enter a valid end time' },
          name: 'end_time',
          type: 'time',
          className: "md:w-1/5 pb-3",
          placeholder: 'Enter end time'
        }
        ],
        className: "w-full flex flex-col lg:flex-row lg:flex-wrap pb-3",
        placeholder: 'Enter Description',
        box: true,
      },
    }
  }
  else if (titles.modelTitle == 'pages') {

    return {
      'visibility': {
        datalabel: 'main_sections',
        dataname: 'mainSectionID',
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
        className: "sm:w-full",
        placeholder: 'Enter Page Type',
        isMultiple: false,
      },
      'title': {
        label: 'Page Title',
        error: { required: 'Please enter a valid Page Title' },
        name: 'title',
        type: 'text',
        className: "sm:w-full",
        placeholder: 'Enter Page Title',
      },
      'is_parent': {
        name: 'is_parent',
        type: 'hidden',
        defaultValue: "1"
      },
    }
  }
  else if (titles.modelTitle == 'videos') {

    return {
      'lacture_type': {
        label: '',
        name: 'lacture_type',
        type: 'hidden',
        defaultValue: titles.type,
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
      'tags': titles.type == 'TEST' ? { type: 'blank' } : {
        label: 'Tags',
        name: 'tags',
        type: 'text',
        className: "sm:w-2/3 ",
        placeholder: 'Enter Tags',
        onTab: 1,
      },
      'duration': titles.type == 'VIDEO' || titles.type == 'LINK' ? { type: 'blank' } : {
        label: 'Duration',
        name: 'duration',
        type: 'text',
        className: "sm:w-1/3",
        placeholder: 'Enter duration',
        onTab: 1,
      },
      'video_id': titles.type == 'TEST' || titles.type == 'VIDEO' || titles.type == 'LINK' ? { type: 'blank' } : {
        label: 'Video ID',
        name: 'video_id',
        type: 'text',
        className: "sm:w-1/2",
        placeholder: 'Enter Video ID',
        onTab: 1,
      },
      'video_url': titles.type == 'TEST' || titles.type == 'VIDEO' || titles.type == 'YOUTUBE' ? { type: 'blank' } : {
        label: 'Video Url',
        name: 'video_url',
        type: 'text',
        className: "sm:w-1/2",
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
      'video': titles.type == 'TEST' || titles.type == 'YOUTUBE' || titles.type == 'LINK' ? { type: 'blank' } : {
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
      'thumbnail': titles.type == 'TEST' ? { type: 'blank' } : {
        label: 'Image',
        name: 'thumbnail',
        error: imageLimits.is_required !== 0 ? { required: 'Please Choose an Image' } : null,
        sizeRequired: imageLimits.is_required == 0,
        ...imageLimits,
        fileTypes: ["jpg", "png", "jpeg"],
        type: 'image',
        className: "sm:w-1/3",
        onTab: 1,
      },
      'questions': titles.type == 'VIDEO' || titles.type == 'YOUTUBE' || titles.type == 'LINK' ? { type: 'blank' } : {
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
            className: "sm:w-full",
            placeholder: 'Enter Question'
          },
          {
            label: 'Option 1',
            name: 'option1',
            type: 'text',
            error: { required: 'Please enter a valid Option 1' },
            className: "sm:w-1/4",
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
            className: "sm:w-1/4",
            placeholder: 'Enter Option 2'
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
            className: "sm:w-1/4",
            placeholder: 'Enter Option 3'
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
            className: "sm:w-1/4",
            placeholder: 'Enter Option 4'
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
            className: "sm:w-full",
            placeholder: 'Enter Description',
            showLabel: true
          },
          {
            label: 'Explaination',
            name: 'explaination',
            type: 'text',
            className: "sm:w-full",
            placeholder: 'Enter Explaination'
          },
        ],
        className: "w-full flex flex-col lg:flex-row lg:flex-wrap",
        placeholder: 'Enter Description',
        onTab: 2,
        box: true,
        btnUp: true,
        btnName: 'Question',

      },
    }
  }

  if (titles.modelTitle == 'validities') {
    return {
      'title': {
        label: 'Title',
        error: { required: 'Please enter a valid Title' },
        name: 'title',
        type: 'text',
        className: "sm:w-1/2  ",
        placeholder: 'Enter Title'
      },
      'type': {
        label: 'Validity type',
        error: { required: 'Please Choose a valid Type' },
        name: 'type',
        type: 'radio',
        options: [{ value: 'DAYS', label: 'DAYS' }, { value: 'DATE', label: 'DATE' }],
        className: "sm:w-1/2",
        placeholder: 'Enter duration Type',
        defaultValue: 'DAYS'
      },
      'date': {
        label: 'Date',
        error: { required: 'Please enter a valid date' },
        name: 'date',
        type: 'date',
        className: "sm:w-1/2",
        placeholder: 'Enter date',
        watchBy: 'type',
        watchValues: ['DATE']
      },
      'duration': {
        label: 'Duration',
        error: { required: 'Please enter a valid duration' },
        name: 'duration',
        type: 'number',
        className: "sm:w-1/2  ",
        placeholder: 'Enter duration',
        watchBy: 'type',
        watchValues: ['DAYS']
      },
      'duration_type': {
        label: 'Is this attribute can update product actual price',
        error: { required: 'Please Choose a valid duration Type' },
        name: 'duration_type',
        type: 'radio',
        options: [{ value: 'DAYS', label: 'DAYS' }, { value: 'MONTH', label: 'MONTH' }, { value: 'YEAR', label: 'YEAR' }],
        className: "sm:w-1/2",
        placeholder: 'Enter duration Type',
        watchBy: 'type',
        watchValues: ['DAYS']
      },
    }
  }
  if (titles.modelTitle == 'compatibilities') {
    return {
      'title': {
        label: 'Title',
        error: { required: 'Please enter a valid Title' },
        name: 'title',
        type: 'text',
        className: "w-full  ",
        placeholder: 'Enter Title'
      },
    }
  }
  if (titles.modelTitle == 'taxes') {
    return {
      'title': {
        label: 'Title',
        error: { required: 'Please enter a valid Title' },
        name: 'title',
        type: 'text',
        className: "w-full  ",
        placeholder: 'Enter Title'
      },
      'amount': {
        label: 'Amount',
        error: { required: 'Please enter a valid Amount' },
        name: 'amount',
        type: 'number',
        className: "sm:w-1/2  ",
        placeholder: 'Enter Amount'
      },
      'amount_type': {
        label: 'Is this attribute can update product actual price',
        error: { required: 'Please Choose a valid Amount Type' },
        name: 'amount_type',
        type: 'radio',
        options: [{ value: 'AMOUNT', label: 'Amount' }, { value: 'PERCENT', label: 'Percent' }],
        className: "sm:w-1/2  ",
        placeholder: 'Enter Amount Type'
      },
      'description': {
        label: 'Description',
        error: { required: 'Please enter a valid Description' },
        name: 'description',
        type: 'textarea',
        className: "w-full  ",
        placeholder: 'Enter Description'
      },
    }
  }
  if (titles.modelTitle == 'languages') {
    return {
      'title': {
        label: 'Title',
        error: { required: 'Please enter a valid Title' },
        name: 'title',
        type: 'text',
        className: "w-full  ",
        placeholder: 'Enter Title'
      },
    }
  }
  if (titles.modelTitle == 'shipping-methods') {
    return {
      'title': {
        label: 'Title',
        error: { required: 'Please enter a valid Title' },
        name: 'title',
        type: 'text',
        className: "w-full  ",
        placeholder: 'Enter Title'
      },
      'amount': {
        label: 'Amount',
        error: { required: 'Please enter a valid Amount' },
        name: 'amount',
        type: 'number',
        className: "sm:w-1/2  ",
        placeholder: 'Enter Amount'
      },
      'amount_type': {
        label: 'Is this attribute can update product actual price',
        error: { required: 'Please Choose a valid Amount Type' },
        name: 'amount_type',
        type: 'radio',
        options: [{ value: 'AMOUNT', label: 'Amount' }, { value: 'PERCENT', label: 'Percent' }],
        className: "sm:w-1/2",
        placeholder: 'Enter Amount Type'
      }
    }
  }
  if (titles.modelTitle == 'managements') {
    return {
      first_name: {
        label: 'First Name',
        error: { required: 'Please enter first name' },
        name: 'first_name',
        type: 'text',
        placeholder: 'Enter you first name',
        className: 'sm:w-1/3  ',
        onTab: 1
      },
      last_name: {
        label: 'Last Name',
        error: { required: 'Please enter last name' },
        name: 'last_name',
        type: 'text',
        placeholder: 'Enter you last name',
        className: 'sm:w-1/3  ',
        onTab: 1
      },
      mobile_number: {
        label: 'Mobile Number',
        error: {
          required: 'Please enter mobile number',
        },
        name: 'mobile_number',
        type: 'number',
        placeholder: 'Enter your Mobile Number',
        className: 'sm:w-1/3  ',
        onTab: 1
      },
      email: {
        label: 'Email',
        error: { required: 'Please enter a valid email' },
        name: 'email',
        type: 'email',
        placeholder: 'Enter you email',
        className: 'sm:w-1/3  ',
        onTab: 1
      },
      designation: {
        label: 'Designation',
        error: { required: 'Please enter a valid Designation' },
        name: 'designation',
        type: 'text',
        placeholder: 'Enter you Designation',
        className: 'sm:w-1/3  ',
        onTab: 1
      },
      dob: {
        label: 'Date Of Birth',
        error: { required: 'Please enter Date Of Birth' },
        name: 'dob',
        type: 'date',
        placeholder: 'Enter you Date Of Birth',
        className: 'sm:w-1/3  ',
        onTab: 1
      },
      type: {
        datalabel: 'Type',
        dataname: 'type',
        label: 'Type',
        name: 'type',
        idSelector: 'value',
        view: 'label',
        type: 'select',
        values: [{ value: 'MANAGEMENT', label: 'MANAGEMENT' }, { value: 'FACULTY', label: 'FACULTY' }
        ],
        className: "sm:w-1/3  ",
        placeholder: 'Enter  Type',
        isMultiple: false,
        effectedRows: [],
        // defaultValue: this.state.user && this.state.user.gender ? { value: this.state.user.gender, label: this.state.user.gender } : ''
      },
      category: {
        label: 'Category',
        name: 'category',
        type: 'text',
        idSelector: 'value',
        view: 'label',
        type: 'select',
        values: [{ value: 'General', label: 'GENERAL' }, { value: 'SC/ST', label: 'SC/ST' }, { value: 'OBC', label: 'OBC' }
        ],
        className: "sm:w-1/3  ",
        placeholder: 'Enter  Type',
        isMultiple: false,
        effectedRows: [],
        // defaultValue: this.state.user && this.state.user.category ? { value: this.state.user.category, label: this.state.user.category } : ''
      },
      gender: {
        datalabel: 'gender',
        dataname: 'gender',
        error: { required: 'Please Select Gender' },
        label: 'Gender',
        name: 'gender',
        idSelector: 'value',
        view: 'label',
        type: 'select',
        values: [{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Transgender', label: 'Transgender' }
        ],
        className: "sm:w-1/3  ",
        placeholder: 'Enter  Type',
        isMultiple: false,
      },
      password: {
        label: 'Password',
        error: {
          required: 'Password is required',
          minLength: {
            value: 4,
            message: 'Your password should have at least 4 characters'
          },
        },
        name: 'password',
        type: 'password',
        placeholder: 'Enter your password',
        className: "sm:w-1/3",
      },
      confirm_password: {
        label: 'Confirm Password',
        error: {
          required: 'Confirm Password is required',
          minLength: {
            value: 4,
            message: 'Your password should have at least 4 characters'
          },
        },
        name: 'confirm_password',
        type: 'password',
        placeholder: 'Enter your Confirm password',
        className: "sm:w-1/3",
      },

      subject_ids: {
        datalabel: 'subjects',
        dataname: 'subjectID',
        label: `${define.subjects}`,
        name: 'subject_ids',
        idSelector: 'id',
        view: 'name',
        type: 'select',
        className: "sm:w-1/3",
        placeholder: 'Enter Subjects',
        isMultiple: true,
        effectedRows: [],
        onTab: 1,
        watchBy: "type",
        allOption: {
          label: "Select all",
          value: "*"
        },
        watchValues: ["FACULTY"]
      },
      module_ids: {
        datalabel: 'modules',
        dataname: 'module',
        label: 'modules',
        error: { required: 'Please enter a valid modules' },
        name: 'module_ids',
        idSelector: 'id',
        view: 'title',
        type: 'select',
        preFilters: {
          withoutParent: true
        },
        className: "sm:w-1/3",
        placeholder: 'Enter modules',
        isMultiple: true,
        effectedRows: [],
        onTab: 1,
      },
      'image': {
        label: 'Image',
        name: 'image',
        error: { required: 'Please Choose an Image' },
        ...imageLimits,
        fileTypes: ["jpg", "png", "jpeg"],
        type: 'image',
        className: "sm:w-1/3",
        onTab: 1
      },
    }
  }

}
