var Recorder = require("./lib/recorder");
var Watcher = require("./lib/watcher");
var Env = require("./lib/env");
var util = require("./lib/util");

var Cyclops = function(options) {
  options = options || {};
  options.env = util.update(Env.defaultEnvironment(), options.env || {});
  options.recorder = util.update(Recorder.defaultOptions(), options.recorder || {});

  this.recorder = new Recorder(options.env, options.recorder);
  this.watcher = new Watcher(options.env, this.recorder);
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

Cyclops.prototype.stop = function() {
  this.watcher.unwatch();
  this.recorder.stop();
};