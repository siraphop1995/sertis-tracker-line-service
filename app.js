'use strict';

/**
 * Add express middleware here
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

//Express middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

module.exports = app;
