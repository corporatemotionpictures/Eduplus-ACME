// Replace with your view ID.
var VIEW_ID = '269732958';

// Query the API and print the results to the page.
function queryReports() {

    console.log("VIEW_ID")
    console.log(VIEW_ID)
    gapi.client.request({
        path: '/v4/reports:batchGet',
        root: 'https://analyticsreporting.googleapis.com/',
        method: 'POST',
        body: {
            reportRequests: [
                {
                    viewId: VIEW_ID,
                    dateRanges: [
                        {
                            startDate: '7daysAgo',
                            endDate: 'today'
                        }
                    ],
                    metrics: [
                        {
                            expression: 'ga:sessions'
                        }
                    ]
                }
            ]
        }
    }).then(displayResults, console.error.bind(console));
}


function displayResults(response) {

    console.log(response.result)
      var formattedJson = JSON.stringify(response.result, null, 2);


      document.getElementById('query-output').value = formattedJson;
}