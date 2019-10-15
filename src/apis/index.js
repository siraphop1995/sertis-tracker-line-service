'use strict';

const { WebhookClient, Payload } = require('dialogflow-fulfillment');
const intent = require('../utils/intentHandler');

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

  await agent.handleRequest(intentMap);
};
