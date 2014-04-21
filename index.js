#!/usr/bin/env node

var util = require('./lib/utility');

// Load configuration
var cfg = util.defaults(require('./configure'), {
  host: '0.0.0.0',
  port: 10086
});

var db = require('./lib/db');
db.initialize(function (err, val) {

  if (err) {
    console.log('ERROR: ' + err);
    process.exit(1);
  }

  if (val) {
    console.log('System database initialization done\n');
    console.log('Administrator account created.\n');
    console.log('\tusername: ' + val.username.red + ' password: ' + val.password.red);
    console.log('Please change the administrator password as soon as possible after login');
  }
  // Load server component
  var server = require('./lib/server.js');

  // Start listening
  server.listen(cfg.port, cfg.host, function () {
    console.log('Listening ' + cfg.host + ' on ' + cfg.port + '...');
  });
});


