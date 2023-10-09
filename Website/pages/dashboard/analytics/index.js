// import  serviceAccount from 'src/json/serviceAccountKey.json'

import { fetchAll, updateAdditional, get } from 'helpers/apiService';
import { Component } from 'react';
import moment from 'moment';
import { data } from 'autoprefixer'

export default class Index extends Component {

  constructor(props) {
    super(props);

    this._isMounted = false;
    this.state = {
      ready: false,
      openTab: 'users',
      activeUsers: 0,
      minutesAgoUsers: null,
      minutesAgoDeviceCategory: null,
      openTabType: 'web',
      openTabApp: 'totalUsers',
      dates: {
        topChart: {
          startdate: '30daysAgo',
          enddate: 'today',
        },
        appTopChart: {
          startdate: '30daysAgo',
          enddate: 'today',
        },
        traficChart: {
          startdate: '30daysAgo',
          enddate: 'today',
        },
        appTraficChart: {
          startdate: '30daysAgo',
          enddate: 'today',
        },
        pageChart: {
          startdate: '30daysAgo',
          enddate: 'today',
        },
        systemChart: {
          startdate: '30daysAgo',
          enddate: 'today',
        },
        appSystemChart: {
          startdate: '30daysAgo',
          enddate: 'today',
        },
      },
      dimensions: {
        topChart: 'date',
        appTopChart: 'date',
        traficChart: 'channelGrouping',
        appTraficChart: 'sessionDefaultChannelGrouping',
        pageChart: 'pagePath',
        systemChart: 'operatingSystem',
        appSystemChart: 'operatingSystem',
      },
      success: {
        chart1: false,
        traficChart: false,
        pageChart: false,
        systemChart: false,
        appSystemChart: false,
      },
      customdate: false,
      customappsystem: false,
      customtrafichart: false,
      customtrafichartapp: false,
      customdatesystem: false,
      customappsystem: false,
    };
    this.initialize();
  }

  state = {
    cloak: null,
    avatar: null,
    loggedInUser: null,
    notifications: [],
    notifications: [],
    graphData: null,
    isNotification: false,
    accessToken: false,
    autorized: true,
    counts: {},
    appCounts: {},
  }

  url = `/dashboard/${this.props.back}`

  fetchData = async () => {


    let thisRef = this
    // // 
    gapi.analytics.ready(function () {

      fetch('/api/v1/google-access-token')
        .then(async function (response) {

          response = await response.json()

          thisRef.setState({
            accessToken: response.accessToken,
            ViewID: response.ViewID,
            analyticsDataClient: response.analyticsDataClient,
          }, () => thisRef.execute())

        });
    });
  }

  formatTime = (str) => {
    var dur = moment.duration(parseInt(str, 10), 'seconds');
    var minutes = dur.minutes();
    var seconds = dur.seconds();
    return minutes + " m " + seconds + " s";
  }


  reportData = () => {

    let startDate = this.state.dates.topChart.startdate
    let endDate = this.state.dates.topChart.enddate
    let dimention = this.state.dimensions.topChart

    let appstartDate = this.state.dates.appTopChart.startdate
    let appendDate = this.state.dates.appTopChart.enddate
    let appdimention = this.state.dimensions.appTopChart

    if (gapi.analytics.googleCharts != undefined) {

      // app 

      let thisRef = this

      let metrics = 'totalUsers,sessions,newUsers,userEngagementDuration,eventCount,screenPageViews'

      let appReport = fetch(`/api/v1/google-access-token/app-data?count=true&&startDate=${appstartDate}&&endDate=${appendDate}&&dimentions=${appdimention}&&metrics=${metrics}`)
        .then(async function (response) {

          response = await response.json()
          thisRef.setState({
            appCounts: {
              ...thisRef.state.appCounts,
              ...response.data
            }
          })


        });


      var report = new gapi.analytics.report.Data({
        query: {
          'ids': `ga:${this.state.ViewID}`, // <-- Replace with the ids value for your view.
          'metrics': 'ga:users,ga:sessions,ga:bounceRate,ga:newUsers,ga:avgSessionDuration,ga:hits,ga:screenviews',
          'start-date': startDate,
          'end-date': endDate,
          'prettyPrint': 'true',
          //  'filters': 'ga:country==IN',
        }
      });


      report.on('success', function (response) {

        // var timeFormatter = new google.visualization.DateFormat({pattern: 'H:mm:ss'});
        // timeFormatter.format(data, 2);


        thisRef.setState({
          counts: {
            totalUsers: response.totalsForAllResults['ga:users'],
            totalSessions: response.totalsForAllResults['ga:sessions'],
            totalbounceRate: response.totalsForAllResults['ga:bounceRate'],
            totalavgSessionDuration: thisRef.formatTime(response.totalsForAllResults['ga:avgSessionDuration']),
            totalnewUsers: response.totalsForAllResults['ga:newUsers'],
            totalhits: response.totalsForAllResults['ga:hits'],
            totalscreenviews: response.totalsForAllResults['ga:screenviews'],
          }
        })
      });

      report.execute()


    } else {
      this.loadGA(true)
    }
  }

  dataByDate = async (key) => {
    let startDate = this.state.dates.topChart.startdate
    let endDate = this.state.dates.topChart.enddate
    let dimention = this.state.dimensions.topChart

    if (gapi.analytics.googleCharts != undefined) {
      let thisRef = this


      if (this.state.openTabType == 'web') {
        var dataChart1 = new gapi.analytics.googleCharts.DataChart({
          query: {
            'ids': `ga:${this.state.ViewID}`, // <-- Replace with the ids value for your view.
            'start-date': startDate,
            'end-date': endDate,
            'metrics': `ga:${key}`,
            'dimensions': `ga:${dimention}`
          },
          chart: {
            'container': 'chart-1-container',
            'type': 'LINE',
            'options': {
              'width': '80%',
              'height': '90%',
            }
          }
        });

        dataChart1.on('success', function (response) {
          thisRef.setState({
            success: {
              ...thisRef.state.success,
              chart1: true
            }
          })
        });

        dataChart1.execute()

      } else {

        let metrics = key

        let appReport = fetch(`/api/v1/google-access-token/app-data?startDate=${startDate}&&endDate=${endDate}&&dimentions=${dimention}&&metrics=${metrics}`)
          .then(async function (response) {

            response = await response.json()
            google.charts.load('current', { packages: ['corechart'] });
            google.charts.setOnLoadCallback(function () {


              var table = google.visualization.arrayToDataTable(response.data);
              var options = {
                title: `${key} by ${dimention}`,
                legend: { position: 'bottom' }
              };

              var chart = new google.visualization.LineChart(document.getElementById('appTopChart'));
              chart.draw(table, options);

            });

          })
      }

      // google.charts.load('current', {
      //     'packages': ['geochart'],
      //     // Note: you will need to get a mapsApiKey for your project.
      //     // See: https://developers.google.com/chart/interactive/docs/basic_load_libs#load-settings
      //     'mapsApiKey': process.env.NEXT_PUBLIC_MAP_KEY
      // });


      // // google.charts.load('current', { packages: ['corechart'] });
      // google.charts.setOnLoadCallback(function () {




      //     var table = google.visualization.arrayToDataTable(thisRef.state.analyticsDataClient);
      //     var options = {
      //         region: 'IN',
      //         displayMode: 'markers',
      //         colorAxis: { colors: ['green', 'blue'] }
      //     };

      //     var chart = new google.visualization.GeoChart(document.getElementById('curve_chart'));
      //     chart.draw(table, options);
      // });

    } else {
      this.loadGA(true)
    }

  }

