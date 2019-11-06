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
  'GET /findLineById/:lid': {
    middlewares: ['findLineById']
  },
  'PATCH /updateLine/:lid': {
    middlewares: ['updateLine']
  },
  'DELETE /deleteLine/:lid': {
    middlewares: ['deleteLine']
  },
};
