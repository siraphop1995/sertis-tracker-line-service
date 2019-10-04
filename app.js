'use strict'

/**
 * Add express middleware here
 */

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const errorHandler = require('./src/utils/errorHandler');

const app = express()

//Express middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(errorHandler);

module.exports = app