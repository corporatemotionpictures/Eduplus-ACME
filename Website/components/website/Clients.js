import define from 'src/json/worddefination.json'

export default function Clients() {
  return (
    <section className="our_sponsor">
      <div className="container">
        <div className="row">
          <div className="col-12 col-sm-12 col-md-12 col-lg-12">
            <div className="sub_title">
              <h2>Trusted To Tell Their Story</h2>
              <p></p>
            </div>
            
          </div>
          <div className="col-12 col-sm-12 col-md-12 col-lg-12">
            
            <ul className="sponsored_company_logos">
              <li>
                <img src="/website/assets/images/logos/logo-1.png" alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid  wow fadeIn" data-wow-duration="2s" data-wow-delay=".1s" />
              </li>
              <li>
                <img src="/website/assets/images/logos/logo-2.png" alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid  wow fadeIn" data-wow-duration="2s" data-wow-delay=".2s" />
              </li>
              <li>
                <img src="/website/assets/images/logos/logo-3.png" alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid  wow fadeIn" data-wow-duration="2s" data-wow-delay=".3s" />
              </li>
              <li>
                <img src="/website/assets/images/logos/logo-4.png" alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid  wow fadeIn" data-wow-duration="2s" data-wow-delay=".6s" />
              </li>
              <li>
                <img src="/website/assets/images/logos/logo-5.png" alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid  wow fadeIn" data-wow-duration="2s" data-wow-delay=".5s" />
              </li>
            </ul>

            <ul className="sponsored_company_logos sponsored_company_logos_2">
              <li>
                <img src="/website/assets/images/logos/logo-6.png" alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid  wow fadeIn" data-wow-duration="2s" data-wow-delay=".4s" />
              </li>
              <li>
                <img src="/website/assets/images/logos/logo-7.png" alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid  wow fadeIn" data-wow-duration="2s" data-wow-delay=".3s" />
              </li>
              <li>
                <img src="/website/assets/images/logos/logo-8.png" alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid  wow fadeIn" data-wow-duration="2s" data-wow-delay=".6s" />
              </li>
              <li>
                <img src="/website/assets/images/logos/logo-9.png" alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid  wow fadeIn" data-wow-duration="2s" data-wow-delay=".5s" />
              </li>
            </ul>

          </div>
        </div>
      </div>
    </section>
  )
}