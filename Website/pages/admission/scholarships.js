import Link from "next/link";
import define from 'src/json/worddefination.json'
export default function courses() {
  return (
    <>
      <header className="header_inner courses_page">

        <div className="intro_wrapper scholarship_head">
          <div className="container">
            <div className="row">
              <div className="col-sm-12 col-md-8 col-lg-8">
                
              </div>
            </div>
          </div>
        </div>

      </header>
      {/* Mid Content starts */}
      <section className="about_us scholarship_body my-2">
        <div className="container">

          <div className="about_title mb-2">
            <span>Scholarships</span>
            <h2>Scholarships Offered</h2>
          </div>

          

          <p className="text-justify">{window.localStorage.getItem('baseTitle')} has taken an initiative to reward promising Petrocrats and to ensure that money is not a constraint for those with a passion for learning.  We, at {window.localStorage.getItem('baseTitle')} offer scholarships to meritorious students for pursuing classroom program, based on the eligibility and brilliance of the students.</p>
          <p className="text-justify">The scholarships have been divided into two categories:</p>
          
          <div className="row about_content_wrapper pt-4">
            <div className="col-12 col-sm-12 col-md-8 col-lg-8 ">
              <h5><strong className="font-black">Category A : </strong> {window.localStorage.getItem('baseTitle')} Darcy’s Scholarship</h5>

              <div className="table-responsive sign__wrapper-2 white-bg mt-3 mb-4">
                <table className="table table-bordered table-striped table-hover mb-0">
                  <thead>
                    <tr>
                      <th>S.No.</th>
                      <th>Scholarship Eligibility</th>
                      <th>Code no.</th>
                      <th>Tuition Fee Wavier</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1.</td>
                      <td>GATE-2021 Qualified Students (AIR ≤ 50)</td>
                      <td>PGDS01</td>
                      <td>75%</td>
                    </tr>

                    <tr>
                      <td>2.</td>
                      <td>GATE-2021 Qualified Students (AIR 51 - 100)</td>
                      <td>PGDS02</td>
                      <td>50%</td>
                    </tr>

                    <tr>
                      <td>3.</td>
                      <td>GATE-2021 Qualified Students (AIR 101 - 200)</td>
                      <td>PGDS03</td>
                      <td>25%</td>
                    </tr>

                    <tr>
                      <td>4.</td>
                      <td>GATE-2021 Qualified Students</td>
                      <td>PGDS04</td>
                      <td>10%</td>
                    </tr>

                    <tr>
                      <td>5.</td>
                      <td>Students with CPGA ≥ 9.5 with no backlogs(B. Tech/M. Tech)</td>
                      <td>PGDS05</td>
                      <td>20%</td>
                    </tr>

                    <tr>
                      <td>6.</td>
                      <td>Students with CPGA ≥ 8.5 &amp; ≤ 9.5 with no backlogs(B. Tech/ M. Tech)</td>
                      <td>PGDS06</td>
                      <td>10%</td>
                    </tr>
                    
                    <tr>
                      <td>7.</td>
                      <td>Early Bird Discount (ERD) (To first 10 registered students only)</td>
                      <td>PGDS07</td>
                      <td>10%</td>
                    </tr>
                    
                  </tbody>
                </table>
              </div>
              <p><span className="font-saffron">Note:</span> A student can avail any ONE (along with ERD, if applicable) of the {window.localStorage.getItem('baseTitle')} Darcy’s scholarships, whichever is the higher.</p>
              <hr className="mb-2"></hr>
              <h5 className="pt-4"><strong className="font-black ">Category B : </strong>  {window.localStorage.getItem('baseTitle')} Vogel’s Scholarships</h5>

              <p>To support and promote talent by nurturing exemplary students in one-to-one manner under the close supervision of Advisory Council and Directors to ensure top ranks in GATE-2021.</p>

              <p><strong>Cash Award for Internal Test Toppers</strong></p>

              <div className="table-responsive sign__wrapper-2 white-bg mt-3 mb-4">
                <table className="table table-bordered table-striped table-hover mb-0">
                  <thead>
                    <tr>
                      <th>S.No.</th>
                      <th>Scholarship Eligibility</th>
                      <th>Code No.</th>
                      <th>Cash Award</th>
                    </tr>

                    <tr>
                      <td>1.</td>
                      <td>1<sup>st</sup> Ranker</td>
                      <td>PGVS01</td>
                      <td>Rs. 1500</td>
                    </tr>

                    <tr>
                      <td>2.</td>
                      <td>2<sup>nd</sup> Ranker</td>
                      <td>PGVS02</td>
                      <td>Rs. 1000</td>
                    </tr>

                    <tr>
                      <td>3.</td>
                      <td>3<sup>rd</sup> Ranker</td>
                      <td>PGVS03</td>
                      <td>Rs. 500</td>
                    </tr>
                  </thead>
                </table>
              </div>
              <p><span className="font-saffron mb-3">Note:</span> A student can avail any ONE of the {window.localStorage.getItem('baseTitle')} Vogel’s scholarships, whichever is the higher.</p>
              <hr className="mb-2"></hr>
              <h5 className="pt-4 "><strong className="font-saffron">Important Note</strong></h5>
            <ul>
              <li>Students eligible for any scholarship are required to submit the supporting document in original at the time of availing the scholarship.</li>
              <li>Scholarships are offered on Tuition fees only.</li>
              <li>All the above scholarships are applicable only for Intensive Classroom Program s.</li>
              <li>Disbursement of scholarship will be done in 15 days from the date of application received through online transaction only.</li>
              <li>A student is eligible for only one scholarship at a time, No two criteria can be clubbed to avail deduction in fee at {window.localStorage.getItem('baseTitle')}.</li>
            </ul>
            </div>
            <div className="col-12 col-sm-12 col-md-4 col-lg-4 height sm-mt-4 ">
              <img src="/website/assets/images/banner/scholarship-image.jpg" alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid sign__wrapper-3 white-bg" />
            </div>
          </div>
          <h6 className="col-12 col-sm-6 col-md-5 col-lg-3 btn-submit mt-5 mt-md-3 mt-lg-3 mb-2 text-center">
                     <Link href="/website/assets/pdf/scholarshipform.pdf">
                     <a target="_blank">Download Scholarship Form now.</a>
                     </Link>
               </h6>

          <div className="about_content_wrapper pt-4 sm-pt-4">
          <h5><strong className="font-saffron">How to Apply for Scholarship</strong></h5>
            <ul className="mb-2">
              <li>Prescribed <strong>SCHOLARSHIP APPLICATION FORM</strong> is available on demand at {window.localStorage.getItem('baseTitle')} Office.</li>
              <li>To avail the scholarship, student has to produce required documents in original along with the scholarship application form by the earliest</li>
              <li>Students for whom the Semester Result is awaited at the time of Admission can also apply for scholarship at later stage (before last date), if eligible.</li>
            </ul>
            <h5 className="mt-lg-4 mt-md-4 sm-pt-4"><strong className="font-saffron">Terms &amp; Conditions</strong></h5>
            <p>{window.localStorage.getItem('baseTitle')} reserves the right to make any alteration or cancel any scholarship at any time at its sole discretion and no claim of any kind will be entertained in this matter. Scholarship of the student will be cancelled if he /she fails to fulfil the minimum requirements. In case of any disputes {window.localStorage.getItem('baseTitle')} decision will be final and no further discussions will be entertained.</p>

            
          </div>
        </div>
      </section>
      {/* Mid Content ends */}
    </>
  )
}