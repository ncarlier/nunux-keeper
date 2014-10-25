var home        = require('./home'),
    welcome     = require('./welcome'),
    bookmarklet = require('./bookmarklet'),
    pub         = require('./public'),
    login       = require('./login');

module.exports = {
  homepage:    home,
  welcomepage: welcome,
  bookmarklet: bookmarklet,
  pub:         pub,
  login:       login
};
