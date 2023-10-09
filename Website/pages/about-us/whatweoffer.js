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
                  <h1 className="mt-3">What We Offer?</h1>
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
         <h2>What We Offer?</h2>
      </div>
      <div className="row about_content_wrapper">
         <div className="col-12 col-sm-12 col-md-12 col-lg-12">
            <p className="text-justify"> ACME provides comprehensive online learning platform for MCA aspirants in India. Currently, we cater to provide various  classes MCA Entrance Preparation for NIT (NIMCET), JNU, BHU, LPU, IIT-JEE, 9th  to 12th.</p>
         </div>
      </div>
   </div>
</section>
<div className="container">
   <AppStoreFooter />
</div>
</>
) 
}