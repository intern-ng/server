
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
var pwdgen = require('password-generator');
var passhash = require('password-hash');

_.extend(db, {

  initialize: function(cb) {
    var username = cfg.init.defaultAdminUsername;
    var password = pwdgen();
    var secret = passhash.generate(password);

    // XXX node-mysql seems won't expand argument for procedure ?
    var query = 'CALL create_initial_admin( ' + mysql.escape(username) + ',' + mysql.escape(secret) + ');';
    db.query(query, function(err, rows) {
      if (err) return cb(err, null);
      var response = rows[0][0];
      if (!response.result) return cb(null, null);
      else return cb(null, {
        username: username,
        password: password
      });
    })
  },

  handleInsertionError: function(err) {
    console.log(err);
    // TODO:
  },

  user: {
    // Empty rows: 410/404 or 403(if we don't cracker knows if this username exists)
    //
    querySigninInfo: qb(
     'select \
      u.id as user_id, \
      a.secret as secret, \
      not isnull(ad.user_id) as is_admin, \
      not isnull(t.user_id) as is_teacher, \
      not isnull(s.user_id) as is_student \
      from user u \
      inner join account a on u.id = a.user_id \
      left join administratorship ad on u.id = ad.user_id \
      left join teachership t on u.id = t.user_id \
      left join studentship s on u.id = s.user_id \
      where a.username = :username', {
      username: String
    }),
  }


});

