var chai = require('chai'),
  path = require('path'),
  fs = require('fs'),
  JsonStorageService = require(path.join(__dirname, '../services/JsonStorageService')),
  expect = chai.expect;

describe('Service tests', function () {
  let testFile = 'test.json';
  let testStorageManager = new JsonStorageService(testFile);
  afterEach(function () {
    //delete file after running tests
    fs.unlinkSync(testFile);
  });
  it('should create and read a json file', function (done) {
    let testData = {'testKey': 'testVal'};
    //file should not exist
    try {
      fs.lstatSync(testFile);
    } catch (ex) {
      expect(ex).to.not.be.a('null');
    }
    testStorageManager.createById('testKey', testData, function (err, result) {
      expect(err).to.be.a('null');
      expect(result).to.deep.equal(testData);
      //file should exist
      expect(fs.lstatSync(testFile)).to.be.an('object');
      testStorageManager.getById('testKey', function (err, result) {
        expect(err).to.be.a('null');
        expect(result).to.deep.equal(testData);
        done();
      });
    });
  });
});
