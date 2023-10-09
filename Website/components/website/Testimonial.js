import Link from "next/link";
import define from 'src/json/worddefination.json'

export default function Testimonial() {
  return (
    <section className="testimonial">
      <div className="container">
        <div className="row">
          <div className="col-12 col-sm-12 col-md-12 col-lg-4">
            <div className="testimonial_title">
              <h2>Student Say About Us.</h2>
            </div>
          </div>
          <div className="col-12 col-sm-12 col-md-12 col-lg-8">
            <div className="testimonial_text_wrapper">
              <div className="carousel_text slider-for">
                <div>
                  <div className="single_box wow fadeInUp" data-wow-duration="2s" data-wow-delay=".2s">
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque um sociis natoque pena pretium quis, sem.</p>
                  </div>
                </div>
                <div>
                  <div className="single_box wow fadeInUp" data-wow-duration="2s" data-wow-delay=".3s">
                    <p>Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus.</p>
                  </div>
                </div>
                <div>
                  <div className="single_box wow fadeInUp" data-wow-duration="2s" data-wow-delay=".4s">
                    <p>Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum.</p>
                  </div>
                </div>
              </div>
              <div className="reviewer_info">
                <div className="carousel_images slider-nav">
                  <div className="restimonial_single_img">
                    <img src="/website/assets/images/team/review_1.jpg" alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid" />
                    <div className="name_position">
                      <span className="name">Michael Jusi</span>
                      <span>Graphic Student</span>
                    </div>
                  </div>
                  <div className="restimonial_single_img">
                    <img src="/website/assets/images/team/review_4.jpg" alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid" />
                    <div className="name_position">
                      <span className="name">Jhon Smith</span>
                      <span>Web Student</span>
                    </div>
                  </div>
                  <div className="restimonial_single_img ">
                    <img src="/website/assets/images/team/review_3.jpg" alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid" />
                    <div className="name_position">
                      <span className="name">James Colins</span>
                      <span>Graphic Student</span>
                    </div>
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