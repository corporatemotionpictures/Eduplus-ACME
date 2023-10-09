import fetch from 'isomorphic-unfetch';
import { getToken } from 'helpers/auth';
import FormData from 'isomorphic-form-data';
import Router from 'next/router';
import { getConfig } from 'helpers/config';
import { Vimeo } from 'vimeo';

// Assign API Url const 
export const domainUrl = process.env.NEXT_PUBLIC_DOMAIN_URL;
export const apiUrl = domainUrl.concat("/api/v1");


let vimeoAuth = getConfig('vimeoAuth');

let CLIENT_ID = vimeoAuth.CLIENT_ID;
let CLIENT_SECRET = vimeoAuth.CLIENT_SECRET;
let ACCESS_TOKEN = vimeoAuth.ACCESS_TOKEN;

// let file_name = req.file.getRealPath()  

const client = new Vimeo(CLIENT_ID, CLIENT_SECRET, ACCESS_TOKEN);

export async function addVideoLive() {

    client.request({
        method: 'POST',
        path: 'me/videos',
        body: {
            'upload': { "approach": "live" },
        },
        headers: {
            'Content-Type': '	application/json',
            'Accept': 'application/vnd.vimeo.*+json;version=3.4',
            'Authorization' : 'bearer' + ACCESS_TOKEN
        }
    },
        function (error, body, statusCode, headers) {
            if (error) {
                return
            }
            if (body) {

                client.request({
                    method: 'PATCH',
                    path: body.uri,
                    body: {
                        'live': { "status": "ready" },
                    },
                    headers: {
                        'Content-Type': '	application/json',
                        'Accept': 'application/vnd.vimeo.*+json;version=3.4',
                        'Authorization' : 'bearer' + ACCESS_TOKEN
                    }
                },
                    function (error, body, statusCode, headers) {
                        if (error) {
                            return
                        }
                        if (body) {

                            return
                        }
                    })



                return
            }
        })
}

