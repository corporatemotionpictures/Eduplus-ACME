// import Preloader from "components/Preloader";
import Link from "next/link";
import TopBar from "components/website/TopBar";
import PopularCourses from "components/website/PopularCourses";
import OurCourses from "components/website/OurCourses";
import MidContent from "components/website/MidContent";
// import UpcomingEvents from "components/website/Upcoming_Events";
import Blog from "components/website/Blog";
import Slider from "components/website/Slider";
// import MeanMenu from "components/website/MeanMenu";


export default function Home() {
  return (

    <div>

      <Slider />
      {/* <MeanMenu /> */}
      <PopularCourses />

      <div className="col-12 col-sm-12 col-md-12 col-lg-12 mt-5">
        <div className="sub_title">
          <h2>Our Popular Courses</h2>
          <p></p>
        </div>
        {/* <!-- ends: .section-header --> */}
      </div>
      <OurCourses divclass="w-20" preFilter={{ limit: 5 }} />
      <MidContent />

      {/* <UpcomingEvents /> */}
      {/* <Blog /> */}
      {/* <Clients /> */}


    </div>
  )
}