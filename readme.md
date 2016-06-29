# OpenSesame Profile
[![Build Status](https://travis-ci.org/EikosPartners/opensesame-profile.svg?branch=master)](https://travis-ci.org/EikosPartners/opensesame-profile)

A solution for applications that use PJSON to gain profile capabilities and user management

It provides the following routes for authentication purposes:
### API
- _GET_ __/profile/user__ - Gets all users.
- _PUT_ __/profile/user__ - Updates all users at the same time. The body of the request will be merged into the database.
- _GET_ __/profile/user/:userId__ - Gets a user by their id.
- _POST_ __/profile/user/:userId__ - Creates a new user with __userId__. The body of the request will be the json that is stored for that user.
- _PUT_ __/profile/user/:userId__ - Updates a new user with __userId__. The body of the request will be the json that is stored for that user.
- _DELETE_ __/profile/user/:userId__ - Deletes a new user with __userId__.
- _PUT_ __/profile/user/:userId/role/:roleId__ - Adds a role named __roleId__ to a user with __userId__
- _DELETE_ __/profile/user/:userId/role/:roleId__ - Deletes a role named __roleId__ from a user with __userId__

## Configuration options
Opensesame Profile options are passed directly to OpenSesame so all OpenSesame options can be used here as well.
### Required

- __secret__ - A string which is used by the JWT library to crpytographically sign and verify JWTs.

__checkUser__, __registerUser__, and __refreshUser__ are implemented by OpenSesame Profile so they are not required here.

### Optional

Opensesame Profile has the same optional options as Opensesame with one addition:

- __middleware__ - A function or an array of functions that is express middleware that will be run after opensesame middleware but before opensesame-profile middleware. This can be used to provide authorization to the /profile routes by using the req.user object that opensesame provides for example.

## Example
Check the example folder for a running example of how to use opensesame.
```
var opensesameProfile = require('opensesame-profile');
//you can give opensesame-profile an express app object
opensesameProfile({
    secret: 'testSecret',
    middleware: function (req, res, next) {
        //also can check which route this is accessing
        if(req.user.roles.indexOf('admin') !== -1) {
            next();
        } else {
            res.status(401).end();
        }
    },
    httpsOnly: false
}, app);
```
```
//or have it generate one for you
var app = opensesameProfile({
    secret: 'testSecret',
    middleware: function (req, res, next) {
        //also can check which route this is accessing
        if(req.user.roles.indexOf('admin') !== -1) {
            next();
        } else {
            res.status(401).end();
        }
    },
    httpsOnly: false
});
```

Note: OpenSesame Profile uses OpenSesame and it uses the bodyParser.json() middleware.
