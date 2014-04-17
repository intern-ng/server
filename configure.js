
var _ = require('lodash');
var crypto = require('crypto');
var util = require('./lib/utility');

var cfg = module.exports = {

  ///
  // Host and port the server should listening on
  ///
  host: process.env.HOST || '0.0.0.0',
  port: process.env.PORT || 4032,

  ///
  // Passed to connect.logger middleware
  // Documentation:
  //    http://www.senchalabs.org/connect/logger.html
  ///
  logger: 'short',

  ///
  // Passed to connect.session middleware
  // Documentation:
  //    http://www.senchalabs.org/connect/session.html
  ///
  session: {
    secret : crypto.randomBytes(16).toString('hex'),
    // TODO Redis Session Store
    // store: new RedisStore({
    //      port: process.env.REDIS_SESSION_PORT,
    //      db: process.env.REDIS_SESSION_DB
    // })
  },

  ///
  // Passed to mysql.createPool
  // Documentation:
  //    https://github.com/felixge/node-mysql#connection-options
  ///
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'interndb'
  },

};

