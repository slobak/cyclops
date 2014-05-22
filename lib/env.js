exports.defaultEnvironment = function() {
  return {
    setTimeout: window.setTimeout,
    now: function() {
      return new Date().getTime();
    }
  };
};
