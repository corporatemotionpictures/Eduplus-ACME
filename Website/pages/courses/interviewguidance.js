import Link from "next/link";
import AppStoreFooter from "components/website/AppStoreFooter";

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
      <section className="about_us my-2">
        <div className="container">
          <div className="about_title mb-2">
            <span>Courses</span>
            <h2>Interview Guidance</h2>
          </div>

          <p className="text-justify">Once the results are declared, successful aspirants will have a myriad of questions and we can very confidently say that these sessions by industry experts will give students solutions for their queries.</p>
          <p className="text-justify">acme will conduct an exclusive program for PSUs/Higher education interviews after the announcement of GATE-2017 results. The course duration will be of 15-20 days. 
acme interview panel comprises of very experienced & highly reputed technical & psychological experts. The interview programme will emphasizes on improving personal aptitude of presentation and enhancing technical and general awareness on practical aspects. The technical classes will be held to analyse practical situation for interview requirements. Classes for current national & international issues would be conducted to improve the confidence level. The panel members will help to filter out weaknesses & psychological problems of the candidates.</p>
          <p className="text-justify">At the end of session, 3-4 mock interviews will be organized consisting of members from different fields in the interview board.  Based on performance in the mock-interviews, a thorough feedback and valuable suggestions will be given to the candidates to help them understand their weaknesses and improve their personality. 
A useful guidance could bring valuable improvement in the performance. </p>
  
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