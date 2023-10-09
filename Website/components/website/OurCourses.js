import Link from "next/link";
import React, { useState, useEffect } from 'react';
import { fetchAll, updateAdditional,getSettings } from 'helpers/apiService';
import Filter from 'components/classical-ui/filters'


import define from 'src/json/worddefination.json'
import ProductsShimmer from "./shimmer/products-shimmer";

export default function OurCourses({ filterable = false, divClass = '', preFilter = { limit: 10, offset: 0 } }) {

  const [filters, setFilters] = useState(preFilter)
  const [products, setProducts] = useState({})
  const [productTypes, setProductTypes] = useState({})
  const [packageTypes, setPackageTypes] = useState({})
  const [attributes, setAttributes] = useState({})
  const [first, setFirst] = useState(true)
  const [viewFilterBox, setviewFilterBox] = useState(false)
  const [firstAttr, setFirstAttr] = useState(true)
  const [totalIndex, setTotalIndex] = useState(0)
  const [loaded, setloaded] = useState(false)
  const [hideHierarchy, setHierarchy] = useState(0)
  const [filterRender, setFilterRender] = useState(false)

  // Call first time when component rander
  useEffect(() => {
    async function getInnerdata() {
      if (first == true) {

        filters.listOnly = false
        var productList = await fetchAll('products', filters)
        setProducts(productList.products)
        setloaded(productList.success)

        var data = await getSettings('hide_hierarchy')
        setHierarchy(data)
        setFilterRender(true)
        

        


        let totalIndex = (parseInt(productList.totalCount) % filters.limit == 0) ? (parseInt(productList.totalCount) / filters.limit) : parseInt(parseInt(productList.totalCount) / filters.limit) + 1
        setTotalIndex(totalIndex)

        if (firstAttr == true && filterable == true) {

          var productTypes = await fetchAll('product-types')
          setProductTypes(productTypes.productTypes)

          var packageTypes = await fetchAll('package-types')
          setPackageTypes(packageTypes.packageTypes)

          var attributes = await fetchAll('attributes', { forFilter: true })
          setAttributes(attributes.attributes)
        }
        setviewFilterBox(false)
        setloaded(true)
      }
    }

    getInnerdata()

    setFirstAttr(false)

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

  // Search data
  function onChange(filterData) {
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


    <section className="popular_courses our_courses">

      <div className="container">
        <div className="row">
          {filterable == true && <div className="col-sm-3 section-preview ">
             <div className="border_info p-3">
            {<h5 className="mb-md-0  mb-lg-2 mt-0 color-inherit">Filters
              <span className="d-sm-none  float-right text-primary" onClick={() => {
                setviewFilterBox(true)
              }}><small>More <i class="fas fa-angle-double-right"></i></small></span>
            </h5>}


            <section className="mb-1">

              <div className="md-form md-outline mt-0 d-flex justify-content-between align-items-center">
                <input type="text" id="search12" className="form-control mb-0" placeholder="Search..." onChange={(e) => {
                  setFilters({
                    ...filters,
                    search: e.target.value
                  })

                  setFirst(true)

                }} />
              </div>

            </section>
            </div>
            {<div className={`filter-products-parent ${(viewFilterBox || (screen.width > 767)) ? 'd-block' : 'd-none'}`}>
              <div className="filter-products">
                <div className="sm-close-div d-none float-right cursor-pointer w-100 text-right mb-4" onClick={() => {
                  setviewFilterBox(false)
                }}>
                  <p>Close</p>
                </div>
                <div className="border_info">
                <p className="mb-2 mt-3"><b>Product Type</b></p>
                <hr className="rows " />
                <div className="flex-filter font-normal">

                  <div className="form-check mb-2 mb-md-1 ">
                    <input type="radio" value='allproductType' className="form-check-input pr-2 rounded mt-0" name="productType" checked={filters && filters.productType && filters.productType == 'all'} id='all' onChange={(e) => {

                      if (e.target.checked == true) {
                        delete filters.productType
                        setFilters({
                          ...filters
                        })
                      }
                      setFirst(true)

                      onChange('all')

                    }} />
                    <label className="form-check-label text-capitalized card-link-secondary" for='allproductType'>All</label>
                  </div>

                  {

                    productTypes && productTypes.length > 0 && productTypes.map(type => {
                      return <div className="form-check mb-2 mb-md-1 ">
                        <input type="checkbox" value={type.id} className="form-check-input pr-2 rounded mt-0" checked={filters && filters.productType && filters.productType == type.id} name="productType" id={`producttype${type.id}`} onChange={(e) => {

                          if (e.target.checked == true) {
                            setFilters({
                              ...filters,
                              productType: type.id
                            })
                          } else {
                            delete filters.productType
                            setFilters({
                              ...filters
                            })

                          }

                          setFirst(true)

                          onChange(type.id)
                        }} />
                        <label className="form-check-label text-capitalized card-link-secondary" for={`producttype${type.id}`}>{type.title}</label>
                      </div>
                    })
                  }
                </div>
                </div>
                <div className="border_info">
                <p className="mb-2 mt-3 "><b>Package Type</b></p>
                <hr className="rows " />

                <div className="flex-filter font-normal">
                  {
                    packageTypes && packageTypes.length > 0 && packageTypes.map(type => {
                      return <div className="form-check mb-2 mb-md-1">
                        <input type="checkbox" value={type.id} className="form-check-input pr-2 rounded mt-0" id={`packagetype${type.id}`} onChange={(e) => {

                          if (e.target.checked == true) {
                            let packageType = []
                            if ('packageType' in filters) {
                              packageType = filters.packageType
                            }
                            packageType.push(parseInt(e.target.value))
                            setFilters({
                              ...filters,
                              packageType: packageType
                            })
                          } else {
                            let packageType = filters.packageType.filter(data => data != e.target.value)
                            setFilters({
                              ...filters,
                              packageType: packageType
                            })

                          }
                          setFirst(true)

                        }} />
                        <label className="form-check-label text-capitalized card-link-secondary" for={`packagetype${type.id}`}>{type.title}</label>
                      </div>
                    })
                    ||
                    <div>
                      <div>
                        <div className="comment br animateShimmer   mt-3 w-25"></div>
                        <div className="comment br animateShimmer  mt-3 w-50"></div>
                        <div className="comment br animateShimmer   mt-3 w-75"></div>
                        <div className="comment br animateShimmer mt-3 w80"></div>
                      </div>
                      <div className="mt-5">
                        <div className="comment br animateShimmer   mt-3 w-25"></div>
                        <div className="comment br animateShimmer  mt-3 w-50"></div>
                        <div className="comment br animateShimmer   mt-3 w-75"></div>
                        <div className="comment br animateShimmer mt-3 w80"></div>
                      </div>
                      <div className="mt-5">
                        <div className="comment br animateShimmer   mt-3 w-25"></div>
                        <div className="comment br animateShimmer  mt-3 w-50"></div>
                        <div className="comment br animateShimmer   mt-3 w-75"></div>
                        <div className="comment br animateShimmer mt-3 w80"></div>
                      </div>
                    </div>
                  }
                </div>
                </div>


                {attributes && attributes.length > 0 && attributes.map(attr => {

                  let fetcher = 'title'
                  if (attr.referances) {
                    fetcher = attr.referances.fetcher
                  }

                  return <>
                  <div className="border_info">
                    <p className="mb-2 mt-3 "><b>{attr.title}</b></p>
                    <hr className="rows " />
                    <div className="flex-filter font-normal">
                      {attr.values && attr.values.length > 0 && attr.values.map(type => {

                        return <div className="form-check mb-2 mb-md-1">
                          <input type="checkbox" value={type.id} className="form-check-input pr-2 rounded mt-0" id={`${attr.slug}${type.id}`} onChange={(e) => {

                            if (e.target.checked == true) {

                              let key = []
                              if (attr.slug in filters) {
                                key = filters[attr.slug]
                              }

                              key.push(parseInt(e.target.value))
                              setFilters({
                                ...filters,
                                [`${attr.slug}`]: key,
                              })

                            } else {
                              let key = filters[attr.slug].filter(data => data != e.target.value)
                              setFilters({
                                ...filters,
                                [`${attr.slug}`]: key,
                              })

                            }
                            setFirst(true)

                          }} />
                          <label className="form-check-label text-capitalized card-link-secondary" for={`${attr.slug}${type.id}`}>{type[fetcher]}</label>
                        </div>
                      })}
                    </div>
                    </div>

                  </>

                })
                }
              </div>
            </div>}

          </div>}
          <div className={filterable == true ? 'col-sm-9' : 'col-sm-12 col-lg-12 adjust_one pl-lg-5 pr-lg-5'}>

            <div className="bordering min-height-6">
             {filterable == true && filterRender == true  && (<>
              <Filter filterObjects={filterObjects} showFilter={true} limit={filters.limit}  onFilter={onFilter} filterOnChange={true} />
              </>)
              ||
              <>
              {filterable == true && <div className="display mb-3 mt-4 transitions">
                <div className="comment animateShimmer md-w-33 p-4 mr-2"></div>
                <div className="comment animateShimmer md-w-33 p-4 mr-2"></div>
                <div className="comment animateShimmer md-w-33 p-4"></div>
              </div>}</>
              }
            </div>
            <div className="gap ">
              <div className="col-lg-12 home_tab">
                <div className="sub_title-wrapper mb-10">

                </div>
                
                {/* <div className="col-lg-6 courses_app">
                <ul class="nav justify-content-end">
                  <li class="nav-item">
                    <a class="nav-link active" aria-current="page" href="#">See All</a>
                    <span class="tag">new</span>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="#">Trending</a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="#">Popularity</a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="#">Featured</a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="#">Art & Design</a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link disabled" href="#" tabindex="-1" aria-disabled="true">Disabled</a>
                  </li>
                </ul>
                </div> */}

                {/* <!-- ends: .section-header --> */}
              </div>
              

              <div className="row transitions">

                {
                  products && products.length > 0 &&
                  products.map((product, i) => {

                    return (

                      <div className={`col-xxl-4 col-xl-4 col-lg-4 col-md-6 grid-item cat1 cat2 cat4  ${divClass} ${i % 2 == 0 ? '' : ''}`}>
                        <div className="single-courses">
                          <div className="courses_banner_wrapper">
                            <div className="badge-position">
                              {/* <br /> */}
                              <p className="badge badge-success  p-2">{product.product_type.is_package == 1 && product.package_type ? product.package_type.title : product.product_type.title}</p> <br />

                            </div>
                            <div className="courses_banner">
                              <Link href={`/courses/${product.slug}`}>
                                <a><img src={product.cover_image} alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid" /></a>
                              </Link>
                            </div>

                            <div className="purchase_price">
                              <Link href={`/courses/${product.slug}`}>
                                <a className="read_more-btn">₹{product.finalAmount} <span className="del-price">
                                  {product.finalAmount != product.amount && <del>₹ {product.amount}</del>}
                                </span></a>
                              </Link>
                            </div>
                          </div>
                          <div className="courses_info_wrapper">
                            <div className="courses_title min-height-4">
                              <h5 className="courses_h">
                                <Link href={`/courses/${product.slug}`}>
                                  <a className="course_hover cart_btn mb-3  text-limit"><b>{product.name}</b></a>
                                </Link>
                              </h5>
                              {hideHierarchy < 2 && <div className="branch_name mb-2 ">
                                {product.courses && product.courses.map((course, i) => {
                                  if (i < 2) {
                                    return (
                                      <Link href="/"><a title="" className="mr-1 mb-1 text-left">{course.name}</a></Link>
                                    )
                                  }
                                })}
                              </div>}

                              {product.courses && product.courses && product.courses.length > 2 && <span>and {product.courses.length - 2} More</span>}

                              { product.faculty && product.faculty.length > 0 &&
                              <>
                                <hr></hr>
                              <div className="teachers_name">
                                <div className="bindteacher">
                                  {product.faculty &&
                                    product.faculty.split(',').map((f, i) => {
                                      if (i < 2) {
                                        return <span className="badge badge-secondary mb-1 mr-1 p-1">{f}</span>
                                      }
                                    })

                                  }
                                  {product.faculty && product.faculty.split(',').length > 2 && <span className="ml-2">and {product.faculty.split(',').length - 2} More</span>}
                                </div>
                              </div>
                              </>}

                            </div>
                            <hr className="mt-3"></hr>

                            <div className="courses_info">
                              <div className=" date">
                                {product.validity && <i className="fas fa-calendar-alt pl-1"></i>}
                                {product.validity && ` ${product.validity}`}
                              </div>

                              <ul className="list-unstyled ">
                                <Link href={`/courses/${product.slug}`}><a className="cart_btn ">Know Details <i class="flaticon-right-arrow"></i></a></Link>

                              </ul>

                            </div>
                          </div>
                        </div>

                      </div>
                    )
                  })
                  ||
                  ( !loaded &&
                    <ProductsShimmer/>  )
                  }
                  {
                    loaded && products && products.length <= 0 && <div className="col-12 text-center ">
                    <img className="col-12 data-img" src="/images/search.png"></img>
                    <h5 className="font-weight-bold">No Data Available</h5>
                    <p className="mt-1">There is no data to show you right now.</p>
                    </div>
                  
                }

              </div>

            </div>
          </div>
        </div>
      </div>
      {
        filterable == true && <div className="pagination_blog">
          <ul>
            {
              Array.from({ length: totalIndex }, (_, index) => index + 1).map(
                i => {
                  return <li className={(filters.offset / filters.limit) == (i - 1) ? 'bg-selected text-white mr-2' : 'bg-not mr-2'} onClick={() => {
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
      }
    </section >
  )
}