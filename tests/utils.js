var path = require('path');
var fs = require('fs');


module.exports = {
  deleteTempDB: function () {
    // console.log('deleting temp files');
    try {
      fs.unlinkSync(path.join(__dirname, '../users.json'));
      fs.unlinkSync(path.join(__dirname,'../roles.json'));
    } catch (ex) {
      // console.log(ex);
    }
  }
};
