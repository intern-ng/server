
var express = require('express');
var crypto = require('crypto');
var error = require('./error');
var util = require('./utility');

// Load configuration
var cfg = util.defaults(require('../configure'), {
  logger: 'short',
  session: {
    secret : crypto.randomBytes(16).toString('hex')
  }
});

// Create express server instance
var app = express();

// Configure express middleware
app.use(express.logger(cfg.logger));
app.use(express.urlencoded());
app.use(express.json());
app.use(express.query());
app.use(express.compress());
app.use(express.cookieParser());
app.use(express.session(cfg.session));

// TODO custom routes

// Generic error handler
app.use(error.express);
app.use('/user', require('./user.js'))

module.exports = app;

