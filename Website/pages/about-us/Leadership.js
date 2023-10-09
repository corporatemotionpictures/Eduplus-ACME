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
                  <h1 className="mt-3">Leadership</h1>
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
            <h2>Leadership</h2>
          </div>

          <div className="row about_content_wrapper">
            <div className="col-12 col-sm-12 col-md-12 col-lg-12">
              <p className="text-justify">Coming from a small village in Rajasthan, Ashok Rolaniya is a person who believes in self-created destiny and hard work. A graduate from RTU in Computer science Engineering, he worked in strings of reputed organizations for a notable time. He then decided on dedicating his time and energy to educating the young minds of the country by providing them with quality education. He has a clear vision and in-depth understanding of all the issues faced by candidates in the present era. He is thus helping the youths of the country by providing a meaningful solution to get a reputed job in Government Sector.</p>
              <p>With all the best wishes!</p>
              <p>Regards,</p>
              <h5><b>Ashok Kr Rolaniya(Founder)</b></h5>
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