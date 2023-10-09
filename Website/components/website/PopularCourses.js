import Link from 'next/link';

export default function PopularCourses() {
  return (
    <section className="container">
      <div className="cources_highlight">
      <div className="container">
        <div className="col-12 col-sm-12 col-md-12 col-lg-12 pt-md-5 pt-lg-0 mt-5 sm-pt-4 pt-lg-3">
            <div className="">
            </div>
            {/* <!-- ends: .section-header --> */}
          </div>
          <div className="row col-12 sm-mt-4 ml-6 ">
          <div className="col-12 col-sm-6 col-md-6 col-lg-3 mb-5 sm-mt-4 border_adjust border-right">
            <div className="single_item single_item_one">
              <div className="icon_wrap icon_adjust">
              <img src="/website/assets/images/banner/course.png" alt="" class="img-fluid"/>
              </div>
              <div className="blog_titled">
                <h3>
                  <Link href="/">
                    <a title="">80-85%</a>
                    
                  </Link>
                </h3>
                <div className="blog_subtitled">
                Selection Rate
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-6 col-lg-3 mb-5 border_adjust border-right">
            <div className="single_item single_item_two">
              <div className="icon_wrap icon_adjust">
              <img src="/website/assets/images/banner/students.png" alt="" class="img-fluid"/>
              </div>
              <div className="blog_titled">
                <h3>
                  <Link href="/">
                   <a title="">400+</a>
                    
                  </Link>
                </h3>

                <div className="blog_subtitled">
                Students Selected
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-6 col-lg-3 mb-5 border_adjust border-right">
            <div className="single_item single_item_three">
              <div className="icon_wrap icon_adjust">
              <img src="/website/assets/images/banner/access.png" alt="" class="img-fluid"/>
              </div>
              <div className="blog_titled">
                <h3>
                  <Link href="/">
                    <a title="">500+</a>
                
                  </Link>
                </h3>
                <div className="blog_subtitled">
                Mock Test
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-6 col-lg-3 mb-5">
            <div className="single_item single_item_four">
              <div className="icon_wrap icon_adjust">
              <img src="/website/assets/images/banner/world.png" alt="" class="img-fluid"/>
              </div>
              <div className="blog_titled">
                <h3>
                  <Link href="/">
                    <a title="">20000+</a>
                    
                  </Link>
                </h3>
                <div className="blog_subtitled">
                Ques. & Solu.
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    
      </div>
    
    </section>
  )
}