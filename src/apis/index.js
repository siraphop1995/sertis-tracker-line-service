'use strict';

const { WebhookClient, Payload } = require('dialogflow-fulfillment');
const intent = require('../utils/intentHandler');
const Line = require('../db').lineDocument;
const moment = require('moment-timezone');

/**
 * GET
 *   /
 *     @description To test api to line service
 *     @return {string} Hello message
 */
exports.helloWorld = (req, res, next) => {
  console.log('Hello World! line-service');
  res.json({ message: 'Hello World! line-service' });
};

/**
 * Middlewear that check if dialogflow token exist
 * @param req.headers.authorization {string} Bearer token.
 */
exports.ensureToken = async (req, res, next) => {
  console.log('ensureToken')
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    next(new Error('No token'));
  }
};

/**
 * Middlewear that check if dialogflow token is valid
 * @param req.headers.authorization {string} Bearer token.
 */
exports.authorization = async (req, res, next) => {
  console.log('authorization')
  //decode token using base64 decoder
  let buff = Buffer.from(req.token, 'base64');
  let key = buff.toString('ascii');

  var [username, password] = key.split(':');
  if (username === 'admin' && password === 'admin') {
    next();
  } else throw new Error('incorrect username or password');
};

/**
 * POST
 *   /webhook
 *     @description Dialogflow webhook, will forward request to
 *                  respective intentHandler
 */
exports.webhook = async (req, res, next) => {
  console.log('webhook');
  var agent = new WebhookClient({ request: req, response: res });
  var intentMap = new Map();
  intentMap.set('Default Fallback Intent', intent.defaultAction(next));
  intentMap.set('Initialize Intent', intent.initialize(next));
  intentMap.set('Leave Intent', intent.leaveHandler(next));
  intentMap.set('Absent Intent', intent.absentHandler(next));
  intentMap.set('Long Absent Intent', intent.longAbsentHandler(next));

  await agent.handleRequest(intentMap);
};

/**
 * GET
 *   /getAllLine
 *     @description To get a list of all line data
 *      @return {Array} Array of line data object
 */
exports.getAllLine = async (req, res) => {
  console.log('getAllLine');
  const lineRes = await Line.find({}, null);
  res.json({
    line: lineRes
  });
};

/**
 * POST
 *   /createLine
 *     @description Create new line data
 *      @param req.body.line {Object} Line data object.
 *      @return {Object} Line data object
 */
exports.createLine = async (req, res) => {
  console.log('createLine');
  const { dateQuery } = req.body;
  const [day, month, year] = _parseDate(dateQuery);

  let newDate = _createMoment(day, month, year);

  let newLine = new Line({
    date: newDate,
    history: []
  });
  const lineRes = await newLine.save();

  res.json({
    line: lineRes
  });
};

/**
 * POST
 *   /findLineById/:lineId
 *     @description Query for line data by id
 *      @param req.params.lineId {string} Line mongo id.
 *      @return {object} Line data object
 */
exports.findLineById = async (req, res) => {
  console.log('getLine');
  const lineRes = await Line.findOne({ _id: req.params.lid });
  res.json({
    line: lineRes
  });
};

/**
 * POST
 *   /findLine
 *     @description Query for line data by query
 *      @param req.body.dateQuery {Object} Line data object.
 *      @return {object} Line data object
 */
exports.findLine = async (req, res) => {
  const { dateQuery } = req.body;
  const [day, month, year] = _parseDate(dateQuery);

  const newDate = moment([year, month - 1, day])
    .tz('Asia/Bangkok')
    .format('DD/MM/YYYY');

  const lineRes = await Line.findOne({
    date: newDate
  });

  res.json({
    line: lineRes
  });
};

/**
 * PATCH
 *   /updateLine/:lineId
 *     @description Update line data
 *      @param req.params.dateId {string} line mongo id.
 *      @param req.body.query {Object} Line data object.
 *      @return {Object} Line data object
 */
exports.updateLine = async (req, res) => {
  console.log('updateLine');
  let newLine = req.body;
  const lineRes = await Line.uplineOne({ _id: req.params.lid }, newLine);
  res.json({
    line: lineRes
  });
};

/**
 * DELETE
 *   /deleteLine/:lineId
 *     @description Delete line data
 *      @param req.params.lineId {string} Line mongo id.
 *      @return {object} Delete response
 */
exports.deleteLine = async (req, res) => {
  console.log('deleteLine');
  const line = await Line.deleteOne({ _id: req.params.lid });
  let message = 'No line remove';
  if (line.deletedCount >= 1) {
    message = 'Delete line id: ' + req.params.lid + ' successfully';
  }
  const response = {
    message: message,
    id: line._id
  };
  res.json(response);
};

//The following route are use for testing and development

/**
 * GET
 *   /deleteAllLine
 *     @description Delete all line data
 *      @return {Object} Delete respond
 */
exports.deleteAllLine = async (req, res) => {
  console.log('deleteAllLine');
  const line = await Line.deleteMany({});
  res.json(line);
};

//Function

/**
 * Parse date string into array of date (number)
 * @param     {string} date - string of date
 * @returns   {number} number
 * @example    _parseDate('10/10/2019')
 */
function _parseDate(date) {
  return date.split('/').map(d => parseInt(d, 10));
}

/**
 * Create a moment date from date string
 * @param     {number} day
 * @param     {number} month
 * @param     {number} year
 * @returns   {Date} moment date
 * @example    _createMoment(10,10,2019)
 */
function _createMoment(day, month, year) {
  return moment([year, month - 1, day])
    .tz('Asia/Bangkok')
    .format('DD/MM/YYYY');
}
