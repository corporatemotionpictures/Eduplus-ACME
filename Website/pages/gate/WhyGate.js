import Link from "next/link";
import define from 'src/json/worddefination.json'

export default function courses() {
  return (
    <>
      <header className="header_inner courses_page">
        <div className="intro_wrapper why_gate_head">
          <div className="container">
            <div className="row">
              <div className="col-sm-12 col-md-8 col-lg-8">
                <div className="intro_text">
                  <h1>Why GATE</h1>
                  <div className="pages_links">
                    <Link href="/">
                      <a title="">Home</a>
                    </Link>
                    <Link href="/">
                      <a title="" className="active">Why GATE</a>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </header>
      {/* Mid COntent Starts */}
      <section className="about_us">
        <div className="container">

          <div className="about_title mb-2">
            <span>GATE</span>
            <h2>Why GATE</h2>
          </div>

          <div className="row about_content_wrapper">
            <div className="col-12 col-sm-12 col-md-8 col-lg-8">
              <p className="text-justify">GATE today has opened new avenues for budding professionals. Gives them an opportunity to be a part of prestigious public sector undertaking (PSUs) and reputed institutes and research organizations which are renowned for their excellence. </p>
              <p className="text-justify">These are the reasons we strongly recommend petroleum engineer to appear for GATE exam</p>
              <ul>
                <li>Several reputed PSUs recruits on basis of GATE Score. i.e. ONGC. IOCL, MECL and many more in coming years</li>
                <li>M. Tech Admissions at IITs/ISM/IISc</li>
                <li>Teaching: Professor, Asst. Professor at IITs, NITs, reputed educational institutes etc.</li>
                <li>Makes you eligible for Junior Research Fellow and Senior Research Fellow on UGC and MHRD projects</li>
                <li> Candidates on qualifying GATE, get a financial aid of 12,400/- pm in the form of UGC scholarship for pursuing higher studies</li>
                <li>Gives you an opportunity to study abroad: The institutes offering Masters for GATE qualifiers are National University of Singapore (NUS), Singapore.</li>
                <li>Career in Research &amp; Development on Petroleum related projects</li>
                <li>Technical value addition to resume</li>
                <li>Expertise in subject/domain specialization</li>
              </ul>
            </div>
            <div className="col-12 col-sm-12 col-md-4 col-lg-4">
              <div className="why_gate">
                <img src="/website/assets/images/banner/gate_whygate.jpg" alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid" />
              </div>
            </div>
          </div>

        </div>
      </section>
      {/* Mid COntent Ends */}
    </>
  )
}