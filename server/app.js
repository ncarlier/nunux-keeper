/**

  NUNUX Keeper

  Copyright (c) 2014 Nicolas CARLIER (https://github.com/ncarlier)

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var express        = require('express'),
    morgan         = require('morgan'),
    bodyParser     = require('body-parser'),
    compress       = require('compression'),
    methodOverride = require('method-override'),
    cookieParser   = require('cookie-parser'),
    session        = require('express-session'),
    path           = require('path'),
    os             = require('os'),
    passport       = require('passport'),
    logger         = require('./helpers').logger,
    files          = require('./helpers').files,
    middleware     = require('./middlewares'),
    secMiddleware  = require('./security/middlewares'),
    appInfo        = require('../package.json'),
    Document       = require('./models').Document;

var app = module.exports = express();

var env = process.env.NODE_ENV || 'development',
    uploadDir = process.env.APP_VAR_DIR ? path.join(process.env.APP_VAR_DIR, 'upload') : os.tmpdir();

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
// Logger
app.use(morgan('dev'));
app.use(compress());
app.use(cookieParser(process.env.APP_SESSION_SECRET || 'NuNUXKeEpR_'));
app.use(bodyParser());
app.use(middleware.rawbodyParser());
app.use(middleware.multipart());

// Session store
if ('production' == env) {
  var RedisStore = require('connect-redis')(session),
      redis = require('./helpers/redis');
  app.use(session({ store: new RedisStore({
    host: redis.host,
    port: redis.port,
    db: 10
  })}));
} else {
  app.use(session());
}

app.use(passport.initialize());
app.use(passport.session());
app.use('/api', secMiddleware.token(passport), middleware.cors());
app.use('/api/admin', secMiddleware.ensureIsAdmin);
app.use(methodOverride());

if ('development' == env) {
  app.use(require('less-middleware')(path.join(__dirname, '../client')));
  app.use(express.static(path.join(__dirname, '../client')));
}
if ('production' == env) {
  var oneDay = 86400000;
  app.use(express.static(path.join(__dirname, '../dist'), {maxAge: oneDay}));
}

// Set up security
require('./security')(app, passport);

// Set up OAuth2
require('./security/oauth2')(app, passport);

// Register routes...
require('./routes')(app);

// Set up connectors
require('./connectors');

app.use(middleware.errorHandler(app));

Document.configure().then(function() {
  logger.debug('Great! Elasticsearch seem to be well configured.');
  if (!module.parent) {
    app.listen(app.get('port'), function() {
      logger.info('%s web server listening on port %s (%s mode)',
                  app.get('info').name,
                  app.get('port'),
                  app.get('env'));
    });
  }
}, function(err) {
  logger.error('Arghhh! Elasticsearch seem to be misconfigured. Application will not work properly.');
  logger.error(err);
  if (!module.parent) {
    process.exit(1);
  }
});

