//Taken from the opensesame project
var chai = require('chai'),
  path = require('path'),
  request = require('supertest'),
  opensesameProfile = require(path.join(__dirname, '../app.js')),
  jwt = require('jsonwebtoken'),
  expect = chai.expect;

var userStore = {

};

var config = {
    secret: 'test',
    httpsOnly: false
  };

var app = opensesameProfile(config);

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/test', function (req, res) {
  expect(req).to.have.property('user');
  expect(req.user).to.have.property('user');
  expect(req.user.user).to.equal('peter');
  res.status(200).end();
});

var agent = request.agent(app);

describe('Authentication Test', function () {
  describe('Register Test', function () {
    it('should show a register page', function (done) {
      agent.get('/register')
        .expect(200)
        .expect(function (res) {
          expect(res.text).to.contain('<html>');
        })
        .end(done);
    });
    it('should verify that you are not logged in', function (done) {
      agent.get('/auth/verify')
        .expect(302)
        .end(done);
    });
    it('should fail to register when passwords don\'t match', function (done) {
      agent.post('/auth/register')
        .type('form')
        .send({ user: 'peter', pass: 'test1234', pass2: 'test12345' })
        .end(done);
    });
    it('should register a new user and login', function (done) {
      agent.post('/auth/register')
        .type('form')
        .send({ user: 'peter', pass: 'test1234', pass2: 'test1234' })
        .expect('set-cookie', /auth=[\w\-_]+?\.[\w\-_]+?\.[\w\-_]+; Path=\/; HttpOnly/)
        .expect(function (res) {
          var userCookieRegex = /auth=([\w\-_]+?\.[\w\-_]+?\.[\w\-_]+); Path=\/; HttpOnly/g;
          var userCookie = res.headers['set-cookie'][0];
          var matches = userCookieRegex.exec(userCookie);
          var token = matches[1];
          expect(token).to.not.be.a('null');
          expect(token).to.not.be.a('undefined');
          var decoded = jwt.verify(token, config.secret);
          expect(decoded).to.be.an('object');
          expect(decoded).to.have.ownProperty('user');
          expect(decoded.user).to.equal('peter');
        })
        .end(done);
    });
    it('should verify that you are logged in', function (done) {
      agent.get('/auth/verify')
        .expect(200)
        .end(done);
    });
  });
  describe('Login test', function () {
    before(function (done) {
      agent.get('/auth/logout')
        .end(done);
    });
    it('should show a login page', function (done) {
      agent.get('/login')
        .expect(200)
        .expect(function (res) {
          expect(res.text).to.contain('<html>');
        })
        .end(done);
    });
    it('should not allow access to / route before authentication', function (done) {
      agent.get('/')
        .expect(302)
        .end(done);
    });
    it('should verify that you are not logged in', function (done) {
      agent.get('/auth/verify')
        .expect(302)
        .end(done);
    });
    it('should not login on bad credentials', function(done) {
      agent.post('/auth/login')
        .type('form')
        .send({ user: 'peter', pass: 'test12345' })
        .expect(302)
        .end(done);
    });
    it('should login', function(done) {
      agent.post('/auth/login')
        .type('form')
        .send({ user: 'peter', pass: 'test1234' })
        .expect(302)
        .expect('set-cookie', /auth=[\w\-_]+?\.[\w\-_]+?\.[\w\-_]+; Path=\/; HttpOnly/)
        .expect(function (res) {
          var userCookieRegex = /auth=([\w\-_]+?\.[\w\-_]+?\.[\w\-_]+); Path=\/; HttpOnly/g;
          var userCookie = res.headers['set-cookie'][0];
          var matches = userCookieRegex.exec(userCookie);
          var token = matches[1];
          expect(token).to.not.be.a('null');
          expect(token).to.not.be.a('undefined');
          var decoded = jwt.verify(token, config.secret);
          expect(decoded).to.be.an('object');
          expect(decoded).to.have.ownProperty('user');
          expect(decoded.user).to.equal('peter');
        })
        .end(done);
    });
    it('should allow access to / route after authentication', function (done) {
      agent.get('/')
        .expect(200)
        .expect(function (res) {
          expect(res.text).to.equal('Hello World!');
        })
        .end(done);
    });
    it('should verify that you are logged in', function (done) {
      agent.get('/auth/verify')
        .expect(200)
        .end(done);
    });
    it('should set req.user to the return value of checkUser', function (done) {
      agent.get('/test')
        .expect(200)
        .end(done);
    });
  });
  describe('Logout test', function () {
    it('should verify that you are still logged in', function (done) {
      agent.get('/auth/verify')
        .expect(200)
        .end(done);
    });
    it('should allow access to / route before logging out', function (done) {
      agent.get('/')
        .expect(200)
        .expect(function (res) {
          expect(res.text).to.equal('Hello World!');
        })
        .end(done);
    });
    it('should logout', function (done) {
      agent.get('/auth/logout')
        .expect(302)
        .expect('set-cookie', /auth=; Path=\/; Expires=Thu, 01 Jan 1970 00:00:00 GMT/)
        .end(done);
    });
    it('should not allow access to / route after logging out', function (done) {
      agent.get('/')
        .expect(302)
        .end(done);
    });
    it('should verify that you are no longer logged in', function (done) {
      agent.get('/auth/verify')
        .expect(302)
        .end(done);
    });
  });
});
