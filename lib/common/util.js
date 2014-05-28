var querystring = require("querystring");

var util = {};

/**
 * > var counter = makeCounter();
 * > counter();
 * 0
 * > counter();
 * 1
 * ...
 */
util.makeCounter = function(start /* = 0*/) {
  var next_value = start || 0;
  return function() {
    return next_value++;
  };
};

/**
 * Returns an integer that has never been returned by this function before --
 * in this particular JavaScript process.
 */
util.localUniq = util.makeCounter();

/**
 * Returns a value that is consistently returned for this object, but is unique
 * across all objects in this JavaScript process.  This is useful so you can
 * then use those IDs as keys into a map object.
 *
 * WARNING: This function will annotate the given obj with a __localid field,
 * so if you're using an object as (essentially) a map, you should avoid
 * calling this function on it.
 */
util.localId = function(object) {
  if (!(object.hasOwnProperty("__localid"))) {
    // It's important to use hasOwnProperty, lest we pick up on a
    // this.__localid that was actually assigned to this.__prototype__.
    object.__localid = "o" + util.localUniq();
  }
  return object.__localid;
};

util.defaultEnvironment = function() {
  return {
    setTimeout: function(f, delay) {
      return window.setTimeout(f, delay);
    },
    now: function() {
      return new Date().getTime();
    }
  };
};

util.parseQuery = function(url) {
  var vars = {};
  var pairs = url.slice(url.indexOf('?') + 1).split('&');
  for(var i = 0; i < pairs.length; i++) {
    var hash = pairs[i].split('=');
    vars[hash[0]] = decodeURIComponent(hash[1]);
  }
  return vars;
};

util.appendQuery = function(uri_string, parameter_map) {
  var qmark = uri_string.indexOf("?");
  var new_params = querystring.stringify(parameter_map);
  if (new_params.length === 0) {
    return uri_string;
  } else if (qmark === -1) {
    return uri_string + "?" + new_params;
  } else if (qmark === uri_string.length - 1) {
    return uri_string + new_params;
  } else {
    return uri_string + "&" + new_params;
  }
};

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
