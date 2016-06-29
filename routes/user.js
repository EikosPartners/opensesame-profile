var path = require('path');
var express = require('express');
var _ = require('lodash');
var debug = require('debug')('opensesame-profile');
var router = express.Router();
var JsonStorageService = require(path.join(__dirname, '../services/JsonStorageService'));
var userService = new JsonStorageService('users.json');
var roleService = new JsonStorageService('roles.json');

router.get('/', (req, res, next) => {
  userService.getAll((err, users) => {
    if(!err) {
      res.json(users);
    } else {
      res.json(err);
    }
  });
});

router.get('/:id', (req, res, next) => {
  userService.get(req.params.id, (err, user) => {
    if(err) {
      res.status(500).end();
    } else {
      roleService.getAll((err, roles) => {
        let concatArrays = (objValue, srcValue) => {
          if (_.isArray(objValue)) {
            debug('routes/user.js:28:objValue', objValue);
            debug('routes/user.js:29:srcValue', srcValue);
            return _.union(objValue, srcValue);
          }
        };
        debug('routes/user.js:33:user', user);
        let roleObjects = _.map(user.roles, (role) => {
          return roles[role] || {};
        });
        debug('routes/user.js:37:roles', roleObjects);
        let mergedRolesObject = _.mergeWith.apply(this, roleObjects.concat(concatArrays));

        debug('routes/user.js:40:mergedRolesObject', mergedRolesObject);
        debug('routes/user.js:41:merged userdata', _.mergeWith(user.data, mergedRolesObject, concatArrays));
        res.json(_.mergeWith(user.data, mergedRolesObject, concatArrays));
      });
    }
  });
});

router.post('/:id', (req, res, next) => {
  if(req.body) {
    let user = {
      roles: [],
      data: req.body
    };
    userService.create(req.params.id, user, (err, user) => {
      if(err) {
        res.status(500).end();
      } else {
        res.json(user.data);
      }
    });
  } else {
    res.status(500).end();
  }
});

router.put('/', (req, res, next) => {
  if(req.body && _.isObject(req.body)) {
    userService.getAll((err, users) => {
      if(err) {
        return res.status(500).end();
      }

      let updatedUsers = _.pick(req.body, _.keys(users));
      userService.updateAll(_.assignIn(users, updatedUsers), (err, users) => {
        if(err) {
          res.status(500).end();
        } else {          
          res.json(users);
        }
      });

    });
  } else {
    res.status(500).end();
  }
});

router.put('/:id', (req, res, next) => {
  if(req.body) {
    userService.get(req.params.id, (err, user) => {
      if(err) {
        return res.status(500).end();
      }
      user.data = req.body;
      userService.update(req.params.id, user, (err, user) => {
        if(err) {
          res.status(500).end();
        } else {
          res.json(user.data);
        }
      });
    });
  } else {
    res.status(500).end();
  }
});

router.delete('/:id', (req, res, next) => {
  userService.delete(req.params.id, (err, user) => {
    if(err) {
      res.status(500).end();
    } else {
      res.json(user.data);
    }
  });
});

// For adding roles to a user

router.put('/:userId/role/:roleId', (req, res, next) => {
  userService.get(req.params.userId, (err, user) => {
    if(err) {
      return res.status(500).json('User does not exist').end();
    }

    // roleService.get(req.params.roleId, (err, role) => {
    //   if(err) {
    //     return res.status(500).json('Role does not exist').end();
    //   }

      //add this new role to this list of user's roles
      var currentUserRoles = user.roles;
      if(!_.isArray(currentUserRoles)) {
        currentUserRoles = [];
      }

      if(currentUserRoles.indexOf(req.params.roleId) !== -1) {
        return res.status(500).json('User already has role').end();
      }

      currentUserRoles.push(req.params.roleId);
      user.roles = currentUserRoles;

      userService.update(req.params.userId, user, (err, user) => {
        if(err) {
          res.status(500).end();
        } else {
          res.json(user);
        }
      });
    // });
  });
});

router.delete('/:userId/role/:roleId', (req, res, next) => {
  userService.get(req.params.userId, (err, user) => {
    if(err) {
      return res.status(500).json('User does not exist').end();
    }

    //add this new role to this list of user's roles
    var currentUserRoles = user.roles;
    if(!_.isArray(currentUserRoles)) {
      return res.status(500).json('User does not have this role').end();
    }

    if(currentUserRoles.indexOf(req.params.roleId) === -1) {
      return res.status(500).json('User does not have this role').end();
    }

    currentUserRoles.splice(currentUserRoles.indexOf(req.params.roleId), 1);
    user.roles = currentUserRoles;

    userService.update(req.params.userId, user, (err, user) => {
      if(err) {
        res.status(500).end();
      } else {
        res.json(user);
      }
    });
  });
});

module.exports = router;
