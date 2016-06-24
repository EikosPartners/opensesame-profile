var path = require('path');
var express = require('express');
var router = express.Router();
var JsonStorageService = require(path.join(__dirname, '../services/JsonStorageService'));
var userService = new JsonStorageService('users.json');

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
      res.json(user);
    }
  });
});

router.post('/:id', (req, res, next) => {
  if(req.body) {
    userService.create(req.params.id, req.body, (err, user) => {
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

router.put('/:id', (req, res, next) => {
  if(req.body) {
    userService.update(req.params.id, req.body, (err, user) => {
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

router.delete('/:id', (req, res, next) => {
  userService.delete(req.params.id, (err, user) => {
    if(err) {
      res.status(500).end();
    } else {
      res.json(user);
    }
  });
});

module.exports = router;
