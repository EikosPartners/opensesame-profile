var express = require('express');
var _ = require('lodash');
var debug = require('debug')('opensesame-profile');
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
          debug('app.js:27', user);
          if(user.data.user === userObject.user && user.data.pass === userObject.pass)
            return callback(null, { roles: user.roles, data: _.omit(user.data, ['pass', 'pass2']) });
          else {
            return callback('Incorrect password');
          }
        }
      });
    },
    registerUser: (userObject, callback) => {
      let user = {
        roles: [],
        data: userObject
      };
      // console.log(user);
      userService.create(userObject.user, user, (err, user) => {
        if(err) {
          return callback(err);
        } else {
          return callback(null, { roles: user.roles, data: _.omit(user.data, ['pass', 'pass2']) });
        }
      });
    },
    refreshUser: (userObject, callback) => {
      userService.get(userObject.user, (err, user) => {
        if(err) {
          return callback(err);
        } else {
            return callback(null, { roles: user.roles, data: _.omit(user.data, ['pass', 'pass2']) });          
        }
      });
    },
  }), app);

  app.use('/profile/user', user);
  app.use('/profile/role', role);

  return app;

};
