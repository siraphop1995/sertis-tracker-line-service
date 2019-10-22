'use strict'

/**
 * Middlewares (hooks) & custom functions for main document.
 * For modularity (unit testing), all those functions
 * are defined here.
 * 
 * Note that every function defined here must use ES5 syntax
 * (function () {}) since it must be functional scope
 * i.e. it must be aware of mongoose's `this`.
 */
const process = require('process')

const hooks = {
  // for pre hooks, the header style is `function (next) {}`
  pre: {
    save: function (next) {
      process.stdout.write('New document is being added...')
      next()
    },
  },
  // for post hooks, the header style is `function (doc) {}`
  post: {
    save: function (doc) {
      process.stdout.write(`Date '${doc.date}' was added`)
    }
  }
}

// `this` is the document this method is called on
const methods = {
  getMetadata: function () {
    return `${this.name}: createdAt ${this.metadata.created}, updateAt ${this.metadata.update}`
  }
}

const toJSON = {
  transform: function (doc, obj) {
    delete obj.__v
    return obj
  }
}

module.exports = { hooks, methods, toJSON }