  dataByDateApp = async (key) => {
    let startDate = this.state.dates.appTopChart.startdate
    let endDate = this.state.dates.appTopChart.enddate
    let dimention = this.state.dimensions.appTopChart

    if (gapi.analytics.googleCharts != undefined) {
      let thisRef = this

      let metrics = key

      let appReport = fetch(`/api/v1/google-access-token/app-data?startDate=${startDate}&&endDate=${endDate}&&dimentions=${dimention}&&metrics=${metrics}`)
        .then(async function (response) {

          response = await response.json()
          google.charts.load('current', { packages: ['corechart'] });
          google.charts.setOnLoadCallback(function () {


            var table = google.visualization.arrayToDataTable(response.data);
            var options = {
              title: `${key} by ${dimention}`,
              legend: { position: 'bottom' },
              chartArea: {
                width: '90%',
              },
              legend: {
                position: 'bottom'
              },
              width: '80%',
              height: '100%',
              lineWidth: 4

            };

            var chart = new google.visualization.AreaChart(document.getElementById('appTopChart'));
            chart.draw(table, options);

          });

        })
    } else {
      this.loadGA(true)
    }

  }

  RealTimeDataApp = async () => {
    let dimention = 'city'

    if (gapi.analytics.googleCharts != undefined) {
      let thisRef = this

      let metrics = 'activeUsers'

      let appReport = fetch(`/api/v1/google-access-token/app-data?dimentions=${dimention}&&metrics=${metrics}&&realtime=true`)
        .then(async function (response) {
          response = await response.json()

          google.charts.load('current', {
            'packages': ['geochart'],
            'mapsApiKey': process.env.NEXT_PUBLIC_MAP_KEY
          });


          // google.charts.load('current', { packages: ['corechart'] });
          google.charts.setOnLoadCallback(function () {

            var table = google.visualization.arrayToDataTable(response.data);
            var options = {
              region: '034',
              displayMode: 'markers',
              sizeAxis: { minValue: 0, maxValue: 100 },
              colorAxis: { colors: ['#4374e0', '#78b602'] },
              enableRegionInteractivity: true,
              keepAspectRatio: true,
              legend: 'none',
              tooltip: { isHtml: true },
              // resolution: 'provinces',
              magnifyingGlass: { enable: true, zoomFactor: 2 }
            };

            var chart = new google.visualization.GeoChart(document.getElementById('curve_chart'));
            chart.draw(table, options);
          });

        });


      appReport = fetch(`/api/v1/google-access-token/app-data?metrics=${metrics}&&realtime=true`)
        .then(async function (response) {
          response = await response.json()

          thisRef.setState({
            activeUsers: response.data[0]
          })

        });

      appReport = fetch(`/api/v1/google-access-token/app-data?metrics=${metrics}&&dimentions=minutesAgo&&realtime=true&&point=true`)
        .then(async function (response) {
          response = await response.json()

          thisRef.setState({
            minutesAgoUsers: response.data
          })


          let times = Object.keys(response.data)
          let userTime = [['Min Ago', 'Users']]

          for (let i = 30; i >= 1; i--) {

            let value = 0
            if (response.data[i]) {
              value = response.data[i]
            }
            let single = [i, value]
            userTime.push(single)

          }


          google.charts.load('current', { packages: ['corechart'] });
          google.charts.setOnLoadCallback(function () {
            var table = google.visualization.arrayToDataTable(userTime);
            var options = {
              chartArea: {
                'width': '100%',
                height: '80%'
              },
              'width': '80%'
            };

            var chart = new google.visualization.ColumnChart(document.getElementById('30MinUsers'));
            chart.draw(table, options);

          });

        });

      appReport = fetch(`/api/v1/google-access-token/app-data?metrics=${metrics}&&dimentions=deviceCategory&&realtime=true`)
        .then(async function (response) {
          response = await response.json()

          thisRef.setState({
            minutesAgoUsers: response.data
          })


          google.charts.load('current', { packages: ['corechart'] });
          google.charts.setOnLoadCallback(function () {
            var table = google.visualization.arrayToDataTable(response.data);
            var options = {
              chartArea: {
                'width': '90%',
                height: '80%'
              },
              'width': '100%',
              pieHole: 0.4,
              legend: { position: 'bottom' }
            };

            var chart = new google.visualization.PieChart(document.getElementById('30MinCategory'));
            chart.draw(table, options);

          });

        });

    } else {
      this.loadGA(true)
    }

  }

  userByTrafic = () => {
    let startDate = this.state.dates.traficChart.startdate
    let endDate = this.state.dates.traficChart.enddate
    let dimention = this.state.dimensions.traficChart
    let thisRef = this

    if (gapi.analytics.googleCharts != undefined) {
      var dataChart1 = new gapi.analytics.googleCharts.DataChart({
        query: {
          'ids': `ga:${this.state.ViewID}`, // <-- Replace with the ids value for your view.
          'start-date': startDate,
          'end-date': endDate,
          'metrics': `ga:users`,
          'dimensions': `ga:${dimention}`
        },
        chart: {
          'container': 'userByTrafic',
          'type': 'PIE',
          'options': {
            chartArea: {
              'width': '80%',
              height: '70%'
            },
            'width': '80%',
            height: '90%',
            legend: { position: 'bottom' }
          }
        }
      });

      dataChart1.on('success', function (response) {
        thisRef.setState({
          success: {
            ...thisRef.state.success,
            userByTrafic: true
          }
        })
      });

      dataChart1.execute()

    } else {
      console.log('empty');
      this.loadGA(true);
    }



  }

  appUserByTrafic = () => {
    let startDate = this.state.dates.appTraficChart.startdate
    let endDate = this.state.dates.appTraficChart.enddate
    let dimention = this.state.dimensions.appTraficChart
    let thisRef = this

    if (gapi.analytics.googleCharts != undefined) {

      let metrics = 'totalUsers'

      let appReport = fetch(`/api/v1/google-access-token/app-data?startDate=${startDate}&&endDate=${endDate}&&dimentions=${dimention}&&metrics=${metrics}`)
        .then(async function (response) {

          response = await response.json()
          google.charts.load('current', { packages: ['corechart'] });
          google.charts.setOnLoadCallback(function () {
            var table = google.visualization.arrayToDataTable(response.data);
            var options = {
              chartArea: {
                'width': '90%',
                height: '70%'
              },
              'width': '90%',
              height: '90%',
              legend: { position: 'bottom' }
            };

            var chart = new google.visualization.PieChart(document.getElementById('appUserByTrafic'));
            chart.draw(table, options);

          });

        })

    } else {
      this.loadGA(true)
    }

  }

  systemChart = () => {
    let startDate = this.state.dates.systemChart.startdate
    let endDate = this.state.dates.systemChart.enddate
    let dimention = this.state.dimensions.systemChart
    let thisRef = this

    if (gapi.analytics.googleCharts != undefined) {
      var dataChart1 = new gapi.analytics.googleCharts.DataChart({
        query: {
          'ids': `ga:${this.state.ViewID}`, // <-- Replace with the ids value for your view.
          'start-date': startDate,
          'end-date': endDate,
          'metrics': `ga:users,ga:sessions`,
          'dimensions': `ga:${dimention}`
        },
        chart: {
          'container': 'systemChart',
          'type': 'PIE',
          'options': {
            chartArea: {
              'width': '80%',
              height: '70%'
            },
            'width': '80%',
            height: '90%',
            legend: { position: 'bottom' }
          }
        }
      });

      dataChart1.on('success', function (response) {
        thisRef.setState({
          success: {
            ...thisRef.state.success,
            systemChart: true
          }
        })
      });

      dataChart1.execute()

    } else {
      this.loadGA(true)
    }

  }


