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
  'POST /createLine': {
    middlewares: ['createLine']
  },
  'GET /findLineById/:lid': {
    middlewares: ['findLineById']
  },
  'POST /findLine': {
    middlewares: ['findLine']
  },
  'PATCH /updateLine/:lid': {
    middlewares: ['updateLine']
  },
  'DELETE /deleteLine/:lid': {
    middlewares: ['deleteLine']
  },
};
