/**
 * Home page (aka index).
 */
module.exports = function(req, res) {
  if (!req.user) {
    return res.redirect('/welcome');
  }
  res.render('index', req.context);
};
