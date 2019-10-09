'use strict';

module.exports = {
  'GET /': {
    middlewares: ['helloWorld']
  },
  'POST /webhook': {
    middlewares: ['ensureToken', 'authorization', 'webhook']
  }
};
