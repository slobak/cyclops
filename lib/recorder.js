var util = require("./lib/util");

var Recorder = function(env, options) {
  this._receive = null;
  this._start_time = null;
  this._buffer = [];
  this._buffer_timeout = null;
  this._env = env;
  this._options = util.update(Recorder.defaultOptions(), options || {});
  this._first_buffered_time = null;
};

Recorder.defaultOptions = function() {
  return {
    buffer: true,
    max_buffer_events: 100,
    max_buffer_time_ms: 1000
  };
};

Recorder.prototype.onEvents = function(receiveEvents) {
  this._receive = receiveEvents;
};


Recorder.prototype.recordEvent = function(event) {
  var me = this;

  var now = me._env.now();

  if (event.type !== "config") {
    if (me._start_time === null) {
      // Got an event before we expected. Drop it.
      return;
    }
    event.offset = now - me._start_time;
  }

  if (me._buffer.length === 0) {
    me._first_buffered_time = now;
  }
  me._buffer.push(event);

  if (me._options.buffer) {
    if ((me._buffer.length >= me._options.max_buffer_events ||
         now - me._first_buffered_time >= me._options.max_buffer_time_ms) &&
        me._buffer_timeout === null) {
      me._buffer_timeout = me._env.setTimeout(function() {
        me._buffer_timeout = null;
        me._flush();
      }, 0);
    }
  } else {
    me._flush();
  }
};

Recorder.prototype.config = function(config) {
  this.recordEvent({
    type: "config",
    config: config
  });
};

Recorder.prototype.stop = function() {
  this.recordEvent({
    type: "stop"
  });
  this._flush();
  this._start_time = null;
};

Recorder.prototype.start = function() {
  this._start_time = this._env.now();
  this.recordEvent({
    type: "start",
    timestamp: this._start_time
  });
};

Recorder.prototype._flush = function() {
  if (this._receive !== null) {
    var buffer = this._buffer;
    this._buffer = [];
    this._receive.call(null, buffer);
  }
};

module.exports = Recorder;
