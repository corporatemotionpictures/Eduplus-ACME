import Link from "next/link";
import define from 'src/json/worddefination.json'

export default function footerAbout() {
  return (
    <section className="teamgroup sm-mt-2 mt-md-20 mb-5">
      <div className="container about_space">
        <div className="row mt-lg-5">
        <div className="col-12 col-sm-12 col-md-6 col-lg-6 ">
            <div className="teamgroup_info_wrapper">
              <div >
                <p className="text-blue">Why Choose Us</p>
              </div>
              <h2 className="section__title about_us_title">With Us,You Can Build<span className=" "> yourself<img className="blink_img" src="/website/assets/images/banner/yellow-bg.png" alt=""></img> </span><br></br>To Achieve Your Goals</h2>
              <p className="pb-2"><span > Our aim is to provide education in an unconventional & distinct learning environment in MCA Entrance for Mathematics, Computers, Reasoning, and English. As a result of our highly qualified faculty and competent teaching strategies we have been able to help our students achieve the best of the results in all of India from the last 6 years with an impressive selection rate of 80-85%. In the last 5 years, more than 400 of our students have been selected in NITs and other top universities and colleges of India for MCA.</span></p>
            <div className="footer_btn">
            <Link href="/auth/register">
                <a title="Get Started Now" className="srtarte_btn">Join Now<i class="fas fa-arrow-circle-right ml-1"></i></a>
              </Link>
              <div className="about_btn pl-3">
              <Link href="/">
                    <a title="" className="footer_about">Read More</a>
            </Link>
              </div>

            </div>
              

              
            </div>
            
          </div>
          <div className="col-12 col-sm-12 col-md-5 col-lg-5 p-0" style={{ margin:'auto' }}>
            
            <div className="teamgroup_info_banner">
              <img src="/website/assets/images/banner/why.png" alt={window.localStorage.getItem('defaultImageAlt')} style={{ height:'420px' }} className="img-fluid" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}