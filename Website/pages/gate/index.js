import Link from "next/link";
import define from 'src/json/worddefination.json'

export default function courses() {
  return (
    <>
      <header className="header_inner courses_page">

        <div className="intro_wrapper gate_head">
          <div className="container">
            <div className="row">
              <div className="col-sm-12 col-md-8 col-lg-8">
                <div className="intro_text">
                  <h1>About GATE</h1>
                  <div className="pages_links">
                    <Link href="/">
                      <a title="">Home</a>
                    </Link>
                    <Link href="/gate">
                      <a title="" className="active">About GATE</a>
                    </Link>
                    <Link href="/gate/WhyGate">
                      <a title="" className="active">About GATE</a>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* MId Content starts */}
      <section className="about_us">
        <div className="container">

          <div className="about_title mb-2">
            <span>GATE</span>
            <h2>About GATE</h2>
          </div>

          <div className="row about_content_wrapper">
            <div className="col-12 col-sm-12 col-md-8 col-lg-8">
              <p className="text-justify">Graduate Aptitude Test in Engineering (GATE) is an all India entrance examination that primarily tests the comprehensive understanding of various undergraduate subjects in engineering and science. GATE is administered and conducted jointly by Indian Institute of Science-IISc and Indian Institute of Technology-IITs (IIT-Bombay, IIT-Delhi, IIT-Guwahati, IIT-Kanpur, IIT-Kharagpur, IIT-Madras and IIT-Roorkee), every year in the month of January/February on behalf of the National Coordination Board-GATE Dept. of Higher Education, Ministry of Human Recourses Development (MHRD) and Government of India.</p>
              <p className="text-justify">The GATE score of a candidate reflects the relative performance level of a candidate. The GATE score has now became an essential eligibility criteria for getting admission into the premium institutes for post-graduate education programs. Candidates on qualifying GATE, get a financial assistance of Rs 12,400/- (for Master’s) and 25000/- (for Doctorate) in the form of UGC or MHRD scholarship. Recently, GATE Score has also become a criteria by several PSUs for recruiting young engineers in entry-level positions with attractive CTC.</p>
              <p className="text-justify">There are numerous jobs opportunities available for a fresh petroleum graduate in major PSU’s like ONGC, IOCL and MECL in 2016. In coming years many Navaratna and Miniratna companies are expected to add up to the tally of recruiting Petroleum Graduates based on the GATE Scores. </p>
            </div>
            <div className="col-12 col-sm-12 col-md-4 col-lg-4">
              <div className="gate_banner_down">
                <img src="/website/assets/images/banner/gate_img.jpg" alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid" />
              </div>
            </div>
          </div>

        </div>
      </section>
      {/* MId Content ends */}
    </>
  )
}