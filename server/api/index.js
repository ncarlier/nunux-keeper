var documents  = require('./document'),
    categories = require('./category'),
    resources  = require('./resource');

module.exports = {
  info: function(app) {
    return function(req, res) {
      res.json(app.get('info'));
    };
  },
  documents: documents,
  categories: categories,
  resources: resources
};
