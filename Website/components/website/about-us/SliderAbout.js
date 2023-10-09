import Link from "next/link";

export default function aboutSlider() {
  return (
    <div className="intro_wrapper">
      <div className="container">
        <div className="row">
          <div className="col-sm-12 col-md-8 col-lg-8">
            <div className="intro_text">
              <h1>About Us</h1>
              <div className="pages_links">
                <Link href="/">
                  <a title="">Home</a>
                </Link>
                <Link href="/about-us">
                  <a title="" className="active">About Us</a>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}