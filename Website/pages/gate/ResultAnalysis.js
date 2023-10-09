import Link from "next/link";

export default function courses() {
  return (
    <>
      <header className="header_inner courses_page">
        
        <div className="intro_wrapper gate_result_analysis">
          <div className="container">
            <div className="row">
              <div className="col-sm-12 col-md-8 col-lg-8">
                <div className="intro_text">
                  <h1>GATE Result Analysis</h1>
                  
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
            <h2>Result Analysis</h2>
          </div>

          <img src="/website/assets/images/Result Comparison.png" className="img-fluid" />

        </div>
      </section>
      {/* Mid COntent ends */}
    </>
  )
}