import Link from "next/link";

export default function SliderWhyPetro() {
  return (
    <div className="intro_wrapper intro_wrapper_2">
      <div className="container">
        <div className="row">
          <div className="col-sm-12 col-md-8 col-lg-8">
            <div className="intro_text">
              <h1>Why {window.localStorage.getItem('baseTitle')}</h1>
              <div className="pages_links">
                <Link href="/">
                  <a title="">Home</a>
                </Link>
                <Link href="/about-us">
                  <a title="">About Us</a>
                </Link>
                <Link href="/about-us/Why{window.localStorage.getItem('baseTitle')}">
                  <a title="" className="active">Why {window.localStorage.getItem('baseTitle')}</a>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}