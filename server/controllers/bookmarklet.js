/**
 * Bookmarklet.
 */
module.exports = function(req, res) {
  res.render('bookmarklet.html', req.context);
};

