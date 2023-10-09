import Link from "next/link";
import AppStoreFooter from "components/website/AppStoreFooter";
import define from 'src/json/worddefination.json'

export default function courses() {
  return (
    <>
      <header className="header_inner courses_page">

        <div className="intro_wrapper test_series">
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
            <h2>Online Test Series <div className="btn btn-primary get_s_btn float-right-1">
              <Link href="https://acme.conductexam.com/landing/">
                <a title="">Login to the Test Series <i class="fa fa-arrow-circle-right" aria-hidden="true"></i></a>
              </Link>
            </div></h2>

          </div>

          <p className="text-justify">Online Test Series is a powerful testing and self-assessment academic tool which will help you evaluate your GATE preparedness with respect to thousands of serious GATE aspirants across the country and gives GATE aspirants the simulation of actual GATE Online Exam.</p>
          <p className="text-justify">The test papers are developed by experienced academicians from premium institutes and GATE toppers. Online Test Series is designed considering previous year paper and standard of the questions resembles the actual examination in all the aspects, helping students to overcome their weaknesses, rectify errors and perform better. </p>
          <p className="text-justify">All the parameters like test standard, question quality, number of questions, negative marking are aligned as per the actual exam pattern. Test series will be benefiting students in developing skills like time management and accuracy required to crack the examination.  </p>
          <p className="text-justify">Comprehensive test analysis on various factors like All India Rank, Score, percentile, comparison with toppers, test wise performance, cut-off analysis etc.  A special mentor team will be appointed for OTS opting students to clarify their doubts.</p>
          <p className="text-justify">Online Test Series is the tool to crack GATE, where candidates will get opportunity to compete with thousands of quality students.</p>
          

          <div className="row about_content_wrapper mt-5">
            <div className="col-12 col-sm-12 col-md-7 col-lg-7">
              <div className="about_content">
                <h4 className="">Program Features</h4>
                <div>
                  <ul>
                    <li>	Online Test includes a total of 32 test on GATE-2022 pattern

                      <ul>
                        <li>10 Full Syllabus Test Papers (Self-Administered Tests) </li>
                        <li>10 Full Syllabus Test Papers (Self-Administered Tests)  </li>
                        <li>06 GATE-Previous Year Papers  </li>
                        <li>01 acme Free Mock Paper </li>
                      </ul>
                    </li>
                  </ul>
                  <li>OTS conducted on online GATE Simulator, which has all real GATE-2022 exam features and test pattern.</li>
                  <li>Complete solutions for the numerical problems will be provided</li>
                  <li>	Comprehensive and Detailed Analysis to test your performance

                    <ul>
                      <li>Subject-wise marks</li>
                      <li>acme All India Rank & Percentile</li>
                      <li>Detailed Solution after individual tests</li>
                      <li>Time usage analysis</li>
                      <li>Doubt clearing sessions</li>
                    </ul>
                  </li>
                  <li>100% Refund of the Test fee for Top-100 GATE-2022 Qualifiers (T&C Apply)</li>
                  <li>Scholarships worth Rs. 1,00,000/-</li>

                </div>
                
                <hr>
                </hr>


                <h6 className="mb-3 mt-3"><b><span className="font-saffron">Note:</span></b> Your registered name at acme Online Test Series MUST match with the GATE Scorecard name to process your refund.</h6>
              </div>
            </div>

            <div className="col-12 col-sm-12 col-md-5 col-lg-5 p-0">
              <div className="about_banner_down">
                <img src="/website/assets/images/banner/test_series.jpg" alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid" />
              </div>
            </div>
            <div  className="col-12 col-sm-12 col-md-12 col-lg-12">
            <h4 className=" mt-5">Terms and Conditions for Refund (OTS)</h4>
                <div className="mb-3">
                  <li> 	Submit the GATE Scorecard/Screenshot within one week of result declaration date. NO REFUND will be done if the claim is made after one week of result declaration date
                    </li>
                  <li> 	No phone calls or emails will be done from {window.localStorage.getItem('baseTitle')} asking you to claim your refund</li>
                  <li> 	To claim your refund send us the below mentioned information and documents via email to classroom@acme.in

                    <ul>
                      <li>GATE Scorecard/Screenshot</li>
                      <li>Passport Size Photograph (As in GATE Scorecard)</li>
                      <li>Screen shot of the acme dashboard</li>
                      <li>Bank details including (Account Holder Name, Account Number, IFSC Code and Bank Name)</li>
                    </ul>
                  </li>
                  <li> 	Refund will be done within 15 working days/before 31st March (whichever is earlier)</li>

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