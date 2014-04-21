///
// SQL Command Builder
///

var _ = require('lodash');
var mysql = require('mysql');

var typeid = require('./utility').typeid;

// Directly binding _call to Function.prototype.call causes error on type
var _call = function () { return Function.prototype.apply(this, arguments); };

///
// Query Builder Factory
//
// @param gconn : function used to obtain a database connection
///
var qb = module.exports = function (gconn) {

  function normailzeValueToFunctionArray (obj) {
    return _.transform(obj || {}, function (result, value, key) {
      result[key] = (typeid(value) == 'function')?[ value ]:value;
    });
  }

  function normalizeValueToFunction (obj) {
    return _.transform(obj || {}, function (result, value, key) {
      result[key] = function (_in) {
        return _.reduce(value, function (result, processor) {
          return processor(result);
        }, _in);
      };
    });
  }

  ///
  // Query Builder
  //
  // @param sql   : sql command with specific substitute pattern
  //                Syntax:
  //                    ::<key> - Placeholder for a key name
  //                    :<name> - Placeholder for a single value
  //                    ?       - Placeholder for `,` seperated `<key>=<val>` expression
  //                    ?+<name1>:<name2>:... - Include specific parameter
  //                    ?-<name3>:<name4>:... - Exclude specific parameter
  // @param params: parameter mappings ([String field] -> [Array(Function)])
  // @param gconv : value converter ([String field] -> [Array(Function)]
  ///
  return function (sql, params, gconv) {

    // Transform value of `gconv` to array if single function is given
    gconv = normailzeValueToFunctionArray(gconv);

    // Transform params from array to single function
    params = normailzeValueToFunctionArray(params);
    params = normalizeValueToFunction(params);

    var renderQueryArgs = qb.createRender(sql, params);

    ///
    // Query Executor
    //
    // @param arg : arguments passed to generate sql command
    // @param conv: (optional) query specific value converter chain,
    //              will be concat to main chain specified from factory
    // @param cb  : (optional) callback function (stream mode if not specified)
    ///
    return function (arg, conv, cb) {

      // Shift Parameter
      if (typeid(conv) == 'function') {
        cb = conv; conv = undefined;
      }

      // Transform value of `conv` to array if single function is given
      conv = normailzeValueToFunctionArray(conv);

      // Merge default converters and converters to a chain
      conv = _.merge(gconv, conv);

      // Convert converter chain to single function
      conv = normalizeValueToFunction(conv);

      // Render SQL template and arguments to SQL command
      var sqlcommand = renderQueryArgs(arg);

      // Use stream mode if callback is not provided
      var _usestream = !cb;

      // Forward streamming events
      var _events = {};

      // Obtain a Connection
      gconn(function (err, conn) {

        var _fields = null;
        var _convts = null;
        var _results = [];
        var _err = null;

        var query = cb._query = conn.query(sqlcommand)

        .on('error', function (err) {

          _call(_events.error, err);

          // Save error
          _err = err;

        })

        .on('fields', function (fields) {

          _call(_events.fields, fields);

          // Save field vector
          _fields = _.pluck(fields, 'name');

          // Generate converter mapping
          _convts = _.transform(_fields, function (result, field) {
            result[field] = conv[field] || _.identity;
          });

        })

        .on('result', function (row, index) {

          _call(_events.result, row, index);

          if (row.constructor.name == 'OkPacket') {
            // Handle OkPacket after performing INSERT/UPDATE query

            _results = row;

          } else {

            // Convert query result
            var _row = _.transform(row, function (result, v, i) {
              result[i] = _convts[i](v, i, row, index);
            });

            if (!_usestream) _results.push(_row);

          }

        })

        .on('end', function () {

          _call(_events.end);

          // Handle both happy & unhappy paths
          // Unhappy path may contains partial results
          if (!_usestream) cb(_err, _results);

          // Release connection
          conn.release();

        });

      });

      // Enable chaining for streamming mode
      if (_usestream) {
        return null, cb = {
          on: function (event, cb) {
            _events[event] = cb;
            return cb;
          }
        };
      }

    };

  };

};

_.extend(qb, {

  createRender: function (sql, params) {

    // Render Query with given Arguments
    return function (values) {

      if (!values) return template;

      // Filter query fields
      var fields = _.intersection(_.keys(values), _.keys(params));

      // Expand sql to template format
      var template = sql.replace(/\?(?:([+-])?([a-zA-Z0-9:]+))?/g, function (qs, type, collection) {

        var _fields = Array.prototype.slice.call(fields, 0);

        if (collection) {
          collection = collection.split(':');
          if (type == '-') {
            // Exclude Fields
            _fields = _.difference(_fields, collection);
          } else {
            // Select Fields
            _fields = _.intersection(_fields, collection);
          }
        }

        return _.map(_fields, function (x) { return x + ' = :' + x; }).join(', ');

      });

      return template.replace(/\:\:(\w+)/g, function (txt, key) {
        if (values.hasOwnProperty(key)) {
          return mysql.escapeId(values[key]);
        }
        return txt;
      }).replace(/\:(\w+)/g, function (txt, key) {
        if (values.hasOwnProperty(key)) {
          // Apply params conversion to provided value and then escape
          return mysql.escape(params[key](values[key]));
        }
        return txt;
      });

    };

  }

});
