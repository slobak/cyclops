var util = require("./util");

var Emitter = function() {
  this._listeners = {};
};

Emitter.prototype.on = function(key, listener) {
  var listeners = this._listeners[key] || {};
  listeners[util.localId(listener)] = listener;
  this._listeners[key] = listeners;
};

/**
 * @param key {String}
 * @param arguments {*} Remaining arguments are passed to the listeners.
 */
Emitter.prototype.emit = function(key /*...*/) {
  var args = $A(arguments).slice(1);
  (this._listeners[key] || []).forEach(function(listener) {
    listener.apply(null, args);
  });
};

/**
 * @param key {String}
 * @param listener {Function} A listener registered with "on"
 */
Emitter.prototype.removeListener = function(key, listener) {
  var listeners = this._listeners[key] || {};
  delete listeners[util.localId(listener)];
  this._listeners[key] = listeners;
};

/**
 * @param key {String?} Optional, if specified just removes listeners
 *     for the given key.
 */
Emitter.prototype.removeAllListeners = function(key) {
  if (key !== undefined) {
    delete this._listeners[key];
  } else {
    this._listeners = {};
  }
};