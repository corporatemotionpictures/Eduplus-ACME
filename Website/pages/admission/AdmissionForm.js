import Link from "next/link";

export default function courses() {
  return (
    <>
        <header className="header_inner courses_page">
          <div className="intro_wrapper admission_page">
            <div className="container">
              <div className="row">
                <div className="col-sm-12 col-md-8 col-lg-8">
                  <div className="intro_text">
                    <h1>Admission Form</h1>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
      {/* Contact page content starts */}
      <section className="contact_info_wrapper">
        <div className="container">
          <div className="admission_form">

            <div className="col-12 col-sm-12 col-md-12 col-lg-12">
              <div className="contact_form_wrapper">
                {/* <h3 className="title mb-0">Admission Form</h3> */}

                <div className="leave_comment">
                  <div className="contact_form">
                    <form action="#">
                      <div className="row">
                        <h5 className="mb-2 pl-3 font-saffron"><strong>Personal Information:</strong></h5>

                        <div className="col-12 col-sm-12 col-md-12 form-group">
                          <label><b>Name:</b></label>
                          <input type="text" className="form-control" placeholder="Your Name" />
                        </div>

                        <div className="col-12 col-sm-12 col-md-6 form-group">
                          <label><b>Date of Birth:</b></label>
                          <input type="date" className="form-control" placeholder="Your Date of Birth" />
                        </div>

                        <div className="col-12 col-sm-12 col-md-6 form-group">
                          <label><b>E-Mail:</b></label>
                          <input type="email" className="form-control" placeholder="Your E-mail" />
                        </div>

                        <div className="col-12 col-sm-12 col-md-4 form-group">
                          <label><b>Gender:</b></label>
                          <select className="form-control" id="selectGender">
                            <option>Male</option>
                            <option>Female</option>
                            <option>Transgender</option>
                          </select>
                        </div>

                        <div className="col-12 col-sm-12 col-md-4 form-group">
                          <label><b>Category:</b></label>
                          <input type="text" className="form-control" placeholder="Your Category" />
                        </div>

                        <div className="col-12 col-sm-12 col-md-4 form-group">
                          <label><b>Photo:</b></label>
                          <div className="custom-file">
                            <input type="file" className="custom-file-input" id="inputPhoto" />
                            <label className="custom-file-label">Choose file</label>
                          </div>
                        </div>
                      </div>

                      <p className="border-bottom"></p>

                      <div className="row">

                        <h5 className="mb-2 pl-3 font-saffron"><strong>Address for Communication:</strong></h5>

                        <div className="col-12 col-sm-12 col-md-12 form-group">
                          <label><b>Address:</b></label>
                          <textarea className="form-control" id="address" placeholder="Write your Address Here ..."></textarea>
                        </div>

                        <div className="col-12 col-sm-12 col-md-4 form-group">
                          <label><b>City:</b></label>
                          <input type="text" className="form-control" placeholder="Your City Name" />
                        </div>

                        <div className="col-12 col-sm-12 col-md-4 form-group">
                          <label><b>State:</b></label>
                          <input type="text" className="form-control" placeholder="Your State Name" />
                        </div>

                        <div className="col-12 col-sm-12 col-md-4 form-group">
                          <label><b>PIN:</b></label>
                          <input type="text" className="form-control" placeholder="Your PIN" />
                        </div>

                        <div className="col-12 col-sm-12 col-md-6 form-group">
                          <label><b>Mobile No.:</b></label>
                          <input type="text" className="form-control" placeholder="Your Mobile No." />
                        </div>

                        <div className="col-12 col-sm-12 col-md-6 form-group">
                          <label><b>WhatsApp No.:</b></label>
                          <input type="text" className="form-control" placeholder="Your Whats App No." />
                        </div>

                        <div className="col-12 col-sm-12 col-md-12 form-group">
                          <label><b>Father's Name:</b></label>
                          <input type="text" className="form-control" placeholder="Your Father's Name" />
                        </div>

                        <div className="col-12 col-sm-12 col-md-4 form-group">
                          <label><b>Father's Occupation:</b></label>
                          <input type="text" className="form-control" placeholder="Your Father's Occupation" />
                        </div>

                        <div className="col-12 col-sm-12 col-md-4 form-group">
                          <label><b>Mobile No.:</b></label>
                          <input type="text" className="form-control" placeholder="Your Father's Mobile No." />
                        </div>

                        <div className="col-12 col-sm-12 col-md-4 form-group">
                          <label><b>E-Mail ID:</b></label>
                          <input type="email" className="form-control" placeholder="Your Father's E-Mail ID" />
                        </div>
                      </div>

                      <p className="border-bottom"></p>

                      <div className="row">

                        <h5 className="mb-2 pl-3 font-saffron"><strong>Academic Information:</strong></h5>

                        <div className="col-12 col-sm-12 col-md-12 form-group">
                          <table className="table table-bordered">
                            <thead>
                              <tr>
                                <th scope="col-1">#</th>
                                <th scope="col-2">Degree</th>
                                <th scope="col-5">Name of the Institute</th>
                                <th scope="col-2">Year of Passing</th>
                                <th scope="col-2">CGPA Marks</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <th scope="row">1.</th>
                                <td>M.Tech</td>
                                <td><input type="text" className="form-control" id="" placeholder="" /></td>
                                <td><input type="text" className="form-control" id="" placeholder="" /></td>
                                <td><input type="text" className="form-control" id="" placeholder="" /></td>
                              </tr>
                              <tr>
                                <th scope="row">2.</th>
                                <td>B.Tech</td>
                                <td><input type="text" className="form-control" id="" placeholder="" /></td>
                                <td><input type="text" className="form-control" id="" placeholder="" /></td>
                                <td><input type="text" className="form-control" id="" placeholder="" /></td>
                              </tr>
                              <tr>
                                <th scope="row">3.</th>
                                <td>12th</td>
                                <td><input type="text" className="form-control" id="" placeholder="" /></td>
                                <td><input type="text" className="form-control" id="" placeholder="" /></td>
                                <td><input type="text" className="form-control" id="" placeholder="" /></td>
                              </tr>
                              <tr>
                                <th scope="row">4.</th>
                                <td>10th</td>
                                <td><input type="text" className="form-control" id="" placeholder="" /></td>
                                <td><input type="text" className="form-control" id="" placeholder="" /></td>
                                <td><input type="text" className="form-control" id="" placeholder="" /></td>
                              </tr>
                            </tbody>
                          </table>

                          <p className="border-bottom"></p>

                          <div className="row">

                            <div className="col-12 col-sm-12 col-md-4 form-group">

                              <label><b>Program Name:</b></label>
                              <div className="form-check">
                                <input className="form-check-input" type="radio" value="option1" />
                                <label className="form-check-label font-saffron">
                                  <b>INTENSIVE CLASS ROOM PROGRAM (ICP)</b>
                                </label>
                              </div>

                              <div className="form-check">
                                <input className="form-check-input" type="radio" value="option2" />
                                <label className="form-check-label font-saffron">
                                  <b>ONLINE LECTURE SERIES (OLS)</b>
                                </label>
                              </div>

                            </div>

                            <div className="col-12 col-sm-12 col-md-3 form-group">

                              <label><b>Batch Preference:</b></label>
                              <div className="form-check">
                                <input className="form-check-input" type="radio" value="option1" />
                                <label className="form-check-label">
                                  Explorer
                                </label>
                              </div>

                              <div className="form-check">
                                <input className="form-check-input" type="radio" value="option2" />
                                <label className="form-check-label">
                                  Developer
                                </label>
                              </div>

                              <div className="form-check">
                                <input className="form-check-input" type="radio" value="option3" />
                                <label className="form-check-label">
                                  Producer
                                </label>
                              </div>

                            </div>

                            <div className="col-12 col-sm-12 col-md-5 form-group">

                              <label><b>Have you attemped GATE-2020 Exam (if YES give details):</b></label>
                              <div className="form-check">
                                <input className="form-check-input" type="radio" value="option1" />
                                <label className="form-check-label">
                                  Yes
                                </label>
                              </div>

                              <div className="form-check">
                                <input className="form-check-input" type="radio" value="option2" />
                                <label className="form-check-label">
                                  No
                                </label>
                              </div>

                            </div>

                          </div>

                          <p className="border-bottom"></p>

                          <div className="row">

                            <div className="col-12 col-sm-12 col-md-6 form-group">
                              <label><b>GATE Rank:</b></label>
                              <input type="text" className="form-control" placeholder="GATE Rank" />
                            </div>

                            <div className="col-12 col-sm-12 col-md-6 form-group">
                              <label><b>GATE Score:</b></label>
                              <input type="text" className="form-control" placeholder="GATE Score" />
                            </div>

                          </div>

                        </div>

                        <div className="col-12 col-sm-12 col-md-12 submit-btn text-center">
                          <button type="submit" className="text-center mt-0">CONFIRM</button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Contact page content ends */}
    </>
  )
}