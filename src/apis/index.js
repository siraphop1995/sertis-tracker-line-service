'use strict';

const { WebhookClient, Payload } = require('dialogflow-fulfillment');
const intent = require('../utils/intentHandler');
const Line = require('../db').lineDocument;
const moment = require('moment-timezone');

exports.helloWorld = (req, res, next) => {
  console.log('Hello World! line-service');
  res.json({ message: 'Hello World! line-service' });
};

exports.ensureToken = async (req, res, next) => {
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

exports.authorization = async (req, res, next) => {
  //decode token using base64 decoder
  let buff = Buffer.from(req.token, 'base64');
  let key = buff.toString('ascii');

  var [username, password] = key.split(':');
  if (username === 'admin' && password === 'admin') {
    next();
  } else throw new Error('incorrect username or password');
};

//Dialogflow webhook
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

exports.getAllLine = async (req, res) => {
  console.log('getAllLine');
  const lineRes = await Line.find({}, null);
  res.json({
    line: lineRes
  });
};

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

exports.findLineById = async (req, res) => {
  console.log('getLine');
  const lineRes = await Line.findOne({ _id: req.params.lid });
  res.json({
    line: lineRes
  });
};

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

exports.updateLine = async (req, res) => {
  console.log('updateLine');
  let newLine = req.body;
  const lineRes = await Line.uplineOne({ _id: req.params.lid }, newLine);
  res.json({
    line: lineRes
  });
};

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

exports.deleteAllLine = async (req, res) => {
  console.log('deleteAllLine');
  const line = await Line.deleteMany({});
  res.json(line);
};

function _parseDate(date) {
  return date.split('/').map(d => parseInt(d, 10));
}

function _createMoment(day, month, year) {
  return moment([year, month - 1, day])
    .tz('Asia/Bangkok')
    .format('DD/MM/YYYY');
}
