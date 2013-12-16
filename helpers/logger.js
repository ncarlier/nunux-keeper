var logger = exports;

logger.level = 3; // defaut

logger.levels = ['error', 'warn', 'info', 'debug'];

logger.setLevel = function(level) {
  logger.level = logger.levels.indexOf(level);
};

logger.debug = function() {
  if (logger.level >= 3) {
    console.log.apply(this, arguments);
  }
};

logger.info = function() {
  if (logger.level >= 2) {
    console.info.apply(this, arguments);
  }
};

logger.warn = function() {
  if (logger.level >= 1) {
    console.warn.apply(this, arguments);
  }
};

logger.error = function() {
  console.error.apply(this, arguments);
};

