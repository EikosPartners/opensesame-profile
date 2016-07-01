var express = require('express');
var _ = require('lodash');
var debug = require('debug')('opensesame-profile');
var bodyParser = require('body-parser');
var opensesame = require('opensesame');
var userRoutes = require('./routes/user');
var JsonStorageService = require('./services/JsonStorageService');

module.exports = function(config, app) {

  let userService = new JsonStorageService('users.json');
  // var roleService = new JsonStorageService('roles.json');

  let user = userRoutes(userService);
  // var role = require('./routes/role')(roleService);

  if(!app) {
    app = express();
  }

  // required since routes use json
  app.use(bodyParser.json());

  let profileConfig = {
    checkUser: (userObject, callback) => {
      // console.log('checkUser: ', userObject);
      userService.getById(userObject.username, (err, user) => {
        // console.log('userService: ', user);
        if(err) {
          return callback(err);
        } else {
          debug('app.js:27', user);
          if(user.username === userObject.username && user.password === userObject.password)
            return callback(null, _.omit(user, 'password'));
          else {
            return callback('Incorrect password');
          }
        }
      });
    },
    registerUser: (userObject, callback) => {
      // console.log(userObject);
      if(userObject.password !== userObject.password2) {
        return callback('Passwords don\'t match');
      }
      userObject.roles = [];
      userService.createById(userObject.username, _.omit(userObject, ['password2']), (err, user) => {
        // console.log(user);
        if(err) {
          return callback(err);
        } else {
          return callback(null, _.omit(user, ['password']));
        }
      });
    },
    refreshUser: (jwtUserData, callback) => {
      userService.getById(jwtUserData.username, (err, user) => {
        if(err) {
          return callback(err);
        } else {
            return callback(null, _.omit(user, 'password'));
        }
      });
    },
  };
  config = _.extend(config, profileConfig);

  app = opensesame(config, app);
  let opensesameUtils = opensesame.utils(config);

  app.use(function (req, res, next) {    
    userService.getById(req.user.username, (err, user) => {
      if(err) {
        debug(req);
        debug(err);
        debug('Logged in user that is not in the database!');
        opensesameUtils.clearAuthCookie(req, res, next);
        return res.redirect('/');
      } else {
        if(!_.isEqual(_.omit(req.user, ['iat', 'exp']), _.omit(user, 'password'))) {
          debug('User was updated. Sending new cookies.');
          debug('req.user', _.omit(req.user, ['iat', 'exp']));
          debug('user', _.omit(user, 'password'));
          let data = opensesameUtils.create(_.omit(user, ['password']), req, res, next);
          opensesameUtils.setAuthCookie(data.token, req, res, next);
          // console.log(data);
          // console.log('req.user', req.user);
          req.user = data.decoded;
          // console.log('req.user', req.user);
        }
      }

      next();

    });
  });

  if(config.middleware) {
    app.use(config.middleware);
  }

  app.use('/profile/user', user);
  // app.use('/profile/role', role);

  return app;

};
