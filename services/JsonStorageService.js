var fsw = require('ep-utils/fsWrapper');
var _ = require('lodash');

var id = 0;

module.exports = class JsonStorageService {

  constructor(file, keyId) {
    // console.log('constructing JsonStorageService: ', file);
    // this.id = id++;
    // if(file === 'users.json') {
    //   var stack = new Error().stack
    //   console.log(this.id + ': ' + stack);
    // }
    this.file = file;
    this.keyId = keyId || 'username';
    this.cache = {};
    fsw.fileToJson(this.file, (err, json) => {
      // console.log(this.file + ':', json);
      if(!err && _.isArray(json)) {
        this.cache = _.keyBy(json, this.keyId);
      }
    });
  }

  createById(id, obj, callback) {
    // console.log('create: ', this.cache);
    // console.log('CREATE', id, obj, this.cache);
    if(this.cache.hasOwnProperty(id)) {
      return callback('Already exists');
    }

    this.cache[id] = obj;
    fsw.jsonToFile(this.file, _.values(this.cache), (err, res) => {
      if(err) {
        return callback(err);
      }
      callback(null, obj);
    });
  }

  updateAll(json, callback) {
    // console.log('updateAll: ', this.cache);
    //overwrite the cache with changes and write it to the db
    // console.log('json', json);
    // console.log('this.cache', this.cache);
    _.assignIn(this.cache, _.keyBy(json, this.keyId));
    // console.log('this.cache', this.cache);
    fsw.jsonToFile(this.file, _.values(this.cache), (err, res) => {
      if(err) {
        return callback(err);
      }
      callback(null, res.data);
    });
  }

  updateById(id, obj, callback) {
    // console.log('update: ', this.cache);
    if(this.cache.hasOwnProperty(id)) {
      this.cache[id] = obj;
    } else {
      return callback('Does not exist');
    }

    fsw.jsonToFile(this.file, _.values(this.cache), (err, res) => {
      if(err) {
        return callback(err);
      }
      callback(null, obj);
    });
  }

  deleteById(id, callback) {
    // console.log('delete: ', this.cache);
    if(this.cache.hasOwnProperty(id)) {
      let deleted = this.cache[id];
      delete this.cache[id];
      fsw.jsonToFile(this.file, _.values(this.cache), (err, res) => {
        if(err) {
          return callback(err);
        }
        callback(null, deleted);
      });
    } else {
      return callback('Does not exist');
    }
  }

  getById(id, callback) {
    // console.log(this.file, this.id);
    // if(this.id === 2) {
    //   var stack = new Error().stack
    //   console.log(this.id + ': ' + stack);
    // }
    // console.log('getById', this.cache);
    if(this.cache.hasOwnProperty(id)) {
      callback(null, this.cache[id]);
    } else {
      callback('Not found');
    }
  }

  getAll(callback) {
    // console.log(this.file, this.id);
    // if(this.id === 1) {
    //   var stack = new Error().stack
    //   console.log(this.id + ': ' + stack);
    // }
    // console.log('getAll: ', this.cache);
    callback(null, _.values(this.cache));
  }

};
