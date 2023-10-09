export default function counterAbout() {
  return (
    <section className="out_count_student">
      <div className="container">
        <div className="row">
          <div className="col-12 col-sm-12 col-md-12 col-lg-12">
            <div className="sub_title">
              <h2>Everything Is {window.localStorage.getItem('baseTitle')}</h2>
              <p></p>
            </div>
            
          </div>
        </div>
        <div className="row">
          <div className="col-12 col-sm-12 col-md-12 col-lg-12">
            <div className="counter_wrapper">
              <div className="counter_single_wrapper">
                <div className="section count_single">
                  <div className="project-count"><span className="counter">1200 </span><span className="count_icon">+</span></div>
                  <span>Active students</span>
                </div>
              </div>

              <div className="counter_single_wrapper">
                <div className="section count_single">
                  <div className="project-count"><span className="counter">1300 </span><span className="count_icon">+</span></div>
                  <span>Online Courses</span>
                </div>
              </div>

              <div className="counter_single_wrapper">
                <div className="section count_single">
                  <div className="project-count"><span className="counter">1050 </span><span className="count_icon">+</span></div>
                  <span>Satisfaction</span>
                </div>
              </div>

              <div className="counter_single_wrapper">
                <div className="section count_single">
                  <div className="project-count"><span className="counter">1500 </span><span className="count_icon">+</span></div>
                  <span>Fraduates</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg_shapes">

      </div>
    </section>
  )
}