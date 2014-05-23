var Emitter = require("../common/emitter").Emitter;


// Preprocess event stream and insert summary info events?
//   - close event if user idle for N seconds
// "Move mouse"
// "Click"
// "Type"
//

/**
 *
 * Events:
 *
 */
var Player = function(env, wd) {
  var me = this;
  me._env = env;
  me._webdriver = wd;
  me._events = [];
  me._event_index = 0;
  me._mouse_last = { x: 0, y: 0 };
  me._start_time = null;
  // we can increment this when things get delayed/paused
  me._delayed_time = 0;

  me._event_key_code_to_webdriver_key_code = {};
  EVENT_CONTROL_KEYS.forEach(function(pair) {
    me._event_key_code_to_webdriver_key_code[pair[0]] = pair[1];
  });

  me._emitter = new Emitter();
  me._before_listeners = [];
  me._after_listeners = [];
};

Player.defaultOptions = function() {
  return {};
};

Player.prototype.events = function(events) {
  var me = this;
  events.forEach(function(e) {
    me._events.push(e);
  });
};

Player.prototype.emitter = function() {
  return this._emitter;
};

Player.prototype.beforeEvent = function(listener) {
  this._before_listeners.push(listener);
};

Player.prototype.afterEvent = function(listener) {
  this._after_listeners.push(listener);
};

Player.prototype.play = function() {
  var me = this;
  me._emitter.emit("play", me._events);
  return this._playNextEvent();
};

Player.prototype.playEvent = function(e) {
  var me = this;

  var promise = webdriver.promise.resolved();
  me._before_listeners.forEach(function(listener) {
    promise = promise.then(function() {
      return listener.call(null, e, me._webdriver);
    });
  });

  if (webdriver.promise.isPromise(promise)) {
    promise = promise.then(function() {
      me._emitter.emit("before_event", e);
      return me._doEvent(e);
    });
  } else {
    me._emitter.emit("before_event", e);
    promise = me._doEvent(e);
  }

  me._after_listeners.reverse().forEach(function(listener) {
    promise = promise.then(function() {
      return listener.call(null, e, me._webdriver);
    });
  });

  promise = promise.then(function() {
    me._emitter.emit("after_event", e);
  });

  return promise;
};

Player.prototype._doEvent = function(e) {
  var me = this;
  var wd = me._webdriver;

  if (e.type === "config") {
    if (e.width !== undefined && e.height !== undefined) {
      return wd.manage().window().setSize(e.width, e.height);
    }
    return webdriver.promise.resolved();
  } else if (e.type === "start") {
    me._start_time = me._env.now();
    return wd.findElement(document.body).then(function(body) {
      return wd.actions().mouseMove(body, { x: 0, y: 0 }).perform();
    });
  } else if (e.type === "resize") {
    return wd.manage().window().setSize(e.width, e.height);
  } else if (e.type === "mousemove") {
    // Mouse move wants relative, since we control every movement we make
    // absolute.
    // TODO: this is fragile?
    var offset = {
      x: e.x - me._mouse_last.x,
      y: e.y - me._mouse_last.y
    };
    me._mouse_last.x = e.x;
    me._mouse_last.y = e.y;
    return wd.actions().mouseMove(offset).perform();
  } else if (e.type === "mousedown") {
    return wd.actions().mouseDown(e.button).perform();
  } else if (e.type === "mouseup") {
    return wd.actions().mouseUp(e.button).perform();
  } else if (e.type === "keydown" || e.type === "keyup" || e.type === "keypress") {
    return me._keyEventToWebdriverAction(e);
  }

  //xcxc can't synthesize wheel events :(

  //xcxc pass to listener
  return webdriver.promise.resolved();
};

