
var util = require('util');
var _ = require('lodash');

var ErrorFactory = function (defaults) {

  var ErrorClass = function (options) {

    if (typeof options == 'string') {
      options = { message: options };
    }

    this.name = 'RemoteAPIError';
    this.code = 'EREMOTE';
    this.message = 'Remote API error';
    this.status = 500;
    this.reason = 'unknown';

    this.convert = function () { return this.message; };

    _(this).extend(defaults);

    Error.captureStackTrace(this, options.stackStartFunction || ErrorClass);

    _(this).extend(options);

  };

  util.inherits(ErrorClass, Error);

  return ErrorClass;

};

var error = module.exports = {

  DatabaseError: ErrorFactory({

    name    : 'DatabaseError',
    code    : 'EDATABASE',
    message : 'Failed accessing database',
    status  : 500, // Internal Error

    // Optional Context

    // query: <Query details>
    // errid: <Native error code>
    // reason: <Detailed Reason Id>

  }),

  ApplicationError: ErrorFactory({

    name    : 'ApplicationError',
    code    : 'EAPP',
    message : 'Application Error',
    status  : 400, // Bad Request

  }),

  express: function (err, req, res, next) {
    if (err.name in error) {
      return res.send(err.status, err.convert());
    } else {
      return next(err);
    }
  }

};

