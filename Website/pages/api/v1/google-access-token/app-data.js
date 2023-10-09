
import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import moment from 'moment';
import { postOnly, createLog, googleApi, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Function to Update subject
export default async function base(req, res) {


    let startDate = req.query.startDate ? req.query.startDate : 'today'
    let endDate = req.query.endDate ? req.query.endDate : 'today'
    let dimensionQuery = req.query.dimentions ? req.query.dimentions.split(',') : (!req.query.realtime ? ['date'] : [])
    let metricsQuery = req.query.metrics ? req.query.metrics.split(',') : ['activeUsers']


    let dimentions = []
    let orderBys = []

    dimensionQuery.map(dimention => {

        dimentions.push({
            name: dimention
        })

        orderBys.push({
            dimension: {
                dimensionName: dimention
            }
        })

    })


    let metricss = []

    metricsQuery.map(metrics => {
        metricss.push({
            name: metrics
        })
    })


    // 
    let credentialsJsonPath = 'src/json/serviceAccountKey.json'

    const { BetaAnalyticsDataClient } = require('@google-analytics/data');
    const analyticsDataClient = new BetaAnalyticsDataClient({
        keyFilename: credentialsJsonPath,
    });

    var responseGa4 = null
    let data = []

    if (!req.query.realtime) {
        responseGa4 = await analyticsDataClient.runReport({
            property: `properties/${process.env.propertyID}`,
            dateRanges: [
                {
                    startDate: startDate,
                    endDate: endDate,
                },
            ],
            dimensions: dimentions,
            BetaAnalyticsDataClient: dimentions,
            metrics: metricss,
            orderBys: orderBys
        });
    } else {

        responseGa4 = await analyticsDataClient.runRealtimeReport({
            property: `properties/${process.env.propertyID}`,
            dimensions: dimentions,
            metrics: metricss,
        });


    }
    if (!req.query.count) {

        if(req.query.point){
            data = {}
        }

        if (dimensionQuery.length > 0) {

            if (responseGa4[0].dimensionHeaders && responseGa4[0].dimensionHeaders.length > 0 && !req.query.point) {

                data = [[responseGa4[0].dimensionHeaders[0].name, responseGa4[0].metricHeaders[0].name]]
            }

            if (req.query.point) {
                responseGa4[0].rows.map((row, i) => {
                    let dim = row.dimensionValues[0].value
                    data[parseInt(dim)] = parseInt(row.metricValues[0].value)
                })
            } else {
                responseGa4[0].rows.map((row, i) => {
                    let dim = row.dimensionValues[0].value
                    if (req.query.dimentions == 'date') {
                        dim = moment(dim).format('MMM DD YYYY')
                    }

                    let array = [dim, parseFloat(row.metricValues[0].value)]
                    data.push(array)
                })
            }
        } else {
            responseGa4[0].rows.map((row, i) => {
                let array = parseFloat(row.metricValues[0].value)
                data.push(array)
            })

        }

    } else {
        responseGa4[0].rows[0].metricValues.map((row, i) => {

            if (responseGa4[0].metricHeaders[i]) {

                data = {
                    ...data,
                    [`${responseGa4[0].metricHeaders[i].name}`]: parseFloat(row.value),
                }
            }
        })
    }


    //
    let statusCode = true ? 200 : 422;
    let response = {
        success: true ? true : false,
        data: data,
        responseGa4: responseGa4,
        // responseGa4RealTime: responseGa4RealTime,
    };


    // Send response
    res.status(statusCode).json(response);
}
