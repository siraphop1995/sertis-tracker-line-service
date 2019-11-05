'use strict';

module.exports = {
  'GET /': {
    middlewares: ['helloWorld']
  },
  'POST /webhook': {
    middlewares: ['ensureToken', 'authorization', 'webhook']
  },
  'GET /getAllLine': {
    middlewares: ['getAllLine']
  },
  'POST /addLine': {
    middlewares: ['addLine']
  },
  'GET /findLineById/:lineId': {
    middlewares: ['findLineById']
  },
  'PATCH /updateLine/:lineId': {
    middlewares: ['updateLine']
  },
  'DELETE /deleteLine/:lineId': {
    middlewares: ['deleteLine']
  },
};
