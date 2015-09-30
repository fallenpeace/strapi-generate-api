'use strict';

/**
 * Module dependencies
 */

// Node.js core.
const path = require('path');

/**
 * Generate a core API
 */

module.exports = {
  templatesDirectory: path.resolve(__dirname, '..', 'templates'),
  before: require('./before'),
  after: require('./after'),
  targets: {

    // Use the default `controller` file as a template for
    // every generated controller.
    'api/controllers/:filename': {
      template: 'controller.template'
    },

    // Copy an empty JavaScript model where every functions will be.
    'api/models/:filename': {
      template: 'model.template'
    },

    // Copy the generated JSON model for the connection,
    // schema and attributes.
    'api/models/:filenameSettings': {
      template: 'model.settings.template'
    }
  }
};
