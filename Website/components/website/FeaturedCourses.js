import Link from "next/link";
import React, { useState, useEffect } from 'react';
import { fetchAll, updateAdditional,getSettings } from 'helpers/apiService';
import Filter from 'components/classical-ui/filters'


import define from 'src/json/worddefination.json'
import ProductsShimmer from "./shimmer/products-shimmer";

export default function FeaturedCourses({ filterable = false, divClass = '', preFilter = { limit: 10, offset: 0 } }) {

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
    {
      label: 'exams',
      name: 'examID',
      idSelector: 'id',
      view: 'name',
      type: 'select-multiple',
      effectedRows: ['courseID', 'subjectID'],
      className: "lg:w-1/3"
    },
    {
      label: 'courses',
      name: 'courseID',
      idSelector: 'id',
      view: 'name',
      type: 'select-multiple',
      effectedRows: ['subjectID'],
      className: "lg:w-1/3"
    },
    {
      label: 'subjects',
      name: 'subjectID',
      idSelector: 'id',
      view: 'name',
      type: 'select-multiple',
      effectedRows: [],
      className: "lg:w-1/3"
    },
  ]

  return (


    <section className="popular_courses">

      <div className="container">
        <div className="row">
          {filterable == true && <div className="col-sm-3 section-preview border-right">

            {<h5 className="mb-md-0  mb-lg-2 mt-0 color-inherit">Filters
              <span className="d-sm-none  float-right text-primary" onClick={() => {
                setviewFilterBox(true)
              }}><small>More <i class="fas fa-angle-double-right"></i></small></span>
            </h5>}


            <section className="mb-4">

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
            {<div className={`filter-products-parent ${(viewFilterBox || (screen.width > 767)) ? 'd-block' : 'd-none'}`}>
              <div className="filter-products">
                <div className="sm-close-div d-none float-right cursor-pointer w-100 text-right mb-4" onClick={() => {
                  setviewFilterBox(false)
                }}>
                  <p>Close</p>
                </div>
                <p className="mb-2 mt-4 border-bottom"><b>Product Type</b></p>
                <div className="flex-filter font-normal">

                  <div className="form-check mb-2 mb-md-1 ">
                    <input type="radio" value='allproductType' className="form-check-input pr-2 rounded" name="productType" checked={filters && filters.productType && filters.productType == 'all'} id='all' onChange={(e) => {

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
                        <input type="checkbox" value={type.id} className="form-check-input pr-2 rounded" checked={filters && filters.productType && filters.productType == type.id} name="productType" id={`producttype${type.id}`} onChange={(e) => {

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

                <p className="mb-2 mt-4 border-bottom"><b>Package Type</b></p>

                <div className="flex-filter font-normal">
                  {
                    packageTypes && packageTypes.length > 0 && packageTypes.map(type => {
                      return <div className="form-check mb-2 mb-md-1">
                        <input type="checkbox" value={type.id} className="form-check-input pr-2 rounded" id={`packagetype${type.id}`} onChange={(e) => {

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
                  }
                </div>


                {attributes && attributes.length > 0 && attributes.map(attr => {

                  let fetcher = 'title'
                  if (attr.referances) {
                    fetcher = attr.referances.fetcher
                  }

                  return <>
                    <p className="mb-2 mt-4 border-bottom"><b>{attr.title}</b></p>
                    <div className="flex-filter font-normal">
                      {attr.values && attr.values.length > 0 && attr.values.map(type => {

                        return <div className="form-check mb-2 mb-md-1">
                          <input type="checkbox" value={type.id} className="form-check-input pr-2 rounded" id={`${attr.slug}${type.id}`} onChange={(e) => {

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

                  </>

                })
                }
              </div>
            </div>}

          </div>}
          <div className={filterable == true ? 'col-sm-9' : 'col-sm-12 col-lg-12 adjust_one pl-lg-5 pr-lg-5'}>


            {filterable == true && <>
              <Filter filterObjects={filterObjects} showFilter={true} limit={filters.limit} onFilter={onFilter} filterOnChange={true} /><hr className="row mb-5 " />
            </>
            }
            <div className="gap ">
              <div className="col-lg-12 home_tab">
                <div className="sub_title-wrapper">
                  <h2 className="section__title">Find The Right <span className="">Online <img className="blink_img" src="/website/assets/images/banner/yellow-bg.png" alt=""></img> </span> Course For You</h2>
                  <p>You don't have to struggle alone, you've got our assistance and help.</p>

                </div>

                {/* <div className=" wrapper-nav">
                  <div className="wrapper-nav-prev"><i class="fas fa-angle-left"></i></div><div className="wrapper-nav-next"><i class="fas fa-angle-right"></i></div>
                </div> */}
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
              <div class="my-4 side">

                <div id="multi-item-example" class="carousel slide carousel-multi-item" data-ride="carousel">

                  {/* <div class="controls-top">
                    <a class="btn-floating" href="#multi-item-example" data-slide="prev"><i class="fa fa-chevron-left"></i></a>
                    <a class="btn-floating" href="#multi-item-example" data-slide="next"><i class="fa fa-chevron-right"></i></a>
                  </div> */}
                  {/* <ol class="carousel-indicators">
                  {
                  products && products.length > 0 &&
                  products.map((product, i) => {
                    return     <li data-target="#multi-item-example" data-slide-to={i} class={i==0?"active":''}></li>

                  })
                  
                }
  
                    
                  </ol> */}

                  <div class="carousel-inner" role="listbox">

                    <div class="carousel-item active">

                    <div className="row  ">
                      <div className="slided col-12 transitions">
                      {
                        products && products.length > 0 &&
                        products.map((product, i) => {

                          return (

                            <div className={`col-xxl-4 col-xl-3 col-lg-3 col-md-6 grid-item cat1 cat2 cat4 our_courses featured_one #multi-item-example    ${divClass} ${i % 2 == 0 ? '' : ''}`}>
                              <div className="single-courses  ">
                                <div className="courses_banner_wrapper">
                                  <div className="badge-position">
                                    {/* <br /> */}
                                    <p className="badge badge-success ">{product.product_type.is_package == 1 && product.package_type ? product.package_type.title : product.product_type.title}</p> <br />

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
                                  <div className="courses_title height-10">
                                    <h5 className="courses_h">
                                      <Link href={`/courses/${product.slug}`}>
                                        <a className="cart_btn mb-3  text-limit ancor"><b>{product.name}</b></a>
                                      </Link>
                                    </h5>
                                    {hideHierarchy < 2 && <div className="branch_name mb-1">
                                      {product.courses && product.courses.map((course, i) => {
                                        if (i < 1) {
                                          return (
                                            <Link href="/"><a title="" className="mr-1 mb-1 text-left">{course.name}</a></Link>
                                          )
                                        }
                                      })}
                                    </div>}

                                    {product.courses && product.courses && product.courses.length > 1 && <span>and {product.courses.length - 1} More</span>}

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
                                  <hr className=""></hr>

                                  <div className="courses_info mt-2">
                                    <div className=" ">
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
                          <ProductsShimmer /> )
                  
                      }
                      </div>



</div>

                    </div>



                  </div>

                </div>


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
                  return <li className={(filters.offset / filters.limit) == (i - 1) ? 'bg-selected text-white' : ''} onClick={() => {
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