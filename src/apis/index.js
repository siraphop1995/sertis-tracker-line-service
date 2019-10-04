'use strict';

const _ = require('lodash');
const User = require('../models/userListModel');
const line = require('@line/bot-sdk');
const { WebhookClient, Payload } = require('dialogflow-fulfillment');
const { Card, Suggestion } = require('dialogflow-fulfillment');

let config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};

const client = new line.Client(config);

exports.helloWorld = (req, res, next) => {
  res.send('Hello World!');
};

exports.webhook = async (req, res, next) => {
  console.log('webhook');
  try {
    const agent = new WebhookClient({ request: req, response: res });

    function initialize(agent) {
      agent.add('initialize');
    }

    let intentMap = new Map();
    intentMap.set('Initialize', initialize);
    agent.handleRequest(intentMap);
  } catch (err) {
    next(err);
  }
};

exports.getAllUsers = async (req, res, next) => {
  console.log('getAllUsers');
  try {
    const user = await User.find({}, null);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.addUser = async (req, res, next) => {
  console.log('addUser');
  try {
    let newUser = new User(req.body);
    const user = await newUser.save();
    return res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.getAUser = async (req, res, next) => {
  console.log('getAUser');
  try {
    const user = await User.findById(req.params.userId);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  console.log('updateUser');
  try {
    let newUser = req.body;
    const user = await User.findByIdAndUpdate(req.params.userId, newUser);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  console.log('deleteUser');
  try {
    const user = await User.findByIdAndRemove(req.params.userId);
    const response = {
      message: 'Delete user id: ' + req.params.userId + ' successfully',
      id: user._id
    };
    res.json(response);
  } catch (err) {
    next(err);
  }
};
