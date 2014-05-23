var Cyclops = require("./lib/cyclops");

/**
 * var cyclops = require("cyclops").init({
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

exports.init = function(options) {
  return Cyclops.init(options);
};
