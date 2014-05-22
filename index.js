var Cyclops = require("./lib/cyclops");

/**
 *
 * Record event
 *
 *
 * cyclops.onEvents(function(events) {
 *   // ...
 * });
 *
 * cyclops.config();
 *
 * cyclops.start()
 *
 * cyclops.event();
 *
 * cyclops.stop();
 *
 *
 */

exports.init = function(options) {
  return new Cyclops(options);
};

