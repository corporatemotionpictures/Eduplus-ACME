import HeadWhyBrainery from "components/website/about-us/HeadWhyBrainery";
import OurInstructor from "components/website/about-us/OurInstructor";
import CounterAbout from "components/website/about-us/CounterAbout";
// import FaqAbout from "components/website/about-us/Faq_About";
import FooterAbout from "components/website/about-us/FooterAbout";

import Link from "next/link";

import define from 'src/json/worddefination.json'

export default function whyBrainery() {
  return (
    <>
      <header className="">
        <div className="intro_wrapper director_msg_head">
          <div className="container">
            <div className="row">
              <div className="col-sm-12 col-md-8 col-lg-8">
             
              </div>
            </div>
          </div>
        </div>
      </header>
      <HeadWhyBrainery />
      <CounterAbout />
      <FooterAbout />
    </>
  )
}