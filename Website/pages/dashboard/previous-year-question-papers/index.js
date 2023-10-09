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
import { Badge, CircularBadge } from 'components/functional-ui/badges'

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
    previousYearQuestions: [],
    storeFilter: {},
    imageLimits: {},
    baseTitle: define.previousYearQuestionPaper,
    modelTitle: 'pyq-papers',
    queryTitle: 'previous_year_question_papers',
    pageUrl: 'previous-year-question-papers',
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
    var data = await fetchAll(`${this.state.modelTitle}`, { ...this.state.filters, 'forList': true });
    this.setState(data)
    //     data = await updateAdditional('count-all', this.state.queryTitle, {  }
    // );
    //     this.setState(data)

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
        error: { required: `Please select ${define.exam} Name` },
        name: 'exam_ids',
        idSelector: 'id',
        view: 'name',
        type: examID ? 'hidden' : 'select',
        className: examID ? '' :"sm:w-1/4",
        defaultValue: examID && `[${examID}]`,
        placeholder: 'Enter Exam Name',
        isMultiple: true,
        addNew: {
          baseTitle: define.exam,
          modelTitle: 'exams',
          queryTitle: 'exams',
        },
        effectedRows: ['courseID', 'subjectID', 'chapterID'],
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
        className: courseID ? '' :"sm:w-1/4",
        defaultValue: courseID && `[${courseID}]`,
        placeholder: 'Enter course Name',
        isMultiple: true,
        addNew: {
          baseTitle: define.course,
          modelTitle: 'courses',
          queryTitle: 'courses',
        },
        effectedRows: ['subjectID', 'chapterID'],
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
        className: "lg:w-1/4",
        placeholder: 'Enter subject Name',
        isMultiple: true,
        addNew: {
          baseTitle: define.subject,
          modelTitle: 'subjects',
          queryTitle: 'subjects',
        },
        effectedRows: ['chapterID'],
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
        className: "lg:w-1/4",
        placeholder: 'Enter chapter Name',
        isMultiple: true,
        addNew: {
          baseTitle: define.chapter,
          modelTitle: 'chapters',
          queryTitle: 'chapters',
        },
        effectedRows: [],
      },
      'title': {
        label: 'title',
        error: { required: 'Please enter a valid title' },
        name: 'title',
        type: 'text',
        className: "sm:w-1/2",
        placeholder: 'Enter Title'
      },
      'mode': {
        datalabel: 'main_sections',
        dataname: 'mainSectionID',
        label: ' mode',
        name: 'mode',
        idSelector: 'value',
        error: { required: 'Please Select a Mode' },
        view: 'label',
        type: 'hidden',
        values: [{
          value: 'PAID',
          label: 'PAID'
        },
        {
          value: 'FREE',
          label: 'FREE'
        }
        ],
        className: "",
        placeholder: 'Enter  Type',
        defaultValue: "PAID",
        isMultiple: false,
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
        isMultiple: true,
        defaultValue: '*',
        disabled: true,
        valueNotDisabled: true,
        effectedRows: [],
      },
      'url': {
        label: 'File',
        name: 'url',
        error: { required: 'Please Choose an File' },
        fileTypes: ["pdf"],
        type: 'file',
        className: "sm:w-1/3",
      },
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

    delete items.url.error.required;

    // items.url = {
    //   ...items.url,
    //   ...this.state.imageLimits
    // }

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

    var previousYearQuestion;
    var message;
    var added = false;


    if ('id' in data) {
      previousYearQuestion = await edit(`${this.state.modelTitle}`, data, 'url');
      message = `${this.state.baseTitle} Updated Successfully`

    } else {

      previousYearQuestion = await add(`${this.state.modelTitle}`, data, 'url');
      message = `${this.state.baseTitle} Added Successfully`;
      added = true

    }

    // check Response
    if (previousYearQuestion.updated) {
      toastr.success(message)
      if (added) {

        let body = {
          title: `We have new  ${this.state.baseTitle} ready for you 😍`,
          body: `'Please open the app to check out the latest  ${data.title} ${this.state.baseTitle} ready`,
          course_ids: data.mode == 'PAID' ? data.course_ids : null,
          subject_ids: data.mode == 'PAID' ? data.subject_ids : null,
          action:'Videos'
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
      if (previousYearQuestion.previousYearQuestion) {
        error = previousYearQuestion.previousYearQuestion.error
      }
      else if (previousYearQuestion.error) {
        error = previousYearQuestion.error.details ? previousYearQuestion.error.details[0].message : previousYearQuestion.error
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
    let data = this.state.previousYearQuestions
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

      this.state.hideHierarchy >= 2 ? { Header: ``, } :   {
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
                return <Badge key={item.id} size='sm' color="bg-yellow-500 text-white mr-2 mb-2" rounded>
                  {item.name}
                </Badge>
              })}
            </div>
          )
        },
      }
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
        label: `Search ${this.state.baseTitle}`,
        name: 'search',
        type: 'text',
        effectedRows: [],
        className: "sm:w-full",
        placeholder: `Search ${this.state.baseTitle} name here`
      }
    ]

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
          <Filter filterObjects={filterObjects} filterOnChange={true} onFilter={this.onFilter} />
          {
            this.state.fetching &&

            <Shimmer /> ||
            <Datatable
              columns={columns}
              deletable={this.props.contentDeletable}
              data={this.state.previousYearQuestions}
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
              viewable={true}
              pageUrl={this.state.pageUrl}
            />
          }

        </Widget>

      </>

    )
  }

}
