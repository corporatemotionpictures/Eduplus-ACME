import Link from "next/link";
import define from 'src/json/worddefination.json'

export default function Instructor() {
  return (
    <div className="container">
      <div className="row">
        <div className="col-12 col-sm-12 col-md-12 col-lg-12 spacing become_techer_wrapper">
          <div className="become_a_teacher">
          <div class="cta__shape">
          <img src="/website/assets/images/shapes/cta-shape.png" alt={window.localStorage.getItem('defaultImageAlt')} className="" />
                  </div>
                  <div className="col-12 col-sm-12 col-md-12 col-lg-12 instruction">
                  <div className="col-12 col-sm-12 col-md-8 col-lg-8 title">
              <h2 className="mb-2">Let's Crack it!</h2>
              <p>The Courses are exclusively designed for MCA students. The best online coaching classes to give you a classroom feel where you can interact with you teacher, clarify Doubts & learn anytime, anywhere.</p>
            </div>
            {/* <!-- ends: .section-header --> */}
            <div className="col-12 col-sm-12 col-md-4 col-lg-4 get_s_btn  ">
              <Link href="/auth/register">
                <a title="">Get Started<i class="fas fa-arrow-circle-right ml-1 "></i></a>
              </Link>
            </div>
            
                  </div>
           
            
          </div>
        </div>
      
      </div>
    
    </div>
  
  )
}