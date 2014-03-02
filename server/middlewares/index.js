/**
 * Middlewares.
 */
module.exports = {
  errorHandler: require('./error'),
  rawbodyHandler: require('./rawbody'),
  contextHandler: require('./context'),
  cors: require('./cors'),
  token: require('./token')
};
