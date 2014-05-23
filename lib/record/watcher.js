var Watcher = function(env, recorder) {
  var me = this;
  me._env = env;
  me._recorder = recorder;
  me._mouse_x = -1;
  me._mouse_y = -1;
  me._listener = function(event) {
    me._onEvent(event);
  };
  me._event_types = [
    "resize", "mousemove", "mousedown", "mouseup", "keydown", "keyup", "keypress"
  ];
};


Watcher.prototype.watch = function() {
  var me = this;
  var listen = function(key) {
    window.addEventListener(key, me._listener, true);
  };
  me._event_types.forEach(listen);
};

Watcher.prototype.unwatch = function() {
  var me = this;
  var unlisten = function(key) {
    window.removeEventListener(key, me._listener, true);
  };
  me._event_types.forEach(unlisten);
};

Watcher.prototype._onEvent = function(event) {
  var me = this;
  var key = event.type;

  // These are the most common and we want to handle them fast.
  if (key === "mousemove" || key === "mouseover" || key === "mouseout") {
    // Only record something if the mouse moved from its last position
    var x = event.clientX;
    var y = event.clientY;
    if (x === me._mouse_x && y === me._mouse_y) {
      return;
    }
    me._recorder.recordEvent({
      type: "mousemove",
      x: x,
      y: y
    });
  } else if (key === "resize") {
    // TODO: cross-browser measurement
    me._recorder.recordEvent({
      type: "resize",
      width: window.innerWidth,
      height: window.innerHeight
    });
  } else if (key === "keyup" || key === "keydown") {
    me._recorder.recordEvent({
      type: key,
      key: event.keyCode
    });
  } else if (key === "keypress") {
    me._recorder.recordEvent({
      type: key,
      key: event.keyCode,
      char: event.charCode
    });
  } else if (key === "mousedown" || key === "mouseup") {
    me._recorder.recordEvent({
      type: key,
      button: event.button,
      x: event.clientX,
      y: event.clientY
    });
  } else if (key === "wheel") {
    me._recorder.recordEvent({
      type: "wheel",
      deltaMode: event.deltaMode,
      deltaX: event.deltaX,
      deltaY: event.deltaY,
      x: event.clientX,
      y: event.clientY
    });
  }
};

module.exports = Watcher;
