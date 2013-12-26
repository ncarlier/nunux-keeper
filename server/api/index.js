var documents = require('./document'),
    resources = require('./resource');

module.exports = {
  info: function(app) {
    return function(req, res) {
      res.json(app.get('info'));
    }
  },
  documents: documents,
  resources: resources
};
