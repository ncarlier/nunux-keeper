var client = require('./client'),
    user   = require('./user');

module.exports = {
  ensureLoggedIn: function(app) {
    return function(req, res, next) {
      if (req.isAuthenticated()) { return next(); }
      var context = {
        info: app.get('info'),
        realm: app.get('realm'),
        env: app.get('env'),
        redirect: req.url
      };
      res.render('login.html', context);
    };
  },
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
      res.render('oauth.html', context);
    };
  },
  client: client,
  user: user
};
