import { Component } from 'react';
import { fetchAll, deleteData, updateAdditional, add, edit, fetchByID } from 'helpers/apiService';
import React from 'react'
import SectionTitle from 'components/functional-ui/section-title'
import Datatable from 'components/functional-ui/datatable'
import Shimmer from 'components/website/shimmer/datatable'
import Widget from 'components/functional-ui/widget'
import Filter from 'components/classical-ui/filters'
import toastr from 'toastr'
import define from 'src/json/worddefination.json'
import { FiEdit, FiDelete, FiToggleRight, FiToggleLeft, FiFolder, FiEye } from 'react-icons/fi'
import Tooltip from 'components/functional-ui/tooltips'
import StoreModel from 'components/functional-ui/modals/modal-store'
import DeleteModel from 'components/functional-ui/modals/modal-confirmation'
import Validation from 'components/functional-ui/forms/validation'
import { FiX, FiMoreVertical } from 'react-icons/fi'
import { Badge, CircularBadge } from 'components/functional-ui/badges'
import Switch from 'components/functional-ui/switch'
import moment from 'moment'
import { addFields } from 'components/functional-ui/forms/AddNewFilds'
import { getSettings } from 'helpers/apiService';
import { Vimeo } from 'vimeo';
import SliderModel from 'components/functional-ui/modals/modal-status'
import Sortable from 'sortablejs';
import Link from 'next/link'


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
      exams: {
        limit: 25,
        offset: 0
      },
      courses: {
        limit: 25,
        offset: 0
      },
      subjects: {
        limit: 25,
        offset: 0
      },
      chapters: {
        limit: 25,
        offset: 0
      },
      videos: {
        limit: 25,
        offset: 0
      },
    },
    showLists: {
      exams: null,
      courses: null,
      subjects: null,
      chapters: null,
      videos: null,
    },
    storeFields: [],
    displayModelTitle: 'Add New',
    showModel: false,
    deleteModel: false,
    id: null,
    storeFilter: {},
    imageLimits: {},
    exams: [],
    examTitle: define.exam,
    examModelTitle: 'exams',
    examQueryTitle: 'exams',
    courses: [],
    courseTitle: define.course,
    courseModelTitle: 'courses',
    courseQueryTitle: 'courses',
    subjects: [],
    subjectTitle: define.subject,
    subjectModelTitle: 'subjects',
    subjectQueryTitle: 'subjects',
    chapters: [],
    chapterTitle: define.chapter,
    chapterModelTitle: 'chapters',
    chapterQueryTitle: 'chapters',
    videos: [],
    video: {},
    videoTitle: define.video,
    videoModelTitle: 'videos',
    videoQueryTitle: 'videos',
    displayModelTitle: `Add new ${define.exam}`,
    appliedOrderBox: false
  }


  // Function for fetch data
  fetchList = async () => {

    let videoType = await getSettings('video_type')
    let allowQuickTest = await getSettings('allow_quick_test')
    this.setState({
      videoType: videoType ? videoType : 'VIDEO',
      allowQuickTest: allowQuickTest,
    })

    var exam = await fetchAll(this.state.examModelTitle, { ...this.state.filters.exams, 'forList': true });
    this.setState(exam)

    if ((exam.exams && exam.exams.length > 0) || this.state.examId) {
      var course = await fetchAll(this.state.courseModelTitle, { ...this.state.filters.courses, 'forList': true, examID: this.state.examId ? this.state.examId : exam.exams[0].id });
      this.setState(course)
      this.setState({
        examId: this.state.examId ? this.state.examId : exam.exams[0].id
      })

      if ((course.courses && course.courses.length > 0) || this.state.courseId) {
        var subject = await fetchAll(this.state.subjectModelTitle, { ...this.state.filters.subjects, 'forList': true, examID: this.state.examId ? this.state.examId : exam.exams[0].id, courseID: this.state.courseId ? this.state.courseId : course.courses[0].id });
        this.setState(subject)

        this.setState({
          courseId: this.state.courseId ? this.state.courseId : course.courses[0].id
        })

        if ((subject.subjects && subject.subjects.length > 0) || this.state.subjectId) {
          var chapter = await fetchAll(this.state.chapterModelTitle, { ...this.state.filters.chapters, 'forList': true, examID: this.state.examId ? this.state.examId : exam.exams[0].id, courseID: this.state.courseId ? this.state.courseId : course.courses[0].id, subjectID: this.state.subjectId ? this.state.subjectId : subject.subjects[0].id });
          this.setState(chapter)

          this.setState({
            subjectId: this.state.subjectId ? this.state.subjectId : subject.subjects[0].id
          })

          if ((chapter.chapters && chapter.chapters.length > 0) || this.state.chapterId) {
            var data = await fetchAll(this.state.videoModelTitle, { ...this.state.filters.videos, 'forList': true, examID: this.state.examId ? this.state.examId : exam.exams[0].id, courseID: this.state.courseId ? this.state.courseId : course.courses[0].id, subjectID: this.state.subjectId ? this.state.subjectId : subject.subjects[0].id, chapterID: this.state.chapterId ? this.state.chapterId : chapter.chapters[0].id });
            this.setState(data)

            this.setState({
              chapterId: chapter.chapters[0].id
            })

            if (data.videos && data.videos.length > 0) {
              var video = await fetchByID(this.state.videoModelTitle, this.state.videoId ? this.state.videoId : data.videos[0].id);
              this.setState(video)

              this.setState({
                videoId: this.state.videoId ? this.state.videoId : data.videos[0].id
              })
            }
          }
        }
      }
    }


    var imageLimits = await fetchAll('image-size-limits', { 'label': this.state.queryTitle });
    imageLimits = imageLimits.success = true ? imageLimits.sizes : {}
    this.setState({ fetching: false, imageLimits: imageLimits })
  }

  // On Exam CHange
  onChangeExam = async () => {

    var course = await fetchAll(this.state.courseModelTitle, { ...this.state.filters.courses, 'forList': true, examID: this.state.examId });
    this.setState(course)

    if (course.courses && course.courses.length > 0) {
      var subject = await fetchAll(this.state.subjectModelTitle, { ...this.state.filters.subjects, 'forList': true, examID: this.state.examId, courseID: course.courses[0].id });
      this.setState(subject)

      this.setState({
        courseId: course.courses[0].id
      })

      if (subject.subjects && subject.subjects.length > 0) {
        var chapter = await fetchAll(this.state.chapterModelTitle, { ...this.state.filters.chapters, 'forList': true, examID: this.state.examId, courseID: course.courses[0].id, subjectID: subject.subjects[0].id });
        this.setState(chapter)

        this.setState({
          subjectId: subject.subjects[0].id
        })

        if (chapter.chapters && chapter.chapters.length > 0) {
          var data = await fetchAll(this.state.videoModelTitle, { ...this.state.filters.videos, 'forList': true, examID: this.state.examId, courseID: course.courses[0].id, subjectID: subject.subjects[0].id, chapterID: chapter.chapters[0].id });
          this.setState(data)

          this.setState({
            chapterId: chapter.chapters[0].id
          })

          if (data.videos && data.videos.length > 0) {
            var video = await fetchByID(this.state.videoModelTitle, data.videos[0].id);
            this.setState(video)

            this.setState({
              videoId: data.videos[0].id
            })
          }
        }
      }
    }


  }


  // On COurse CHange
  onChangeCourse = async () => {

    var subject = await fetchAll(this.state.subjectModelTitle, { ...this.state.filters.subjects, 'forList': true, examID: this.state.examId, courseID: this.state.courseId });
    this.setState(subject)

    if (subject.subjects && subject.subjects.length > 0) {
      var chapter = await fetchAll(this.state.chapterModelTitle, { ...this.state.filters.chapters, 'forList': true, examID: this.state.examId, courseID: this.state.courseId, subjectID: subject.subjects[0].id });
      this.setState(chapter)

      this.setState({
        subjectId: subject.subjects[0].id
      })

      if (chapter.chapters && chapter.chapters.length > 0) {
        var data = await fetchAll(this.state.videoModelTitle, { ...this.state.filters.videos, 'forList': true, examID: this.state.examId, courseID: this.state.courseId, subjectID: subject.subjects[0].id, chapterID: chapter.chapters[0].id });
        this.setState(data)

        this.setState({
          chapterId: chapter.chapters[0].id
        })

        if (data.videos && data.videos.length > 0) {
          var video = await fetchByID(this.state.videoModelTitle, data.videos[0].id);
          this.setState(video)

          this.setState({
            videoId: data.videos[0].id
          })
        }
      }
    }


  }


  // On Subject Change
  onChangeSubject = async () => {

    var chapter = await fetchAll(this.state.chapterModelTitle, { ...this.state.filters.chapters, 'forList': true, examID: this.state.examId, courseID: this.state.courseId, subjectID: this.state.subjectId });
    this.setState(chapter)

    if (chapter.chapters && chapter.chapters.length > 0) {
      var data = await fetchAll(this.state.videoModelTitle, { ...this.state.filters.videos, 'forList': true, examID: this.state.examId, courseID: this.state.courseId, subjectID: this.state.subjectId, chapterID: chapter.chapters[0].id });
      this.setState(data)

      this.setState({
        chapterId: chapter.chapters[0].id
      })

      if (data.videos && data.videos.length > 0) {
        var video = await fetchByID(this.state.videoModelTitle, data.videos[0].id);
        this.setState(video)

        this.setState({
          videoId: data.videos[0].id
        })
      }
    }
  }


  // On Chapter change
  onChangeChapter = async () => {

    var data = await fetchAll(this.state.videoModelTitle, { ...this.state.filters.videos, 'forList': true, examID: this.state.examId, courseID: this.state.courseId, subjectID: this.state.subjectId, chapterID: this.state.chapterId });
    this.setState(data)

    if (data.videos && data.videos.length > 0) {
      var video = await fetchByID(this.state.videoModelTitle, data.videos[0].id);
      this.setState(video)

      this.setState({
        videoId: data.videos[0].id
      })
    }
  }


  // On Video Change
  onChangeVideo = async () => {

    var data = await fetchByID(this.state.videoModelTitle, this.state.videoId);
    this.setState(data)
  }

  // Function for fetch data
  fetchFilteredList = async () => {
    var exam = await fetchAll(this.state.examModelTitle, { ...this.state.filters.exams, 'forList': true });
    this.setState(exam)

    var course = await fetchAll(this.state.courseModelTitle, { ...this.state.filters.courses, 'forList': true, examID: this.state.examId });
    this.setState(course)

    var subject = await fetchAll(this.state.subjectModelTitle, { ...this.state.filters.subjects, 'forList': true, examID: this.state.examId, courseID: this.state.courseId });
    this.setState(subject)

    var chapter = await fetchAll(this.state.chapterModelTitle, { ...this.state.filters.chapters, 'forList': true, examID: this.state.examId, courseID: this.state.courseId, subjectID: this.state.subjectId });
    this.setState(chapter)

    var data = await fetchAll(this.state.videoModelTitle, { ...this.state.filters.videos, 'forList': true, examID: this.state.examId, courseID: this.state.courseId, subjectID: this.state.subjectId, chapterID: this.state.chapterId });
    this.setState(data)

    if (this.state.videoId) {
      var video = await fetchByID(this.state.videoModelTitle, this.state.videoId);
      this.setState(video)
    }

  }

  // Add Modal Status change
  changeModalStatus = (data) => {

    if (this.state.showModel == true) {
      // this.buildAddModel(data);
      this.setState({
        showModel: false
      })
    } else {
      this.buildAddModel(data);

    }
  }

  // On Edit Modal Open
  randerEditModal = async (data, row) => {

    console.log('sdncns')

    this.setState({
      displayModelTitle: `Edit ${data.baseTitle} - ${row.title ? row.title : row.name}`,
      currentSection: data.modelTitle,
      currentBaseTitle: data.baseTitle,
      lactureType: data.type
    })

    var items = await addFields(data);

    Object.keys(items).map((key) => {
      items[key].defaultValue = row[key]
    })


    if (items.course_ids) {
      items.course_ids.preFilters = {
        examID: row.exam_ids && JSON.parse(row.exam_ids).length > 0 ? JSON.parse(row.exam_ids) : 'lock'
      }
    }
    if (items.subject_ids) {
      items.subject_ids.preFilters = {
        examID: row.exam_ids && JSON.parse(row.exam_ids).length > 0 ? JSON.parse(row.exam_ids) : 'lock',
        courseID: row.course_ids && JSON.parse(row.course_ids).length > 0 ? JSON.parse(row.course_ids) : 'lock'
      }
    }
    if (items.chapter_ids) {
      items.chapter_ids.preFilters = {
        examID: row.exam_ids && JSON.parse(row.exam_ids).length > 0 ? JSON.parse(row.exam_ids) : 'lock',
        courseID: row.course_ids && JSON.parse(row.course_ids).length > 0 ? JSON.parse(row.course_ids) : 'lock',
        subjectID: row.subject_ids && JSON.parse(row.subject_ids).length > 0 ? JSON.parse(row.subject_ids) : 'lock'
      }
    }


    if (items.thumbnail && items.thumbnail.error) {
      delete items.thumbnail.error.required;

      items.thumbnail = {
        ...items.thumbnail,
        ...this.state.imageLimits
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
          onTab: 1
        },
        ...items
      }
    }

    if (items.video) {
      delete items.video;

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
      showModel: true
    })



  }

  // On Add modal Open
  buildAddModel = async (data) => {

    this.setState({
      displayModelTitle: `Add  New ${data.baseTitle}`,
      currentSection: data.modelTitle,
      currentBaseTitle: data.baseTitle,
      lactureType: data.type ? data.type : null
    })

    console.log(data)

    return this.setState({
      storeFields: await addFields(data),
      showModel: true
    })

  }

  // On Submit 
  onStoreSubmit = async (data) => {

    var course = null;
    var video = null;
    var message;
    var image = 'thumbnail'

    if (this.state.currentSection == 'chapters' || this.state.lactureType == 'TEST') {
      image = null
    }

    if ('id' in data) {
      course = await edit(this.state.currentSection, data, image);
      message = `${this.state.currentBaseTitle} Updated Successfully`
    } else {
      if (this.state.currentSection == 'videos' && this.state.lactureType == 'VIDEO') {


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
              video = await add(vimeoUploadApp.state.currentSection, data, 'thumbnail');
              message = `${vimeoUploadApp.state.currentBaseTitle} Added Successfully`

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
        course = await add(this.state.currentSection, data, image);
        message = `${this.state.currentBaseTitle} Added Successfully`
      }
    }


    if (course) {  // check Response
      if (course.updated) {
        toastr.success(message)
        this.fetchList()

        this.setState({
          showModel: false
        })
      }
      else {
        let error;
        if (course.course) {
          error = course.course.error
        }
        else if (course.error.details) {
          error = course.error.details[0].message
        } else if (course.error) {
          error = course.error
        }
        toastr.error(error)
      }
    }

  }


  // Function for delete data
  deleteRow = async () => {
    let deleteStatus = await deleteData(`${this.state.modelTitle}`, JSON.stringify({ id: this.state.id }))
    if (deleteStatus.success == true) {
      toastr.success(`${this.state.baseTitle} Deleted Successfully`)
      this.fetchList()
    }
    else {
      toastr.info(`You can't delete this ${this.state.baseTitle}. To delete this, you first need to delete the associated components with the this ${this.state.baseTitle}.`, 'Oops Sorry !',)
    }

    this.setState({
      deleteModel: false
    })
  }


  // Use for Pagination Scroll
  onScroll = async (modelTitle) => {


    let filter = {
      ...this.state.filters[modelTitle],
      'forList': true,
    }


    if (modelTitle == 'courses' || modelTitle == 'subjects' || modelTitle == 'chapters' || modelTitle == 'videos') {
      filter.examID = this.state.examId
    }
    if (modelTitle == 'subjects' || modelTitle == 'chapters' || modelTitle == 'videos') {
      filter.courseID = this.state.courseId
    }
    if (modelTitle == 'chapters' || modelTitle == 'videos') {
      filter.subjectID = this.state.subjectId
    }
    if (modelTitle == 'videos') {
      filter.chapterID = this.state.chapterId
    }

    var data = await fetchAll(modelTitle, filter);
    console.log(data)

    data = this.state[modelTitle].concat(data[modelTitle])

    this.setState({
      [`${modelTitle}`]: data
    })

  }

  //On Status Change
  // Function for delete data
  changeStatus = async (ids, status, queryTitle) => {

    var data = {
      id: ids,
      is_active: status,
    }

    var update = await updateAdditional('change-status', queryTitle, data)

    if (update.success == true) {
      toastr.success('Status change Successfull')
    }

    if (ids.length != undefined) {
      this.fetchList();
    }
  }

  // Re-Indexing
  reorder = async (data, queryTitle) => {

    var update = await updateAdditional('re-indexing', queryTitle, data)

    if (update.success == true) {
      toastr.success('Re-Indexing Successfull')
    }
  }


  // 
  componentDidMount() {
    this.fetchList();

    var thisRef = this
    window.addEventListener('mouseup', function (event) {
      var pol = document.getElementById('dropdown');

      console.log(event.target.parentNode != pol)
      if (event.target != pol && event.target.parentNode != pol) {
        thisRef.setState({
          showLists: {
            exams: null,
            courses: null,
            subjects: null,
            chapters: null,
            videos: null,
          },
        })
      }
    });



    if (document.getElementById('exam') != undefined) {
      Sortable.create(exam, {
        group: "sorting",
        sort: true,
        handle: ".sorticon",
        store: {
          set: function (sortable) {
            var finalList = []
            var order = sortable.toArray();
            order = order.map((value, key) => {
              finalList.push({ id: value, position: key });
            })

            thisRef.reorder(finalList, 'exams')
          },
        },
      });
    }
    if (document.getElementById('course') != undefined) {
      Sortable.create(course, {
        group: "sorting",
        sort: true,
        handle: ".sorticon",
        store: {
          set: function (sortable) {
            var finalList = []
            var order = sortable.toArray();
            order = order.map((value, key) => {
              finalList.push({ id: value, position: key });
            })

            thisRef.reorder(finalList, 'courses')
          },
        },
      });
    }
    if (document.getElementById('subject') != undefined) {
      Sortable.create(subject, {
        group: "sorting",
        sort: true,
        handle: ".sorticon",
        store: {
          set: function (sortable) {
            var finalList = []
            var order = sortable.toArray();
            order = order.map((value, key) => {
              finalList.push({ id: value, position: key });
            })

            thisRef.reorder(finalList, 'subjects')
          },
        },
      });
    }
    if (document.getElementById('chapter') != undefined) {
      Sortable.create(chapter, {
        group: "sorting",
        sort: true,
        handle: ".sorticon",
        store: {
          set: function (sortable) {
            var finalList = []
            var order = sortable.toArray();
            order = order.map((value, key) => {
              finalList.push({ id: value, position: key });
            })

            thisRef.reorder(finalList, 'chapters')
          },
        },
      });
    }
    if (document.getElementById('video') != undefined) {
      Sortable.create(video, {
        group: "sorting",
        sort: true,
        handle: ".sorticon",
        store: {
          set: function (sortable) {
            var finalList = []
            var order = sortable.toArray();
            order = order.map((value, key) => {
              finalList.push({ id: value, position: key });
            })

            thisRef.reorder(finalList, 'videos')
          },
        },
      });
    }
  }

  // 
  render() {
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

    return (
      <>
        <Widget
          title=""
          description=''
          className="h-full"
        >

          {
            this.state.showModel &&
            <StoreModel
              title={this.state.displayModelTitle}
              body={
                <div>
                  {
                    this.state.storeFields && this.state.storeFields != {} && <Validation items={Object.values(this.state.storeFields)} steps={this.state.lactureType == 'TEST' ? steps : null} onSubmit={this.onStoreSubmit} alerts={false} defaultValues={this.state.defaultValues} />
                  }

                </div>
              }
              useModel={this.state.showModel}
              hideModal={this.changeModalStatus}
            />
          }

          <div className="flex h-full  mb-3 overflow-x-scroll overflow-y-hidden  divide-x">
            {this.props.hideHierarchy < 1 && <div className=" border-r relative" >
              <div className="px-2 border-b mb-4">
                <SectionTitle className="section-title w-full pt-3" title="" subtitle={`${this.state.examTitle}s`}
                  hideButton={true}
                  html={
                    <div>

                      <button
                        className="rounded px-2 font-bold py-1 btn-rounded bg-blue-200  text-blue-500  mr-2"
                        type="button"
                        onClick={() => this.changeModalStatus({
                          baseTitle: this.state.examTitle,
                          modelTitle: this.state.examModelTitle,
                          queryTitle: this.state.examQueryTitle,
                        })}
                      >
                        <i class="fas fa-plus mr-1"></i> Add New
                      </button>
                    </div>
                  }

                />
              </div>


              <div className="mr-1 h-85 overflow-y-scroll" id="examList" style={{ width: "16rem" }} id={'exam'} onScroll={() => {
                let element = document.getElementById('exam')

                if ((Math.round(element.scrollHeight - element.clientHeight) == Math.round(element.scrollTop)) && this.state.exams.length > this.state.filters.exams.offset) {

                  this.setState({
                    filters: {
                      ...this.state.filters,
                      exams: {
                        ...this.state.filters.exams,
                        offset: this.state.filters.exams.offset + this.state.filters.exams.limit
                      }
                    }
                  }, () => {
                    this.onScroll('exams')
                  })
                }
              }}>
                {this.state.exams && this.state.exams.map((exam, i) => (
                  <>
                    <div className="flex flex-row " data-id={exam.id}>
                      <div className={` items-center mb-1 mx-2  overflow-y-scroll w-5/6 sorticon  ${this.state.examId == `${exam.id}` ? 'bg-chat-selected' : ''}`} key={i} >
                        <div className="flex flex-row items-center p-1 cursor-pointer" onClick={(event) => {
                          this.setState({
                            examId: exam.id,
                            courseId: null,
                            subjectId: null,
                            chapterId: null,
                            videoId: null,
                            courses: [],
                            subjects: [],
                            chapters: [],
                            videos: [],
                            video: {},
                            filters: {
                              ...this.state.filters,
                              courses: {
                                ...this.state.filters.courses,
                                offset: 0
                              },
                              subjects: {
                                ...this.state.filters.subjects,
                                offset: 0
                              },
                              chapters: {
                                ...this.state.filters.chapters,
                                offset: 0
                              },
                              videos: {
                                ...this.state.filters.videos,
                                offset: 0
                              },
                            },
                          }, () => {
                            this.onChangeExam()
                          })
                        }}>
                          <img className="w-6 pl-0.5 " src={exam.thumbnail} />
                          <span className="ml-1 mr-1 text-xs truncate w-full">{exam.name}</span>
                          <i className="fas fa-angle-right mr-2 text-gray-400 focus:text-white text-right"></i>

                        </div>
                      </div>
                      <div className="hidden lg:flex relative" id={`exam${exam.id}`}>
                        <button
                          onClick={(e) => {
                            // e.preventDefault()
                            this.setState({
                              showLists: {
                                ...this.state.showLists,
                                exams: exam.id
                              }
                            })
                          }}
                          className="flex items-center justify-center " >
                          <FiMoreVertical size={18} />
                        </button>
                        <div
                          className={`dropdown absolute top-0 right-0 mt-8  ${this.state.showLists.exams == exam.id ? 'open' : ''}`} id="dropdown">
                          <div className="dropdown-content  bottom-start border ">
                            <div className="flex flex-row flex-wrap">
                              <div key={exam.id} className="w-full">
                                <div
                                  className="flex items-center justify-start dropdown-item p-2 cursor-pointer hover:bg-green-600"
                                  key={exam.id}
                                  onClick={() => this.randerEditModal({
                                    id: exam.id,
                                    baseTitle: this.state.examTitle,
                                    modelTitle: this.state.examModelTitle,
                                    queryTitle: this.state.examQueryTitle,
                                  }, exam)}
                                >
                                  <div className="ml-2">
                                    <div className="text-xs  flex">
                                      <FiEdit size={16} className="stroke-current text-base mr-2 mt-1" /> Edit</div>
                                  </div>
                                </div>
                                <div
                                  className="flex items-center justify-start dropdown-item p-2 cursor-pointer"
                                  key={exam.id}
                                  onClick={() => {
                                    this.setState({
                                      deleteModel: true,
                                      id: this.state.examId,
                                      baseTitle: this.state.examTitle,
                                      modelTitle: this.state.examModelTitle,
                                      queryTitle: this.state.examQueryTitle,
                                    })
                                  }}
                                >
                                  <div className="ml-2">
                                    <div className="text-xs  flex">
                                      <FiDelete size={16} className="stroke-current text-base mr-2 mt-1" /> Delete</div>
                                  </div>
                                </div>
                                <div
                                  className="flex items-center justify-start dropdown-item p-2 cursor-pointer"
                                  key={exam.id}
                                  onClick={() => this.changeStatus([exam.id], !exam.is_active, 'exams')}
                                >
                                  <div className="ml-2">
                                    {
                                      exam.is_active == 1 &&
                                      <div className="text-xs  flex">
                                        <FiToggleLeft size={16} className="stroke-current text-base mr-2 mt-1" /> Deactivate
                                      </div> ||
                                      <div className="text-xs  flex">
                                        <FiToggleRight size={16} className="stroke-current text-base mr-2 mt-1" /> Activate
                                      </div>
                                    }
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>


                  </>
                ))}

              </div>
            </div>}

            {this.props.hideHierarchy < 2 && <div className=" border-r relative" >
              <div className="px-2 border-b mb-4">
                <SectionTitle className="section-title w-full pt-3" title="" subtitle={`${this.state.courseTitle}s`}
                  hideButton={true}
                  html={
                    <div>

                      <button
                        className="rounded px-2 font-bold py-1 btn-rounded bg-blue-200  text-blue-500  mr-2"
                        type="button"
                        onClick={() => this.changeModalStatus({
                          baseTitle: this.state.courseTitle,
                          modelTitle: this.state.courseModelTitle,
                          queryTitle: this.state.courseQueryTitle,
                        })}                      >
                        <i class="fas fa-plus mr-1"></i> Add New
                      </button>
                    </div>
                  }
                />
              </div>

              <div className="mr-1 h-85 overflow-y-scroll  " style={{ width: "16rem" }} id={'course'} onScroll={() => {
                let element = document.getElementById('course')

                if ((Math.round(element.scrollHeight - element.clientHeight) == Math.round(element.scrollTop)) && this.state.courses.length > this.state.filters.courses.offset) {

                  this.setState({
                    filters: {
                      ...this.state.filters,
                      courses: {
                        ...this.state.filters.courses,
                        offset: this.state.filters.courses.offset + this.state.filters.courses.limit
                      }
                    }
                  }, () => {
                    this.onScroll('courses')
                  })
                }
              }}>
                {this.state.courses && this.state.courses.map((course, i) => (
                  <>
                    <div className="flex flex-row" data-id={course.id}>
                      <div className={` items-center mb-1 mx-2  overflow-y-scroll w-5/6 sorticon  ${this.state.courseId == `${course.id}` ? 'bg-chat-selected' : ''}`} key={i} >
                        <div className="flex flex-row items-center p-1 cursor-pointer" onClick={(event) => {
                          this.setState({
                            courseId: course.id,
                            subjectId: null,
                            chapterId: null,
                            videoId: null,
                            subjects: [],
                            chapters: [],
                            videos: [],
                            video: {},
                            filters: {
                              ...this.state.filters,
                              subjects: {
                                ...this.state.filters.subjects,
                                offset: 0
                              },
                              chapters: {
                                ...this.state.filters.chapters,
                                offset: 0
                              },
                              videos: {
                                ...this.state.filters.videos,
                                offset: 0
                              },
                            },
                          }, () => {
                            this.onChangeCourse()
                          })
                        }}>
                          <img className="w-6 pl-0.5 " src={course.thumbnail} />
                          <span className="ml-1 mr-1 text-xs truncate w-full">{course.name}</span>
                          <i className="fas fa-angle-right mr-2 text-gray-400 focus:text-white text-right"></i>

                        </div>
                      </div>
                      <div className="hidden lg:flex relative" id={`course${course.id}`}>
                        <button
                          onClick={(e) => {
                            // e.preventDefault()
                            this.setState({
                              showLists: {
                                ...this.state.showLists,
                                courses: course.id
                              }
                            })
                          }}
                          className="flex items-center justify-center " >
                          <FiMoreVertical size={18} />
                        </button>
                        <div
                          className={`dropdown absolute top-0 right-0 mt-8  ${this.state.showLists.courses == course.id ? 'open' : ''}`} id="dropdown">
                          <div className="dropdown-content  bottom-start border ">
                            <div className="flex flex-row flex-wrap">
                              <div key={course.id} className="w-full">
                                <div
                                  className="flex items-center justify-start dropdown-item p-2 cursor-pointer hover:bg-green-600"
                                  key={course.id}
                                  onClick={() => this.randerEditModal({
                                    id: course.id,
                                    baseTitle: this.state.courseTitle,
                                    modelTitle: this.state.courseModelTitle,
                                    queryTitle: this.state.courseQueryTitle,
                                  }, course)}
                                >
                                  <div className="ml-2">
                                    <div className="text-xs  flex">
                                      <FiEdit size={16} className="stroke-current text-base mr-2 mt-1" /> Edit</div>
                                  </div>
                                </div>
                                <div
                                  className="flex items-center justify-start dropdown-item p-2 cursor-pointer"
                                  key={course.id}
                                  onClick={() => {
                                    this.setState({
                                      deleteModel: true,
                                      id: this.state.courseId,
                                      baseTitle: this.state.courseTitle,
                                      modelTitle: this.state.courseModelTitle,
                                      queryTitle: this.state.courseQueryTitle,
                                    })
                                  }}
                                >
                                  <div className="ml-2">
                                    <div className="text-xs  flex">
                                      <FiDelete size={16} className="stroke-current text-base mr-2 mt-1" /> Delete</div>
                                  </div>
                                </div>
                                <div
                                  className="flex items-center justify-start dropdown-item p-2 cursor-pointer"
                                  key={course.id}
                                  onClick={() => this.changeStatus([course.id], !course.is_active, 'courses')}
                                >
                                  <div className="ml-2">
                                    {
                                      course.is_active == 1 &&
                                      <div className="text-xs  flex">
                                        <FiToggleLeft size={16} className="stroke-current text-base mr-2 mt-1" /> Deactivate
                                      </div> ||
                                      <div className="text-xs  flex">
                                        <FiToggleRight size={16} className="stroke-current text-base mr-2 mt-1" /> Activate
                                      </div>
                                    }
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>


                  </>
                ))}
              </div>
            </div>}

            <div className=" border-r relative" >
              <div className="px-2 border-b mb-4">
                <SectionTitle className="section-title w-full pt-3" title="" subtitle={`${this.state.subjectTitle}s`}
                  hideButton={true}
                  html={
                    <div>

                      <button
                        className="rounded px-2 font-bold py-1 btn-rounded bg-blue-200  text-blue-500  mr-2"
                        type="button"
                        onClick={() => this.changeModalStatus({
                          baseTitle: this.state.subjectTitle,
                          modelTitle: this.state.subjectModelTitle,
                          queryTitle: this.state.subjectQueryTitle,
                        })}                      >
                        <i class="fas fa-plus mr-1"></i> Add New
                      </button>
                    </div>
                  }
                />
              </div>

              <div className="mr-1 h-85 overflow-y-scroll " style={{ width: "16rem" }} id={'subject'} onScroll={() => {
                let element = document.getElementById('subject')

                if ((Math.round(element.scrollHeight - element.clientHeight) == Math.round(element.scrollTop)) && this.state.subjects.length > this.state.filters.subjects.offset) {

                  this.setState({
                    filters: {
                      ...this.state.filters,
                      subjects: {
                        ...this.state.filters.subjects,
                        offset: this.state.filters.subjects.offset + this.state.filters.subjects.limit
                      }
                    }
                  }, () => {
                    this.onScroll('subjects')
                  })
                }
              }}>
                {this.state.subjects && this.state.subjects.map((subject, i) => (
                  <>
                    <div className="flex flex-row" data-id={subject.id}>
                      <div className={` items-center mb-1 mx-2  overflow-y-scroll w-5/6 sorticon  ${this.state.subjectId == `${subject.id}` ? 'bg-chat-selected' : ''}`} key={i} >
                        <div className="flex flex-row items-center p-1 cursor-pointer" onClick={(event) => {
                          this.setState({
                            subjectId: subject.id,
                            chapterId: null,
                            videoId: null,
                            chapters: [],
                            videos: [],
                            video: {},
                            filters: {
                              ...this.state.filters,
                              chapters: {
                                ...this.state.filters.chapters,
                                offset: 0
                              },
                              videos: {
                                ...this.state.filters.videos,
                                offset: 0
                              },
                            },
                          }, () => {
                            this.onChangeSubject()
                          })
                        }}>
                          <img className="w-6 pl-0.5 " src={subject.thumbnail} />
                          <span className="ml-1 mr-1 text-xs truncate w-full">{subject.name}</span>
                          <i className="fas fa-angle-right mr-2 text-gray-400 focus:text-white text-right"></i>

                        </div>
                      </div>
                      <div className="hidden lg:flex relative" id={`subject${subject.id}`}>
                        <button
                          onClick={(e) => {
                            // e.preventDefault()
                            this.setState({
                              showLists: {
                                ...this.state.showLists,
                                subjects: subject.id
                              }
                            })
                          }}
                          className="flex items-center justify-center " >
                          <FiMoreVertical size={18} />
                        </button>
                        <div
                          className={`dropdown absolute top-0 right-0 mt-8  ${this.state.showLists.subjects == subject.id ? 'open' : ''}`} id="dropdown">
                          <div className="dropdown-content  bottom-start border ">
                            <div className="flex flex-row flex-wrap">
                              <div key={subject.id} className="w-full">
                                <div
                                  className="flex items-center justify-start dropdown-item p-2 cursor-pointer hover:bg-green-600"
                                  key={subject.id}
                                  onClick={() => this.randerEditModal({
                                    id: subject.id,
                                    baseTitle: this.state.subjectTitle,
                                    modelTitle: this.state.subjectModelTitle,
                                    queryTitle: this.state.subjectQueryTitle,
                                  }, subject)}
                                >
                                  <div className="ml-2">
                                    <div className="text-xs  flex">
                                      <FiEdit size={16} className="stroke-current text-base mr-2 mt-1" /> Edit</div>
                                  </div>
                                </div>
                                <div
                                  className="flex items-center justify-start dropdown-item p-2 cursor-pointer"
                                  key={subject.id}
                                  onClick={() => {
                                    this.setState({
                                      deleteModel: true,
                                      id: this.state.subjectId,
                                      baseTitle: this.state.subjectTitle,
                                      modelTitle: this.state.subjectModelTitle,
                                      queryTitle: this.state.subjectQueryTitle,
                                    })
                                  }}
                                >
                                  <div className="ml-2">
                                    <div className="text-xs  flex">
                                      <FiDelete size={16} className="stroke-current text-base mr-2 mt-1" /> Delete</div>
                                  </div>
                                </div>
                                <div
                                  className="flex items-center justify-start dropdown-item p-2 cursor-pointer"
                                  key={subject.id}
                                  onClick={() => this.changeStatus([subject.id], !subject.is_active, 'subjects')}
                                >
                                  <div className="ml-2">
                                    {
                                      subject.is_active == 1 &&
                                      <div className="text-xs  flex">
                                        <FiToggleLeft size={16} className="stroke-current text-base mr-2 mt-1" /> Deactivate
                                      </div> ||
                                      <div className="text-xs  flex">
                                        <FiToggleRight size={16} className="stroke-current text-base mr-2 mt-1" /> Activate
                                      </div>
                                    }
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>


                  </>
                ))}
              </div>

            </div>


            <div className=" border-r relative" >
              <div className="px-2 border-b mb-4">
                <SectionTitle className="section-title w-full pt-3" title="" subtitle={`${this.state.chapterTitle}s`}
                  hideButton={true}
                  html={
                    <div>

                      <button
                        className="rounded px-2 font-bold py-1 btn-rounded bg-blue-200  text-blue-500  mr-2"
                        type="button"
                        onClick={() => this.changeModalStatus({
                          baseTitle: this.state.chapterTitle,
                          modelTitle: this.state.chapterModelTitle,
                          queryTitle: this.state.chapterQueryTitle,
                        })}                      >
                        <i class="fas fa-plus mr-1"></i> Add New
                      </button>
                    </div>
                  }
                />
              </div>

              <div className="mr-1 h-85 overflow-y-scroll " style={{ width: "16rem" }} id={'chapter'} onScroll={() => {
                let element = document.getElementById('chapter')

                if ((Math.round(element.scrollHeight - element.clientHeight) == Math.round(element.scrollTop)) && this.state.chapters.length > this.state.filters.chapters.offset) {

                  this.setState({
                    filters: {
                      ...this.state.filters,
                      chapters: {
                        ...this.state.filters.chapters,
                        offset: this.state.filters.chapters.offset + this.state.filters.chapters.limit
                      }
                    }
                  }, () => {
                    this.onScroll('chapters')
                  })
                }
              }}>
                {this.state.chapters && this.state.chapters.map((chapter, i) => (
                  <>
                    <div className="flex flex-row" data-id={chapter.id}>
                      <div className={` items-center mb-1 mx-2  overflow-y-scroll w-5/6 sorticon  ${this.state.chapterId == `${chapter.id}` ? 'bg-chat-selected' : ''}`} key={i} >
                        <div className="flex flex-row items-center p-1 cursor-pointer" onClick={(event) => {
                          this.setState({
                            chapterId: chapter.id,
                            videoId: null,
                            videos: [],
                            video: {},
                            filters: {
                              ...this.state.filters,
                              videos: {
                                ...this.state.filters.videos,
                                offset: 0
                              },
                            },
                          }, () => {
                            this.onChangeChapter()
                          })
                        }}>
                          <FiFolder className="w-6 pl-0.5 " />
                          <span className="ml-1 mr-1 text-xs truncate w-full">{chapter.name}</span>
                          <i className="fas fa-angle-right mr-2 text-gray-400 focus:text-white text-right"></i>

                        </div>
                      </div>
                      <div className="hidden lg:flex relative" id={`chapter${chapter.id}`}>
                        <button
                          onClick={(e) => {
                            // e.preventDefault()
                            this.setState({
                              showLists: {
                                ...this.state.showLists,
                                chapters: chapter.id
                              }
                            })
                          }}
                          className="flex items-center justify-center " >
                          <FiMoreVertical size={18} />
                        </button>
                        <div
                          className={`dropdown absolute top-0 right-0 mt-8  ${this.state.showLists.chapters == chapter.id ? 'open' : ''}`} id="dropdown">
                          <div className="dropdown-content  bottom-start border ">
                            <div className="flex flex-row flex-wrap">
                              <div key={chapter.id} className="w-full">
                                <div
                                  className="flex items-center justify-start dropdown-item p-2 cursor-pointer hover:bg-green-600"
                                  key={chapter.id}
                                  onClick={() => this.randerEditModal({
                                    id: chapter.id,
                                    baseTitle: this.state.chapterTitle,
                                    modelTitle: this.state.chapterModelTitle,
                                    queryTitle: this.state.chapterQueryTitle,
                                  }, chapter)}
                                >
                                  <div className="ml-2">
                                    <div className="text-sm font-bold flex">
                                      <FiEdit size={16} className="stroke-current text-base mr-2 mt-1" /> Edit</div>
                                  </div>
                                </div>
                                <div
                                  className="flex items-center justify-start dropdown-item p-2 cursor-pointer"
                                  key={chapter.id}
                                  onClick={() => {
                                    this.setState({
                                      deleteModel: true,
                                      id: this.state.chapterId,
                                      baseTitle: this.state.chapterTitle,
                                      modelTitle: this.state.chapterModelTitle,
                                      queryTitle: this.state.chapterQueryTitle,
                                    })
                                  }}
                                >
                                  <div className="ml-2">
                                    <div className="text-sm font-bold flex">
                                      <FiDelete size={16} className="stroke-current text-base mr-2 mt-1" /> Delete</div>
                                  </div>
                                </div>
                                <div
                                  className="flex items-center justify-start dropdown-item p-2 cursor-pointer"
                                  key={chapter.id}
                                  onClick={() => this.changeStatus([chapter.id], !chapter.is_active, 'chapters')}
                                >
                                  <div className="ml-2">
                                    {
                                      chapter.is_active == 1 &&
                                      <div className="text-sm font-bold flex">
                                        <FiToggleLeft size={16} className="stroke-current text-base mr-2 mt-1" /> Deactivate
                                      </div> ||
                                      <div className="text-sm font-bold flex">
                                        <FiToggleRight size={16} className="stroke-current text-base mr-2 mt-1" /> Activate
                                      </div>
                                    }
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>


                  </>
                ))}
              </div>

            </div>

            <div className=" border-r relative" >
              <div className="px-2 border-b mb-4">
                <SectionTitle className="section-title w-full pt-3" title="" subtitle={`${this.state.videoTitle}s`}
                  hideButton={true}
                  html={
                    <div>

                      <button
                        className="rounded px-2 font-bold py-1 btn-rounded bg-blue-200  text-blue-500  mr-2"
                        type="button"
                        onClick={() => this.changeModalStatus({
                          baseTitle: this.state.videoTitle,
                          modelTitle: this.state.videoModelTitle,
                          queryTitle: this.state.videoQueryTitle,
                          type: this.state.videoType ? this.state.videoType : 'VIDEO',
                        })}                      >
                        <i class="fas fa-plus mr-1"></i> Add New
                      </button>
                      {
                        this.state.allowQuickTest == 'YES' && <button
                          className="rounded px-2 font-bold py-1 btn-rounded bg-blue-200  text-blue-500  mr-2"
                          type="button"
                          onClick={() => this.changeModalStatus({
                            baseTitle: this.state.videoTitle,
                            modelTitle: this.state.videoModelTitle,
                            queryTitle: this.state.videoQueryTitle,
                            type: 'TEST',
                          })}                      >
                          Add Test
                        </button>
                      }
                    </div>
                  }
                />
              </div>

              <div className="mr-1 h-85 overflow-y-scroll " style={{ width: "16rem" }} id={'video'} onScroll={() => {
                let element = document.getElementById('video')

                if ((Math.round(element.scrollHeight - element.clientHeight) == Math.round(element.scrollTop)) && this.state.videos.length > this.state.filters.videos.offset) {

                  this.setState({
                    filters: {
                      ...this.state.filters,
                      videos: {
                        ...this.state.filters.videos,
                        offset: this.state.filters.videos.offset + this.state.filters.videos.limit
                      }
                    }
                  }, () => {
                    this.onScroll('videos')
                  })
                }
              }}>
                {this.state.videos && this.state.videos.map((video, i) => (
                  <>
                    <div className="flex flex-row" data-id={video.id}>
                      <div className={` items-center mb-1 mx-2  overflow-y-scroll w-5/6 sorticon  ${this.state.videoId == `${video.id}` ? 'bg-chat-selected' : ''}`} key={i} >
                        <div className="flex flex-row items-center p-1 cursor-pointer" onClick={(event) => {
                          this.setState({
                            videoId: video.id,
                            video: {},
                          }, () => {
                            this.onChangeVideo()
                          })
                        }}>
                          <img className="w-6 pl-0.5 " src={video.thumbnail} />
                          <span className="ml-1 mr-1 text-xs truncate w-full">{video.title}</span>
                          <i className="fas fa-angle-right mr-2 text-gray-400 focus:text-white text-right"></i>

                        </div>
                      </div>
                      <div className="hidden lg:flex relative" id={`video${video.id}`}>
                        <button
                          onClick={(e) => {
                            // e.preventDefault()
                            this.setState({
                              showLists: {
                                ...this.state.showLists,
                                videos: video.id
                              }
                            })
                          }}
                          className="flex items-center justify-center " >
                          <FiMoreVertical size={18} />
                        </button>
                        <div
                          className={`dropdown absolute top-0 right-0 mt-8  ${this.state.showLists.videos == video.id ? 'open' : ''}`} id="dropdown">
                          <div className="dropdown-content  bottom-start border ">
                            <div className="flex flex-row flex-wrap">
                              <div key={video.id} className="w-full">
                                <Link href={`/dashboard/videos/[id]`} as={`/dashboard/videos/${video.id}`}>
                                  <a target="_blank"
                                    className="flex items-center justify-start dropdown-item p-2 cursor-pointer"
                                    key={video.id}
                                  >
                                    <div className="ml-2">
                                      <div className="text-sm font-bold flex">
                                        <FiEye size={16} className="stroke-current text-base mr-2 mt-1" /> View</div>
                                    </div>
                                  </a>
                                </Link>
                                <div
                                  className="flex items-center justify-start dropdown-item p-2 cursor-pointer hover:bg-green-600"
                                  key={video.id}
                                  onClick={() => this.randerEditModal({
                                    id: video.id,
                                    baseTitle: this.state.videoTitle,
                                    modelTitle: this.state.videoModelTitle,
                                    queryTitle: this.state.videoQueryTitle,
                                    type: video.lacture_type,
                                  }, video)}
                                >
                                  <div className="ml-2">
                                    <div className="text-sm font-bold flex">
                                      <FiEdit size={16} className="stroke-current text-base mr-2 mt-1" /> Edit</div>
                                  </div>
                                </div>
                                <div
                                  className="flex items-center justify-start dropdown-item p-2 cursor-pointer"
                                  key={video.id}
                                  onClick={() => {
                                    this.setState({
                                      deleteModel: true,
                                      id: this.state.videoId,
                                      baseTitle: this.state.videoTitle,
                                      modelTitle: this.state.videoModelTitle,
                                      queryTitle: this.state.videoQueryTitle,
                                    })
                                  }}
                                >
                                  <div className="ml-2">
                                    <div className="text-sm font-bold flex">
                                      <FiDelete size={16} className="stroke-current text-base mr-2 mt-1" /> Delete</div>
                                  </div>
                                </div>
                                <div
                                  className="flex items-center justify-start dropdown-item p-2 cursor-pointer"
                                  key={video.id}
                                  onClick={() => this.changeStatus([video.id], !video.is_active, 'videos')}
                                >
                                  <div className="ml-2">
                                    {
                                      video.is_active == 1 &&
                                      <div className="text-sm font-bold flex">
                                        <FiToggleLeft size={16} className="stroke-current text-base mr-2 mt-1" /> Deactivate
                                      </div> ||
                                      <div className="text-sm font-bold flex">
                                        <FiToggleRight size={16} className="stroke-current text-base mr-2 mt-1" /> Activate
                                      </div>
                                    }
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>


                  </>
                ))}

              </div>
            </div>

            <div className="  pr-1 border-r-2" >
              <div className="flex items-center justify-between mb-4 mx-2">
                {/* <h5 className="font-semibold">Video</h5> */}
              </div>

              <div className="mr-1 h-90 overflow-y-scroll relative" style={{ width: "16rem" }}>

                {
                  this.state.video && <div >
                    <img className="w-full px-2" src={this.state.video.thumbnail} />

                    <div className="pb-2 flex flex-col lg:flex-row p-2">
                      <div className=" w-full font-bold ">
                        <span className="capitalized">{this.state.video.title}</span>
                      </div>

                    </div>

                    <div className="pb-2 flex flex-col lg:flex-row p-2 border-b">
                      <div className="text-xs text-gray-600 w-1/3">Language</div>
                      <div className="text-xs  w-2/3 font-bold text-right">
                        <span className="capitalized">{this.state.video.language && this.state.video.language.title}</span>
                      </div>
                    </div>
                    {this.state.video.lacture_type == 'VIDEO' || this.state.video.lacture_type == 'YOUTUBE' && <div className="pb-2 flex flex-col lg:flex-row p-2 border-b">
                      <div className="text-xs text-gray-600 w-1/3">Video ID</div>
                      <div className="text-xs  w-2/3 font-bold text-right">
                        <span className="capitalized">{this.state.video.video_id}</span>
                      </div>
                    </div>}
                    {this.state.video.lacture_type == 'LINK' && <div className="pb-2 flex flex-col lg:flex-row p-2 border-b">
                      <div className="text-xs text-gray-600 w-1/3">Video Url</div>
                      <div className="text-xs  w-2/3 font-bold text-right">
                        <span className="capitalized">{this.state.video.video_url}</span>
                      </div>
                    </div>}
                    <div className="pb-2 flex flex-col lg:flex-row p-2 border-b">
                      <div className="text-xs text-gray-600 w-1/3">Tags</div>
                      <div className="text-xs  w-2/3 font-bold text-right">
                        <span className="capitalized">{this.state.video.tags}</span>
                      </div>
                    </div>
                    <div className="pb-2 flex flex-col lg:flex-row p-2 border-b">
                      <div className="text-xs text-gray-600 w-1/3">Status</div>
                      <div className="text-xs  w-2/3 font-bold text-right">
                        <span className="capitalized">{this.state.video.status}</span>
                      </div>
                    </div>
                    <div className="pb-2 flex flex-col lg:flex-row p-2 border-b">
                      <div className="text-xs text-gray-600 w-1/3">Mode</div>
                      <div className="text-xs  w-2/3 font-bold text-right">
                        <span className="capitalized">{this.state.video.mode}</span>
                      </div>
                    </div>
                    {this.state.video.lacture_type == 'VIDEO' && <div className="pb-2 flex flex-col lg:flex-row p-2 border-b">
                      <div className="text-xs text-gray-600 w-1/3">Views</div>
                      <div className="text-xs  w-2/3 font-bold text-right">
                        <span className="capitalized">{this.state.video.views}</span>
                      </div>
                    </div>}
                    {this.props.hideHierarchy < 1 && <div className="pb-2 flex flex-col lg:flex-row p-2 border-b">
                      <div className="text-xs text-gray-600 w-full">Exams</div>
                      <div className="text-xs  w-full font-bold text-right">
                        <span className="capitalized">
                          {
                            this.state.video.exams && this.state.video.exams.map((exam, i) => {
                              return i == 0 ? exam.name : `, ${exam.name}`
                            })
                          }
                        </span>
                      </div>
                    </div>}
                    {this.props.hideHierarchy < 2 && <div className="pb-2 flex flex-col lg:flex-row p-2 border-b">
                      <div className="text-xs text-gray-600 w-1/3">Courses</div>
                      <div className="text-xs  w-2/3 font-bold text-right">
                        <span className="capitalized">
                          {
                            this.state.video.courses && this.state.video.courses.map((course, i) => {
                              return i == 0 ? course.name : `, ${course.name}`
                            })
                          }
                        </span>
                      </div>
                    </div>}
                    <div className="pb-2 flex flex-col lg:flex-row p-2 border-b">
                      <div className="text-xs text-gray-600 w-1/3">Subjects</div>
                      <div className="text-xs  w-2/3 font-bold text-right">
                        <span className="capitalized">
                          {
                            this.state.video.subjects && this.state.video.subjects.map((subject, i) => {
                              return i == 0 ? subject.name : `, ${subject.name}`
                            })
                          }
                        </span>
                      </div>
                    </div>
                    <div className="pb-2 flex flex-col lg:flex-row p-2 border-b">
                      <div className="text-xs text-gray-600 w-1/3">Chapters</div>
                      <div className="text-xs  w-2/3 font-bold text-right">
                        <span className="capitalized">
                          {
                            this.state.video.chapters && this.state.video.chapters.map((chapter, i) => {
                              return i == 0 ? chapter.name : `, ${chapter.name}`
                            })
                          }
                        </span>
                      </div>
                    </div>
                    <div className="pb-2 flex flex-col lg:flex-row p-2 border-b">
                      <div className="text-xs text-gray-600 w-1/3">Created At</div>
                      <div className="text-xs  w-2/3 font-bold text-right">
                        <span className="capitalized">{moment(this.state.video.created_at).format('DD MMM YYYY hh:mm A')}</span>
                      </div>
                    </div>

                  </div>
                }
              </div>
            </div>
          </div>

        </Widget>

        {
          (this.state.startUpload == true || (this.state.uploadPercentage > 0 && this.state.uploadPercentage < 100)) && <SliderModel color="bg-base" defaultValue={this.state.uploadPercentage} title={this.state.startUploadMessage} />
        }

        {this.state.deleteModel && <DeleteModel
          title="Delete"
          icon={
            <span className="h-10 w-10 bg-red-100 text-white flex items-center justify-center rounded-full text-lg font-display font-bold">
              <FiX size={18} className="stroke-current text-red-500" />
            </span>
          }
          body={
            <div className="text-sm text-gray-500">
              Are you sure you want to delete ?
            </div>
          }
          buttonTitle="Delete"
          buttonClassName="btn btn-default btn-rounded bg-red-500 hover:bg-red-600 text-white"
          useModel={this.state.deleteModel}
          hideModal={() => {
            this.setState({
              deleteModel: false,
              id: null
            })
          }}
          onClick={this.deleteRow}
        />
        }


      </>

    )
  }

}
