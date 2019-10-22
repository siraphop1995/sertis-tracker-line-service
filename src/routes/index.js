'use strict';

module.exports = {
  'GET /': {
    middlewares: ['helloWorld']
  },
  'POST /webhook': {
    middlewares: ['ensureToken', 'authorization', 'webhook']
  },
  'GET /line': {
    middlewares: ['getAllLine']
  },
  'POST /line': {
    middlewares: ['addLine']
  },
  'GET /line/:lineId': {
    middlewares: ['getLine']
  },
  'PATCH /line/:lineId': {
    middlewares: ['uplineLine']
  },
  'DELETE /line/:lineId': {
    middlewares: ['deleteLine']
  },
};
