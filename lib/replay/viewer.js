/**
 * A controller for a separate window that pops up to narrate the
 * replaying events.
 */
var Viewer = function(player, options) {
  var me = this;
  me._window = null;
  me._player = player;
  me._onOwnerWindowUnload = function() {
    if (me._window) {
      me._window.close();
    }
  };

  player.emitter().on("")
};

Viewer.prototype.open = function() {
  var me = this;
  me._window = window.open(
      "about:blank",
      me._uniqueWindowName(),
          "scrollbars=yes,height=" + me._options.height + ",width=" + me._options.width);

  me._window.addEventListener(
      "unload",
      function() {
        me._window = null;
      },
      true);
  window.addEventListener("unload", me._onOwnerWindowUnload, true);
};

Viewer.prototype.close = function() {
  var me = this;
  if (me._window) {
    // Our window is closing; the owner window no longer has to worry
    // about unloading it. We remove the listener for proper cleanup.
    window.removeEventListener("unload", me._onOwnerWindowUnload, true);
    me._window.close();
    // Window close callback should do the rest.
  }
};

Viewer.prototype._uniqueWindowName = function() {
  return "CyclopsReplayViewer_" + util.localUniq();
};


module.exports = Viewer;
