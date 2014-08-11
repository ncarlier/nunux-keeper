
module.exports = {
  info: function(app) {
    return function(req, res) {
      var info = app.get('info');
      if (req.authInfo) {
        info.scope = req.authInfo.scope;
      }
      res.json(info);
    };
  },
  documents:  require('./document'),
  categories: require('./category'),
  resources:  require('./resource'),
  connector:  require('./connector'),
  user:       require('./user'),
  admin:      require('./admin')
};
