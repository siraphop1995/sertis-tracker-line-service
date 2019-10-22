'use strict';

const { WebhookClient, Payload } = require('dialogflow-fulfillment');
const intent = require('../utils/intentHandler');
const Line = require('../db').lineDocument;

exports.helloWorld = (req, res, next) => {
  res.send('Hello World!');
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
  intentMap.set('Check ID Intent', intent.checkLineId(next));
  intentMap.set('Leave Intent', intent.leaveHandler(next));
  intentMap.set('Absent Intent', intent.absentHandler(next));
  intentMap.set('Long Absent Intent', intent.longAbsentHandler(next));

  await agent.handleRequest(intentMap);
};

exports.getAllLine = async (req, res) => {
  console.log('getAllLines');
  const line = await Line.find({}, null);
  res.json(line);
};

exports.addLine = async (req, res) => {
  console.log('addLine');
  let newDate = new Line(req.body);
  const line = await newDate.save();
  res.json(line);
};

exports.getLine = async (req, res) => {
  console.log('getLine');
  const line = await Line.findOne({ _id: req.params.lineId });
  res.json(line);
};

exports.updatw = async (req, res) => {
  console.log('uplineLine');
  let newLine = req.body;
  const line = await Line.uplineOne({ _id: req.params.lineId }, newLine);
  res.json(line);
};

exports.deleteLine = async (req, res) => {
  console.log('deleteLine');
  const line = await Line.deleteOne({ _id: req.params.lineId });
  let message = 'No line remove';
  if (line.deletedCount >= 1) {
    message = 'Delete line id: ' + req.params.lineId + ' successfully';
  }
  const response = {
    message: message,
    id: line._id
  };
  res.json(response);
};