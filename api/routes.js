'use strict';

const Process = require('./controllers/process');


// Declare internals

const internals = {};


// Routes

internals.routes = [
    { method: 'GET', path: '/', config: { handler: (request, reply) => reply('welcome') } },
    { method: 'POST', path: '/process', config: Process }
];


// Plugin

exports.register = (server, options, next) => {

    server.route(internals.routes);

    return next();
};

exports.register.attributes = {
    name: 'api-routes',
    version: '1.0.0'
};