Player.prototype._playNextEvent = function() {
  var me = this;
  var e = me._nextEvent();
  if (e === null) {
    ufu("xcxc stopping playback");
    return webdriver.promise.resolved();
  }

  var play;
  if (me._start_time !== null) {
    var now_offset = me._env.now() - (me._start_time + me._delayed_time);
    if (e.offset !== undefined && e.offset > now_offset) {
      play = webdriver.promise.delayed(e.offset - now_offset).then(function() {
        return me.playEvent(e);
      });
    } else {
      play = me.playEvent(e);
    }
  } else {
    play = me.playEvent(e);
  }

  return play.then(function() {
    me._playNextEvent();
  });
};

Player.prototype._nextEvent = function() {
  if (this._event_index >= this._events.length) {
    return null;
  }
  return this._events[this._event_index++];
};

Player.prototype._keyEventToWebdriverAction = function(event) {
  var me = this;

  if (event.type === "keypress") {
    return me._webdriver.actions()
        .sendKeys(String.fromCharCode(event.char))
        .perform();
  }

  var down = event.type === "keydown";

  var key = me._event_key_code_to_webdriver_key_code[event.key];
  if (key === webdriver.Key.SHIFT || key === webdriver.Key.CONTROL ||
      key === webdriver.Key.ALT || key === webdriver.Key.META ||
      key === webdriver.Key.COMMAND || key === webdriver.Key.TAB) {
    if (down) {
      return me._webdriver.actions().keyDown(key).perform();
    } else {
      return me._webdriver.actions().keyUp(key).perform();
    }
  } else if (key !== undefined && down) {
    // This is a control key code that will not generate a keypress event,
    // the proper thing to do is to send it once to webdriver.
    return me._webdriver.actions().sendKeys(key).perform();
  } else {
    // Results in a regular key - wait for keypress event.
    return webdriver.promise.resolved();
  }
};

var EVENT_CONTROL_KEYS = [
  [9, webdriver.Key.TAB],
  [8, webdriver.Key.BACK_SPACE],
  [16, webdriver.Key.SHIFT],
  [17, webdriver.Key.CONTROL],
  [18, webdriver.Key.ALT],
  [19, webdriver.Key.PAUSE],
  [27, webdriver.Key.ESCAPE],
  [33, webdriver.Key.PAGE_UP],
  [34, webdriver.Key.PAGE_DOWN],
  [35, webdriver.Key.END],
  [36, webdriver.Key.HOME],
  [37, webdriver.Key.LEFT],
  [38, webdriver.Key.UP],
  [39, webdriver.Key.RIGHT],
  [40, webdriver.Key.DOWN],
  [45, webdriver.Key.INSERT],
  [46, webdriver.Key.DELETE],
  [91, webdriver.Key.COMMAND],
  [93, webdriver.Key.COMMAND],
  [96, webdriver.Key.NUM_ZERO],
  [97, webdriver.Key.NUM_ONE],
  [98, webdriver.Key.NUM_TWO],
  [99, webdriver.Key.NUM_THREE],
  [100, webdriver.Key.NUM_FOUR],
  [101, webdriver.Key.NUM_FIVE],
  [102, webdriver.Key.NUM_SIX],
  [103, webdriver.Key.NUM_SEVEN],
  [104, webdriver.Key.NUM_EIGHT],
  [105, webdriver.Key.NUM_NINE],
  [106, webdriver.Key.MULTIPLY],
  [107, webdriver.Key.ADD],
  [109, webdriver.Key.SUBTRACT],
  [110, webdriver.Key.DECIMAL],
  [111, webdriver.Key.DIVIDE],
  [112, webdriver.Key.F1],
  [113, webdriver.Key.F2],
  [114, webdriver.Key.F3],
  [115, webdriver.Key.F4],
  [116, webdriver.Key.F5],
  [117, webdriver.Key.F6],
  [118, webdriver.Key.F7],
  [119, webdriver.Key.F8],
  [120, webdriver.Key.F9],
  [121, webdriver.Key.F10],
  [122, webdriver.Key.F11],
  [123, webdriver.Key.F12]
];

module.exports = Player;
