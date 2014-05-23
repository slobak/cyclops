/**
 * var cyclops = require("cyclops-record").init({
 *   env: {
 *     now: ...
 *     setTimeout: ...
 *   },
 *   recorder: {
 *     buffer: true,
 *     max_buffer_time_ms: 1000,
 *     max_buffer_events: 100
 *   }
 * });
 *
 * cyclops.onEvents(function(events) {
 *
 * });
 *
 * cyclops.config();
 *
 * cyclops.start();
 *
 * cyclops.event({
 *   type: "my_custom_event",
 *   foo: "bar"
 * });
 * cyclops.flush();
 *
 * cyclops.stop();
 *
 */


var Recorder = require("./recorder");
var Watcher = require("./watcher");
var util = require("../common/util");

var Cyclops = function(options) {
  options = options || {};
  options.env = util.update(util.defaultEnvironment(), options.env || {});
  options.recorder = util.update(Recorder.defaultOptions(), options.recorder || {});

  this.recorder = new Recorder(options.env, options.recorder);
  this.watcher = new Watcher(options.env, this.recorder);
};

Cyclops.init = function(options) {
  return new Cyclops(options);
};

Cyclops.prototype.event = function(e) {
  this.recorder.recordEvent(e);
};

Cyclops.prototype.onEvents = function(receive) {
  this.recorder.onEvents(receive);
};

Cyclops.prototype.start = function() {
  // Always record a window size config event first to indicate
  // the initial browser size.
  this.recorder.recordEvent({
    type: "config",
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Start the recorder, and always record a resize event first to indicate
  // the initial browser size.
  this.recorder.start();

  // Watch the DOM for events to record.
  this.watcher.watch();
};

Cyclops.prototype.flush = function() {
  this.recorder.flush();
};

Cyclops.prototype.stop = function() {
  this.watcher.unwatch();
  this.recorder.stop();
};

module.exports = Cyclops;
