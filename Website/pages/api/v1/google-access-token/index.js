import Joi from '@hapi/joi';
import { knexConnectionConfig } from 'db/knexConnection';
import { isEmptyArray } from 'formik';
import { postOnly, createLog, googleApi, injectMethodNotAllowed, validateRequestParams, verifyToken, restrictedAccess, invalidFormData } from 'helpers/api';

// Function to Update subject
export default async function base(req, res) {

    let googleApidata = await googleApi()

    //
    let statusCode = true ? 200 : 422;
    let response = {
        success: true ? true : false,
        accessToken: googleApidata.access_token,
        ViewID: process.env.VIEW_ID,
    };


    // Send response
    res.status(statusCode).json(response);
}
