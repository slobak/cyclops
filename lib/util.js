exports.valueOrDefault = function(a, b) {
  return a !== undefined ? a : b;
};

exports.update = function(me, obj) {
  for (var key in obj) {
    me[key] = obj[key];
  }
  return me;
};
