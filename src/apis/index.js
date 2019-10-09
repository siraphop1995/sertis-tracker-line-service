'use strict';

const _ = require('lodash');
const line = require('@line/bot-sdk');
const { WebhookClient, Payload } = require('dialogflow-fulfillment');
const { Card, Suggestion } = require('dialogflow-fulfillment');
const intent = require('../utils/intentHandler');

let config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};

const client = new line.Client(config);

exports.helloWorld = (req, res, next) => {
  res.send('Hello World!');
};

//Dialogflow webhook
exports.webhook = async (req, res, next) => {
  console.log('webhook');
  try {
    var agent = new WebhookClient({ request: req, response: res });

    var intentMap = new Map();
    intentMap.set('Default Fallback Intent', intent.defaultAction(next));
    intentMap.set('Initialize Intent', intent.initialize(next));
    intentMap.set('Check ID Intent', intent.checkLineId(next));
    intentMap.set('Leave Intent', intent.leaveHandler(next));

    await agent.handleRequest(intentMap);
  } catch (err) {
    agent.add('test');
    next(err);
  }
};

exports.authorization = async (req, res, next) => {
  console.log('authorization');
  try {
    console.log(req.headers)
    next()
  } catch (err) {
    next(err);
  }
};


