'use strict';

module.exports = (err, req, res, next) => {
  console.log('errorHandler');
  console.error(err.message);
};
