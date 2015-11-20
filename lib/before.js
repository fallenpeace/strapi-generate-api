'use strict';

/**
 * Module dependencies
 */

// Node.js core.
const fs = require('fs');
const path = require('path');

// Public node modules.
const _ = require('lodash');
const pluralize = require('pluralize');

// Fetch stub attribute template on initial load.
let ATTRIBUTE_TEMPLATE = path.resolve(__dirname, '..', 'templates', 'attribute.template');
ATTRIBUTE_TEMPLATE = fs.readFileSync(ATTRIBUTE_TEMPLATE, 'utf8');

/**
 * This `before` function is run before generating targets.
 * Validate, configure defaults, get extra dependencies, etc.
 *
 * @param {Object} scope
 * @param {Function} cb
 */

module.exports = function (scope, cb) {

  // `scope.args` are the raw command line arguments.
  _.defaults(scope, {
    id: scope.args[0],
    idPluralized: pluralize.plural(scope.args[0]),
    attributes: _.slice(scope.args, 1)
  });

  // Validate custom scope variables which are required by this generator.
  if (!scope.rootPath || !scope.id) {
    return cb.invalid('Usage: `$ strapi generate api <myAPI> [attribute|attribute:type ...]`');
  }

	// Test naming pattern for API name (required by GraphQL)
  const NAMEPATTERN = /^[_a-zA-Z][_a-zA-Z0-9]*$/;
  if (!NAMEPATTERN.test(scope.id)) {
    return cb.invalid(`Names must match /^[_a-zA-Z][_a-zA-Z0-9]*$/ but "${scope.id}" does not.`);
  }

  // Validate optional attribute arguments.
  let attributes = scope.attributes;
  const invalidAttributes = [];

  // Map attributes and split them.
  attributes = _.map(attributes, function (attribute) {
    const parts = attribute.split(':');

    if (parts[1] === undefined) {
      parts[1] = 'string';
    }

    // Handle invalid attributes.
    if (!parts[1] || !parts[0]) {
      invalidAttributes.push('Error: Invalid attribute notation `' + attribute + '`.');
      return;
    }

    return {
      name: parts[0],
      type: parts[1]
    };
  });

  // Handle invalid action arguments.
  // Send back invalidActions.
  if (invalidAttributes.length) {
    return cb.invalid(invalidAttributes);
  }

  // Make sure there aren't duplicates.
  if (_(attributes).pluck('name').uniq().valueOf().length !== attributes.length) {
    return cb.invalid('Duplicate attributes not allowed!');
  }

  // Determine default values based on the available scope.
  _.defaults(scope, {
    globalID: _.capitalize(scope.id),
    ext: '.js',
    attributes: []
  });

  // Take another pass to take advantage of the defaults absorbed in previous passes.
  _.defaults(scope, {
    rootPath: scope.rootPath,
    filename: scope.globalID + scope.ext,
    filenameSettings: scope.globalID + '.settings.json'
  });

  // Humanize output.
  _.defaults(scope, {
    humanizeId: scope.args[0],
    humanizedPath: '`./api`'
  });

  // Render some stringified code from the action template
  // and make it available in our scope for use later on.
  scope.attributes = _.map(attributes, function (attribute) {
    const compiled = _.template(ATTRIBUTE_TEMPLATE);
    return _.trimRight(_.unescape(compiled({
      name: attribute.name,
      type: attribute.type
    })));
  }).join(',\n');

  // Trigger callback with no error to proceed.
  return cb.success();
};
