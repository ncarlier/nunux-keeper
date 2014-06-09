/**
 * Bookmarklet.
 */
module.exports = function(req, res) {
  if (req.query.redirect) {
    req.context.redirect = req.query.redirect;
  } else {
    req.context.redirect = '/';
  }
  if (req.user) return res.redirect(req.context.redirect);
  res.render('login', req.context);
};

