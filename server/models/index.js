var mongoose  = require('mongoose'),
    user      = require('./user'),
    document  = require('./document'),
    category  = require('./category');

/**
 * Get MongoDB URI.
 * @return {String} MongoDB string URI
 */
var getMongoDBUri = function() {
  return process.env.APP_MONGO_URI ?
    process.env.APP_MONGO_URI :
    'mongodb://localhost/keeper';
};

var conn = mongoose.createConnection(getMongoDBUri());

module.exports = {
  User: user(mongoose, conn),
  Document: document(mongoose, conn),
  Category: category(mongoose, conn)
};

