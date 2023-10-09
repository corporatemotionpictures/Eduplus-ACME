import React, { useState, useEffect } from 'react';
import { fetchAll } from 'helpers/apiService';
import define from 'src/json/worddefination.json'

import Link from "next/link";

export default function whyBrainery() {

  const [faqs, setFaqs] = useState([])
  const [first, setFirst] = useState(true)

  // Call first time when component rander
  useEffect(() => {
    async function getInnerdata() {
      if (first == true) {
        var faqList = await fetchAll('faqs', { forWeb: true })
        setFaqs(faqList.faqs)
      }
    }
    getInnerdata()

    setFirst(false)
    return
  }, [first])

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
      <section className="faq_about faq_space">
        <div className="container">
          <div className="row">
            <div className="col-12 col-sm-12 col-md-12 col-lg-12">
              <h3 className="text-center font-faq mb-3">Frequently Asked Questions</h3>
              <hr className="mb-4 mt-2"></hr>
            </div>
          </div>
          <div className="row">
            <div className="col-12 col-sm-12 col-md-12 col-lg-12 faq_adjust">
              <div className="faq_wrapper">
                {
                  faqs && faqs.map((faq, index) => {
                    return <div className="single_faq">
                      <h3><span>{index + 1}</span>{faq.question}</h3>
                      <p>{faq.answer}</p>
                    </div>
                  })
                }
              </div>
            </div>
          </div>

        </div>

      </section>


      <div className="container">
        {/* App Download */}
        <div className="rs-download-app md-pt-30 md-pb-30">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6 md-mb-40">
                <div className="img-part" style={{ marginBottom: "-15px" }}>
                  <img src="/website/assets/images/download/m-app.png" alt={window.localStorage.getItem('defaultImageAlt')} />
                </div>
              </div>
              <div className="col-lg-6 md-pl-15">
                <div className="sec-title3 mb-30">
                  <div className="sub-title">Download the Android Mobile App</div>
                  <h2 className=" title new-title">Learn Anytime, Anywhere</h2>
                  <div className="desc big text-justify mt-3">{window.localStorage.getItem('baseTitle')} Mobile app is specially designed for GATE/ ISRO/ BARC/ SSC-JE (Mechanical Engineering)/ PGCET and Other PSUs exam. You can access free courses in app or buy premium content. <br></br>Fast, simple & Delightful. <br></br>All it takes is 30 seconds to Download.</div>
                </div>
                <div className="mobile-img">
                  <div className="apps-image pr-2 sm-pr-5 mt-4">
                    <Link href="">
                      <a>
                        <img src="/website/assets/images/download/play.png" style={{ width: '200px' }} alt={window.localStorage.getItem('defaultImageAlt')} />
                      </a>
                    </Link>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}