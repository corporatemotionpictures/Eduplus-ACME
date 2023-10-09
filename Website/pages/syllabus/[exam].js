import Link from "next/link";
import React, { useState, useEffect } from 'react';
import { get, updateAdditional } from 'helpers/apiService';
import { useRouter } from "next/router";

export default function courses() {

  const [filters, setFilters] = useState({})
  const [syllabus, setSyllabus] = useState({})
  const [first, setFirst] = useState(true)

  const { query } = useRouter();

  // Call first time when component rander
  useEffect(() => {
    async function getInnerdata() {
      if (first == true) {

        let data = await get(`exams/slug?slug=${query.exam}`)
        let id = data.exam ? data.exam.id : null


        let preFilter = {
          offLimit: true,
          examID: id
        }

        setFilters(preFilter)

        var syllabusList = await get('syllabus/subject-wise', preFilter)
        setSyllabus(syllabusList.syllabus)
      }
    }

    getInnerdata()

    setFirst(false)
    return
  }, [first])


  return (
    <>
      {
        syllabus && <>
          <header className="header_inner courses_page">
            <div className="intro_wrapper gate_syllabus_head">
              <div className="container">
                <div className="row">
                  <div className="col-sm-12 col-md-8 col-lg-8">
                    <div className="intro_text">
                      <h1>{syllabus.name} Syllabus</h1>

                    </div>
                  </div>
                </div>
              </div>
            </div>

          </header>
          {/* Mid Content Starts */}
          <section className="about_us gate_syllabus">
            <div className="container">

              <div className="about_title mb-2">
                <span>{syllabus.name}</span>
                {/* <h2>{syllabus.name}-2021 - Syllabus for Mechanical Engineering</h2> */}
              </div>
              {syllabus.courses && syllabus.courses.map(course => {
                return <>
                  <div className="about_title mb-2">
                    {/* <span>{syllabus.name}</span> */}
                    <h2>{syllabus.name}-2021 - Syllabus for {course.name}</h2>
                  </div>
                  {
                    course.subjects && course.subjects.map(subject => {
                      return <>
                        {
                          subject.chapters && subject.chapters.length > 0 && <>

                            <h5 className="font-saffron mb-2"><strong>Syllabus for {subject.name}</strong></h5>

                            <div className="table-responsive">
                              <table className="table table-bordered table-striped table-hover">
                                <thead>
                                  <tr>
                                    <th><strong>#</strong></th>
                                    <th><strong>Chapter</strong></th>
                                    <th><strong>Topics</strong></th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {
                                    subject.chapters.map(chapter => {
                                      return chapter.topics && chapter.topics.length > 0 &&
                                        <tr>
                                          <td><strong>1.</strong></td>
                                          <td><strong>{chapter.name}</strong></td>
                                          <td>{
                                            chapter.topics && chapter.topics.map((topic, i) => {
                                              return i > 0 ? `, ${chapter.topics}` : chapter.topics
                                            })
                                          }</td>
                                        </tr>
                                    })
                                  }
                                </tbody>
                              </table>
                            </div></>
                        }




                      </>
                    })
                  }
                </>
              })
              } </div>
          </section>
          {/* Mid Content Ends */}
        </>
      }
    </>
  )
}