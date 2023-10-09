import Link from "next/link";
import React from 'react';
import { get, fetchByID, fetchAll, add, post } from 'helpers/apiService';
import { getUser } from 'helpers/auth';
import { UnderlinedTabs } from 'components/functional-ui/tabs';
import { Component } from 'react';
import ConfirmationModel from 'components/functional-ui/modals/modal-confirmation'
import { FiCheck } from 'react-icons/fi'
import moment from 'moment';
import toastr from 'toastr';
import ScrollableFeed from 'react-scrollable-feed'
import define from 'src/json/worddefination.json'

export default class extends Component {
  state = {
    video: {},
    url: null,
    autoplay: false,
    wishListed: false,
    liked: false,
    loader: true,
    videoID: null,
    startExam: null,
    currentQuestionNumber: 0,
    currentQuestion: {},
    currentValue: null,
    isCorrect: null,
    showAnswer: null,
    totalQuestion: null,
    resultData: [],
    openConfirmationModal: false
  }


  // 
  static getInitialProps({ query }) {
    return query;
  }

  // Function for fetch data
  fetchData = async (id) => {

    this.setState({
      loader: true,

    })


    let dataSlug = this.props.chapterslug.split('-')

    let subjectID = dataSlug[0]
    let chapterID = dataSlug[1]

    data = await fetchByID(`chapters`, chapterID)
    let chapter = data.chapter ? data.chapter : null

    data = await fetchByID(`subjects`, subjectID)
    let subject = data.subject ? data.subject : null

    // this.setState({ video: null })
    let data = await get(`products/slug?slug=${this.props.productslug}`)
    let productid = data.product ? data.product.id : null

    let product = data.product

    let filters = { productID: productid }

    var video = await fetchByID('videos', id, filters)



    if (video.video) {
      let result = await get(`tests/result?test_id=${id}`)
      result = result.success == true ? result.completeTest : null

      this.setState({
        user: await getUser(),
        result: result,
        showResult: result ? true : false
      })
    }

    this.setState({
      loader: false,
      video: video.video,
      chapter: chapter,
      subject: subject,
      product: product,

    }, () => {



      this.setState({
        viewed: false,
        totalQuestion: video.video.questions ? video.video.questions.length : 0
      }, () => {


      })
    })

    // Agree Button
    var text = document.getElementById("agreeButton");
    if (text) {
      text.disabled = true;
    }
  }

  onAgree = () => {
    // Get the checkbox
    var checkBox = document.getElementById("agree");
    // Get the output text
    var text = document.getElementById("agreeButton");

    if (checkBox.checked == true) {
      text.disabled = false;
      text.style.opacity = 1;

    } else {
      text.disabled = true;
      text.style.opacity = 0.5;
    }
  }

  applyAnswer = () => {
    // Get the checkbox
    var value = document.querySelector('input[name="answer"]:checked').value;

    // Get the output text
    var text = document.getElementById("applyButton");

    if (value) {
      text.disabled = false;
      text.style.opacity = 1;

      this.setState({
        currentValue: {
          [`${this.state.currentQuestion.id}`]: value
        }
      })
    } else {
      text.disabled = true;
      text.style.opacity = 0.5;
    }
  }

  submit = () => {


    let value = this.state.currentValue[this.state.currentQuestion.id]

    let resultData = this.state.resultData
    let data = resultData.filter(data => data.question_id == this.state.currentQuestion.id)

    if (data.length == 0) {
      resultData.push({
        question_id: this.state.currentQuestion.id,
        answer: value
      })
    } else {
      resultData.map(data => {
        if (data.question_id == this.state.currentQuestion.id) {
          data.answer = value
        }
      })
    }

    document.querySelector(`input[name="answer"][value=${value}]`).parentElement.classList.add('backgroud_danger');
    document.querySelector(`input[name="answer"][value=${this.state.currentQuestion.answer}]`).parentElement.classList.add('backgroud_success');

    this.setState({
      resultData: resultData,
      isCorrect: this.state.currentQuestion.answer,
      showAnswer: true
    })
    console.log(resultData)
  }

  startExam = () => {
    this.checkQuestion()

    this.setState({
      startExam: true
    }, () => {
      document.querySelector("#examContainer").requestFullscreen({ navigationUI: "hide" })
        .then(function () {
        })
        .catch(function (error) {
        });
    })
  }

  checkQuestion = () => {

    let questionNumber = this.state.currentQuestionNumber

    if (this.state.video.questions) {
      let questions = this.state.video.questions

      let question = questions[questionNumber]
      this.setState({
        currentQuestion: question,
        showAnswer: false
      }, () => {

        let qsn = this.state.resultData.filter(data => data.question_id == this.state.currentQuestion.id)

        let element = document.querySelectorAll(`input[name="answer"]`);

        for (let i = 0; i < element.length; i++) {
          element[i].parentElement.classList.remove('backgroud_danger');
          element[i].parentElement.classList.remove('backgroud_success');
        }


        if (qsn && qsn.length > 0) {
          let ans = qsn[0].answer
          if (ans && document.querySelector(`input[name="answer"][value=${ans}]`)) {
            document.querySelector(`input[name="answer"][value=${ans}]`).checked = true;

            document.querySelector(`input[name="answer"][value=${ans}]`).parentElement.classList.add('backgroud_danger');
            document.querySelector(`input[name="answer"][value=${question.answer}]`).parentElement.classList.add('backgroud_success');
          }

        }
      })
    }
  }


