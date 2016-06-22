var jsonfile = require('jsonfile');

var file = 'data.json';

module.exports = {
  get: function (userObject) {
    var users = json.file.readFileSync(file);
    if(users) {
      return users[user];
    } else {
      return null;
    }
  },
  create: function(userObject) {
    var users = json.file.readFileSync(file);
    if(users) {
      return users[user];
    } else {
      return null;
    }
  }
};
