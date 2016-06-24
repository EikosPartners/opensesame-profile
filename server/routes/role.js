var path = require('path');
var express = require('express');
var router = express.Router();
var JsonStorageService = require(path.join(__dirname, '../services/JsonStorageService'));
var roleService = new JsonStorageService('roles.json');

router.get('/', (req, res, next) => {
  roleService.getAll((err, roles) => {
    console.log('got all');
    if(!err) {
      res.json(roles);
    } else {
      res.json(err);
    }
  });
});

router.get('/:id', (req, res, next) => {
  roleService.get(req.params.id, (err, role) => {
    if(err) {
      res.status(500).end();
    } else {
      res.json(role);
    }
  });
});

router.post('/:id', (req, res, next) => {
  if(req.body) {
    roleService.create(req.params.id, req.body, (err, role) => {
      if(err) {
        res.status(500).end();
      } else {
        res.json(role);
      }
    });
  } else {
    res.status(500).end();
  }
});

router.put('/:id', (req, res, next) => {
  if(req.body) {
    roleService.update(req.params.id, req.body, (err, role) => {
      if(err) {
        res.status(500).end();
      } else {
        res.json(role);
      }
    });
  } else {
    res.status(500).end();
  }
});

router.delete('/:id', (req, res, next) => {
  roleService.delete(req.params.id, (err, role) => {
    if(err) {
      res.status(500).end();
    } else {
      res.json(role);
    }
  });
});

module.exports = router;
