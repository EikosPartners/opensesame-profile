var chai = require('chai'),
  path = require('path'),
  fs = require('fs'),
  opensesameProfile = require(path.join(__dirname, '../index.js')),
  expect = chai.expect;

describe('All tests', function () {
  after(function () {
    //delete data.json after running tests
    fs.unlinkSync('data.json');
  });

  it('should create a user', function (done) {
    opensesameProfile.registerUser({user: 'peter', pass: 'test'}, function (err, userObject) {
      expect(err).to.be.a('null');
      expect(userObject).to.be.an('object');
      expect(userObject).to.have.property('username');
      expect(userObject.username).to.equal('peter');
      opensesameProfile.checkUser({user: 'peter', pass: 'test'}, function(err, userObject) {
        expect(err).to.be.a('null');
        expect(userObject).to.be.an('object');
        done();
      });
    });
  });

  it('should create another user', function (done) {
    opensesameProfile.registerUser({user: 'peter2', pass: 'test2'}, function (err, userObject) {
      expect(err).to.be.a('null');
      expect(userObject).to.be.an('object');
      expect(userObject).to.have.property('username');
      expect(userObject.username).to.equal('peter2');
      opensesameProfile.checkUser({user: 'peter2', pass: 'test2'}, function(err, userObject) {
        expect(err).to.be.a('null');
        expect(userObject).to.be.an('object');
        opensesameProfile.checkUser({user: 'peter', pass: 'test'}, function(err, userObject) {
          expect(err).to.be.a('null');
          expect(userObject).to.be.an('object');
          done();
        });
      });
    });
  });

  it('should fail for wrong password', function (done) {
    opensesameProfile.checkUser({user: 'peter', pass: 'wrongpass'}, function (err, userObject) {
      expect(err).to.be.a('string');
      expect(userObject).to.be.an('undefined');
      done();
    });
  });

  it('should not register duplicate user', function (done) {
    opensesameProfile.registerUser({
      user: 'peter',
      pass: 'test'
    }, function(err, userInfo) {
      expect(err).to.be.a('string');
      expect(userInfo).to.be.an('undefined');
      done();
    });
  });
});
