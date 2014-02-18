var mongoose  = require('mongoose'),
    user      = require('./user'),
    document  = require('./document'),
    category  = require('./category');

/**
 * Get MongoDB docker URI.
 */
var getMongoDBDockerUri = function() {
  if (process.env.DB_PORT_27017_TCP_ADDR) {
    return 'mongodb://' + process.env.DB_PORT_27017_TCP_ADDR + '/keeper';
  }
  return null;
};

var uri = process.env.APP_MONGO_URI ||
          process.env.DB_PORT_27017_TCP_ADDR ||
          'mongodb://localhost/keeper';

mongoose.connect(uri);

module.exports = {
  User: user(mongoose),
  Document: document(mongoose),
  Category: category(mongoose)
};

