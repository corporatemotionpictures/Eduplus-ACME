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
      <section className="about_us my-2">
        <div className="container">
          <div className="about_title mb-2">
            <span>Courses</span>
            <h2>Online Lecture Series (OLS)</h2>
          </div>


          <div className="row about_content_wrapper mb-3">
            <div className="col-12 col-sm-12 col-md-12 col-lg-12">
              <div className="about_content">
                <p className="text-justify">acme e-Learning course is meticulously designed as per the pattern of the exam and systematic subject sequence. The lectures will be delivered by the highly renowned and experienced faculties of {window.localStorage.getItem('baseTitle')} who have the vast experience in the preparation of GATE to ensure that no stones are left unturned in the exam preparation.</p>
                <p className="text-justify">In this course recorded video lectures will be provided along to help the aspirants gain the required knowledge and deep understanding of the subjects/topics from the examination perspective in a time bound manner. The feature of doubt chat is also provided to enable the aspirants post/clear their doubts and interact with the faculties and other students for better understanding from the comfort of their home. Hence, the course will be highly beneficial for the students aiming for GATE to ensure a sound preparation.</p>
                <p className="text-justify">Online Course is an ideal course for working professionals and students who could not attend classroom program due to time constrains. The course is designed considering the need of student who wants to access quality materials for qualifying and excelling in GATE at the ease of their time. No classroom burdens. Access quality pre-recorded lectures ANYTIME, ANYWHERE.</p>
                <p className="text-justify">The program runs in three batches to suit the convenience of the students. The students can opt for any one program.</p>
              </div>
            </div>

            <div className="col-12">
              <h4>Two-Year Course</h4>
              <p className="text-justify">Two Years Classroom Course is exclusively designed for 2nd/3rd year college going students. Time Table is suitable for college going students as well as working professionals. At {window.localStorage.getItem('baseTitle')}, we teach concepts from basic level hence this program offers the convenience of managing comprehensive syllabus without compromising the college curriculum and work schedule.</p>
              <p className="text-justify">This program will help in better revision and provides more time for planned preparation of competitive examinations while having flexibility to opt for leaves during semester exams.  </p>
            </div>
          </div>
          <div className="row blog_wrapper intensive_class_body">
          <div className="col-12 col-sm-6 col-md-12 col-lg-6 ">
                     <h5 className="">Explorer Batch (2nd Year Students):</h5>
                     <h6>Batch Starting from March/April</h6>
                     <p className="text-justify">Classes will be held daily from Monday-Saturday for 2-3 hours (after the college timings) and on Sundays/public holidays for 3-5 hours.</p>
                     
                     <div className="table-responsive sign__wrapper-2 white-bg mt-3">
                        <table className="table table-bordered table-striped table-hover mb-0">
                           <thead>
                              <tr className="text-center">
                                 <th className="text-center"><strong>1st Year Course</strong></th>
                                 <th className="text-center"><strong>2nd Year Course</strong></th>
                              </tr>
                           </thead>
                           <tbody>
                              <tr>
                                 <td className="text-center">Engineering Mathematics </td>
                                 <td className="text-center">Production Operations-2</td>
                              </tr>
                              <tr>
                                 <td className="text-center">General Aptitude</td>
                                 <td className="text-center">Well Test Analysis</td>
                              </tr>
                              <tr>
                                 <td className="text-center">Reservoir Engineering</td>
                                 <td className="text-center">Offshore Technology</td>
                              </tr>
                              <tr>
                                 <td className="text-center">Drilling Technology</td>
                                 <td className="text-center">Formation Evaluation</td>
                              </tr>
                              <tr>
                                 <td className="text-center">Production Operations-1</td>
                                 <td className="text-center">EOR</td>
                              </tr>
                              <tr>
                                 <td className="text-center">Petroleum Exploration</td>
                                 <td className="text-center">Latest Trend</td>
                              </tr>
                              <tr>
                                 <td className="text-center"></td>
                                 <td className="text-center">HSE</td>
                              </tr>
                           </tbody>
                        </table>
                     </div>

                     <h5 className="mt-10">Producer Batch (4th Year Pursuing & Pass-Out Students):</h5>
                     <h6>Batch Starting from March/April</h6>
                     <p className="text-justify">Classes will be conducted for 6 to 7 days a week and for 3 to 5 hours per day. These batches are conducted in morning and evening sessions, students can join as per their convenience.</p>
                     
                     <div className="table-responsive sign__wrapper-2 white-bg mt-3">
                        <table className="table table-bordered table-striped table-hover mb-0">
                           <thead>
                              <tr className="text-center">
                                 <th className="text-center"><strong>1st Year Course</strong></th>
                              </tr>
                           </thead>
                           <tbody>
                              <tr>
                                 <td className="text-center">Engineering Mathematics </td>
                              </tr>
                              <tr>
                                 <td className="text-center">General Aptitude </td>
                              </tr>
                              <tr>
                                 <td className="text-center">Petroleum Exploration </td>
                              </tr>
                              <tr>
                                 <td className="text-center">Drilling Technology </td>
                              </tr>
                              <tr>
                                 <td className="text-center">Reservoir Engineering </td>
                              </tr>
                              <tr>
                                 <td className="text-center">Production Operations-1 </td>
                              </tr>
                              <tr>
                                 <td className="text-center">Production Operations-2 </td>
                              </tr>
                              <tr>
                                 <td className="text-center">Offshore Technology </td>
                              </tr>
                              <tr>
                                 <td className="text-center">Formation Evaluation </td>
                              </tr>
                              <tr>
                                 <td className="text-center">Well Test Analysis </td>
                              </tr>
                              <tr>
                                 <td className="text-center">HSE </td>
                              </tr>
                              <tr>
                                 <td className="text-center">EOR </td>
                              </tr>
                              <tr>
                                 <td className="text-center">Latest Trend </td>
                              </tr>
                           </tbody>
                        </table>
                     </div>
                  </div>
                  <div className="col-12 col-sm-6 col-md-12 col-lg-6 sm-pt-4 md-pt-4">
                     <h5 className="">Developer Batch (3rd Year Students):</h5>
                     <h6>Batch Starting from March/April</h6>
                     <p className="text-justify">Classes will be held daily from Monday-Saturday for 2-3 hours (after the college timings) and on Sundays/public holidays for 3-5 hours</p>
                     
                     <div className="table-responsive sign__wrapper-2 white-bg mt-3">
                        <table className="table table-bordered table-striped table-hover mb-0">
                           <thead>
                              <tr className="text-center">
                                 <th className="text-center"><strong>1st Year Course</strong></th>
                                 <th className="text-center"><strong>2nd Year Course</strong></th>
                              </tr>
                           </thead>
                           <tbody>
                              <tr>
                                 <td className="text-center">Engineering Mathematics </td>
                                 <td className="text-center">Engineering Mathematics</td>
                              </tr>
                              <tr>
                                 <td className="text-center">General Aptitude </td>
                                 <td className="text-center">General Aptitude</td>
                              </tr>
                              <tr>
                                 <td className="text-center">Petroleum Exploration </td>
                                 <td className="text-center">Petroleum Exploration</td>
                              </tr>
                              <tr>
                                 <td className="text-center">Drilling Technology </td>
                                 <td className="text-center">Drilling Technology</td>
                              </tr>
                              <tr>
                                 <td className="text-center">Reservoir Engineering </td>
                                 <td className="text-center">Reservoir Engineering</td>
                              </tr>
                              <tr>
                                 <td className="text-center">Production Operations-1 </td>
                                 <td className="text-center">Production Operations-1</td>
                              </tr>
                              <tr>
                                 <td className="text-center">Production Operations-2 </td>
                                 <td className="text-center">Production Operations-2</td>
                              </tr>
                              <tr>
                                 <td className="text-center">Offshore Technology </td>
                                 <td className="text-center">Offshore Technology</td>
                              </tr>
                              <tr>
                                 <td className="text-center">Formation Evaluation </td>
                                 <td className="text-center">Formation Evaluation</td>
                              </tr>
                              <tr>
                                 <td className="text-center">Well Test Analysis </td>
                                 <td className="text-center">Well Test Analysis</td>
                              </tr>
                              <tr>
                                 <td className="text-center">HSE </td>
                                 <td className="text-center">HSE</td>
                              </tr>
                              <tr>
                                 <td className="text-center">EOR </td>
                                 <td className="text-center">EOR</td>
                              </tr>
                              <tr>
                                 <td className="text-center">Latest Trend </td>
                                 <td className="text-center">Latest Trend</td>
                              </tr>
                           </tbody>
                        </table>
                     </div>
                     
                  </div>
                  <div className="col-12 col-sm-12 col-md-12 col-lg-12 mt-5">
                  <h4>One-Year Course</h4>
                     <p>One Year Classroom Course is exclusively designed for preparation of GATE examination. These batches are developed for 4th year and pass-out students, who can devote their full time for preparation of competitive examinations as classes will be conducted regularly on weekdays. The main feature of the course is that all the subjects are taught from basic to advanced level: this helps students to develop strong grip on the basics and clear understanding of fundamental concepts. More focus will be given on solving multiple choice and numerical data type questions which are asked in GATE examination.</p>
                  </div>


            <hr>
            </hr>
            {/* <div className="about_title mb-2 mt-2">
                     <hr>
                     </hr>
                     <h2>Intensive Classroom Program Courses and Plans</h2>
                  </div> */}
          </div>
          <div className="row about_content_wrapper mt-10">
            <div className="col-12 col-sm-12 col-md-7 col-lg-7">
              <div className="about_content">
                <h4 className="">Important Features of Online Course</h4>
                <ul>
                  <li>Full HD-quality, pre-recorded video lectures consisting of <b>400+ hours</b> covering entire GATE syllabus <b>(including Mathematics & General Aptitude)</b></li>
                  <li>Classes will be taken by experienced petroleum engineering faculties and GATE toppers.</li>
                  <li>Updated and well researched <b>study material</b> will be provided; this study material is compact, easy to understand and very effective</li>
                  <li>Subject wise <b>4000+ practice questions</b> [200+ practice papers (MCQ/MSQ/NAQ)] to analyze the performance.</li>
                  <li>The syllabus will be covered by November, well before the examinations given sufficient time for revision</li>
                  <li>Concepts to be taught from basic level through concept building and intensive numerical problem solving.</li>
                  <li>Subject wise 4000+ practice questions [200+ practice papers (MCQ/MSQ/NAQ)] to analyze the performance.</li>
                  <li>Doubt chat facility to clear queries/doubts.</li>
                  <li>Regular doubt clearing sessions and Easy Access to the subject faculties.</li>
                  <li>Scholarships for meritorious aspirants.</li>
                  <li>Career Counseling and Motivational Sessions.</li>
                  <li>100% result-oriented classes.</li>
                  <li>User friendly interface.</li>
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