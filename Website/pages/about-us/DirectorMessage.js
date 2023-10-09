import Link from "next/link";
import FooterAbout from "components/website/about-us/FooterAbout";
import AppStoreFooter from "components/website/AppStoreFooter";

export default function courses() {
  return (
    <>

<header className="header_inner about_page">
        <div className="intro_wrapper page__title-overlay">
          <div className="container">
            <div className="row">
              <div className="col-sm-12 col-md-8 col-lg-8  ">
              <div className="intro_text">
                  <h1 className="mt-3">Team Message</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

     
      <section className="about_us sm-pt-4 about_space mb-5">
        <div className="container">

          <div className="about_title mb-2">
            <span>About Us</span>
            <h2>Team Message</h2>
          </div>

          <div className="row about_content_wrapper">
            <div className="col-12 col-sm-12 col-md-12 col-lg-12">
              <p className="text-justify"> We {window.localStorage.getItem('baseTitle')} welcome you to join us (ACME ACADEMY) today and ensure your grand success as a software Engineer of tomorrow.</p>
              <p className="text-justify">We endeavor to make the best out of even mediocre students who come to us with lot of hope and trust. We believe that every student appearing at MCA Entrance Examinations cannot be an MCA stuff, but, given time, proper guidance and practice, he can definitely crack MCA Entrance Examinations.</p>
              <p className="text-justify">At the same time, he can improve his performance and succeed with better ranks at various reputed MCA Entrance Examinations such as NIMCET, JNU MCA, DU MCA, HCU, IPU , Pune University MCA, BHU MCA, CG Pre MCA, MAH-MCA, VIT-MCA , BIT-MCA , LPU-MCA , ICET , TANCET etc.</p>
              <p>With all the best wishes!</p>
              <h5><b>Team ACME</b></h5>
            </div>
           
          </div>

        </div>
      </section>
      

      <div className="container">
      {/* App Download */}
  <AppStoreFooter />
</div>
    </>
  )
}