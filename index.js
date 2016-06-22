var jsonfile = require('jsonfile'),
  debug = require('debug')('opensesame-profile'),
  fs = require('fs');

var file = 'data.json';

try {
  fs.readFileSync(file);
} catch (ex) {
  debug(ex);
  fs.writeFileSync(file, JSON.stringify({}));
}


module.exports = {
  checkUser: function (userObject, callback) {
    var allUsers = jsonfile.readFileSync(file);
    if(allUsers) {
      if(allUsers.hasOwnProperty(userObject.user)) {
        var user = allUsers[userObject.user];
        if(userObject.pass === user.pass) {
          callback(null, {username: user.user});
        } else {
          callback('Incorrect password');
        }
      } else {

      }
    } else {
      callback('Database cannot be read');
    }
  },
  registerUser: function (userObject, callback) {
    var allUsers = jsonfile.readFileSync(file);
    if(!allUsers) {
      allUsers = {};
    }
    if(!allUsers.hasOwnProperty(userObject.user)) {
      allUsers[userObject.user] = userObject;
      jsonfile.writeFileSync(file, allUsers);
      callback(null, {username: userObject.user});
    } else {
      callback('User already exists');
    }
  }
};
