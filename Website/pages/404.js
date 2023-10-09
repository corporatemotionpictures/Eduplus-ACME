import Link from 'next/link'
import define from 'src/json/worddefination.json'

const ErrorPage = () => {
  return (
    <div>
      <header className="header_inner account_page">
        <div className="intro_wrapper product_head_3 ">
          <div className="container">
            <div className="row">
              <div className="col-sm-12 col-md-8 col-lg-8">

              </div>
            </div>
          </div>
        </div>

      </header>
      <div
    
      data-layout="centered"
      className="container  justify-center   ">
        
      <div className=" flex-col w-1/2 max-w-xl text-center sm-mt-4 mt-lg-4">
        <img
          className="object-contain w-auto "
          src="/images/404.jpg"
          alt={window.localStorage.getItem('defaultImageAlt')}
        />
        
    </div>
    {/* 
        <div className="mb-8 text-center text-gray-900">
          We're sorry. The page you requested could not be found. Please go back
          to the homepage or contact us
      </div> */}
      </div>
      <div className="text-center pb-10">
        <h4 className="text-5xl text-base  font-bold text-bold">Oops!</h4>

        <div className="my-1 pb-3 text-gray">
        The page you are looking for doesn't exist.
      </div>
        {/* <p className="my-1 mb-4">The page you are looking for doesn't exist.</p> */}
        <Link href="/" className="mt-2 ">
          <a className="btn_404 ">
            Go Home
          </a>
        </Link>
      </div>
    </div>
    
  )
}

export default ErrorPage


