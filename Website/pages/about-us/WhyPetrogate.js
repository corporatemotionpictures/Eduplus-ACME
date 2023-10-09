import HeadWhyPetro from "components/website/about-us/HeadWhyPetro";
import OurInstructor from "components/website/about-us/OurInstructor";
import CounterAbout from "components/website/about-us/CounterAbout";
// import FaqAbout from "components/website/about-us/Faq_About";
import FooterAbout from "components/website/about-us/FooterAbout";
import AppStoreFooter from "components/website/AppStoreFooter";

import Link from "next/link";

export default function whyeliveclass() {
  return (
    <>
      <header className="header_inner about_page">
        <div className="intro_wrapper-2">
          <div className="container">
            <div className="row">
              <div className="col-sm-12 col-md-8 col-lg-8  ">
                
              </div>
            </div>
          </div>
        </div>
      </header>
      <HeadWhyPetro />
      {/* <OurInstructor /> */}
      
      <FooterAbout />
      <div className="container">
      {/* App Download */}
  <AppStoreFooter />
</div>
    </>
  )
}