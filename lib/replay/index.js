/**
 *
 * On server:
 *
 * var cyclops = require("cyclops-launcher");
 *
 * var promise = cyclops.launch({
 *   page_url: "http://my.app.com/",
 *   events_url: "file:///Users/me/src/events.json"
 * });
 *
 * promise.then(function() {
 *   ...
 * });
 *
 *
 * In browser:
 *
 * <script src="cyclops-player.js"><script>
 *
 * Cyclops.init({
 *   // .. options here, none needed by default
 * }).then(function(cyclops) {
 *   // At this point, cyclops is connected to webdriver and has loaded
 *   // the events. Assuming the app is ready, now start playing back.
 *   return cyclops.run();
 * });
 *
 */

//xcxc browserify version of webdriver doesn't compile in
//var webdriver = require("selenium-webdriver");

var Player = require("./player");
var Viewer = require("./viewer");
var Loader = require("./loader");
var util = require("../common/util");

var Cyclops = function(options) {
  options = options || {};
  options.env = util.update(util.defaultEnvironment(), options.env || {});
  options.player = util.update(Player.defaultOptions(), options.player || {});
  options.webdriver = util.update(Cyclops.defaultWebdriverOptions(), options.webdriver || {});
  options.loader = util.update(Loader.defaultOptions(), options.loader || {});

  this._options = options;
  this._player = null;
  this._webdriver = null;
};

Cyclops.init = function(options) {
  return new Cyclops(options).connect();
};

Cyclops.defaultWebdriverOptions = function() {
  var queryParams = function() {
    return util.parseQuery(window.location.href);
  };

  return {
    url: function() { return queryParams()["wdurl"]; },
    sessionId: function() { return queryParams()["wdsid"]; },
    onError: function(e) { throw e; }
  };
};

/**
 * @returns {webdriver.promise.Promise<webdriver.WebDriver>} A promise resolved
 *     when the webdriver session is connected.
 */

Cyclops.prototype.connect = function() {
  var me = this;

  var wd_url = me._options.webdriver.url();
  var wd_id = me._options.webdriver.sessionId();
  console.log("Connecting to webdriver: " + wd_url + " with session id " + wd_id);

  var builder = new webdriver.Builder();
  var w = builder
      .usingServer(wd_url)
      .usingSession(wd_id)
      .withCapabilities({})
      .build();
  return w.getSession().then(function() {

    // Install error hook
    webdriver.promise.Application.getInstance().on(
        webdriver.promise.Application.EventType.UNCAUGHT_EXCEPTION,
        me._options.webdriver.onError);

    me._player = new Player(me._options.env, w);
    return me;
  });
};

Cyclops.prototype.player = function() {
  return this._player;
};

Cyclops.prototype.webdriver = function() {
  return this._webdriver;
};

Cyclops.prototype.loader = function() {
  return new Loader(this._options.env, this._options.loader);
};

Cyclops.prototype.run = function() {
  var me = this;
  return me.loader().load().then(function(events) {
    slog("events");
    me._player.events(events);
    slog("play");
    return me._player.play();
  })
};

Cyclops.prototype.viewer = function(options) {
  return new Viewer(options);
};

module.exports = Cyclops;
