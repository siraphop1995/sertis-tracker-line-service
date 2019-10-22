'use strict';

/**
 * Mongoose main document schema and model.
 * Model should be defined only for the main document.
 */

const mongoose = require('mongoose');
const { hooks, methods, toJSON } = require('./functions');

const lineSchema = mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now
    },
    history: [
      {
        lineId: {
          type: String
        },
        displayName: {
          type: String
        },
        message: {
          type: String
        },
        messageType: {
          type: String
        },
        messageVar: {
          type: Object
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
