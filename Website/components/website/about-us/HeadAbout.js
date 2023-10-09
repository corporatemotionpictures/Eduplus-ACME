import Link from "next/link";
import define from 'src/json/worddefination.json'

export default function aboutHead() {
  return (
    <section className="about_us about_banner ">
      <div className="container">

        <div className="row ">
          <div className="col-12 col-sm-10 col-md-5 col-lg-5 lg-pl-20">

            <div className="banner_about ">
              <img src="/website/assets/images/banner/about.jpg" alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid" />
            </div>
            <div className="banner_about_2 col-sm-5 col-md-7 col-lg-7  ">
              <img src="/website/assets/images/banner/about-banner.jpg" alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid" />
            </div>
            


          </div>
          <div className="col-12 col-sm-12 col-md-7 col-lg-6 lg-pl-20">
            <div className="">

              <h2 className="section__title about_us_title sm-pt-4 mb-2">About<span className=" "> ACME<img className="blink_img" src="/website/assets/images/banner/yellow-bg.png" alt=""></img></span><span class="title_color"></span></h2>
            </div>

            <p className="text-justify">{window.localStorage.getItem('baseTitle')} is established to prepare the students for various MCA Entrance Examinations held throughout the country. ACME ACADEMY for MCA Entrance Examinations run under complete control of KARTIKEY PANDEY( a PHD scholar and young professional from NIT Raipur) was launched in the year 2015. ACME ACADEMY has been imparting guidance for MCA Entrance Examinations to students from all over states of Chhattisgarh, M.P, Orissa, West Bengal, Bihar, Jharkhand, etc<br/>
            This has been possible because of our excellent results year after year at various MCA Entrance Examinations. Within a short span it has achieved the status of undisputed leader in the country in the field of preparing students for MCA Entrance Examinations.</p>
            <div className="pt-1">
              <a href="/courses" className="e-btn e-btn-border" type="submit">Apply Now<i class="fas fa-arrow-circle-right ml-1"></i></a>
            </div>

          </div>

        </div>

        {/* <div className="row about_content_wrapper">
          <div className="col-12 col-sm-12 col-md-5 col-lg-5 p-0">
            <div className="about_banner_down">
              <img src="/website/assets/images/banner/about_thinking.jpg" alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid" />
            </div>
          </div>
          <div className="col-12 col-sm-12 col-md-7 col-lg-7">
            <div className="about_content">
              <p>We believe that there is a champion in every student which needs to be discovered. {window.localStorage.getItem('baseTitle')} endeavors to discover the hidden champions and so it brings together the most renowned faculty, the most comprehensive course material and the best teaching methodology. This academy assures you to provide the best facilities and homely environment so that you yourself can explore the best out of you.</p>
              <p>Therefore, we believe in the proverb “Together we will make a difference”.</p>
              <Link href="/">
                <a title="">Read More About Us <i className="fas fa-angle-right"></i></a>
              </Link>
            </div>
          </div>
        </div> */}
      </div>
    </section>
  )
}