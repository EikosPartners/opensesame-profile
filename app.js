var express = require('express');
var path = require('path');
// var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var opensesame = require('opensesame');
var JsonStorageService = require('./services/JsonStorageService');

var userService = new JsonStorageService('users.json');

var user = require('./routes/user');
var role = require('./routes/role');

var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app = opensesame({
  secret: 'testSecret',
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
  },
  httpsOnly: false
}, app);

app.use('/profile/user', user);
app.use('/profile/role', role);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
});


module.exports = app;
