var bunyan = require('bunyan');

// Init. logger.
var logger = bunyan.createLogger({
  name: process.title,
  stream: process.stdout,
  level: process.env.APP_LOG || 'debug'
});

/**
 * HTTP logger middleware.
 */
logger.requestLogger = function (req, res, next) {
  var start = new Date();
  var end = res.end;
  res.end = function (chunk, encoding) {
    var responseTime = (new Date()).getTime() - start.getTime();
    end.call(res, chunk, encoding);
    var contentLength = parseInt(res.getHeader('Content-Length'), 10);
    var data = {
      res: res,
      req: req,
      responseTime: responseTime,
      contentLength: isNaN(contentLength) ? 0 : contentLength
    };
    logger.info('%s %s %d %dms - %d', data.req.method, data.req.url, data.res.statusCode, data.responseTime, data.contentLength);
  };
  next();
};

/**
 * Logger helper.
 * @module logger
 */
module.exports = logger;

