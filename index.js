var webdriver = require("selenium-webdriver");
var util = require("./lib/common/util");
var fs = require("fs");
var path = require("path");

var launch = {};

launch.launch = function(options) {

  options = util.update({
    browser: "chrome",
    webdriver_url: "http://localhost:4444/wd/hub",
    events_url: null,
    page_url: null
  }, options);

  var caps = {
    "acceptSslCerts": true,
    "browserName": options.browser
  };

  console.log("Connecting to webdriver", options.webdriver_url, caps);
  var driver = new webdriver.Builder()
      .usingServer(options.webdriver_url)
      .withCapabilities(caps)
      .build();

  var promise = driver.getSession().then(function(session) {
    // The `wdsid` and `wdurl` parameters have names that the WebdriverJS
    // library looks for.
    var query_params = {
      wdsid: session.getId(),
      wdurl: options.webdriver_url,
      cyclops_events_url: options.events_url
    };
    var url = util.appendQuery(options.page_url, query_params);
    console.log("Navigating " + caps.browserName + " to " + url);
    return driver.get(url);
  });

  // If the URL is a local file, read it in and upload it to the JS
  // once the page is loaded.
  if (options.events_url.indexOf("file:") === 0) {

    // Read it in, a newline-separate list of events
    var filename = decodeURIComponent(options.events_url.split("://")[1]);
    var lines = fs.readFileSync(filename, "utf8").split("\n");
    var events = [];
    lines.forEach(function(line) {
      line = line.trim();
      if (line !== "") {
        events.push(JSON.parse(line));
      }
    });
    console.log("Read in " + events.length + " events from " + filename);

    // Send a massive request via webdriver to set it in the JS
    // TODO: break up into event chunks so we can support really large lists
    var deferred = webdriver.promise.defer();
    promise = promise.then(function() {
      console.log("Uploading events to browser");
      driver.executeAsyncScript(
              "var callback = arguments[arguments.length - 1];\n" +
              "callback();\n" +
              "var cyclops_data = {};\n" +
              "cyclops_data.events = JSON.parse(arguments[0]);\n" +
              "window._$cyclops = cyclops_data;\n",
          JSON.stringify(events),
          function() {
            console.log("Finished uploading events to browser");
            deferred.resolve();
          });
    });
  }

  return promise;
};

module.exports = launch;
