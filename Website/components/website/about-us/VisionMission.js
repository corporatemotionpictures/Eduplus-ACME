import Link from "next/link";
import { fetchAll } from 'helpers/apiService';
import React, { useState, useEffect } from 'react';

export default function visionMission() {

  const [teams, setTeams] = useState([])
  const [webSliders, setWebSliders] = useState([])
  const [first, setFirst] = useState(true)
  const [contactData, setContactdata] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getInnerdata() {
      if (first == true) {
        let data = await fetchAll('our-teams')
        setTeams(data.ourTeams)
        console.log("aa",data)
        setLoading(false)
      }
    }
    getInnerdata()
    setFirst(false)
    return
  }, [first])
  return (
    <section className="unlimited_possibilities" id="about_unlimited_possibilities">
      <div className="container">
        <div className="row">
          <div className="col-12 col-sm-12 col-md-12 col-lg-12">
            <div className="sub_title">
            <h2 className="section__title about_us_title">Our <span className=" ">  Team<img className="blink_img" src="/website/assets/images/banner/yellow-bg.png" alt=""></img> </span><br></br></h2>
              <p>We believe that there is a champion in every student which needs to be discovered.</p>
            </div>
          </div>
          {teams && teams.length > 0 && <div className="col-12 slided">
          {teams && teams.map(team => {
            return <>
          <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-5 flex-shrink-0">
            <div className="single_item single_item_first">
              <div className="icon_wrapper">
              <img src={team.image}></img>
              </div>
              <div class="rtin-content">
                  <h3 class="rtin-title"><a href="https://radiustheme.com/demo/wordpress/eikra/lp-profile/rosy/">{team.name}</a></h3>						
                    <div class="rtin-designation">{team.designation}</div>
                        <ul class="rtin-social">
                            <li><a href={team.contact_url} target="_blank"><img src="/images/linkedin.png"/></a></li>
                        </ul>
                    </div>
            </div>
          </div>
          </>})}
          </div>}
        </div>
      </div>
    </section>
  )
}