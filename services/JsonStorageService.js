var fsWrapper = require('ep-utils').fsWrapper;
var _ = require('lodash');

module.exports = class JsonStorageService {

  constructor(file) {
    this.file = file;
  }

  create(id, obj, callback) {
    fsWrapper.fileToJson(this.file, (err, json) => {
      if(err) {
        json = {};
      }

      if(json.hasOwnProperty(id)) {
        return callback('Already exists');
      }

      json[id] = obj;
      fsWrapper.jsonToFile(this.file, json, (err, res) => {
        if(err) {
          return callback(err);
        }
        callback(null, obj);
      });
    });
  }

  updateAll(json, callback) {    
    fsWrapper.jsonToFile(this.file, json, (err, res) => {
      if(err) {
        return callback(err);
      }
      callback(null, res.data);
    });
  }

  update(id, obj, callback) {
    fsWrapper.fileToJson(this.file, (err, json) => {
      if(err) {
        return callback('Does not exist');
      }

      if(json.hasOwnProperty(id)) {
        json[id] = obj;
      } else {
        return callback('Does not exist');
      }

      fsWrapper.jsonToFile(this.file, json, (err, res) => {
        if(err) {
          return callback(err);
        }
        callback(null, obj);
      });
    });
  }

  delete(id, callback) {
    fsWrapper.fileToJson(this.file, (err, json) => {
      if(err) {
        return callback('Does not exist');
      }

      if(json.hasOwnProperty(id)) {
        fsWrapper.jsonToFile(this.file, _.omit(json, id), (err, res) => {
          if(err) {
            return callback(err);
          }
          callback(null, json[id]);
        });
      } else {
        return callback('Does not exist');
      }
    });
  }

  get(id, callback) {
    fsWrapper.fileToJson(this.file, (err, json) => {
      if(err) {
        return callback('Not found');
      }

      if(json.hasOwnProperty(id)) {
        callback(null, json[id]);
      } else {
        callback('Not found');
      }
    });
  }

  getAll(callback) {
    fsWrapper.fileToJson(this.file, (err, json) => {
      if(err) {
        return callback(null, {});
      }

      callback(null, json);
    });
  }

};
