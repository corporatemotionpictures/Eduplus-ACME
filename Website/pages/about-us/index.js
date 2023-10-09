import HeadAbout from "components/website/about-us/HeadAbout";
import VisionMission from "components/website/about-us/VisionMission";
import RegisterAbout from "components/website/about-us/RegisterAbout";
import FooterAbout from "components/website/about-us/FooterAbout";
import AppStoreFooter from "components/website/AppStoreFooter";

import Link from "next/link";

export default function about() {
  return (
    <>

      <header className="header_inner about_page">
        <div className="intro_wrapper page__title-overlay">
          <div className="container">
            <div className="row">
              <div className="col-sm-12 col-md-8 col-lg-8  ">
                <div className="intro_text">
                  <h1 >About Us</h1>
                  <span>
                  <Link href="/">
                    <a title="Get Started Now" className="">Home </a>
                    </Link>
                  </span>
                  <span> /  </span>
                  <span>About</span>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <HeadAbout />
      <VisionMission />
      <RegisterAbout />
      <FooterAbout />
      <div className="container">
      {/* App Download */}
  <AppStoreFooter />
</div>
    </>
  )
}