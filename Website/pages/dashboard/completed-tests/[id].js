import { Component } from 'react';
import { get } from 'helpers/apiService';
import { getUser } from 'helpers/auth';
import React from 'react'
import SectionTitle from 'components/functional-ui/section-title'
import Widget from 'components/functional-ui/widget'
import { UnderlinedTabs } from 'components/functional-ui/tabs'
import Switch from 'components/functional-ui/switch'
import define from 'src/json/worddefination.json'

//

export default class extends Component {
  state = {
    user: {},
    search: '',
    fetching: true,
    modelTitle: 'tests',
    filterObject: {
      orders: {
        limit: 10,
        offset: 0
      },
    },
    totalCount: {}
  }

  // 
  static getInitialProps({ query }) {
    return query;
  }

  // Function for fetch data
  fetchData = async (id) => {

    let result = await get(`tests/result?test_id=${id}`)
    this.setState({
      user: await getUser(),
      result: result.completeTest,
      test: result.test,
      totalQuestions: result.totalQuestions,
      showResult: result ? true : false
    }, () => {
      console.log(this.state)
    })
  }


  formatAMPM = (date) => {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
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

    const tabs = [
      {
        index: 0,
        title: 'Details',
        content: (
          <div className="py-4 w-full">

          </div>
        )
      },
    ]

    return (
      <>
        {
          this.state.result &&
          <>
            {this.state.test && <SectionTitle title="Quick Test" subtitle={`${this.state.test.title}`} hideButton={true} />}

            <Widget
              title=""
              description=''>

              <div className="flex flex-row items-center justify-start p-4">
                {
                  <div class="container mb-10 ">
                    <div class="z-depth-2 pt-3 pb-3 white-bg text-center result_title">
                      <i class="fas fa-chart-pie"></i>
                      <span className="bold text-center"> Exam Result</span>
                    </div>
                    <div class="z-depth-2 p-5 mt-4 white-bg ">
                      <div className="w-full flex  flex-row flex-wrap justify-between items-center">

                        <div className="w-full lg:w-1/2 border-r">
                          <ul className="exam_result">
                            <li >
                              <i class="fas fa-user mr-2"></i>
                              <span>Student Name : </span>
                              <span className="bold">{this.state.user && `${this.state.user.first_name} ${this.state.user.last_name}`}</span>
                            </li>
                            <li>
                              <i class="far fa-question-circle question mr-2"></i>
                              <span>Total Questions : </span>
                              <span className="bold">{this.state.totalQuestion}</span>
                            </li>
                            <li>
                              <i class="far fa-question-circle question mr-2"></i>
                              <span>Attempt Questions : </span>
                              <span className="bold">{parseInt(this.state.totalQuestion) - parseInt(this.state.result.unattept_question_count)}</span>
                            </li>
                            <li>
                              <i class="fas fa-check right_answer mr-2"></i>
                              <span>Correct Answer : </span>
                              <span className="bold">{this.state.result.right_answer_count}</span>
                            </li>
                            <li>
                              <i class="fas fa-times wrong mr-2"></i>
                              <span>Wrong Answer : </span>
                              <span className="bold">{this.state.result.wrong_answer_count}</span>
                            </li><li>
                              <i class="fas fa-trophy score mr-2"></i>
                              <span>Total Score : </span>
                              <span className="bold">{this.state.result.marks} out of {this.state.result.final_marks}</span>
                            </li>
                          </ul>

                        </div>
                        <div className="w-full lg:w-1/2 ">
                          <h4 className="bold text-center">Success Rate :</h4>
                          <h1 className="success_rate  mt-4">{this.state.result.marks}%</h1>
                        </div>

                        <div className="w-full border-top mt-4 cart_box">
                          <div className="card-on-responsive">
                            <div className="table-responsive">
                              <table className="w-full table">
                                <thead>
                                  <tr style={{ borderBottom: '1px solid rgba(0,0,0,.05)' }}>
                                    <th><b>Question</b></th>
                                    <th><b>Actual Answer</b></th>
                                    <th><b>Given Answer</b></th>
                                    <th><b>Result</b></th>
                                    <th><b>Explain</b></th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {
                                    this.state.totalQuestions &&
                                    this.state.totalQuestions.map(question => {

                                      let givenAnswer = this.state.result.answers.filter(answer => answer.question_id == question.id)

                                      if (givenAnswer && givenAnswer.length > 0) {
                                        givenAnswer = givenAnswer[0]
                                      } else {
                                        givenAnswer = null
                                      }
                                      return <tr className="mb-8">
                                        <td className="line-height-initial" data-label="Question">{question.question}</td>
                                        <td className="line-height-initial" data-label="Actual Answer">{question[question.answer]}</td>
                                        <td className="line-height-initial" data-label="Given Answer">{givenAnswer ? question[givenAnswer.answer] : <span className="badge badge-md badge-danger font-12">Not Attempted</span>}</td>
                                        <td className="line-height-initial" data-label="Result">{givenAnswer && givenAnswer.result == 1 ? <span className="font-14"><i class="fas fa-check right_answer mr-2"></i></span> : <span className="font-14"><i class="fas fa-times wrong mr-2"></i></span>}</td>
                                        <td className="line-height-initial" data-label="Explain">{question.explaination}</td>
                                      </tr>
                                    })
                                  }
                                </tbody>
                              </table>

                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>

              <div className="flex flex-wrap">
                <div className="w-full p-4">
                  {/* <UnderlinedTabs tabs={tabs} /> */}
                </div>
              </div>


            </Widget>
          </>
        }
      </>

    )
  }

}