  submitExam = async () => {


    console.log('submit')

    let data = this.state.resultData


    data = {
      test_id: this.state.videoID,
      answers: data
    }

    data = await post('tests/submit-exam', data)


    // check Response
    if (data.success == true) {

      toastr.success('Test Completed Successfully')

      this.setState({
        openConfirmationModal: false,
        showResult: true,
        result: data.completeTest,
      })
    }
    else {
      let error;
      if (data.data) {
        error = data.data.error
      }
      else if (data.error.details) {
        error = data.error.details[0].message
      } else if (data.error) {
        error = data.error
      }
      toastr.error(error)
    }

  }

  // 
  componentDidMount() {
    let id = this.props.slug;
    if (id) {
      this.fetchData(id);
    } else {
      alert("Oh!");
    }

    this.setState({ videoID: this.props.slug })
  }


  render() {

    return (
      <>
        <div className="webbgdashboard">
          <div className=" container">
            <div className="row quickTest">

              {
                this.state.openConfirmationModal &&
                <ConfirmationModel
                  title="Confirm"
                  icon={
                    <span className="h-10 w-10 bg-green-100 text-white flex items-center justify-center rounded-full text-lg font-display font-bold">
                      <FiCheck size={18} className="stroke-current text-green-500" />
                    </span>
                  }
                  body={
                    <div className="text-sm text-gray-500">
                      Are you sure you want to submit exam ?
                    </div>
                  }
                  buttonTitle="Submit"
                  buttonClassName="btn btn-default btn-rounded bg-green-500 hover:bg-green-600 text-white"
                  useModel={this.state.openConfirmationModal}
                  hideModal={() => {
                    document.querySelector("#examContainer").requestFullscreen({ navigationUI: "hide" })
                      .then(function () {
                      })
                      .catch(function (error) {
                      });
                    this.setState({ openConfirmationModal: false })
                  }}
                  onClick={this.submitExam}
                />
              }

              {
                !this.state.startExam && !this.state.showResult && <div class="container  white-bg mt-20 mb-10 " id="container">
                  <div>
                    <h4 className="mb-3 bold">Terms and Instructions</h4>
                  </div>

                  <div className="instructions">


                    <h5 className="mb-2"> Please carefully read and agree to the below :</h5>

                    <ul >
                      <li>It is NOT advisable to attempt coding problems from a mobile phone.
                        Use a laptop or desktop instead.</li>
                      <li>Please ensure to load the test in the latest version of
                        Google Chrome browser (above version 60) or latest version of Firefox.</li>
                      <li>Please ensure third party cookies are enabled.</li>
                      <li>The system should have uninterrupted internet connectivity
                        with an download and upload speed of atleast 2 Mbps and 2 Mbps respectively.</li>
                      <li>Please ensure that your system clock is set to (GMT +5:30) Mumbai, Kolkata, Chennai, New Delhi timezone.</li>
                      <li>No tab switches are allowed during the test. It may result in
                        premature submission of the test.</li>
                      <li>Any notifications or Pop-ups during the test will be counted as
                        tab switches and may result in pre-mature closure of your test.
                        Please ensure that its turned off.</li>
                      <li>Some Anti-virus software will prevent you from login and from taking the test.
                        In such cases disable the anti-virus and try.</li>
                      <li>Instructions to Enable Microphone &amp; Camera:</li>
                    </ul>

                    <div class="checkbox">
                      <label class="mt-3">
                        <input type="checkbox" id="agree" value="1" name="agree" id="agree" className="mr-1" onClick={this.onAgree} />
                        I have read and understand the examination conduct requirements for this exam.
                      </label>
                    </div>

                    <button className="mt-3 mr-2 submit_button bold" type="submit" value="Submit" id="agreeButton" style={{ opacity: "0.5" }}
                      onClick={() => {
                        this.startExam()
                      }}> Agree </button>
                    <button className="mt-3 mr-2 close_button bold" type="close" value="close" onClick={() => {
                      // agree()
                    }}> Close </button>
                  </div>

                </div>
              }

              <div id="examContainer" className="bg-white">
                {
                  this.state.startExam && !this.state.showResult && <div class="container z-depth-2 mt-20">
                    <h2 className="mb-4 ">Questions: </h2>
                    {
                      this.state.currentQuestion && <div className="que_title">
                        <h5>Question {this.state.currentQuestionNumber + 1} : </h5>
                        <h6 className="mt-1 mb-1">{this.state.currentQuestion.question}</h6>

                        <div class="radio">
                          <label class={``}><input type="radio" id="1" value={'option1'} className="mr-1 my-2 mx-2 border-radius" name="answer" onClick={this.applyAnswer} />
                            {this.state.currentQuestion.option1}
                          </label>
                        </div>
                        <div class="radio">
                          <label class={``}><input type="radio" id="2" value={'option2'} className="mr-1 my-2 mx-2 border-radius" name="answer" onClick={this.applyAnswer} />
                            {this.state.currentQuestion.option2}
                          </label>
                        </div>
                        <div class="radio">
                          <label class={``}><input type="radio" id="3" value={'option3'} className="mr-1 my-2 mx-2 border-radius" name="answer" onClick={this.applyAnswer} />
                            {this.state.currentQuestion.option3}
                          </label>
                        </div>
                        <div class="radio">
                          <label class={``}><input type="radio" id="4" value={'option4'} className="mr-1 my-2 mx-2 border-radius" name="answer" onClick={this.applyAnswer} />
                            {this.state.currentQuestion.option4}
                          </label>
                        </div>
                        {
                          this.state.currentQuestion.explaination != '' && this.state.showAnswer == true && <div className="mt-2 border p-2">
                            <h6>Explain : {this.state.currentQuestion.explaination}</h6>
                          </div>
                        }
                        <button className="mt-3 mr-2 submit_button" type="submit" value="Submit" id="applyButton" onClick={() => {
                          this.submit()
                        }}> Submit</button>
                      </div>
                    }
                    <div className="">

                      {
                        this.state.currentQuestionNumber > 0 && <button className="mt-3 mr-2 next_button" type="submit" value="Submit"
                          onClick={() => {
                            this.setState({
                              currentQuestionNumber: this.state.currentQuestionNumber - 1
                            }, () => {
                              if (document.querySelector('input[name="answer"]:checked')) {
                                document.querySelector('input[name="answer"]:checked').checked = false
                              }
                              this.checkQuestion()
                            })
                          }}
                        > Previous question</button>
                      }

                      {
                        (this.state.currentQuestionNumber + 1) < this.state.totalQuestion && <button className="mt-3 next_button" type="submit" value="Submit" onClick={() => {
                          this.setState({
                            currentQuestionNumber: this.state.currentQuestionNumber + 1
                          }, () => {
                            this.checkQuestion()
                            if (document.querySelector('input[name="answer"]:checked')) {
                              document.querySelector('input[name="answer"]:checked').checked = false
                            }
                          })
                        }} > Next question</button>
                      }

                      {(this.state.currentQuestionNumber + 1) == this.state.totalQuestion && <button className="mt-3 next_button" type="submit" value="Submit" onClick={() => {
                        document.exitFullscreen()
                          .then(function () {
                          })
                          .catch(function (error) {
                            console.log(error.message);
                          });

                        this.setState({
                          openConfirmationModal: true
                        })
                      }} > Submit Exam</button>}

                    </div>
                  </div>
                }
              </div>

              {
                this.state.showResult && <div class="container  mt-20 mb-10 ">
                  <div class="z-depth-2 pt-3 pb-3 white-bg text-center result_title">
                    <i class="fas fa-chart-pie"></i>
                    <span className="bold text-center"> Exam Result</span>
                  </div>
                  <div class="z-depth-2 p-5 mt-4 white-bg ">
                    <div className="row">

                      <div className="col-12 col-lg-6 border-r">
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
                      <div className="col-12 col-lg-6 ">
                        <h4 className="bold ">Success Rate :</h4>
                        <h1 className="success_rate  mt-4">{this.state.result.marks}%</h1>
                      </div>

                      <div className="col-12 col-lg-12 border-top mt-4 cart_box">
                        <div className="card-on-responsive">
                          <div className="table-responsive">
                            <table className="table table-striped">
                              <thead>
                                <tr>
                                  <th><b>Question</b></th>
                                  <th><b>Actual Answer</b></th>
                                  <th><b>Given Answer</b></th>
                                  <th><b>Result</b></th>
                                  <th><b>Explain</b></th>
                                </tr>
                              </thead>
                              <tbody>
                                {
                                  this.state.video && this.state.video.questions &&
                                  this.state.video.questions.map(question => {

                                    let givenAnswer = this.state.result.answers.filter(answer => answer.question_id == question.id)

                                    if (givenAnswer && givenAnswer.length > 0) {
                                      givenAnswer = givenAnswer[0]
                                    } else {
                                      givenAnswer = null
                                    }
                                    return <tr className="tr_mb">
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

              {
                !this.state.video &&
                <div className="empty_box">
                  <h2 className="text-center"><i className="fa fa-cart-plus"></i></h2>
                  <h5 className="text-center"> <b className="font-saffron"><b></b></b>Video Not found</h5>
                </div>
              }
            </div>
          </div>
        </div>
      </>
    )
  }
}