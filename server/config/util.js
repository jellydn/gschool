'use strict';

var fs = require('fs'),
    path = require('path'),
    _ = require('lodash');

// recursively walk modules path and callback for each file
var walk = function(modulesPath, excludeDir, callback) {
    fs.readdirSync(modulesPath).forEach(function(file) {
        var newPath = path.join(modulesPath, file);
        var stat = fs.statSync(newPath);
        if (stat.isFile() && /(.*)\.(js|coffee)$/.test(file)) {
            callback(newPath);
        } else if (stat.isDirectory() && file !== excludeDir) {
        walk(newPath, excludeDir, callback);
        }
    });
};

function loadConfig() {
  // Load configurations
  // Set the node environment variable if not set before
  var configPath = process.cwd() + '/server/config/env';
  process.env.NODE_ENV = ~fs.readdirSync(configPath).map(function(file) {
    return file.slice(0, -3);
  }).indexOf(process.env.NODE_ENV) ? process.env.NODE_ENV : 'development';

  // Extend the base configuration in all.js with environment
  // specific configuration
  return _.extend(
    require(configPath + '/all'),
    require(configPath + '/' + process.env.NODE_ENV) || {}
  );
}

exports.walk = walk;
exports.loadConfig = loadConfig;
