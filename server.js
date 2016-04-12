'use strict';

const Config = require('./api/config');
const Hapi = require('hapi');
const Hoek = require('hoek');

const server = new Hapi.Server(Config.get('/server'));

server.connection(Config.get('/connection'));


// Routes

server.register(require('./api/routes'), {
    routes: {
        prefix: Config.get('/api/version')
    }
}, (err) => Hoek.assert(!err, err));


// Start server

/* $lab:coverage:off$ */
if (!module.parent) {
    server.start(() => console.log('Server started', server.info.uri));
}
/* $lab:coverage:on$ */

module.exports = server;