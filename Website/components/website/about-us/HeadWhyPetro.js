import Link from "next/link";
import define from 'src/json/worddefination.json'

export default function HeadWhyPetro() {
  return (
    <section className="about_us sm-mt-4">
      <div className="container">
        <div className="about_title">
          <span>About Us</span>
          <h2>Why {window.localStorage.getItem('baseTitle')}?</h2>
        </div>
        <div className="row about_content_wrapper">
        <div className="col-12 col-sm-12 col-md-7 col-lg-8">
            <div className="about_content text-justify">
              <p>Introduction of Petroleum Engineering in GATE Examination manifest the developing interest of students in this subject and the need of oil and gas industry for young Partocrats.</p>
              <p>{window.localStorage.getItem('baseTitle')} equips you with the core concepts of Petroleum Engineering thus preparing you efficiently for GATE and builds confidence and knowledge to excel in the readily changing industry trends. The industry and academic experts at {window.localStorage.getItem('baseTitle')} have made a detailed study of the GATE syllabus and pattern based on the extensive research and expertise of five years in the classroom coaching of GATE, the study material at eliveclass is developed by our well recognized subject experts. The practice problems are designed in a structured and scientific way that facilitates the students to develop a complete understanding. We coach our students from the very grass root level and this enables them to achieve the best rank in engineering exams.</p>
              <p>Considering the fact that GATE paper includes a considerable number of numerical questions, a significant weightage has been given to numerical problems to help you score high in GATE Examination.</p>
              <p>We, at eliveclass are committed to take our students to the doors of success by guiding them right from the stage of admission for GATE coaching up to PSUs Interviews/M. Tech admission in the prestigious institutes.</p>
            </div>
          </div>
          <div className="col-12 col-sm-12 col-md-5 col-lg-4 p-0">
            <div className="about_banner_down banner_about">
              <img src="/website/assets/images/banner/about_thinking_1.jpg" alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid" />
            </div>
          </div>
          
        </div>


      </div>
    </section>
  )
}