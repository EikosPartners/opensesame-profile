var express = require('express');
var _ = require('lodash');
var bodyParser = require('body-parser');
var opensesame = require('opensesame');
var JsonStorageService = require('./services/JsonStorageService');

var userService = new JsonStorageService('users.json');

var user = require('./routes/user');
var role = require('./routes/role');

module.exports = function(config, app) {

  if(!app) {
    app = express();
  }

  // required since routes use json
  app.use(bodyParser.json());

  opensesame(_.extend(config, {
    checkUser: (userObject, callback) => {
      userService.get(userObject.user, (err, user) => {
        if(err) {
          return callback(err);
        } else {
          return callback(null, user);
        }
      });
    },
    registerUser: (userObject, callback) => {
      userService.create(userObject.user, userObject, (err, user) => {
        if(err) {
          return callback(err);
        } else {
          return callback(null, userObject);
        }
      });
    }
  }), app);

  app.use('/profile/user', user);
  app.use('/profile/role', role);

  return app;

};
