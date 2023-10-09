
// DEVELOPMENT | PRODUCTION
const deploymentType = 'DEVELOPMENT';

const configurationArray = {
  //
  "envType": deploymentType,

  // URL for API 
  'domainUrl': (deploymentType === 'DEVELOPMENT') ? "http://localhost:3000" : "https://live.petrogate.in",

  // URL for Socket 
  'socketUrl': (deploymentType === 'DEVELOPMENT') ? "http://localhost:3000" : "https://live.petrogate.in",

  // URL for Test Series
  'testSeriesUrl': (deploymentType === 'DEVELOPMENT') ? "https://testseries.brainerygroup.com/api/v1" : "https://testseries.brainerygroup.com/api/v1",

  // URL for API 
  'webUrl': (deploymentType === 'DEVELOPMENT') ? "http://localhost/PetroGate-education-live-2020" : "https://www.petrogate.in",

  // Secret to sign JWT payload
  'jwtSecret': "<Ff##2<[nCG@7&1/|/N}>5nh=?h?.a",

  // TTL in milli-seconds
  'ttlMs': (24 * 60 * 60 * 100),

  // SMS Auth Details
  'smsAuth': {
    'authkey': '352239AcICmS5sT9Lm6007bb3bP1',
    'sender_id': 'diBtis',
    'route': '4',
    'template_id': '600bd6f452cdb276312e41c1',
    'extra_param': JSON.stringify({ "HASH": "%2BYlocDjn9zm" }),
    'invisible': 1,
  },



  // Mail Auth Details
  'mailAuth': {
    'service': 'gmail',
    'auth': {
      'user': 'medicomentors@gmail.com', //  Put sender's email Id
      'pass': 'medico@mentors1234' // Put sender's email password
    }
  },

  // Vime Auth Details
  'vimeoAuth': {
    'CLIENT_ID': '121930724',
    'CLIENT_SECRET': 'uGylq7jPrfxuNFB2dS93OEwgOglfMAU1FYJnPSGpgNXQx5hMPymDCg1I3aIioVjnO0yY/fsByEztfZyxA+7aS3p2DR441tZPfxzXF0AflfHbS67qq6CHEaYcbTk1ZpJ0',
    'ACCESS_TOKEN': '66857ce68c58dddab7543f625d3dc28b'
  },

  'fcmServerKey': "AAAAVdPmaTI:APA91bFhqU3B_NiPCuTgnlBP8JWQJiZqSQBm-yzLVKMW2yg988OBdYxrruAFSZvjcQzaWU5H5b-ccaGAF3YThsI_2F4oEzK7hh06BeKcIAE_MxTnNSadWev_euFv1G4pvJULAGjYB1A4y",

  'twilioAccountId': 'ACe48f02af21743f59ee349dbd939e4e9b',

  'twilioAuthToken': 'c5271b400dda673e48518e31f3ab1075',

  'twilioNumber': '+17604725598',

  'vimeoRtmpUrl': 'rtmp://rtmp-global.cloud.vimeo.com/live',

  'otsIntigration': true
};

export function getConfig(key) {
  return configurationArray[key] ? configurationArray[key] : null;
}

export function getdevelopmentType() {
  return deploymentType;
}