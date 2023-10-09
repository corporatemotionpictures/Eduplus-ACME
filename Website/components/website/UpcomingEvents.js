import Link from "next/link";
import define from 'src/json/worddefination.json'

export default function UpcomingEvents() {
  return (
    <section className="events-area">
      <div className="container">
        <div className="row">
          <div className="col-12 col-sm-12 col-md-12 col-lg-12">
            <div className="event_title_wrapper">
              <div className="sub_title">
                <h2>Our Upcoming Events</h2>
                <p></p>
              </div>
              {/* <!-- ends: .section-header --> */}
              <div className="envent_all_view">
                <Link href="/">
                  <a title="">View All</a>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-12 events_full_box">
            <div className="events_single">
              <div className="event_banner">
                <Link href="/">
                  <a><img src="/website/assets/images/events/event_1.jpg" alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid" /></a>
                </Link>
              </div>
              <div className="event_info">
                <h3>
                  <Link href="/">
                    <a title="">
                      OneNote for Windows 10 Essential<br /> Training
                    </a>
                  </Link>
                </h3>
                <div className="events_time">
                  <span className="time"><i className="flaticon-clock-circular-outline"></i>8.00 Am - 5.00 Pm</span>
                  <span><i className="fas fa-map-marker-alt"></i>Hall - A | Broklyn Audiitorium</span>
                </div>
                <p>Lorem ipsum dolor sit amet mollis dapibus arcur donec viverra to phasellus<br /> eget. Etiam maecenas vel vici quis dictum rutrum nec nisi et. Ac pena<br /> tibus aenean laoreet.</p>
                <div className="event_dete">
                  <span className="date">09</span>
                  <span>Jan</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-sm-12 events_full_box">
            <div className="events_single events_single_left">
              <div className="event_info">
                <h3>
                  <Link href="/">
                    <a title="">Magazine Design Start to Finish:<br /> The Inside Pages</a>
                  </Link>
                </h3>
                <div className="events_time">
                  <span className="time"><i className="flaticon-clock-circular-outline"></i>8.00 Am - 5.00 Pm</span>
                  <span><i className="fas fa-map-marker-alt"></i>Hall - A | Broklyn Audiitorium</span>
                </div>
                <p>Lorem ipsum dolor sit amet mollis dapibus arcur donec viverra to phasellus<br /> eget. Etiam maecenas vel vici quis dictum rutrum nec nisi et. Ac pena<br /> tibus aenean laoreet.</p>
              </div>
              <div className="event_banner">
                <Link href="/">
                  <a><img src="/website/assets/images/events/event_2.jpg" alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid" /></a>
                </Link>
              </div>
              <div className="event_dete">
                <span className="date">15</span>
                <span>Jan</span>
              </div>
            </div>
          </div>

          <div className="col-sm-12 events_full_box">
            <div className="events_single">
              <div className="event_banner">
                <Link href="/">
                  <a><img src="/website/assets/images/events/event_3.jpg" alt={window.localStorage.getItem('defaultImageAlt')} className="img-fluid" /></a>
                </Link>
              </div>
              <div className="event_info">
                <h3>
                  <Link href="/">
                    <a title="">Robotic Process Automation Tech<br /> Primer</a>
                  </Link>
                </h3>
                <div className="events_time">
                  <span className="time"><i className="flaticon-clock-circular-outline"></i>8.00 Am - 5.00 Pm</span>
                  <span><i className="fas fa-map-marker-alt"></i>Hall - A | Broklyn Audiitorium</span>
                </div>
                <p>Lorem ipsum dolor sit amet mollis dapibus arcur donec viverra to phasellus<br /> eget. Etiam maecenas vel vici quis dictum rutrum nec nisi et. Ac pena<br /> tibus aenean laoreet.</p>
                <div className="event_dete">
                  <span className="date">20</span>
                  <span>Jan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}