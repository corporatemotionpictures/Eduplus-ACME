import Link from "next/link";
import define from 'src/json/worddefination.json'

export default function ourInstructor() {
  return (
    <section className="our_instructors" id="about_our_instructors">
      <div className="container">
        <div className="row">
          <div className="col-12 col-sm-12 col-md-12 col-lg-12">
            <div className="sub_title">
              <h2>Advisory Council</h2>
                         </div>
          </div>

          <div className="single-wrapper col-12 col-sm-6 col-md-1 col-lg-1"></div>

          <div className="single-wrapper col-12 col-sm-6 col-md-2 col-lg-2">
            <div className="team-single-item">
              <figure>
                <div className="">
                  <div className="teachars_pro">
                    <img src="/website/assets/images/team/uma.jpg" alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid" />
                  </div>
                </div>
                <figcaption>
                  <div className="member-name mt-3">
                    <h4>
                      <Link href="/">
                        <a title="">Dr. Uma Shankar Prasad</a>
                      </Link>
                    </h4>
              
                  </div>
                </figcaption>
              </figure>
            </div>
       
           
          </div>

          <div className="single-wrapper col-12 col-sm-6 col-md-2 col-lg-2">
            <div className="team-single-item">
              <figure>
                <div className="">
                  <div className="teachars_pro">
                    <img src="/website/assets/images/team/sushil.jpg" alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid" />
                  </div>
                </div>
                <figcaption>
                  <div className="member-name mt-3">
                    <h4>
                      <Link href="/">
                        <a title="">Dr. Sushil Kumar Mishra</a>
                      </Link>
                    </h4>
                   
                  </div>
                </figcaption>
              </figure>
            </div>

    
          </div>

          <div className="single-wrapper  col-12 col-sm-6 col-md-2 col-lg-2">
            <div className="team-single-item ">
              <figure>
                <div className="">
                  <div className="teachars_pro">
                    <img src="/website/assets/images/team/ckjain.png" alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid" />
                  </div>
                </div>
                <figcaption>
                  <div className="member-name mt-3">
                    <h4>
                      <Link href="/">
                        <a title="">Prof. C. K. Jain</a>
                      </Link>
                    </h4>
              
                  </div>
                </figcaption>
              </figure>
            </div>



          
          </div>

          <div className="single-wrapper col-12 col-sm-6 col-md-2 col-lg-2">
            <div className="team-single-item">
              <figure>
                <div className="">
                  <div className="teachars_pro">
                    <img src="/website/assets/images/team/prabhu.jpg" alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid" />
                  </div>
                </div>
                <figcaption>
                  <div className="member-name mt-3">
                    <h4>
                      <Link href="/">
                        <a title="">Prof. Prabhu Dayal Arora</a>
                      </Link>
                    </h4>
                   
                  </div>
                </figcaption>
              </figure>
            </div>
            {/* Introduction Modal */}

      
          </div>

          <div className="single-wrapper col-12 col-sm-6 col-md-2 col-lg-2">
            <div className="team-single-item">
              <figure>
                <div className="">
                  <div className="teachars_pro">
                    <img src="/website/assets/images/team/mukesh.jpg" alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid" />
                  </div>
                </div>
                <figcaption>
                  <div className="member-name mt-3">
                    <h4>
                      <Link href="/">
                        <a title="">Dr. Mukesh Kumar</a>
                      </Link>
                    </h4>
                    
                  </div>
                </figcaption>
              </figure>
            </div>
            {/* Introduction Modal */}

   
          </div>

          <div className="single-wrapper col-12 col-sm-6 col-md-1 col-lg-1"></div>

        </div>
      </div>

    </section>
  )
}