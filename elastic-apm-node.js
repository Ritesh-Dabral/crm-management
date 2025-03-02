// sails.log('apm loaded');

/**
 *  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
 *  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
 *  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
 *      DO NOT DELETE THIS FILE
 *  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
 *  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
 *  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

 * This file will be replaced in staging and production env
 */


require('elastic-apm-node').start({
  // Override service name from package.json
  // Allowed characters: a-z, A-Z, 0-9, -, _, and space
  serviceName: 'YOUR_SERVICE_NAME',

  // Use if APM Server requires a token
  secretToken: 'YOUR_SECRET TOKEN',

  // Set custom APM Server URL (default: http://127.0.0.1:8200)
  serverUrl: 'http://localhost:8200',

  // Only activate the agent if it's running in production
  active: false
})

