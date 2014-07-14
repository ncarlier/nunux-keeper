/**
 * Welcome page.
 */
module.exports = function(req, res) {
  res.render('welcome.html', req.context);
};

