import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { fetchAll } from 'helpers/apiService';
import { getSettings } from 'helpers/apiService';
import Razorpay from 'razorpay';
import { v4 as uuidv4 } from 'uuid';
import { getOnly, createLog, replaceUploadsArray, verifyToken, restrictedAccess, injectMethodNotAllowed, checkCoupon } from 'helpers/api';

// Function to Fetch product
export default async function base(req, res) {

    // Only allowed GET only methods
    if (!getOnly(req)) { injectMethodNotAllowed(res); return false; }

    // Later parse User from JWT-header token 
    let user = await verifyToken(req);

    let order = null
    let method = await getSettings('PaymentGatwayType');
    let keys = await getSettings('paymentGatway')

    if (method == 'Razorpay' || !user.country_prefix || user.country_prefix == '91') {
        var instance = new Razorpay({
            key_id: keys.key_id,
            key_secret: keys.key_secret,
        });

        order = await instance.orders.fetchPayments(req.query.orderID)

        console.log(order)

        order.orderID = order.items[0].notes.shopping_order_id

         //
         let statusCode = order ? 200 : 422;
         let response = {
             success: order ? true : false,
             order: order ? order : null,
             // order_id: order ? order_id : null,
         };
 
         res.status(statusCode).json(response);

    }
    else if (method == 'Paypal') {
        var paypal = require('paypal-rest-sdk');

        await paypal.configure({
            'mode': keys.paypalClientMode, //sandbox or live
            'client_id': keys.paypalClientId,
            'client_secret': keys.paypalClientSecret
        });

        await paypal.payment.get(req.query.orderID, function (error, payment) {
            if (error) {
                console.log(error);
                throw error;
            } else {
                console.log("Get Payment Response");
                console.log(JSON.stringify(payment));

                payment.status = 'captured'
                payment.captured = true
                payment.orderID = payment.transactions[0].description
                payment.method = payment.payer.payment_method


                order = {}
                order.items = [payment]


                //
                let statusCode = order ? 200 : 422;
                let response = {
                    success: order ? true : false,
                    order: order ? order : null,
                    // order_id: order ? order_id : null,
                };

                res.status(statusCode).json(response);
            }

        });


    }


   
}

