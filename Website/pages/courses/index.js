import Link from "next/link";
import OurCourses from "components/website/OurCourses";

export default function courses() {

  return (
    <>
      <header className="header_inner courses_page">
        <div className="intro_wrapper courses_head">
          <div className="container">
            <div className="row">
              <div className="col-sm-12 col-md-8 col-lg-8">
                <div className="intro_text">
                  <h1>Courses</h1>
                  <span>
                  <Link href="/">
                    <a title="Get Started Now" className="">Home </a>
                    </Link>
                  </span>
                  <span> /  </span>
                  <span>Courses</span>
                  
                </div>
              </div>
            </div>
          </div>
        </div>

      </header>
      <div className="col-12 col-sm-12 col-md-12 col-lg-12  ">
        <div className="sub_title mb-1">
        <h2 className="section__title sm-mt-4">Find The Right <span className="">Online Course <img className="blink_img" src="/website/assets/images/banner/yellow-bg.png" alt=""></img> </span>  For You</h2>
                  <p>You don't have to struggle alone, you've got our assistance and help.</p>

          {/* <p></p> */}
        </div>
        {/* <!-- ends: .section-header --> */}
      </div>

      <OurCourses filterable={true} />

      
    </>
  )
}