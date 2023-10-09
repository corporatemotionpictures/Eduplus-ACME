import Link from "next/link";

export default function courses() {
  return (
    <>
      <header className="header_inner courses_page">
        <div className="intro_wrapper gate_ppr_analysis">
          <div className="container">
            <div className="row">
              <div className="col-sm-12 col-md-8 col-lg-8">
                <div className="intro_text">
                  <h1>GATE Paper Analysis</h1>
                  
                </div>
              </div>
            </div>
          </div>
        </div>

      </header>
      {/* Mid COntent starts */}
      <section className="about_us">
        <div className="container">

          <div className="about_title mb-2">
            <span>GATE</span>
            <h2>Paper Analysis</h2>
          </div>

          <embed src= "/website/assets/images/4-Paper Analysis-2021.pdf" width="100%" height="1000px"></embed>

          {/* <img src="/website/assets/images/paper_analysis2020.jpg" className="img-fluid" /> */}

        </div>
      </section>
      {/* Mid COntent ends */}
    </>
  )
}