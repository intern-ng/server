
var _ = require('lodash');

var util = module.exports = {

  // Figure out type of `obj'
  typeid: function (obj) {
    return Object.prototype.toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
  },

  // Deep object merge using default strategy
  defaults: function (object, defs) {
    return _.extend(object, defs, function (objectValue, sourceValue) {
      if (util.typeid(objectValue) == 'object' && util.typeid(sourceValue) == 'object') {
        return util.defaults(objectValue, sourceValue);
      } else {
        return util.typeid(objectValue) == 'undefined' ? sourceValue : objectValue;
      }
    });
  },

  isEmptyObject: function (obj) {
    for(var prop in obj) {
      if(obj.hasOwnProperty(prop)) return false;
    }
    return true;
  },

};

