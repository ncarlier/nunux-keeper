var client = require('./client');

module.exports = {
  authorize: function(app) {
    return function(req, res) {
      var context = {
        info: app.get('info'),
        realm: app.get('realm'),
        env: app.get('env'),
        user: req.user,
        transactionID: req.oauth2.transactionID,
        client: req.oauth2.client
      };
      res.render('oauth', context);
    };
  },
  client: client
};
