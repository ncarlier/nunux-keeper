var mongoose  = require('mongoose'),
    user      = require('./user'),
    document  = require('./document'),
    category  = require('./category');

/**
 * Get MongoDB URI.
 * @return {String} MongoDB string URI
 */
var getMongoDBUri = function() {
  var uri = 'mongodb://localhost/keeper';
  if (process.env.APP_MONGO_URI) {
    uri = process.env.APP_MONGO_URI;
  } else if (process.env.DB_PORT_27017_TCP) { // Docker
    uri = process.env.DB_PORT_27017_TCP.replace(/^tcp/, 'mongodb');
    uri = uri + '/keeper';
  }
  return uri;
};

var conn = mongoose.createConnection(getMongoDBUri());

module.exports = {
  User: user(mongoose, conn),
  Document: document(mongoose, conn),
  Category: category(mongoose, conn)
};

