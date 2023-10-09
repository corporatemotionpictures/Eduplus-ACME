import { knexConnectionConfig } from 'db/knexConnection';
import moment from 'moment'


// Ping pong the client!
export default async function (req, res) {
    const { zip } = require('zip-a-folder');
    const moment = require('moment');
    const mysqldump = require('mysqldump')

    const fs = require('fs');
    const { google } = require('googleapis');
    const log = require('node-file-logger');


    //client id
    const CLIENT_ID = process.env.DRIVE_CLIENT_ID
    const CLIENT_SECRET = process.env.DRIVE_CLIENT_SECRET
    const REDIRECT_URI = process.env.DRIVE_REDIRECT_URI
    const REFRESH_TOKEN = process.env.DRIVE_REFRESH_TOKEN

    const oauth2Client = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        REDIRECT_URI
    );

    //setting our auth credentials
    oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

    //initialize google drive
    const drive = google.drive({
        version: 'v3',
        auth: oauth2Client,
    });


    async function uploadFile() {

        //file path for out file
        const filePath = 'public/backups/uploads.zip';
        const filePathDatabse = 'public/backups/database.sql';
    
    
        zip('public/uploads', filePath);
    
        const result = await mysqldump({
            connection: {
                host: 'localhost',
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME
            },
            dumpToFile: filePathDatabse,
        });
    
    
        const folderName = `Backup-Eduplus`
    
        var folder = await drive.files.list(
            {
                q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}'`,
                fields: 'files(id, name)',
            }
        )
    
    
        // folder = await folder.json()
        folder = folder.data && folder.data.files ? folder.data.files[0] : null
    
    
        if (!folder) {
    
            folder = await drive.files.create({
                resource: {
                    name: folderName,
                    mimeType: 'application/vnd.google-apps.folder',
                },
                fields: 'id, name',
            })
    
    
            folder = await drive.files.list(
                {
                    q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}'`,
                    fields: 'files(id, name)',
                }
            )
    
            folder = folder.data.files ? folder.data.files[0] : null
        }
    
    
        if (folder) {
    
            let parent = folder
    
            let folderNameChild = `Backup-${window.localStorage.getItem('baseTitle').replace(' ', '-')}`
    
            folder = await drive.files.list(
                {
                    q: `mimeType='application/vnd.google-apps.folder' and name='${folderNameChild}'`,
                    fields: 'files(id, name)',
                }
            )
    
    
            // folder = await folder.json()
            folder = folder.data && folder.data.files ? folder.data.files[0] : null
    
    
            if (!folder) {
    
                folder = await drive.files.create({
                    resource: {
                        name: folderNameChild,
                        mimeType: 'application/vnd.google-apps.folder',
                        parents: [parent.id]
                    },
                    // addParents: parent.id,
                    fields: 'id, name',
                })
    
    
                folder = await drive.files.list(
                    {
                        q: `mimeType='application/vnd.google-apps.folder' and name='${folderNameChild}'`,
                        fields: 'files(id, name)',
                    }
                )
    
                folder = folder.data.files ? folder.data.files[0] : null
            }
    
        }
    
    
    
        try {
    
            const response = await drive.files.create({
                requestBody: {
                    name: `uploads-${moment().format('DD-MM-YYYY-hh-mm-A')}.zip`, //file name
                    mimeType: 'application/zip',
                    parents: folder.id ? [folder.id] : [],
                },
                media: {
                    mimeType: 'application/zip',
                    body: fs.createReadStream(filePath),
                },
            });
            // report the response from the request
        } catch (error) {
            //report the error message
        }
    
        try {
    
            const responsedata = await drive.files.create({
                requestBody: {
                    name: `database-${moment().format('DD-MM-YYYY-hh-mm-A')}.sql`, //file name
                    mimeType: 'text/x-sql',
                    parents: folder.id ? [folder.id] : [],
                },
                media: {
                    mimeType: 'text/x-sql',
                    body: fs.createReadStream(filePathDatabse),
                },
            });
            // report the responsedata from the request
        } catch (error) {
            //report the error message
        }
    }

    uploadFile()

    // Mysql DUmp

    let statusCode = true ? 200 : 422;
    let response = {
        success: true ? true : false,
    };


    // Send Response
    res.status(statusCode).json(response);
}