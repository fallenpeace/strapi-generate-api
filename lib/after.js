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

/**
 * Runs after this generator has finished
 *
 * @param {Object} scope
 * @param {Function} cb
 */

module.exports = function afterGenerate(scope, cb) {

  // Read the current `routes.json` file to get existing routes.
  const routesFile = fs.readFileSync(path.resolve(process.cwd(), 'config', 'routes.json'));
  const currentRoutes = JSON.parse(routesFile);

  // Create new routes.
  const newRoutes = {
    'routes': {}
  };

  newRoutes['routes']['GET /' + scope.id] = {
    'controller': scope.globalID,
    'action': 'find',
    'policies': [
      'isAuthorized'
    ]
  };

  newRoutes['routes']['GET /' + scope.id + '/:id'] = {
    'controller': scope.globalID,
    'action': 'findOne',
    'policies': [
      'isAuthorized'
    ]
  };

  newRoutes['routes']['POST /' + scope.id] = {
    'controller': scope.globalID,
    'action': 'create',
    'policies': [
      'isAuthorized',
      'addDataCreate'
    ]
  };

  newRoutes['routes']['PUT /' + scope.id + '/:id'] = {
    'controller': scope.globalID,
    'action': 'update',
    'policies': [
      'isAuthorized',
      'addDataUpdate'
    ]
  };

  newRoutes['routes']['DELETE /' + scope.id + '/:id'] = {
    'controller': scope.globalID,
    'action': 'destroy',
    'policies': [
      'isAuthorized'
    ]
  };

  newRoutes['routes']['POST /' + scope.id + '/:parentId/:relation'] = {
    'controller': scope.globalID,
    'action': 'add',
    'policies': [
      'isAuthorized',
      'addDataCreate'
    ]
  };

  newRoutes['routes']['DELETE /' + scope.id + '/:parentId/:relation/:id'] = {
    'controller': scope.globalID,
    'action': 'remove',
    'policies': [
      'isAuthorized',
      'addDataUpdate'
    ]
  };

  // Merge existing routes with the new ones.
  const newRoutesFile = JSON.stringify(_.merge(currentRoutes, newRoutes), null, '  ');

  // Write the `routes.json` file with the new routes.
  fs.writeFileSync(path.resolve(process.cwd(), 'config', 'routes.json'), newRoutesFile);

  // `User` model file path.
  const userFilePath = path.resolve(process.cwd(), 'modules', 'user', 'api', 'models', 'User.settings.json');

  // Current `user` model.
  const userFile = fs.readFileSync(userFilePath);
  let userModel = JSON.parse(userFile);

  // Updated `user` model.
  userModel.attributes[pluralize.plural(scope.id)] = {
    collection: scope.id,
    via: 'contributors'
  };

  // Update the `User.settings.json` file with the new attributes.
  const newUserFile = JSON.stringify(userModel, null, '  ');
  fs.writeFileSync(userFilePath, newUserFile);

  // Trigger callback with no error to proceed.
  return cb.success();
};
