//xcxc var webdriver = require("selenium-webdriver");
var util = require("../common/util");

var Loader = function(env, options) {
  var me = this;
  me._env = env;
  me._options = options;
  me._load_start_time = null;
};

Loader.defaultOptions = function() {
  var queryParams = function() {
    return util.parseQuery(window.location.href);
  };

  return {
    eventsUrl: function() { return queryParams()["cyclops_events"]; },
    events_js_load_timeout_ms: 10000
  };
};

/**
 * @param url {String}
 * @return {webdriver.promise.Promise<Object[]>} Resolved when the events
 *     have been fetched from the URL and parsed.
 */
Loader.loadFromUrl = function(url) {
  // TODO
  throw new Error("not implemented");
};

/**
 * @param url {String}
 * @return {webdriver.promise.Promise<Object[]>} Resolved when events have been
 *     loaded from their source.
 */
Loader.prototype.load = function() {
  var me = this;
  var url = me._options.eventsUrl();
  if (url === "js" || url === undefined) {
    return me._loadFromJs();
  } else {
    return Loader.loadFromUrl(url);
  }
};

Loader.prototype._loadFromJs = function() {
  var me = this;
  var cyclops_data = window["_$cyclops"];
  if (cyclops_data === undefined) {
    if (me._load_start_time === null) {
      me._load_start_time = me._env.now();
      console.log("Cyclops event data not yet available in browser, " +
          "will wait up to " + me._options.event_js_load_timeout_ms + "ms");
    }
    if (me._env.now() >
        me._load_start_time + me._options.event_js_load_timeout_ms) {
      throw new Error("Cyclops event data not found");
    }
    return webdriver.promise.delayed(1000).then(function() {
      return me._loadFromJs();
    });
  }
  console.log(
      "Cyclops event data found in JS: " + cyclops_data.events.length +
          " events");
  return webdriver.promise.resolved(cyclops_data.events);
};

module.exports = Loader;

