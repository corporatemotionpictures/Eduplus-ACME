import { Component } from 'react';
import { get, deleteData, updateAdditional, add, edit } from 'helpers/apiService';
import React from 'react'
import define from 'src/json/worddefination.json'
import * as Section from 'components/website/sections/first'
import Link from "next/link";
import Head from 'next/head'
//

export default class extends Component {
  state = {
    pageSections: [],
  }

  static getInitialProps({ query }) {
    return query;
  }

  // Function for fetch data
  fetchList = async (slug) => {
    let pageDetail = await get('pages/getBySlug', { slug: `${slug}` })
    this.setState({
      page: pageDetail.page,
      pageSections: pageDetail.page.sections
    }, () => {
      Section.asignDefaultvalue(pageDetail.page.sections)
    }, () => {
      this.setState({ fetching: false })
    })

  }

  // 
  componentDidMount() {

    let slug = this.props.landingPage
    this.fetchList(slug);

  }

  // 
  render() {

    return (
      <>
        <Head>
          {this.state.page && this.state.page.title && <title>{window.localStorage.getItem('baseTitle')} - {this.state.page.title}</title>}
          {this.state.page && this.state.page.title && <meta name="title" content={this.state.page.title} />}
          {this.state.page && this.state.page.title && <meta name="title" content={this.state.page.title} />}
          {this.state.page && this.state.page.keyword && <meta name="keywords" content={this.state.page.keyword} />}
          {this.state.page && this.state.page.description && <meta name="description" content={this.state.page.description} />}
          {this.state.page && this.state.page.description && <meta property="og:description" content={this.state.page.description} />}
          {this.state.page && this.state.page.image && <meta property="og:image" content={this.state.page.image} />}
        </Head>
        <div className="defult-home">
          <div className="main-content">

            <div className="root-section">
              <div className="rs-breadcrumbs breadcrumbs-overlay">
                <div className="breadcrumbs-img">
                  <img src="/website/assets/images/breadcrumbs/2.jpg" alt={window.localStorage.getItem('defaultImageAlt')} />
                </div>
                <div className="breadcrumbs-text white-color">
                  <h1 className="page-title">{this.state.page && this.state.page.title}</h1>
                  <ul>
                    <li>
                      <Link href="/">
                        <a className="active">Home</a>
                      </Link>
                    </li>
                    <li>{this.state.page && this.state.page.title}</li>
                  </ul>
                </div>
              </div>

              {this.state.pageSections && this.state.pageSections.map((preSection, i) => {
                let Import = Section[preSection.section.url]

                return <Import editable="false" sectionID={`${preSection.section_id}`} position={`${preSection.position}`} />
              })}
            </div>

          </div>

        </div>

      </>

    )
  }

}
