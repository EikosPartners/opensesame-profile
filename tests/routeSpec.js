var chai = require('chai'),
  path = require('path'),
  fs = require('fs'),
  jwt = require('jsonwebtoken'),
  fsWrapper = require('ep-utils/fsWrapper'),
  opensesameProfile = require(path.join(__dirname, '../app.js')),
  request = require('supertest'),
  utils = require('./utils'),
  expect = chai.expect;

let config = {
  secret: 'testSecret',
  httpsOnly: false,
  middleware: function(req, res, next) {
    expect(req).to.have.ownProperty('user');
    if(req.user.username === 'peter2') {
      return res.status(401).end();
    } else {
      next();
    }
  }
};


describe('Route tests', () => {
  describe('User tests', () => {
    var agent;
    before((done) => {
      utils.deleteTempDB();

      var app = opensesameProfile(config);

      app.get('/test', function (req, res, next) {
        expect(req.user).to.be.an('object');
        expect(req.user).to.have.ownProperty('roles');
        expect(req.user.roles).to.be.an('array');
        expect(req.user.roles).to.contain('admin');
        res.status(200).end();
      });

      agent = request.agent(app);

      agent
        .post('/auth/register')
        .type('form')
        .send({ username: 'peter', password: 'test1234', password2: 'test1234' })
        .expect('set-cookie', /auth=[\w\-_]+?\.[\w\-_]+?\.[\w\-_]+; Path=\/; HttpOnly/)
        .end(done);

    });

    after(utils.deleteTempDB);

    it('should get one user', (done) => {
      agent
        .get('/profile/user')
        .expect('Content-Type', /json/)
        .expect(200, [{
          username: 'peter',
          password: 'test1234',
          roles: []
        }], done);
    });

    it('should create a user', (done) => {
      agent
        .post('/profile/user/peter2')
        .send({username: 'peter2', password: 'test12345'})
        .expect('Content-Type', /json/)
        .expect(200, { username: 'peter2', password: 'test12345', roles: [] }, done);
    });

    it('should get two users', (done) => {
      agent
        .get('/profile/user')
        .expect('Content-Type', /json/)
        .expect(200, [
          { username: 'peter', password: 'test1234', roles: [] },
          { username: 'peter2', password: 'test12345', roles: [] }
        ], done);
    });

    it('should get a single user by key', (done) => {
      agent
        .get('/profile/user/peter2')
        .expect('Content-Type', /json/)
        .expect(200, { username: 'peter2', password: 'test12345', roles: [] }, done);
    });

    it('should update a user', (done) => {
      agent
        .put('/profile/user/peter2')
        .send({ username: 'peter2', password: 'test', hairColor: 'blue' })
        .expect('Content-Type', /json/)
        .expect(200, { username: 'peter2', password: 'test', hairColor: 'blue', roles: [] }, done);
    });

    it('should get the updated user', (done) => {
      agent
        .get('/profile/user/peter2')
        .expect('Content-Type', /json/)
        .expect(200, { username: 'peter2', password: 'test', hairColor: 'blue', roles: [] }, done);
    });

    it('should update many users', (done) => {
      agent
        .put('/profile/user')
        .send([{
              username: 'peter',
              password: 'abc123',
              roles: ['admin'],
              bloodType: 'A+'
        }])
        .expect('Content-Type', /json/)
        .expect(200, [
          {
              username: 'peter',
              password: 'abc123',
              roles: ['admin'],
              bloodType: 'A+'
          },
          {
              username: 'peter2',
              password: 'test',
              hairColor: 'blue',
              roles: []
          }
        ], done);
    });

    it('should update cookies on next request', (done) => {
      agent
        .get('/test')
        .expect('set-cookie', /auth=[\w\-_]+?\.[\w\-_]+?\.[\w\-_]+; Path=\/; HttpOnly/)
        .expect(function (res) {
          var userCookieRegex = /auth=([\w\-_]+?\.[\w\-_]+?\.[\w\-_]+); Path=\/; HttpOnly/g;
          var userCookie = res.headers['set-cookie'][0];
          var matches = userCookieRegex.exec(userCookie);
          var token = matches[1];
          expect(token).to.not.be.a('null');
          expect(token).to.not.be.a('undefined');
          var decoded = jwt.verify(token, config.secret);
          // console.log(decoded);
          expect(decoded).to.be.an('object');
          expect(decoded).to.have.ownProperty('roles');
          expect(decoded.roles).to.be.an('array');
          expect(decoded.roles).to.contain('admin');
        })
        .end(done);
    });

    it('should add a role to a user', (done) => {
      agent
        .put('/profile/user/peter2/role/admin')
        .expect('Content-Type', /json/)
        .expect(200, { username: 'peter2', password: 'test', roles: ['admin'], hairColor: 'blue' }, done);
    });

    // it('should get a user with role properties', (done) => {
    //   agent
    //     .get('/profile/user/peter2')
    //     .expect('Content-Type', /json/)
    //     .expect(200, { username: 'peter2', password: 'test', roles: [], hairColor: 'blue', allowedModules: ['dynamicModule'] }, done);
    // });

    it('should add another role to a user', (done) => {
      agent
        .put('/profile/user/peter2/role/user')
        .expect('Content-Type', /json/)
        .expect(200, { username: 'peter2', password: 'test', roles: ['admin', 'user'], hairColor: 'blue' }, done);
    });

    // it('should get a user with role properties from 2 roles', (done) => {
    //   agent
    //     .get('/profile/user/peter2')
    //     .expect('Content-Type', /json/)
    //     .expect(200, { username: 'peter2', password: 'test', roles: [], hairColor: 'blue', allowedModules: ['dynamicModule', 'moduleA', 'moduleB'] }, done);
    // });

    // it('should add a third role to a user', (done) => {
    //   roleService.create('owner', {allowedModules: ['moduleOwner'], allowedRoutes: ['/admin']}, (err, role) => {
    //     agent
    //       .put('/profile/user/peter2/role/owner')
    //       .expect('Content-Type', /json/)
    //       .expect(200, { roles: ['admin', 'user', 'owner'], data: { username: 'peter2', password: 'test', hairColor: 'blue' } }, done);
    //   });
    // });

    // it('should get a user with role properties from 3 roles', (done) => {
    //   agent
    //     .get('/profile/user/peter2')
    //     .expect('Content-Type', /json/)
    //     .expect(200, { username: 'peter2', password: 'test', hairColor: 'blue', allowedModules: ['dynamicModule', 'moduleA', 'moduleB', 'moduleOwner'], allowedRoutes: ['/admin'] }, done);
    // });

    // it('should add a fourth non-existant role to a user', (done) => {
    //     agent
    //       .put('/profile/user/peter2/role/null')
    //       .expect('Content-Type', /json/)
    //       .expect(200, { roles: ['admin', 'user', 'owner', 'null'], data: { username: 'peter2', password: 'test', hairColor: 'blue' } }, done);
    // });
    //
    // it('should get a user with role properties from 4 roles', (done) => {
    //   agent
    //     .get('/profile/user/peter2')
    //     .expect('Content-Type', /json/)
    //     .expect(200, { username: 'peter2', password: 'test', hairColor: 'blue', allowedModules: ['dynamicModule', 'moduleA', 'moduleB', 'moduleOwner'], allowedRoutes: ['/admin'] }, done);
    // });

    it('should run the middleware', function (done) {
      //login as unauthorized user
      agent
        .post('/auth/login')
        .type('form')
        .send({ username: 'peter2', password: 'test' })
        .end(function () {
          //after login, make request to protected route
          agent
            .get('/profile/user')
            .expect(401)
            .end(function () {
              //log back in as authorized user for next tests
              agent
                .post('/auth/login')
                .type('form')
                .send({ username: 'peter', password: 'abc123' })
                .end(done);
            });
        });
    });

    it('should delete a user', (done) => {
      agent
        .delete('/profile/user/peter2')
        .expect('Content-Type', /json/)
        .expect(200, { username: 'peter2', password: 'test', roles: ['admin', 'user'], hairColor: 'blue' }, done);
    });

    it('should get one user again', (done) => {
      agent
        .get('/profile/user')
        .expect('Content-Type', /json/)
        .expect(200, [{
              username: 'peter',
              password: 'abc123',
              roles: ['admin'],
              bloodType: 'A+'
        }], done);
    });

  }); //user tests
});
