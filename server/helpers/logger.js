var colors = require('colors'),
    _      = require('underscore');

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
  if (_.isObject(arguments[0])) {
    var err = arguments[0];
    console.error('\nERROR:'.red, err.message ? err.message.red : err);
    console.error('');
    if (err.stack) {
      console.error(err.stack, '\n');
    }
  } else {
    console.error.apply(this, arguments);
  }
};

// Config.
logger.setLevel(process.env.APP_LOG || 'debug');

