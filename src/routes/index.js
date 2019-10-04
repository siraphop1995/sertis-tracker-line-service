'use strict'

module.exports = {
  'GET /': {
    middlewares: ['helloWorld']
  },
  'POST /webhook': {
    middlewares: ['webhook']
  },
  'GET /user': {
    middlewares: ['getAllUsers']
  },
  'POST /user': {
    middlewares: ['addUser']
  },
  'GET /user/:userId': {
    middlewares: ['getAUser']
  },
  'PATCH /user/:userId': {
    middlewares: ['updateUser']
  },
  'DELETE /user/:userId': {
    middlewares: ['deleteUser']
  }
};
