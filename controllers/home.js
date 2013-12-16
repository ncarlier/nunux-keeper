/**
 * Home page (aka index).
 */
module.exports = function(req, res) {
  if (!req.user) {
    return res.redirect('/welcome');
  }
  res.format({
    html: function() {
      res.render('index', req.context);
    },
    json: function() {
      res.json(req.context);
    }
  });
};
