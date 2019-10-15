'use strict';

const httpStatus = require('http-status');

module.exports = (err, req, res, next) => {
  console.log('errorHandler');
  const getStatusCode = err => {
    let numberFromStatus = Number.isInteger(err.status) && err.status;
    let numberFromCode = Number.isInteger(err.code) && err.code;
    return numberFromStatus || numberFromCode || 500;
  };

  if (!err) err = {};

  switch (err.name) {
    case 'CastError':
      err.status = 404;
      err.message = 'User Not Found.';
      break;
  }

  const status = getStatusCode(err);
  console.error(err.message);
};
