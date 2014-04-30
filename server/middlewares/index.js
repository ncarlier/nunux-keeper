/**
 * Middlewares.
 */
module.exports = {
  errorHandler: require('./error'),
  rawbodyParser: require('./rawbody'),
  contextHandler: require('./context'),
  cors: require('./cors'),
  multipart: require('./multipart')
};
