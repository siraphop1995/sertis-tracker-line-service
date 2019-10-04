'use strict';

/**
 * Middlewares to handle requests.
 * Business logics (e.g. db, provider) should be implementd separately
 * and exposed as a list of methods that will be called here.
 *
 * Different schemas may require different implementation of standard methods
 * (list, get, create, update, delete). Consult mongoose documentation
 * for more details.
 */
const _ = require('lodash');
const User = require('../models/userListModel');

exports.helloWorld = (req, res, next) => {
  res.send('Hello World!');
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
