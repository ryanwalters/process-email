'use strict';

const Confidence = require('confidence');
const Package = require('../package');


// Declare criteria

const criteria = {
    env: process.env.NODE_ENV
};


// Config

const config = {
    version: Package.version,
    api: {
        version: '/v1'
    },
    connection: {
        port: {
            $filter: 'env',
            production: process.env.PORT,
            $default: 5001
        }/*,
        routes: {
            cors: {
                origin: ['.example.com']
            }
        },
        uri: {
            $filter: 'env',
            production: 'https://api.example.com'
        }*/
    },
    server: {}
};

const store = new Confidence.Store(config);

exports.get = (key) => store.get(key, criteria);