  appSystemChart = () => {
    let startDate = this.state.dates.appSystemChart.startdate
    let endDate = this.state.dates.appSystemChart.enddate
    let dimention = this.state.dimensions.appSystemChart
    let thisRef = this

    if (gapi.analytics.googleCharts != undefined) {

      let metrics = 'totalUsers'

      let appReport = fetch(`/api/v1/google-access-token/app-data?startDate=${startDate}&&endDate=${endDate}&&dimentions=${dimention}&&metrics=${metrics}`)
        .then(async function (response) {

          response = await response.json()
          google.charts.load('current', { packages: ['corechart'] });
          google.charts.setOnLoadCallback(function () {
            var table = google.visualization.arrayToDataTable(response.data);
            var options = {
              chartArea: {
                'width': '90%',
                height: '70%'
              },
              'width': '90%',
              height: '90%',
              legend: { position: 'bottom' }
            };

            var chart = new google.visualization.PieChart(document.getElementById('appSystemChart'));
            chart.draw(table, options);

          });

        })

    } else {
      this.loadGA(true)
    }

  }

  pageChart = () => {
    let startDate = this.state.dates.pageChart.startdate
    let endDate = this.state.dates.pageChart.enddate
    let dimention = this.state.dimensions.pageChart
    let thisRef = this

    if (gapi.analytics.googleCharts != undefined) {
      var dataChart1 = new gapi.analytics.googleCharts.DataChart({
        query: {
          'ids': `ga:${this.state.ViewID}`, // <-- Replace with the ids value for your view.
          'start-date': startDate,
          'end-date': endDate,
          'metrics': `ga:pageviews,ga:uniquePageviews,ga:timeOnPage,ga:bounces,ga:entrances,ga:exits`,
          'dimensions': `ga:${dimention}`,
          'max-results': 10
        },
        chart: {
          'container': 'pageGraph',
          'type': 'TABLE',
          'options': {
            'width': '100%',
            title: 'Campaign visits today',
            is3D: true
          }
        }
      });

      dataChart1.on('success', function (response) {
        thisRef.setState({
          success: {
            ...thisRef.state.success,
            // pageGraph: true
          }
        })
      });

      dataChart1.execute()

    } else {
      this.loadGA(true)
    }

  }


  execute = () => {



    gapi.analytics.auth.authorize({
      'serverAuth': {
        'access_token': this.state.accessToken
      },
    });

    this.setState({
      autorized: true
    })


    this.reportData();
    this.dataByDate('users');
    this.dataByDateApp('totalUsers');
    this.userByTrafic();
    this.appUserByTrafic();
    // this.pageChart();
    this.systemChart();
    this.appSystemChart();
    this.RealTimeDataApp();

  }

  loadGA(fetchAnalytics = false) {

    /* eslint-disable */
    (function (w, d, s, g, js, fs) {
      g = w.gapi || (w.gapi = {});
      g.analytics = { q: [], ready: function (f) { this.q.push(f); } };
      js = d.createElement(s); fs = d.getElementsByTagName(s)[0];
      js.src = 'https://apis.google.com/js/platform.js';
      js.id = 'googleMaps'

      fs.parentNode.insertBefore(js, fs);
      js.onload = function () {
        g.load('analytics');
      };
    }(window, document, 'script'));

    if (fetchAnalytics) {
      this.fetchData()
    }
    /* eslint-enable */
  }

  initialize() {
    if (typeof window === 'undefined') {
      return false;
    }

    console.log(document.getElementById('googleMaps'))

    if (document.getElementById('googleMaps') === null) {
      this.loadGA();
    }

    return window.gapi;
  }

  loadScript = (filename, id = null, callback) => {


    console.log(document.getElementById(id))
    if (!id || document.getElementById(id) === null) {
      var fileref = document.createElement('script');
      fileref.setAttribute("type", "text/javascript");
      fileref.onload = callback;

      if (id) {
        fileref.setAttribute('id', id)
      }
      fileref.setAttribute("src", filename);
      if (typeof fileref != "undefined") {
        document.getElementsByTagName("head")[0].appendChild(fileref)
      }
    }

  }


  componentDidMount = async () => {

    this.loadScript('https://www.google.com/jsapi')
    this.loadScript(`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_MAP_KEY}`, 'googleapis')
    this.loadScript('https://www.gstatic.com/charts/loader.js')

    this._isMounted = true;
    window.gapi.analytics.ready(() => {
      if (this._isMounted) {
        this.setState({ ready: true });
      }
    });

    this.fetchData();

  }

