if (process.env.NODETIME_ACCOUNT_KEY) {
    require('nodetime').profile({
        accountKey: process.env.NODETIME_ACCOUNT_KEY,
        appName: 'FullOn 2014'
    });
}

// start the server
var config = require('./config');
require('./app').start(config.port);