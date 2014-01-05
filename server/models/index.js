var mongoose = require('mongoose'),
    user     = require('./user'),
    document = require('./document'),
    category = require('./category');

var uri = process.env.APP_MONGO_URI || 'mongodb://localhost/keeper';
mongoose.connect(uri);

module.exports = {
  User: user(mongoose),
  Document: document(mongoose),
  Category: category(mongoose)
};

