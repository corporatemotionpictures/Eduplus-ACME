import Link from "next/link";

import define from 'src/json/worddefination.json'

export default function HeadWhyBrainery() {
  return (
    <section className="about_us about_spacing">
      <div className="container">
        <div className="about_title">
          <span>About Us</span>
          <h2>Why {window.localStorage.getItem('baseTitle')}?</h2>
        </div>
        <div className="row about_content_wrapper mt-3">
          <div className="col-12 col-sm-12 col-md-6 col-lg-6 p-0">
          <h5>GATE/ISRO/BARC</h5>
          <div className="about_content text-justify border-about mr-2">
              <p>• Best precise and revised content. GATE is an exam where revisions, precision and ability to approach a new question is very important, hence the video lectures are designed accordingly.</p>
              <p>• Active Doubt Support by the respective Faculties.</p>
              <p>• Learning from experienced GATE Rankers.</p>
              <p>• Course Oriented and Dedicated Video Lectures for Mechanical Engineering.</p>
              <p>• Regular Updates in Content with Latest Trends and concepts used in GATE.</p>
              <p>• PYQ’s included in App in the form of Test Modules.</p>
              <p>• Bookmarks Facility and Live Practice Sessions.</p>
              <p>• In-App Doubt Discussion.</p>
              <p>• Regular Updates in Content</p>
         
            </div>
          </div>
          <div className="col-12 col-sm-12 col-md-6 col-lg-6">
          <h5>ATC COURSE</h5>
            <div className="about_content text-justify border-about">
              <p>• Dedicated Course Pre-recorded Lectures proved very effective in ATC 2018 Exam for Maths and Physics. Thorough syllabus coverage is our Best Priority. In 2021, we had given more efforts in building the course close to your undefined ATC Syllabus.</p>
              <p>• Only Trusted course for ATC.</p>
              <p>• Test Feedbacks to improve your preparation to TOP 300 Students. This points out the important area which you need to focus in respective subjects and topic.</p>
              <p>• Important Aptitude and Reasoning Lectures are provided along with it without any cost.</p>
              <p>• More than 85% of the Questions came from our Question Bank & Test Series content in ATC 2018 Exam in Physics and Mathematics.</p>
              <p>• Learning from very experienced Faculties famous in South India.</p>
              <p>• PYQ’s included in App in the form of Test Modules.</p>
              <p>• Bookmarks Facility and Live Practice Sessions.</p>
              <p>• In-App Doubt Discussion.</p>
              <p>• Regular Updates in Content</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}