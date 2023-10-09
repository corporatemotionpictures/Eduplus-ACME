// // Welcome to CronJob
let timeZone = 'Asia/Kolkata';
const log = require('node-file-logger');

const dotenv = require('dotenv');
dotenv.config();

// Assign API Url const 
const domainUrl = process.env.NEXT_PUBLIC_DOMAIN_URL;
const apiUrl = domainUrl.concat("/api/jobs");

//Get Url 
function getUrl(ctx) {
  return apiUrl.concat(ctx);
}

// Fetch
var fetch = require('isomorphic-unfetch');

// CronJob config
var CronJob = require('cron').CronJob;

// Logger
const logOptions = {
  timeZone: timeZone,
  folderPath: './logs/',
  dateBasedFileNaming: true,
  fileNamePrefix: 'logs_',
  fileNameSuffix: '',
  fileNameExtension: '.log',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: 'HH:mm:ss.SSS',
  logLevel: 'debug',
  onlyFileLogging: true,
};

var Job = new CronJob('0 */12 * * *', async function () {

  let jobUrl = getUrl('/backup-script');
  let response = await fetch(jobUrl);
  let responseJson = await response.json();

  if (responseJson.success) {
    log.Info('Job executed successfully.', 'Backup Done', 'Backup', '');
  } else {
    log.Error('Job executed failed.', 'Job executed', null);
  }
 

}, null, true, timeZone);

console.log(Job.running)

if(!Job.running){
    Job.start()
}

console.log('job.running')
console.log(Job.running)