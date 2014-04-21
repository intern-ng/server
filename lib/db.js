
var util = require('./utility');

// Load configuration
var cfg = util.defaults(require('../configure'), {
  mysql: {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'interng'
  }
});

var mysql = require('mysql');

var db = module.exports = mysql.createPool(cfg.mysql);

var qb = require('./querybuilder')(db.getConnection.bind(db));

var _ = require('lodash');
var passhash = require('password-hash');

_.extend(db, {



});

