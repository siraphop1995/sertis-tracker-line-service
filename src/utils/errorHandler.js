'use strict'

const httpStatus = require('http-status')

module.exports = (err, req, res, next) => {
  const getStatusCode = err => {
    let numberFromCode = Number.isInteger(err.code) && err.code
    let numberFromStatus = Number.isInteger(err.status) && err.status
    return numberFromCode || numberFromStatus || 500
  }

  if (!err) err = {}

  switch (err.name) {
    case 'CastError':
      err.status = 404
      err.message = 'User Not Found.'
      break
    case 'MongoError':
      err.status = 400
      err.message = 'User already exists.'
      break
  }

  const status = getStatusCode(err)

  res.status(status).json({
    error: {
      code: status,
      status: httpStatus[status],
      message: err.message,
    }
  })
}
