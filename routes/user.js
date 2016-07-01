var path = require('path');
var express = require('express');
var _ = require('lodash');
var debug = require('debug')('opensesame-profile');
var router = express.Router();

//TODO: verify ids match the key that is the id or just don't take ids

module.exports = function(userService) {
  // console.log('Creating user routes: ' + userService.id);
  router.get('/', (req, res, next) => {
    // console.log(userService.id);
    userService.getAll((err, users) => {
      // console.log('getAllUsers: ', users);
      if(err) {
        res.status(500).json(err).end();
      } else {
        res.json(users);
      }
    });
  });

  router.get('/:id', (req, res, next) => {
    // console.log(userService.id);
    userService.getById(req.params.id, (err, user) => {
      if(err) {
        res.status(500).end();
      } else {
        res.json(user);
        // roleService.getAll((err, roles) => {
        //   let concatArrays = (objValue, srcValue) => {
        //     if (_.isArray(objValue)) {
        //       debug('routes/user.js:28:objValue', objValue);
        //       debug('routes/user.js:29:srcValue', srcValue);
        //       return _.union(objValue, srcValue);
        //     }
        //   };
        //   debug('routes/user.js:33:user', user);
        //   let roleObjects = _.map(user.roles, (role) => {
        //     return roles[role] || {};
        //   });
        //   debug('routes/user.js:37:roles', roleObjects);
        //   let mergedRolesObject = _.mergeWith.apply(this, roleObjects.concat(concatArrays));
        //
        //   debug('routes/user.js:40:mergedRolesObject', mergedRolesObject);
        //   debug('routes/user.js:41:merged userdata', _.mergeWith(user, mergedRolesObject, concatArrays));
        //   res.json(_.mergeWith(user, mergedRolesObject, concatArrays));
        // });
      }
    });
  });

  router.post('/:id', (req, res, next) => {
    // console.log(userService.id);
    if(req.body) {
      let user = req.body;
      user.roles = [];
      userService.createById(req.params.id, user, (err, user) => {
        if(err) {
          res.status(500).end();
        } else {
          res.json(user);
        }
      });
    } else {
      res.status(500).end();
    }
  });

  router.put('/', (req, res, next) => {
    // console.log(userService.id);
    if(req.body && _.isArray(req.body)) {
      userService.updateAll(req.body, (err, users) => {
        if(err) {
          res.status(500).end();
        } else {
          res.json(users);
        }
      });
    } else {
      res.status(500).end();
    }
  });

  router.put('/:id', (req, res, next) => {
    // console.log(userService.id);
    if(req.body) {
      userService.getById(req.params.id, (err, user) => {
        if(err) {
          return res.status(500).end();
        }
        //don't allow this route to modify roles, there's already a route for that
        req.body.roles = user.roles;

        userService.updateById(req.params.id, req.body, (err, user) => {
          if(err) {
            res.status(500).end();
          } else {
            res.json(user);
          }
        });
      });
    } else {
      res.status(500).end();
    }
  });

  router.delete('/:id', (req, res, next) => {
    // console.log(userService.id);
    userService.deleteById(req.params.id, (err, user) => {
      if(err) {
        res.status(500).end();
      } else {
        res.json(user);
      }
    });
  });

  // For adding roles to a user

  router.put('/:userId/role/:roleId', (req, res, next) => {
    // console.log(userService.id);
    userService.getById(req.params.userId, (err, user) => {
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

      userService.updateById(req.params.userId, user, (err, user) => {
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
    // console.log(userService.id);
    userService.getById(req.params.userId, (err, user) => {
      if(err) {
        return res.status(500).json('User does not exist').end();
      }

      //add this new role to this list of user's roles
      var currentUserRoles = user.roles;
      if(!_.isArray(currentUserRoles) || currentUserRoles.indexOf(req.params.roleId) === -1) {
        return res.status(500).json('User does not have this role').end();
      }

      currentUserRoles.splice(currentUserRoles.indexOf(req.params.roleId), 1);
      user.roles = currentUserRoles;

      userService.updateById(req.params.userId, user, (err, user) => {
        if(err) {
          res.status(500).end();
        } else {
          res.json(user);
        }
      });
    });
  });

  return router;
};
