const mongoose = require('mongoose');

async function authen(req, res, next) {
  next();
}

module.exports = {
  authen: authen
};
