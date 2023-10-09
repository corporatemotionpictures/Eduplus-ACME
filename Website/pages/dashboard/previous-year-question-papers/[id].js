import { Component } from 'react';
import { fetchByID } from 'helpers/apiService';
import React from 'react'
import SectionTitle from 'components/functional-ui/section-title'
import Datatable from 'components/functional-ui/datatable'
import Shimmer from 'components/website/shimmer/datatable'
import Widget from 'components/functional-ui/widget'
import Comments from 'components/functional-ui/social-feed/comments'
import { Badge } from 'components/functional-ui/badges'
import {
  FiThumbsUp,
  FiMessageCircle,
  FiShare2
} from 'react-icons/fi'
import moment from 'moment'
import define from 'src/json/worddefination.json'

//

export default class extends Component {
  state = {
    previousYearQuestion: {},
    search: '',
    fetching: true,
    modelTitle: 'pyq-papers',
  }

  // 
  static getInitialProps({ query }) {
    return query;
  }

  // Function for fetch data
  fetchData = async (id) => {
    var data = await fetchByID(this.state.modelTitle, id, { noLog: true });
    this.setState({ data })

  }

  // 
  componentDidMount() {
    let id = this.props.id;
    if (id) {
      this.fetchData(id);
    } else {
      alert("Oh!");
    }
  }

  // 
  render() {
    const previousYearQuestion = this.state.data && this.state.data.previousYearQuestion

    return (
      <>
        {
          this.state.data && this.state.data.previousYearQuestion &&
          <>
            <SectionTitle title={define.previousYearQuestionPaper} subtitle={`${previousYearQuestion.title}`} hideButton={true} />

            <Widget
              title=""
              description=''>
              <div className="flex flex-col md:flex-row justify-start mb-4">

                <div className='sm:w-1/2 mb-4'>
                  <iframe
                    src={`${previousYearQuestion.url}`}
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen="false"
                    width='90%'
                    height="500"
                    ref={frame => this.previousYearQuestion = frame}
                    className="previousYearQuestion__iframe"
                  />

                </div>
                <div className="sm:w-1/2">
                  <div className="pb-2 items-center flex flex-row">
                    <div className="text-sm pt-1">
                      {previousYearQuestion.description}
                    </div>
                  </div>
                 
                  <div className="pb-2 items-center flex flex-row">
                    <div className="text-sm font-bold w-1/3">Tags</div>
                    <div className="text-sm pt-1 w-2/3 ">
                      <span className="capitalized">{previousYearQuestion.tags}</span>
                    </div>
                  </div>
                  <div className="pb-2 items-center flex flex-row">
                    <div className="text-sm font-bold w-1/3">Status</div>
                    <div className="text-sm pt-1 w-2/3 ">
                      <span className="capitalized">{previousYearQuestion.status}</span>
                    </div>
                  </div>
                  <div className="pb-2 items-center flex flex-row">
                    <div className="text-sm font-bold w-1/3">Mode</div>
                    <div className="text-sm pt-1 w-2/3">
                      {previousYearQuestion.mode}
                    </div>
                  </div>
                  {process.env.NEXT_PUBLIC_HIDE_HIERARCHY < 1 && <div className="pb-2 items-center flex flex-row">
                    <div className="text-sm font-bold w-1/3">Exams</div>
                    <div className="text-sm pt-1 w-2/3">
                      <div className="flex flex-wrap justify-start items-start" >
                        {previousYearQuestion.exams && previousYearQuestion.exams.map((item) => {
                          return <Badge key={item.id} size='sm' color="bg-blue-200 text-blue-600 mr-2 mb-2" rounded>
                            {item.name}
                          </Badge>
                        })}
                      </div>
                    </div>
                  </div>}
                  {/* <div className="pb-2 items-center flex flex-row">
                    <div className="text-sm font-bold w-1/3">languages</div>
                    <div className="text-sm pt-1 w-2/3">
                      <div className="flex flex-wrap justify-start items-start" >
                        {previousYearQuestion.languages && previousYearQuestion.languages.map((item) => {
                          return <Badge key={item.id} size='sm' color="bg-blue-200 text-blue-600 mr-2 mb-2" rounded>
                            {item.title}
                          </Badge>
                        })}
                      </div>
                    </div>
                  </div> */}
                  <div className="pb-2 items-center flex flex-row">
                    <div className="text-sm font-bold w-1/3">Courses</div>
                    <div className="text-sm pt-1 w-2/3">
                      <div className="flex flex-wrap justify-start items-start" >
                        {previousYearQuestion.courses && previousYearQuestion.courses.map((item) => {
                          return <Badge key={item.id} size='sm' color="bg-blue-200 text-blue-600 mr-2 mb-2" rounded>
                            {item.name}
                          </Badge>
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="pb-2 items-center flex flex-row">
                    <div className="text-sm font-bold w-1/3">Subjects</div>
                    <div className="text-sm pt-1 w-2/3">
                      <div className="flex flex-wrap justify-start items-start" >
                        {previousYearQuestion.subjects && previousYearQuestion.subjects.map((item) => {
                          return <Badge key={item.id} size='sm' color="bg-blue-200 text-blue-600 mr-2 mb-2" rounded>
                            {item.name}
                          </Badge>
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="pb-2 items-center flex flex-row">
                    <div className="text-sm font-bold w-1/3">Chapters</div>
                    <div className="text-sm pt-1 w-2/3">
                      <div className="flex flex-wrap justify-start items-start" >
                        {previousYearQuestion.chapters && previousYearQuestion.chapters.map((item) => {
                          return <Badge key={item.id} size='sm' color="bg-blue-200 text-blue-600 mr-2 mb-2" rounded>
                            {item.name}
                          </Badge>
                        })}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </Widget>
          </>
        }
      </>

    )
  }

}
