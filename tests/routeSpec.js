var chai = require('chai'),
  path = require('path'),
  fs = require('fs'),
  fsWrapper = require('ep-utils').fsWrapper,
  opensesameProfile = require('../app.js'),
  JsonStorageService = require('../services/JsonStorageService'),
  roleService = new JsonStorageService('roles.json'),
  request = require('supertest'),
  expect = chai.expect;

let config = {
  secret: 'testSecret',
  httpsOnly: false
};

let app = opensesameProfile(config);

var agent = request.agent(app);

describe('Route tests', () => {
  describe('User tests', () => {
    before((done) => {
      try {
        fs.unlinkSync(path.join(__dirname, '../users.json'));
        fs.unlinkSync(path.join(__dirname,'../roles.json'));
      } catch (ex) { }

      agent
        .post('/auth/register')
        .type('form')
        .send({ user: 'peter', pass: 'test1234', pass2: 'test1234' })
        .end(done);

    });

    after(() => {
      try {
        fs.unlinkSync(path.join(__dirname, '../users.json'));
        fs.unlinkSync(path.join(__dirname,'../roles.json'));
      } catch (ex) { }
    });

    it('should get one user', (done) => {
      agent
        .get('/profile/user')
        .expect('Content-Type', /json/)
        .expect(200, {
          peter: { roles: [], data: { user: 'peter', pass: 'test1234', pass2: 'test1234' } }
        }, done);
    });

    it('should create a user', (done) => {
      agent
        .post('/profile/user/peter2')
        .send({user: 'peter2', pass: 'test12345'})
        .expect('Content-Type', /json/)
        .expect(200, { user: 'peter2', pass: 'test12345' }, done);
    });

    it('should get two users', (done) => {
      agent
        .get('/profile/user')
        .expect('Content-Type', /json/)
        .expect(200, {
          peter: { roles: [], data: { user: 'peter', pass: 'test1234', pass2: 'test1234'} },
          peter2: { roles: [], data: { user: 'peter2', pass: 'test12345' } }
        }, done);
    });

    it('should get a single user by key', (done) => {
      agent
        .get('/profile/user/peter2')
        .expect('Content-Type', /json/)
        .expect(200, { user: 'peter2', pass: 'test12345' }, done);
    });

    it('should update a user', (done) => {
      agent
        .put('/profile/user/peter2')
        .send({ user: 'peter2', pass: 'test', hairColor: 'blue' })
        .expect('Content-Type', /json/)
        .expect(200, { user: 'peter2', pass: 'test', hairColor: 'blue' }, done);
    });

    it('should get the updated user', (done) => {
      agent
        .get('/profile/user/peter2')
        .expect('Content-Type', /json/)
        .expect(200, { user: 'peter2', pass: 'test', hairColor: 'blue' }, done);
    });

    it('should add a role to a user', (done) => {
      roleService.create('admin', {allowedModules: ['dynamicModule']}, (err, role) => {
        agent
          .put('/profile/user/peter2/role/admin')
          .expect('Content-Type', /json/)
          .expect(200, { roles: ['admin'], data: { user: 'peter2', pass: 'test', hairColor: 'blue' } }, done);
      });
    });

    it('should get a user with role properties', (done) => {
      agent
        .get('/profile/user/peter2')
        .expect('Content-Type', /json/)
        .expect(200, { user: 'peter2', pass: 'test', hairColor: 'blue', allowedModules: ['dynamicModule'] }, done);
    });

    it('should add another role to a user', (done) => {
      roleService.create('user', {allowedModules: ['moduleA', 'moduleB']}, (err, role) => {
        agent
          .put('/profile/user/peter2/role/user')
          .expect('Content-Type', /json/)
          .expect(200, { roles: ['admin', 'user'], data: { user: 'peter2', pass: 'test', hairColor: 'blue' } }, done);
      });
    });

    it('should get a user with role properties from 2 roles', (done) => {
      agent
        .get('/profile/user/peter2')
        .expect('Content-Type', /json/)
        .expect(200, { user: 'peter2', pass: 'test', hairColor: 'blue', allowedModules: ['dynamicModule', 'moduleA', 'moduleB'] }, done);
    });

    it('should add a third role to a user', (done) => {
      roleService.create('owner', {allowedModules: ['moduleOwner'], allowedRoutes: ['/admin']}, (err, role) => {
        agent
          .put('/profile/user/peter2/role/owner')
          .expect('Content-Type', /json/)
          .expect(200, { roles: ['admin', 'user', 'owner'], data: { user: 'peter2', pass: 'test', hairColor: 'blue' } }, done);
      });
    });

    it('should get a user with role properties from 3 roles', (done) => {
      agent
        .get('/profile/user/peter2')
        .expect('Content-Type', /json/)
        .expect(200, { user: 'peter2', pass: 'test', hairColor: 'blue', allowedModules: ['dynamicModule', 'moduleA', 'moduleB', 'moduleOwner'], allowedRoutes: ['/admin'] }, done);
    });

    it('should add a fourth non-existant role to a user', (done) => {
        agent
          .put('/profile/user/peter2/role/null')
          .expect('Content-Type', /json/)
          .expect(200, { roles: ['admin', 'user', 'owner', 'null'], data: { user: 'peter2', pass: 'test', hairColor: 'blue' } }, done);
    });

    it('should get a user with role properties from 4 roles', (done) => {
      agent
        .get('/profile/user/peter2')
        .expect('Content-Type', /json/)
        .expect(200, { user: 'peter2', pass: 'test', hairColor: 'blue', allowedModules: ['dynamicModule', 'moduleA', 'moduleB', 'moduleOwner'], allowedRoutes: ['/admin'] }, done);
    });

    it('should delete a user', (done) => {
      agent
        .delete('/profile/user/peter2')
        .expect('Content-Type', /json/)
        .expect(200, { user: 'peter2', pass: 'test', hairColor: 'blue' }, done);
    });

    it('should get one user', (done) => {
      agent
        .get('/profile/user')
        .expect('Content-Type', /json/)
        .expect(200, {
          peter: { roles: [], data: { user: 'peter', pass: 'test1234', pass2: 'test1234' } }
        }, done);
    });
  }); //user tests
});
