var documents = require('./document');

module.exports = {
  info: function(app) {
    return function(req, res) {
      res.json(app.get('info'));
    }
  },
  documents: documents
};
