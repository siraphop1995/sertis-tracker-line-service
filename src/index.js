'use strict';

/**
 * Express router loader
 * Link all middlewares under `/apis` to an express router
 * and export it for the main express app.
 */

const router = require('express').Router();
const routes = require('./routes');
const methods = require('./apis')
const loader = require('./routes/loader')(router, routes, methods)

for (let route in routes) {
  loader.subscribeRoute(route, router)
}

module.exports = router;
