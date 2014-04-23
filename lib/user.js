var db = require('./db');
var express = require('express');
var crypto = require('crypto');
var error = require('./error');
var util = require('./utility');
var passhash = require('password-hash');

var app = module.exports = express();

app.post('/signin', function(req, res, next) {

  if (!req.body.username || !req.body.password) {
    return res.send(400);
  }

  db.user.querySigninInfo({username: req.body.username}, function(err, row) {
    if (err) {
      return next(err);
    }

    if (row.length == 0) {
      return res.send(403);
    } else {
      if (!passhash.verify(req.body.password, row[0].secret))
        return res.send(403);

      delete row[0].secret;
      req.session.user_id = row[0].user_id;
      return res.send(200, row[0]);
    }
  });


});



