import Link from "next/link";
import React, { useState, useEffect } from 'react';
import { fetchAll, updateAdditional, getSettings } from 'helpers/apiService';
import Filter from 'components/classical-ui/filters';
import AppStoreFooter from "components/website/AppStoreFooter";

import define from 'src/json/worddefination.json'
import ProductsShimmer from "../../components/website/shimmer/products-shimmer";

export default function blogs({ filterable = false, divClass = '', preFilter = { limit: 10, offset: 0 } }) {

  const [blogs, setBlogs] = useState({})
  const [filters, setFilters] = useState(preFilter)
  const [first, setFirst] = useState(true)
  const [firstAttr, setFirstAttr] = useState(true)
  const [totalIndex, setTotalIndex] = useState(0)
  const [loaded, setloaded] = useState(false)
  const [hideHierarchy, setHierarchy] = useState(0)
  const [filterRender, setFilterRender] = useState(false)

  // Call first time when component rander
  useEffect(() => {

    async function getInnerdata() {
      if (first == true) {

        var blogList = await fetchAll('blogs', filters)
        setBlogs(blogList.blogs)
        setloaded(blogList.success)

        var data = await getSettings('hide_hierarchy')
        setHierarchy(data)
        setFilterRender(true)

        let countFilter = {
          ...filters
        }
        delete countFilter.offset
        delete countFilter.limit


        let totalIndex = (parseInt(blogList.totalCount) % filters.limit == 0) ? (parseInt(blogList.totalCount) / filters.limit) : parseInt(parseInt(blogList.totalCount) / filters.limit) + 1
        setTotalIndex(totalIndex)
        setloaded(true)
      }
    }

    getInnerdata()
    setFirst(false)
    return
  }, [first])

  // Search data
  function onFilter(filterData) {
    setFilters({
      ...filters,
      ...filterData
    })

    setFirst(true)
  }


  const filterObjects = [
    hideHierarchy >= 1 ? { type : 'blank'} : {
      label: 'exams',
      name: 'examID',
      idSelector: 'id',
      view: 'name',
      type: 'select-multiple',
      effectedRows: ['courseID', 'subjectID'],
      className: "lg:w-1/3 filter_size"
    },
    hideHierarchy >= 2 ? { type : 'blank'} : {
      label: 'courses',
      name: 'courseID',
      idSelector: 'id',
      view: 'name',
      type: 'select-multiple',
      effectedRows: ['subjectID'],
      className: "lg:w-1/3 filter_size"
    },
    {
      label: 'subjects',
      name: 'subjectID',
      idSelector: 'id',
      view: 'name',
      type: 'select-multiple',
      effectedRows: [],
      className: "lg:w-1/3 filter_size"
    },
  ]


  return (
    <>
      <header className="header_inner courses_page">

        <div className="intro_wrapper blogs_head">
          <div className="container">
            <div className="row">
              <div className="col-sm-12 col-md-8 col-lg-8">
                <div className="intro_text">
                  <h1>Blogs</h1>
                  <span>
                  <Link href="/">
                    <a title="Get Started Now" className="">Home </a>
                    </Link>
                  </span>
                  <span> /  </span>
                  <span>Blogs</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </header>
      {/* Blog Content starts */}
      <section className="latest_news_2" id="latest_news_style_2">
        <div className="container">
          <div className="row">
            <div className="col-12">
              {filterRender && (<Filter filterObjects={filterObjects} onFilter={onFilter} showFilter={true} filterOnChange={true} />)
              ||
              <>
              { <div className="display mb-5">
                <div className="comment animateShimmer md-w-33 p-4 mr-2"></div>
                <div className="comment animateShimmer md-w-33 p-4 mr-2"></div>
                <div className="comment animateShimmer md-w-33 p-4"></div>
              </div>}</>}
              <hr className="row mb-5 " />
            </div>
            {
              blogs && blogs.length > 0 &&
              blogs.map(blog => {
                return (
                  <div className="col-12 col-sm-6 col-md-4 col-lg-4 mb-5">
                    <div className="single_item">
                      <div className="item_wrapper">
                        <div className="blog-img">
                          <Link href="/blogs/[id]" as={`/blogs/${blog.slug}`}>
                            <a title="">
                              <img src={blog.image} alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid img_h" />
                            </a>
                          </Link>
                        </div>
                        <h3>
                          <Link href="/blogs/[id]" as={`/blogs/${blog.slug}`}>
                            <a title="">{blog.title}</a>
                          </Link>
                        </h3>
                      </div>
                      <div className="blog_title">
                        <ul className="post_bloger">
                          <li><i className="fas fa-user"></i>{blog.created_user}</li>
                          <li><i className="fas fa-comment"></i>{blog.comments} Comments</li>
                          <li><i className="fas fa-thumbs-up"></i> {blog.views} Views</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )
              })
              ||
              ( !loaded && 
                <ProductsShimmer /> )
              }
              {
                loaded && blogs && blogs.length <= 0 && <div className="col-12 text-center ">
                <img className="col-12 data-img" src="/images/search.png"></img>
                <h5 className="font-weight-bold">No Data Available</h5>
                <p className="mt-1">There is no data to show you right now.</p>
                </div>
              
            
            }
            <div className="pagination_blog">
              <ul>
                

                {
                  Array.from({ length: totalIndex }, (_, index) => index + 1).map(
                    i => {
                      return <li className={(filters.offset / filters.limit) == (i - 1) ? 'text-white active' : 'bg-not'} onClick={() => {
                        setFilters({
                          ...filters,
                          offset: (i - 1) * filters.limit
                        })
                        setFirst(true)
                      }}>
                        <a >{i}</a>
                      </li>
                    }
                  )
                }
                {/* <li>
  <Link href="/">
    <a className=""><i className='flaticon-right-arrow'></i></a>
  </Link>
</li> */}
              </ul>
            </div>
          </div>
        </div>
        <div className="container">
        <AppStoreFooter />
        </div>

      
      </section>
      {/* Blog Content ends */}
    </>
  )
}