/**

  NUNUX Keeper

  Copyright (c) 2013 Nicolas CARLIER (https://github.com/ncarlier)

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
  odule dependencies.
*/

var express    = require('express'),
    http       = require('http'),
    path       = require('path'),
    passport   = require('passport'),
    logger     = require('./helpers').logger,
    files      = require('./helpers').files,
    middleware = require('./middlewares'),
    appInfo    = require('../package.json'),
    routes     = require('./routes');

var app = module.exports = express();

app.configure(function() {
  app.set('info', {
    name: appInfo.name,
    title: appInfo.name,
    description: appInfo.description,
    version: appInfo.version,
    author: appInfo.author
  });
  app.set('port', process.env.APP_PORT || 3000);
  app.set('realm', process.env.APP_REALM || 'http://localhost:' + app.get('port'));
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.logger('dev'));
  app.use(express.compress());
  app.use(express.cookieParser());
  app.use(express.cookieSession({secret: process.env.APP_SESSION_SECRET || 'NuNUXKeEpR_'}));
  app.use(express.bodyParser());
  app.use(middleware.rawbodyHandler());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.methodOverride());
  app.use(app.router);
});

app.configure('development', function() {
  app.use(require('less-middleware')({ src: path.join(__dirname, '../client') }));
  app.use(express.static(path.join(__dirname, '../client')));
  app.use(middleware.errorHandler(app));
});

app.configure('production', function() {
  var oneDay = 86400000;
  app.use(express.static(path.join(__dirname, '../build'), {maxAge: oneDay}));
  app.use(middleware.errorHandler(app));
});

// Set up security
require('./security')(app, passport);

// Register routes...
// Set up API routes
routes.api(app);
// Set up Frontend routes
routes.frontend(app);

if (!module.parent) {
  http.createServer(app).listen(app.get('port'), function() {
    logger.info('%s web server listening on port %s (%s mode)',
                app.get('info').name,
                app.get('port'),
                app.get('env'));
  });
}
