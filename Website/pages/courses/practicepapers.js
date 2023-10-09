import Link from "next/link";
import AppStoreFooter from "components/website/AppStoreFooter";
import define from 'src/json/worddefination.json'

export default function courses() {
  return (
    <>
      <header className="header_inner courses_page">
        
        <div className="intro_wrapper lecture_series">
          <div className="container">
            <div className="row">
              <div className="col-sm-12 col-md-8 col-lg-8">
                
              </div>
            </div>
          </div>
        </div>

      </header>
      {/* content starts */}
      <section className="about_us my-2 p-b-0">
        <div className="container">
          <div className="about_title mb-2">
            <span>Courses</span>
            <h2>Online Practice Papers</h2>
          </div>

          <p>Online Practice Paper contains numerous important objective type theoretical and numerical questions based on basic concepts & latest trends in the petroleum exploration and production industries.</p>
          <p>The questions have been methodically developed/selected from different text books, manuals of petroleum industries, SPE technical papers and teaching materials of experienced academicians from premium institutes and GATE toppers. These questions are very relevant and are prepared considering previous year paper and standard of the questions resembles the actual examination in all the aspects, helping students to overcome their weaknesses, rectify errors and perform better. </p>
          <p>The practice question covers all the topics mentioned in petroleum engineering GATE syllabus including Mathematics and General Aptitude. It will be primarily useful for fresh graduates of petroleum engineering who can prepare themselves soundly for both written as well as oral examinations.</p>
          <p>All the parameters like question quality, number of questions, negative marking is aligned as per the actual exam pattern. It will be benefiting students in developing skills like time management and accuracy required to crack the examination. </p>
          
          <div className="row about_content_wrapper mt-5">
            <div className="col-12 col-sm-12 col-md-7 col-lg-7">
              <div className="about_content">
                <h4 className="">Important Features of Online Practice Papers</h4>
                <ul>
                  <li>Online Practice Papers includes a total of 4000+ questions.</li>
                  <li>Covers entire GATE syllabus (including Mathematics and General Aptitude.</li>
                  <li>OTS conducted on online GATE Simulator, which has all real GATE-2022 exam features.</li>
                  <li>Complete solutions for the numerical problems will be provided.</li>
                  <li>Comprehensive and Detailed Analysis to test your performance (Subject-wise marks, acme All India Rank & Percentile, Time Usage Analysis, Doubt Clearing Sessions).</li>
                 
                </ul>
              </div>
            </div>
            <div className="col-12 col-sm-12 col-md-5 col-lg-5 p-0">
              <div className="about_banner_down">
                <img src="/website/assets/images/banner/lecture_series.jpg" alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid" />
              </div>
            </div>
          </div>

        </div>
      </section>
      <div className="container">
      {/* App Download */}
  <AppStoreFooter />
</div>

      {/* content ends */}
    </>
  )
}