  render() {

    const tabs = [

      {
        index: 'users',
        title: <div>
          <p className="font-500">Users</p>
          <h5 className={!this.state.counts && 'border-shimmer p-2 br animateShimmer mt-4'}>{this.state.counts && this.state.counts.totalUsers}</h5>
        </div>,
        key: 'users',
        type: 'web'
      },
      // {
      //   index: 'newUsers',
      //   title: <div>
      //     <p className="font-500">New Users</p>
      //     <h5 className={!this.state.counts && 'border-shimmer p-2 br animateShimmer mt-4'}>{this.state.counts && this.state.counts.totalnewUsers}</h5>
      //   </div>,
      //   key: 'newUsers',
      //   type: 'web'
      // },
      {
        index: 'sessions',
        title: <div>
          <p className="font-500">Sessions</p>
          <h5 className={!this.state.counts && 'border-shimmer p-2 br animateShimmer mt-4'}>{this.state.counts && this.state.counts.totalSessions}</h5>
        </div>,
        key: 'sessions',
        type: 'web'
      },
      {
        index: 'bounceRate',
        title: <div>
          <p className="font-500">Bounce Rate</p>
          <h5 className={!this.state.counts && 'border-shimmer p-2 br animateShimmer mt-4'}>{this.state.counts && this.state.counts.totalbounceRate && parseFloat(this.state.counts.totalbounceRate).toFixed(2)}</h5>
        </div>,
        key: 'bounceRate',
        type: 'web'
      },

      {
        index: 'hits',
        title: <div>
          <p className="font-500">Hits</p>
          <h5 className={!this.state.counts && 'border-shimmer p-2 br animateShimmer mt-4'}>{this.state.counts && this.state.counts.totalhits}</h5>
        </div>,
        key: 'hits',
        type: 'web'
      },
      // {
      //   index: 'screenviews',
      //   title: <div>
      //     <p className="font-500">screenviews</p>
      //     <h5 className={!this.state.counts && 'border-shimmer p-2 br animateShimmer mt-4'}>{this.state.counts && this.state.counts.totalscreenviews}</h5>
      //   </div>,
      //   key: 'screenviews',
      //   type: 'web'
      // },
      {
        index: 'avgSessionDuration',
        title: <div>
          <p className="font-500">Avg. Session Duration</p>
          <h5 className={!this.state.counts && 'border-shimmer p-2 br animateShimmer mt-4'}>{this.state.counts && this.state.counts.totalavgSessionDuration}</h5>
        </div>,
        key: 'avgSessionDuration',
        type: 'web'
      },
    ]


    const appTabs = [
      {
        index: 'totalUsers',
        title: <div>
          <p className="font-500">Users</p>
          <h5 className={!this.state.appCounts && 'border-shimmer p-2 br animateShimmer mt-4'}>{this.state.appCounts && this.state.appCounts.totalUsers}</h5>
        </div>,
        key: 'totalUsers',
        type: 'app'
      },
      // {
      //   index: 'newUsers',
      //   title: <div>
      //     <p className="font-500">New Users</p>
      //     <h5 className={!this.state.appCounts && 'border-shimmer p-2 br animateShimmer mt-4'}>{this.state.appCounts && this.state.appCounts.newUsers}</h5>
      //   </div>,
      //   key: 'newUsers',
      //   type: 'app'
      // },
      {
        index: 'sessions',
        title: <div>
          <p className="font-500">Sessions</p>
          <h5 className={!this.state.appCounts && 'border-shimmer p-2 br animateShimmer mt-4'}>{this.state.appCounts && this.state.appCounts.sessions}</h5>
        </div>,
        key: 'sessions',
        type: 'app'
      },

      {
        index: 'eventCount',
        title: <div>
          <p className="font-500">Event Counts</p>
          <h5 className={!this.state.appCounts && 'border-shimmer p-2 br animateShimmer mt-4'}>{this.state.appCounts && this.state.appCounts.eventCount}</h5>
        </div>,
        key: 'eventCount',
        type: 'app'
      },
      // {
      //   index: 'screenPageViews',
      //   title: <div>
      //     <p className="font-500">Screen Page Views</p>
      //     <h5 className={!this.state.appCounts && 'border-shimmer p-2 br animateShimmer mt-4'}>{this.state.appCounts && this.state.appCounts.screenPageViews}</h5>
      //   </div>,
      //   key: 'screenPageViews',
      //   type: 'app'
      // },
      {
        index: 'userEngagementDuration',
        title: <div>
          <p className="font-500">Engagement Duration</p>
          <h5 className={!this.state.appCounts && 'border-shimmer p-2 br animateShimmer mt-4'}>{this.state.appCounts && this.state.appCounts.userEngagementDuration}</h5>
        </div>,
        key: 'userEngagementDuration',
        type: 'app'
      },
    ]


    return (
      <>
        <div className=" w-full relative margin-minus">
          <div className="w-full h-full overflow-auto"> <div id="curve_chart" className="w-full overflow-auto"></div></div>
          <div className=" w-full lg:w-1/4 px-2 absolute bottom-0 left-0  mb-4">
            <div className=" rounded overflow-hidden shadow-lg  box-random">

              <div className=" w-full tabs courses_tab_wrapper h-full  p-4">
                <p className="w-full text-gray-500">
                  <b>USERS IN LAST 30 MINUTES</b>
                </p>
                <h1 id="activeUsers" className="py-2">{this.state.activeUsers}</h1>

                <p className="w-full text-gray-500">
                  <b>USERS PER MINUTES</b>
                </p>

                <div id="30MinUsers" className="py-2 h-15">
                  <div className="border-shimmer p-4 ml-1 br animateShimmer mt-4"></div>
                </div>

                <p className="w-full text-gray-500">
                  <b>DEVICE CATEGORY IN LAST 30 MINUTES</b>
                </p>

                <div id="30MinCategory" className="py-2 h-35 flex justify-center items-center"><div className="profilePicIcon animateShimmer din "></div></div>

              </div>

            </div>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row lg:flex-wrap">
          {/* Web Users date  */}
          <div className=" flex flex-col lg:flex-row lg:flex-wrap mb-4 w-full min-h-40">
            <div id="chart_div"></div>

            <div className=" w-full md:w-1/2 px-2 md:pr-2 md:pl-0 h-full mb-4 md:mb-0">

              <div className=" h-full rounded overflow-hidden shadow-lg box-random">

                <div className="h-full flex flex-wrap flex-col w-full tabs courses_tab_wrapper relative ">
                  <div className="w-full border-b p-2">
                    <h5>Website Analytics</h5>
                  </div>
                  <div className=" flex-wrap flex-col w-full tabs courses_details_nav_tabs">
                    <div className="flex flex-row lg:space-x-2 nav nav-tabs w-full overflow-auto">
                      {tabs.map((tab, key) => (
                        <div key={key} className="flex-none nav-item">
                          <button
                            onClick={() => {
                              this.setState({
                                openTab: tab.index,
                                openTabType: tab.type,
                              }, () => this.dataByDate(tab.key))
                            }}
                            className={
                              this.state.openTab === tab.index && this.state.openTabType === tab.type
                                ? 'tab tab-underline capitalize tab-active nav-link active'
                                : 'tab tab-underline capitalize nav-link'
                            }
                            type="button">
                            {tab.title}
                          </button>
                        </div>
                      ))}

                    </div>

                  </div>
                  <div id="chart-1-container" className=" m-2 ">

                    <div className=" w-full h-40 items-center animateShimmer din mt-4 lg:mt-10"></div>
                  </div>
                  {this.state.success.chart1 && <div className=" nav-item m-2 relative bottom-0  w-full border-t pt-2">
                    <div className="flex">
                      <div >
                        <label className="mr-1"><b>Date Range </b></label>
                        <select className="rounded border-b-1 p-1 px-7 mr-2 font-13 bg-transparent" onChange={(e) => {

                          if (e.target.value != 'custom') {
                            this.setState({
                              dates: {
                                ...this.state.dates,
                                topChart: {
                                  ...this.state.topChart,
                                  startdate: e.target.value,
                                  enddate: 'today',
                                }
                              },
                              customdate: false,
                            }, () => {
                              this.dataByDate(this.state.openTab)
                              this.reportData()
                            })
                          } else {
                            this.setState({
                              customdate: true
                            })
                          }
                        }}>
                          <option selected={this.state.dates.topChart.startdate == 'today'} value="today">Today</option>
                          <option selected={this.state.dates.topChart.startdate == 'yesterday'} value="yesterday">Yesterday</option>
                          <option selected={this.state.dates.topChart.startdate == '7daysAgo'} value="7daysAgo">Last 7 Days</option>
                          <option selected={this.state.dates.topChart.startdate == '14daysAgo'} value="14daysAgo">Last 14 Days</option>
                          <option selected={this.state.dates.topChart.startdate == '28daysAgo'} value="28daysAgo">Last 28 Days</option>
                          <option selected={this.state.dates.topChart.startdate == '30daysAgo'} value="30daysAgo">Last 30 Days</option>
                          <option selected={this.state.dates.topChart.startdate == '90daysAgo'} value="90daysAgo">Last 90 Days</option>
                          <option selected={this.state.dates.topChart.startdate == '180daysAgo'} value="180daysAgo">Last 180 Days</option>
                          <option selected={this.state.customdate} value="custom">Custom</option>
                        </select>
                      </div>

                      {/* dimensions */}

                      <div className="float-right ml-2">
                        <label className="ml-2"><b>Dimensions </b></label>

                        <select className="rounded border-b-1 p-1 px-8 mx-2  font-13 bg-transparent " onChange={(e) => {

                          this.setState({
                            dimensions: {
                              ...this.state.dimensions,
                              topChart: e.target.value
                            },
                            customdate: false,
                          }, () => {
                            this.dataByDate(this.state.openTab)
                            this.reportData()
                          })
                        }}>
                          <option selected={this.state.dimensions.topChart == 'date'} value="date">Date</option>
                          <option selected={this.state.dimensions.topChart == 'month'} value="month">Month</option>
                          <option selected={this.state.dimensions.topChart == 'year'} value="year">Year</option>
                          <option selected={this.state.dimensions.topChart == 'day'} value="day">Day</option>
                          <option selected={this.state.dimensions.topChart == 'hour'} value="hour">Hour</option>
                          <option selected={this.state.dimensions.topChart == 'minute'} value="minute">Minute</option>
                          {/* <option selected={this.state.dimensions.topChart == 'userType'} value="userType">User Type</option>
<option selected={this.state.dimensions.topChart == 'sessionDurationBucket'} value="sessionDurationBucket">Session Duration</option> */}
                        </select>
                      </div>
                    </div>



                    {/* Custom Date Range */}

                    <div className="lg:flex ">

                      {this.state.customdate && <div>
                        <label className="mr-4">Start Date</label>
                        <input className="border-0 border-b py-1 font-13 p-0 mt-2 uppercase" type="date" onChange={(e) => {


                          this.setState({
                            dates: {
                              ...this.state.dates,
                              topChart: {
                                ...this.state.topChart,
                                startdate: e.target.value,
                              }
                            }

                          }, () => {
                            this.dataByDate(this.state.openTab)
                            this.reportData()
                          })
                        }} />
                      </div>}

                      {/* {this.state.customdate && ' -'} */}
                      {this.state.customdate && <div className="lg:ml-5">
                        <label className="md:mr-7 mr-6">End Date</label>
                        <input className="border-0 border-b py-1 font-13 p-0 mt-2 uppercase" type="date" onChange={(e) => {

                          this.setState({
                            dates: {
                              ...this.state.dates,
                              topChart: {
                                ...this.state.topChart,
                                enddate: e.target.value,
                              }
                            }
                          }, () => {
                            this.dataByDate(this.state.openTab)
                            this.reportData()
                          })
                        }} />
                      </div>}
                    </div>

                  </div>}

                </div>

              </div>
            </div>
            <div className=" w-full md:w-1/2 px-2 md:pl-2 md:pr-0 h-full mb-2 md:mb-0">
              <div className="h-full rounded overflow-hidden shadow-lg box-random">


                <div className=" h-full flex flex-wrap flex-col w-full tabs courses_tab_wrapper relative">
                  <div className="w-full border-b p-2">
                    <h5>Application Analytics</h5>
                  </div>
                  <div className="flex flex-wrap flex-col w-full tabs courses_details_nav_tabs">
                    <div className="flex  flex-row lg:space-x-2 nav nav-tabs w-full overflow-auto">
                      {appTabs.map((tab, key) => (
                        <div key={key} className="flex-none nav-item">
                          <button
                            onClick={() => {
                              this.setState({
                                openTabApp: tab.index,
                              }, () => this.dataByDateApp(tab.key))
                            }}
                            className={
                              this.state.openTabApp === tab.index
                                ? 'tab tab-underline capitalize tab-active nav-link active'
                                : 'tab tab-underline capitalize nav-link'
                            }
                            type="button">
                            {tab.title}
                          </button>
                        </div>
                      ))}

                    </div>

                  </div>
                  <div id="appTopChart" className=" m-2 ">
                    <div className=" w-full h-40 items-center animateShimmer din mt-4 lg:mt-10"></div>
                  </div>
                  {this.state.success.chart1 && <div className=" nav-item m-2 relative bottom-0  w-full border-t pt-2">
                    <div className="flex">
                      <div >
                        <label className="mr-1"><b>Date Range </b></label>
                        <select className="rounded border-b-1 p-1 px-7 mr-2 font-13 bg-transparent" onChange={(e) => {

                          if (e.target.value != 'custom') {


                            this.setState({
                              dates: {
                                ...this.state.dates,
                                appTopChart: {
                                  ...this.state.appTopChart,
                                  startdate: e.target.value,
                                  enddate: 'today',
                                }
                              },
                              customdate: false,
                            }, () => {
                              this.dataByDateApp(this.state.openTabApp)
                              this.reportData()
                            })
                          } else {
                            this.setState({
                              appcustomdate: true
                            })
                          }
                        }}>
                          <option selected={this.state.dates.appTopChart.startdate == 'today'} value="today">Today</option>
                          <option selected={this.state.dates.appTopChart.startdate == 'yesterday'} value="yesterday">Yesterday</option>
                          <option selected={this.state.dates.appTopChart.startdate == '7daysAgo'} value="7daysAgo">Last 7 Days</option>
                          <option selected={this.state.dates.appTopChart.startdate == '14daysAgo'} value="14daysAgo">Last 14 Days</option>
                          <option selected={this.state.dates.appTopChart.startdate == '28daysAgo'} value="28daysAgo">Last 28 Days</option>
                          <option selected={this.state.dates.appTopChart.startdate == '30daysAgo'} value="30daysAgo">Last 30 Days</option>
                          <option selected={this.state.dates.appTopChart.startdate == '90daysAgo'} value="90daysAgo">Last 90 Days</option>
                          <option selected={this.state.dates.appTopChart.startdate == '180daysAgo'} value="180daysAgo">Last 180 Days</option>
                          <option selected={this.state.appcustomdate} value="custom">Custom</option>
                        </select>



                      </div>




                      <div className="float-right ml-2">
                        <label className="ml-2"><b>Dimensions </b></label>

                        <select className="rounded border-b-1 p-1 px-8 mx-2  font-13 bg-transparent " onChange={(e) => {

                          this.setState({
                            dimensions: {
                              ...this.state.dimensions,
                              appTopChart: e.target.value
                            },
                            appcustomdate: false,
                          }, () => {
                            this.dataByDateApp(this.state.openTabApp)
                            this.reportData()
                          })
                        }}>
                          <option selected={this.state.dimensions.appTopChart == 'date'} value="date">Date</option>
                          <option selected={this.state.dimensions.appTopChart == 'month'} value="month">Month</option>
                          <option selected={this.state.dimensions.appTopChart == 'year'} value="year">Year</option>
                          <option selected={this.state.dimensions.appTopChart == 'day'} value="day">Day</option>
                          <option selected={this.state.dimensions.appTopChart == 'hour'} value="hour">Hour</option>
                          <option selected={this.state.dimensions.appTopChart == 'minute'} value="minute">Minute</option>
                          {/* <option selected={this.state.dimensions.topChart == 'userType'} value="userType">User Type</option>
<option selected={this.state.dimensions.topChart == 'sessionDurationBucket'} value="sessionDurationBucket">Session Duration</option> */}
                        </select>
                      </div>
                    </div>

                    <div className="lg:flex">
                      {this.state.appcustomdate && <div>
                        <label className="mr-4">Start Date</label>
                        <input className="border-0 border-b py-1 font-13 p-0 mt-2 uppercase" type="date" onChange={(e) => {


                          this.setState({
                            dates: {
                              ...this.state.dates,
                              appTopChart: {
                                ...this.state.appTopChart,
                                startdate: e.target.value,
                              }
                            }

                          }, () => {
                            this.dataByDateApp(this.state.openTabApp)
                            this.reportData()
                          })
                        }} />
                      </div>}

                      {/* {this.state.appcustomdate && ' -'} */}
                      {this.state.appcustomdate && <div className="lg:ml-5">
                        <label className="md:mr-7 mr-6">End Date</label>
                        <input className="border-0 border-b py-1 font-13 p-0 mt-2 uppercase" type="date" onChange={(e) => {

                          this.setState({
                            dates: {
                              ...this.state.dates,
                              appTopChart: {
                                ...this.state.appTopChart,
                                enddate: e.target.value,
                              }
                            }
                          }, () => {
                            this.dataByDateApp(this.state.openTabApp)
                            this.reportData()
                          })
                        }} />
                      </div>}

                    </div>
                  </div>}
                </div>

              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row mb-4 w-full min-h-20">
            <div id="chart_div"></div>

            <div className=" lg:w-1/4 px-2 md:pl-0 md:pr-2 h-full  mb-4 md:mb-0">
              <div className=" rounded overflow-hidden shadow-lg   box-random ">

                <div className="flex flex-wrap flex-col w-full tabs courses_tab_wrapper h-full relative">
                  <div className=" w-full border-b flex flex-row items-center">
                    <p className="w-1/4 py-4 pl-4"><b>Website</b></p  >

                    <select className="rounded border-b-1 py-4 px-4 mx-2 border-0  float-right customSelect w-3/4 bg-transparent" onChange={(e) => {

                      this.setState({
                        dimensions: {
                          ...this.state.dates,
                          traficChart: e.target.value
                        },
                        customtrafichart: false,
                      }, () => {
                        this.userByTrafic()

                      })
                    }}>
                      <option selected={this.state.dimensions.traficChart == 'channelGrouping'} value="channelGrouping">Channel Grouping</option>
                      <option selected={this.state.dimensions.traficChart == 'source'} value="source">Source</option>
                      <option selected={this.state.dimensions.traficChart == 'medium'} value="medium">Medium</option>
                      <option selected={this.state.dimensions.traficChart == 'sourceMedium'} value="sourceMedium">Source Medium</option>
                      <option selected={this.state.dimensions.traficChart == 'campaign'} value="campaign">Campaign</option>
                      <option selected={this.state.dimensions.traficChart == 'referralPath'} value="referralPath">Referral Path</option>
                      <option selected={this.state.dimensions.traficChart == 'userType'} value="userType">User Type</option>
                      <option selected={this.state.dimensions.traficChart == 'sessionDurationBucket'} value="sessionDurationBucket">Session Duration</option>
                    </select>
                  </div>

                  <div id="userByTrafic">
                    <div className="donut"><div className="profilePicIcon3 animateShimmer din  w-80  "></div></div>
                  </div>
                  {this.state.success.userByTrafic && <div className="flex  flex-col nav-item m-2 relative bottom-0  w-full border-t pt-2">
                    <div >
                      <label className="mr-1" ><b>Date Range </b></label>
                      <select className="rounded border-b-1 p-1 px-7 mr-2 font-13 bg-transparent" onChange={(e) => {

                        if (e.target.value != 'custom') {


                          this.setState({
                            dates: {
                              ...this.state.dates,
                              traficChart: {
                                ...this.state.traficChart,
                                startdate: e.target.value,
                                enddate: 'today',
                              }
                            },
                            customtrafichart: false,
                          }, () => {
                            this.userByTrafic()

                          })
                        } else {
                          this.setState({
                            customtrafichart: true
                          })
                        }
                      }}>
                        <option selected={this.state.dates.traficChart.startdate == 'today'} value="today">Today</option>
                        <option selected={this.state.dates.traficChart.startdate == 'yesterday'} value="yesterday">Yesterday</option>
                        <option selected={this.state.dates.traficChart.startdate == '7daysAgo'} value="7daysAgo">Last 7 Days</option>
                        <option selected={this.state.dates.traficChart.startdate == '14daysAgo'} value="14daysAgo">Last 14 Days</option>
                        <option selected={this.state.dates.traficChart.startdate == '28daysAgo'} value="28daysAgo">Last 28 Days</option>
                        <option selected={this.state.dates.traficChart.startdate == '30daysAgo'} value="30daysAgo">Last 30 Days</option>
                        <option selected={this.state.dates.traficChart.startdate == '90daysAgo'} value="90daysAgo">Last 90 Days</option>
                        <option selected={this.state.dates.traficChart.startdate == '180daysAgo'} value="180daysAgo">Last 180 Days</option>
                        <option selected={this.state.customtrafichart} value="custom">Custom</option>
                      </select>



                    </div>

                    {this.state.customtrafichart && <div>
                      <label className="mr-4">Start Date</label>
                      <input className="border-0 border-b py-1 font-13 p-0 mt-2 uppercase" type="date" onChange={(e) => {


                        this.setState({
                          dates: {
                            ...this.state.dimensions,
                            traficChart: {
                              ...this.state.traficChart,
                              startdate: e.target.value,
                            }
                          }

                        }, () => {
                          this.userByTrafic()

                        })
                      }} />
                    </div>}

                    {/* {this.state.customtrafichart && ' -'} */}
                    {this.state.customtrafichart && <div>
                      <label className="mr-6">End Date</label>
                      <input className="border-0 border-b py-1 font-13 p-0 mt-2 uppercase" type="date" onChange={(e) => {

                        this.setState({
                          dates: {
                            ...this.state.dates,
                            traficChart: {
                              ...this.state.traficChart,
                              enddate: e.target.value,
                            }
                          }
                        }, () => {
                          this.userByTrafic()

                        })
                      }} />
                    </div>}

                  </div>}
                </div>


              </div>
            </div>
            <div className=" lg:w-1/4 px-2 h-full mb-4 md:mb-0">
              <div className=" rounded overflow-hidden shadow-lg  box-random">

                <div className="flex flex-wrap flex-col w-full tabs courses_tab_wrapper h-full relative">
                  <div className=" w-full border-b flex flex-row items-center">
                    <p className="w-1/4 py-4 pl-4"><b>App</b></p  >

                    <select className="rounded border-b-1 py-4 px-4 mx-2 border-0  float-right customSelect w-3/4 bg-transparent" onChange={(e) => {

                      this.setState({
                        dimensions: {
                          ...this.state.dates,
                          appTraficChart: e.target.value
                        },
                        customtrafichartapp: false,
                      }, () => {
                        this.appUserByTrafic()

                      })
                    }}>
                      <option selected={this.state.dimensions.appTraficChart == 'sessionDefaultChannelGrouping'} value="sessionDefaultChannelGrouping">Channel Grouping</option>
                      <option selected={this.state.dimensions.appTraficChart == 'source'} value="source">Source</option>
                      <option selected={this.state.dimensions.appTraficChart == 'medium'} value="medium">Medium</option>
                      <option selected={this.state.dimensions.appTraficChart == 'firstUserCampaignName'} value="firstUserCampaignName">First User Campaign Name</option>
                      <option selected={this.state.dimensions.appTraficChart == 'userEngagementDuration'} value="userEngagementDuration">User Engagement Duration</option>
                    </select>
                  </div>

                  <div id="appUserByTrafic" className="">
                    <div className="donut"><div className="profilePicIcon3 animateShimmer din  w-80  "></div></div>
                  </div>
                  {<div className="flex flex-col nav-item m-2 relative bottom-0  w-full border-t pt-2">
                    <div >
                      <label className="mr-1" ><b>Date Range </b></label>
                      <select className="rounded border-b-1 p-1 px-7 mr-2 font-13 bg-transparent" onChange={(e) => {

                        if (e.target.value != 'custom') {


                          this.setState({
                            dates: {
                              ...this.state.dates,
                              appTraficChart: {
                                ...this.state.appTraficChart,
                                startdate: e.target.value,
                                enddate: 'today',
                              }
                            },
                            customtrafichartapp: false,
                          }, () => {
                            this.appUserByTrafic()

                          })
                        } else {
                          this.setState({
                            customtrafichartapp: true
                          })
                        }
                      }}>
                        <option selected={this.state.dates.appTraficChart.startdate == 'today'} value="today">Today</option>
                        <option selected={this.state.dates.appTraficChart.startdate == 'yesterday'} value="yesterday">Yesterday</option>
                        <option selected={this.state.dates.appTraficChart.startdate == '7daysAgo'} value="7daysAgo">Last 7 Days</option>
                        <option selected={this.state.dates.appTraficChart.startdate == '14daysAgo'} value="14daysAgo">Last 14 Days</option>
                        <option selected={this.state.dates.appTraficChart.startdate == '28daysAgo'} value="28daysAgo">Last 28 Days</option>
                        <option selected={this.state.dates.appTraficChart.startdate == '30daysAgo'} value="30daysAgo">Last 30 Days</option>
                        <option selected={this.state.dates.appTraficChart.startdate == '90daysAgo'} value="90daysAgo">Last 90 Days</option>
                        <option selected={this.state.dates.appTraficChart.startdate == '180daysAgo'} value="180daysAgo">Last 180 Days</option>
                        <option selected={this.state.customtrafichartapp} value="custom">Custom</option>
                      </select>



                    </div>

                    {this.state.customtrafichartapp && <div>
                      <label className="mr-4">Start Date</label>
                      <input className="border-0 border-b py-1 font-13 p-0 mt-2 uppercase" type="date" onChange={(e) => {


                        this.setState({
                          dates: {
                            ...this.state.dimensions,
                            appTraficChart: {
                              ...this.state.appTraficChart,
                              startdate: e.target.value,
                            }
                          }

                        }, () => {
                          this.appUserByTrafic()

                        })
                      }} />
                    </div>}

                    {/* {this.state.customtrafichartapp && ' -'} */}
                    {this.state.customtrafichartapp && <div>
                      <label className="mr-6">End Date</label>
                      <input className="border-0 border-b py-1 font-13 p-0 mt-2 uppercase" type="date" onChange={(e) => {

                        this.setState({
                          dates: {
                            ...this.state.dates,
                            appTraficChart: {
                              ...this.state.appTraficChart,
                              enddate: e.target.value,
                            }
                          }
                        }, () => {
                          this.appUserByTrafic()

                        })
                      }} />
                    </div>}

                  </div>}
                </div>

              </div>
            </div>


            <div className="lg:w-1/4 px-2 h-full  mb-4 md:mb-0">
              <div className=" rounded overflow-hidden shadow-lg   box-random ">
                <div className="flex flex-wrap flex-col w-full tabs courses_tab_wrapper h-full relative">
                  <div className=" w-full border-b flex flex-row items-center">
                    <p className="w-1/4 py-4 pl-4"><b>Website</b></p  >

                    <select className="rounded border-b-1 py-4 px-4 mx-2 border-0  float-right customSelect w-3/4 bg-transparent" onChange={(e) => {

                      this.setState({
                        dimensions: {
                          ...this.state.dimensions,
                          systemChart: e.target.value
                        },
                        customdatesystem: false,
                      }, () => {
                        this.systemChart()

                      })
                    }}>
                      <option selected={this.state.dimensions.systemChart == 'operatingSystem'} value="operatingSystem">Operating System</option>
                      <option selected={this.state.dimensions.systemChart == 'mobileDeviceBranding'} value="mobileDeviceBranding">Mobile Device Branding</option>
                      <option selected={this.state.dimensions.systemChart == 'mobileDeviceModel'} value="mobileDeviceModel">Mobile Device Model</option>
                      <option selected={this.state.dimensions.systemChart == 'deviceCategory'} value="deviceCategory">Device Category</option>
                    </select>
                  </div>

                  <div id="systemChart">
                    <div className="donut"><div className="profilePicIcon3 animateShimmer din  w-80  "></div></div>
                  </div>
                  {this.state.success.systemChart && <div className="flex flex-col nav-item m-2 relative bottom-0  w-full border-t pt-2">

                    <div >
                      <label className="mr-1"><b>Date Range </b></label>
                      <select className="rounded border-b-1 p-1 px-7 mr-2 font-13 bg-transparent" onChange={(e) => {


                        if (e.target.value != 'custom') {


                          this.setState({
                            dates: {
                              ...this.state.dates,
                              systemChart: {
                                ...this.state.systemChart,
                                startdate: e.target.value,
                                enddate: 'today',
                              }
                            },
                            customdatesystem: false,
                          }, () => {
                            this.systemChart()

                          })
                        } else {
                          this.setState({
                            customdatesystem: true
                          })
                        }
                      }}>
                        <option selected={this.state.dates.systemChart.startdate == 'today'} value="today">Today</option>
                        <option selected={this.state.dates.systemChart.startdate == 'yesterday'} value="yesterday">Yesterday</option>
                        <option selected={this.state.dates.systemChart.startdate == '7daysAgo'} value="7daysAgo">Last 7 Days</option>
                        <option selected={this.state.dates.systemChart.startdate == '14daysAgo'} value="14daysAgo">Last 14 Days</option>
                        <option selected={this.state.dates.systemChart.startdate == '28daysAgo'} value="28daysAgo">Last 28 Days</option>
                        <option selected={this.state.dates.systemChart.startdate == '30daysAgo'} value="30daysAgo">Last 30 Days</option>
                        <option selected={this.state.dates.systemChart.startdate == '90daysAgo'} value="90daysAgo">Last 90 Days</option>
                        <option selected={this.state.dates.systemChart.startdate == '180daysAgo'} value="180daysAgo">Last 180 Days</option>
                        <option selected={this.state.customdatesystem} value="custom">Custom</option>
                      </select>



                    </div>

                    {this.state.customdatesystem &&
                      <div>
                        <label className="mr-4">Start Date</label>
                        <input className="border-0 border-b py-1 font-13 p-0 mt-2 uppercase" type="date" onChange={(e) => {


                          this.setState({
                            dates: {
                              ...this.state.dates,
                              systemChart: {
                                ...this.state.systemChart,
                                startdate: e.target.value,
                              }
                            }

                          }, () => {
                            this.systemChart()

                          })
                        }} />
                      </div>}

                    {/* {this.state.customdatesystem && ' -'} */}
                    {this.state.customdatesystem && <div>
                      <label className="mr-6">End Date</label>
                      <input className="border-0 border-b py-1 font-13 p-0 mt-2 uppercase" type="date" onChange={(e) => {

                        this.setState({
                          dates: {
                            ...this.state.dates,
                            systemChart: {
                              ...this.state.systemChart,
                              enddate: e.target.value,
                            }
                          }
                        }, () => {
                          this.systemChart()

                        })
                      }} />
                    </div>}

                  </div>}
                </div>

              </div>
            </div>
            <div className="lg:w-1/4 px-2 h-full  mb-2 md:mb-0">
              <div className=" rounded overflow-hidden shadow-lg   box-random ">

                <div className="flex flex-wrap flex-col w-full tabs courses_tab_wrapper h-full relative">
                  <div className=" w-full border-b flex flex-row items-center">
                    <p className="w-1/4 py-4 pl-4"><b>App</b></p  >

                    <select className="rounded border-b-1 py-4 px-4 mx-2 border-0  float-right customSelect w-3/4 bg-transparent" onChange={(e) => {

                      this.setState({
                        dimensions: {
                          ...this.state.dimensions,
                          appSystemChart: e.target.value
                        },
                        customappsystem: false,
                      }, () => {
                        this.appSystemChart()

                      })
                    }}>
                      <option selected={this.state.dimensions.appSystemChart == 'operatingSystem'} value="operatingSystem">Operating System</option>
                      <option selected={this.state.dimensions.appSystemChart == 'mobileDeviceBranding'} value="mobileDeviceBranding">Mobile Device Branding</option>
                      <option selected={this.state.dimensions.appSystemChart == 'mobileDeviceModel'} value="mobileDeviceModel">Mobile Device Model</option>
                      <option selected={this.state.dimensions.appSystemChart == 'deviceCategory'} value="deviceCategory">Device Category</option>
                    </select>
                  </div>

                  <div id="appSystemChart">
                    <div className="donut"><div className="profilePicIcon3 animateShimmer din  w-80  "></div></div>
                  </div>
                  {<div className="flex flex-col nav-item m-2 relative bottom-0  w-full border-t pt-2">
                    <div >
                      <label className="mr-1"><b>Date Range </b></label>
                      <select className="rounded border-b-1 p-1 px-7 mr-2 font-13 bg-transparent" onChange={(e) => {

                        if (e.target.value != 'custom') {
                          this.setState({
                            dates: {
                              ...this.state.dates,
                              appSystemChart: {
                                ...this.state.appSystemChart,
                                startdate: e.target.value,
                                enddate: 'today',
                              }
                            },
                            customappsystem: false,
                          }, () => {
                            this.appSystemChart()

                          })
                        } else {
                          this.setState({
                            customappsystem: true
                          })
                        }
                      }}>
                        <option selected={this.state.dates.appSystemChart.startdate == 'today'} value="today">Today</option>
                        <option selected={this.state.dates.appSystemChart.startdate == 'yesterday'} value="yesterday">Yesterday</option>
                        <option selected={this.state.dates.appSystemChart.startdate == '7daysAgo'} value="7daysAgo">Last 7 Days</option>
                        <option selected={this.state.dates.appSystemChart.startdate == '14daysAgo'} value="14daysAgo">Last 14 Days</option>
                        <option selected={this.state.dates.appSystemChart.startdate == '28daysAgo'} value="28daysAgo">Last 28 Days</option>
                        <option selected={this.state.dates.appSystemChart.startdate == '30daysAgo'} value="30daysAgo">Last 30 Days</option>
                        <option selected={this.state.dates.appSystemChart.startdate == '90daysAgo'} value="90daysAgo">Last 90 Days</option>
                        <option selected={this.state.dates.appSystemChart.startdate == '180daysAgo'} value="180daysAgo">Last 180 Days</option>
                        <option selected={this.state.customappsystem} value="custom">Custom</option>
                      </select>



                    </div>

                    {this.state.customappsystem && <div>
                      <label className="mr-4">Start Date</label>
                      <input className="border-0 border-b py-1 font-13 p-0 mt-2 uppercase" type="date" onChange={(e) => {


                        this.setState({
                          dates: {
                            ...this.state.dates,
                            appSystemChart: {
                              ...this.state.appSystemChart,
                              startdate: e.target.value,
                            }
                          }

                        }, () => {
                          this.appSystemChart()

                        })
                      }} />
                    </div>}

                    {/* {this.state.customappsystem && ' -'} */}
                    {this.state.customappsystem && <div>
                      <label className="mr-6">End Date</label>
                      <input className="border-0 border-b py-1 font-13 p-0 mt-2 uppercase" type="date" onChange={(e) => {

                        this.setState({
                          dates: {
                            ...this.state.dates,
                            appSystemChart: {
                              ...this.state.appSystemChart,
                              enddate: e.target.value,
                            }
                          }
                        }, () => {
                          this.appSystemChart()

                        })
                      }} />
                    </div>}
                  </div>}
                </div>

              </div>
            </div>

          </div>


          <div className="flex flex-col lg:flex-row  mb-4 lg:w-1/2">
            <div id="chart_div"></div>

            <div className=" w-full mb-4 md:mb-0">

              <div className="flex flex-wrap flex-col w-full tabs courses_tab_wrapper">

                <div id="pageGraph"></div>
                {this.state.success.pageGraph && <div className="flex nav-item m-2">
                  <div >
                    <label ><b>Date Range </b></label>
                    <select className="rounded border-b-1 p-1 px-2 mr-2 font-13" onChange={(e) => {

                      if (e.target.value != 'custom') {


                        this.setState({
                          dates: {
                            ...this.state.dates,
                            pageChart: {
                              ...this.state.pageChart,
                              startdate: e.target.value,
                              enddate: 'today',
                            }
                          },
                          customdate: false,
                        }, () => {
                          this.userByTrafic()

                        })
                      } else {
                        this.setState({
                          customdate: true
                        })
                      }
                    }}>
                      <option selected={this.state.dates.pageChart.startdate == 'today'} value="today">Today</option>
                      <option selected={this.state.dates.pageChart.startdate == 'yesterday'} value="yesterday">Yesterday</option>
                      <option selected={this.state.dates.pageChart.startdate == '7daysAgo'} value="7daysAgo">Last 7 Days</option>
                      <option selected={this.state.dates.pageChart.startdate == '14daysAgo'} value="14daysAgo">Last 14 Days</option>
                      <option selected={this.state.dates.pageChart.startdate == '28daysAgo'} value="28daysAgo">Last 28 Days</option>
                      <option selected={this.state.dates.pageChart.startdate == '30daysAgo'} value="30daysAgo">Last 30 Days</option>
                      <option selected={this.state.dates.pageChart.startdate == '90daysAgo'} value="90daysAgo">Last 90 Days</option>
                      <option selected={this.state.dates.pageChart.startdate == '180daysAgo'} value="180daysAgo">Last 180 Days</option>
                      <option selected={this.state.custom} value="custom">Custom</option>
                    </select>



                  </div>

                  {this.state.customdate && <div>
                    <label>Start Date</label>
                    <input className="border-0 border-b py-1 font-13 uppercase" type="date" onChange={(e) => {


                      this.setState({
                        dates: {
                          ...this.state.dates,
                          pageChart: {
                            ...this.state.pageChart,
                            startdate: e.target.value,
                          }
                        }

                      }, () => {
                        this.userByTrafic()

                      })
                    }} />
                  </div>}

                  {this.state.customdate && ' -'}
                  {this.state.customdate && <div>
                    <label>End Date</label>
                    <input className="border-0 border-b py-1 font-13 uppercase" type="date" onChange={(e) => {

                      this.setState({
                        dates: {
                          ...this.state.dates,
                          pageChart: {
                            ...this.state.pageChart,
                            enddate: e.target.value,
                          }
                        }
                      }, () => {
                        this.userByTrafic()

                      })
                    }} />
                  </div>}
                  <div className="float-right ml-2">
                    <label className="ml-2"><b>Dimensions </b></label>

                    <select className="rounded border-b-1 p-1 px-5 mx-2  font-13 bg-transparent " onChange={(e) => {

                      this.setState({
                        dimensions: {
                          ...this.state.dates,
                          pageChart: e.target.value
                        },
                        customdate: false,
                      }, () => {
                        this.userByTrafic()

                      })
                    }}>
                      <option selected={this.state.dimensions.pageChart == 'channelGrouping'} value="channelGrouping">Channel Grouping</option>
                      <option selected={this.state.dimensions.pageChart == 'source'} value="source">Source</option>
                      <option selected={this.state.dimensions.pageChart == 'medium'} value="medium">Medium</option>
                      <option selected={this.state.dimensions.pageChart == 'sourceMedium'} value="sourceMedium">Source Medium</option>
                      <option selected={this.state.dimensions.pageChart == 'campaign'} value="campaign">Campaign</option>
                      <option selected={this.state.dimensions.pageChart == 'referralPath'} value="referralPath">Referral Path</option>
                      <option selected={this.state.dimensions.pageChart == 'userType'} value="userType">User Type</option>
                      <option selected={this.state.dimensions.pageChart == 'sessionDurationBucket'} value="sessionDurationBucket">Session Duration</option>
                    </select>
                  </div>
                </div>}
              </div>

            </div>
          </div>
        </div>


        <div className="flex flex-col lg:flex-row lg:flex-wrap">
          <div id="curve_chart" className=" w-full"></div>
          <div id="chart-5-container" className=" w-1/2"></div>
          <div id="chart-4-container" className=" w-1/2"></div>
          <div id="chart-6-container" className="lg:w-1/4"></div>
          <div id="chart-7-container" className="lg:w-1/4"></div>
          <div id="chart-8-container" className="lg:w-1/4"></div>
          <div id="chart-9-container" className="lg:w-1/4"></div>
          <div id="chart-10-container" className=" w-1/2"></div>
          <div id="chart-3-container" className=" w-1/2"></div>
          <div id="embed-api-auth-container"></div>
          <div id="chart-container"></div>
          <div id="view-selector-container"></div>

        </div>

      </>
    )
  }

}


