import Link from "next/link";
import React from 'react';
import { get, fetchByID, fetchAll, add, post } from 'helpers/apiService';
import { UnderlinedTabs } from 'components/functional-ui/tabs';
import { Component } from 'react';
import moment from 'moment';
import toastr from 'toastr';
import ScrollableFeed from 'react-scrollable-feed'
import { Document, Page, pdfjs } from "react-pdf";

import define from 'src/json/worddefination.json'

export default class extends Component {
  state = {
    document: {},
    previousYearQuestions: {},
    url: null,
    autoplay: false,
    wishListed: false,
    liked: false,
    loader: true,
    numPages: null,
    scale: 1.0,
    documentID: null
  }


  // 
  static getInitialProps({ query }) {
    console.log(query)
    return query;
  }


  // Function for fetch data
  fetchData = async (id) => {

    let dataSlug = this.props.chapterslug.split('-')

    let subjectID = dataSlug[0]
    let chapterID = dataSlug[1]

    data = await fetchByID(`chapters`, chapterID)
    let chapter = data.chapter ? data.chapter : null

    data = await fetchByID(`subjects`, subjectID)
    let subject = data.subject ? data.subject : null

    this.setState({
      loader: true
    })
    // this.setState({ video: null })
    let data = await get(`products/slug?slug=${this.props.productslug}`)
    let productid = data.product ? data.product.id : null

    let product = data.product

    let filters = { productID: productid }

    var document = await fetchByID('pyq-papers', id, filters)

    console.log(chapter.id)

    // this.setState({ video: null })
    let previousYearQuestions = await fetchAll('pyq-papers', { chapterID: chapter.id, offLimit: true, productID: productid })
    previousYearQuestions = previousYearQuestions.previousYearQuestions ? previousYearQuestions.previousYearQuestions : []

    let url = null
    if (document.previousYearQuestion) {
      url = document.previousYearQuestion.url
    }

    console.log(previousYearQuestions)

    this.setState({
      loader: false,
      document: document.previousYearQuestion,
      previousYearQuestions: previousYearQuestions,
      chapter: chapter,
      url: url,
      product: product,
      subject: subject,
    }, () => this.setState({
      // muted: false
    }))

  }
  onDocumentLoadSuccess = ({ numPages }) => {

    this.setState({
      numPages: numPages
    })
  }

  // 
  componentDidMount() {
    let id = this.props.slug;
    if (id) {
      this.fetchData(id);
    } else {
      alert("Oh!");
    }

    this.setState({ documentID: this.props.slug })
  }


  render() {
    const tabs = [
      {
        index: 0,
        title: 'Study Materials',
        content: (
          <div id="curricularm">
            <div className="curriculum-text-box">
              <div className="curriculum-section">
                <div className="panel-group accordion" id="accordion" >
                  {
                    this.state.chapter &&
                    <div className="panel panel-default">

                      <h5 className="panel-title click  mt-4 " data-toggle="collapse" data-parent={`#accordion`} href={`#collapsecourse${this.state.chapter.id}`} className="" aria-expanded="true">
                        <a >
                          {this.state.chapter.name}
                        </a>
                      </h5>

                      <ul id={`collapsecourse${this.state.chapter.id}`} className={`panel-collapse collapse in  mt-4 show`}>
                        {console.log(this.state.previousYearQuestions && this.state.previousYearQuestions.length > 0)}
                        {this.state.previousYearQuestions && this.state.previousYearQuestions.length > 0 && this.state.previousYearQuestions.map((document, index) => {

                          return <li className={this.props.slug == document.id ? 'selected-list' : ''}>
                            <div className="panel-heading bg-white pt-1" onClick={() => { this.fetchData(document.id) }}>
                              <p className="panel-title click playlist mb-1" >
                                <Link href={`/web-app/dashboard/${this.props.productslug}/${this.props.chapterslug}/documents/${document.id}`} >
                                  <a className="row">

                                    <div className="col-2 pl-4">
                                      <h5><i class="fa fa-file-alt"></i></h5>
                                    </div>
                                    <div className="col-10 p-0">
                                      <b>{document.title}</b>
                                      <br />
                                    </div>
                                  </a>
                                </Link>
                              </p>

                            </div>

                          </li>
                        })}
                      </ul>
                    </div>

                  } </div>

              </div>
            </div>
          </div>

        )
      },
    ];

    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
    return (


      <>

        <div className="webbgdashboard mt-4">
          <div className=" container">
            <div className=" row pr-3">
              <div className="col-md-9">

                {this.state.document && <div className="border-bottom">
                  <div className="  pr-5">
                    <h3 className="font-bold">{this.state.document.title}</h3>
                    <p className="cart_btn">{this.state.product && this.state.product.name} / {this.state.subject && this.state.subject.name} / <span className="font-bold font-blue">{this.state.chapter && this.state.chapter.name}</span> </p>

                    <p className="m-3">{this.state.document.description}</p>
                    <div className=" d-flex mb-1">
                      <div className="value-button bg-white text-danger border px-3 py-1" onClick={(e) => {

                        this.setState({
                          scale: this.state.scale - 0.5
                        })
                      }}><h5><b>-</b></h5>
                      </div>
                      <div className="value-button bg-white text-danger border px-3 py-1" onClick={(e) => {
                        this.setState({
                          scale: this.state.scale + 0.5
                        })
                      }}><h5><b>+</b></h5>
                      </div>
                    </div>
                  </div>

                </div>}

                {
                  this.state.document && !this.state.loader && <div className="player-wrapper h-100-vh border-right border-left" id="custom-scroll">
                    <Document file={this.state.url} onContextMenu={(e) => e.preventDefault()} onLoadSuccess={this.onDocumentLoadSuccess.bind(this)} className="pdf-container w-100 h-100 overflow-auto">
                      {/* <Page pageNumber={1} /> */}


                      {Array.from(new Array(this.state.numPages), (el, index) => (
                        <Page key={`page_${index + 1}`} pageNumber={index + 1} scale={this.state.scale} />
                      ))}
                    </Document>
                    {/* <iframe
                  src={this.state.url + "#toolbar=0"}
                  type="application/pdf"
                  height={100}
                  width={100}
                  className="w-100 h-100 pdf-container"
                  onContextMenu={(e) => e.preventDefault()}
                /> */}

                    {/* <iframe id="videoFrame" src={this.state.url} preload="none" controlsList="nodownload" className="w-100 h-100" height="" /> */}
                    <div className="row">
                      <div className="col-8">
                        <h3 className="m-3">{this.state.document.title}</h3>
                      </div>
                    </div>
                  </div>
                }

                {
                  this.state.loader && <div className="top-0 left-0 right-0 bottom-0  h-screen z-2000 overflow-hidden opacity-100 flex items-center justify-center bg-white">
                    <img src="/images/loader.gif" />
                  </div>
                }

              </div><div className="col-md-3 pl-0">
                <UnderlinedTabs tabs={tabs} />
              </div>
            </div>
          </div>
        </div>

      </>

    )
  }
}