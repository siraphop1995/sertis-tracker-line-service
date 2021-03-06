'use strict';

/**
 * Mongoose main document schema and model.
 * Model should be defined only for the main document.
 */

const mongoose = require('mongoose');
const moment = require('moment-timezone');
const { hooks, methods, toJSON } = require('./functions');

const lineSchema = mongoose.Schema(
  {
    date: {
      type: String
    },
    history: [
      {
        lid: {
          type: String,
          require: true
        },
        uid: {
          type: String,
          require: true
        },
        displayName: {
          type: String
        },
        message: {
          type: String
        },
        messageIntent: {
          type: String
        },
        messageVar: {
          type: Object
        },
        messageObjective: {
          type: Object
        },
        isVerify: {
          type: Boolean,
          default: false
        },
        isCanceled: {
          type: Boolean,
          default: false
        },
        rejectMessage: {
          type: String
        },
        timestamp: {
          type: Number,
          default: Date.now
        },
        createdDate: {
          type: String,
          default: moment().tz('Asia/Bangkok').format()
        }
      }
    ],
    metadata: {
      created: {
        type: Date,
        default: Date.now
      },
      update: {
        type: Date,
        default: Date.now
      }
    }
  },
  { toJSON }
);

/**
 * Middlewares a.k.a. Hooks
 * Refer to mongoose document for more details.
 * Fat arrow notation cannot be used due to its lexical scope property.
 */
const preHooks = Object.keys(hooks.pre);
const postHooks = Object.keys(hooks.post);

preHooks.forEach(hook => {
  lineSchema.pre(hook, hooks.pre[hook]);
});
postHooks.forEach(hook => {
  lineSchema.post(hook, hooks.post[hook]);
});

/**
 * Custom methods for this schema.
 * Fat arrow notation cannot be used due to its lexical scope property.
 */
const customMethods = Object.keys(methods);
customMethods.forEach(method => {
  lineSchema.methods[method] = methods[method];
});

module.exports = mongoose.model('Dates', lineSchema);
