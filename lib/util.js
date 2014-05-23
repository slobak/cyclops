var util = {};

util.valueOrDefault = function(a, b) {
  return a !== undefined ? a : b;
};

util.update = function(me, obj) {
  for (var key in obj) {
    me[key] = obj[key];
  }
  return me;
};

module.exports = util;
