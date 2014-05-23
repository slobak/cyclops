var webdriver = require("selenium-webdriver");

var Loader = function(env, options) {
  var me = this;
  me._env = env;
  me._options = options;
};

Loader.defaultOptions = function() {
  var queryParams = function() {
    return util.parseQuery(window.location.href);
  };

  return {
    eventsUrl: function() { return queryParams()["cyclops_events_url"]; }
  };
};

/**
 * @param url {String}
 * @return {webdriver.promise.Promise<Object[]>} Resolved when the events
 *     have been fetched from the URL and parsed.
 */
Loader.loadFromUrl = function(url) {
  // TODO
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
    return me._loadFromJs(url);
  } else {
    return Loader.loadFromUrl(url);
  }
};

Loader.prototype._loadFromJs = function(url) {
  var me = this;
  var cyclops_data = window["_$cyclops"];
  if (cyclops_data === undefined) {
    throw new Error("Cyclops event data not yet available in browser");
  }
  return webdriver.promise.resolved(cyclops_data.events);
};

module.exports = load;

