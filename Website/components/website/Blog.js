import Link from "next/link";
import define from 'src/json/worddefination.json'

export default function Blog() {
  return (
    <section className="blog">
      <div className="container">
        <div className="row">
          <div className="col-12 col-sm-12 col-md-12 col-lg-12">
            <div className="sub_title">
              <h2>Our Latest Blog</h2>
              <p></p>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-4 col-lg-4">
            <div className="single_item single_item_first">
              <div className="blog-img">
                <Link href="/blogs/BlogDetails"  as="/blogs/BlogDetails">
                  <a title=""><img src="/website/assets/images/blog/blog_1.jpg" alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid" /></a>
                </Link>
              </div>
              <div className="blog_title">
                <span>LeaderShip Development</span>
                <h3>
                  <Link href="/blogs/BlogDetails"  as="/blogs/BlogDetails">
                    <a title="">How to Become Master In <br />CSS within qa Week.</a>
                  </Link>
                </h3>
                <div className="post_bloger">
                  <span>15/02/2018 - By </span> <span className="bloger_name"> James Colins</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-4 col-lg-4">
            <div className="single_item single_item_center">
              <div className="blog-img">
                <Link href="/blogs/BlogDetails"  as="/blogs/BlogDetails">
                  <a title=""><img src="/website/assets/images/blog/blog_2.jpg" alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid" /></a>
                </Link>
              </div>
              <div className="blog_title">
                <span>LeaderShip Development</span>
                <h3><Link href="/blogs/BlogDetails"  as="/blogs/BlogDetails"><a title="">Students work together to <br />solve a problem.</a></Link></h3>
                <div className="post_bloger">
                  <span>15/02/2018 - By </span> <span className="bloger_name"> Jhon Deo</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-4 col-lg-4">
            <div className="single_item single_item_last">
              <div className="blog-img">
                <Link href="/blogs/BlogDetails"  as="/blogs/BlogDetails">
                  <a title=""><img src="/website/assets/images/blog/blog_3.jpg" alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid" /></a>
                </Link>
              </div>
              <div className="blog_title">
                <span>LeaderShip Development</span>
                <h3>
                  <Link href="/blogs/BlogDetails"  as="/blogs/BlogDetails">
                    <a title="">How to Become Master In <br />CSS within qa Week.</a>
                  </Link>
                </h3>
                <div className="post_bloger">
                  <span>15/02/2018 - By </span> <span className="bloger_name"> Simon Stain</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}