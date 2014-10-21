var api = require('../../api');

/**
 * User API Routes.
 */
module.exports = function(app) {
  /**
   * @api {get} /api/user/current Request current user information
   * @apiVersion 0.0.1
   * @apiName GetUser
   * @apiGroup user
   * @apiPermission user
   *
   * @apiSuccess {String}  uid              ID of the User (email).
   * @apiSuccess {String}  username         Name of the User.
   * @apiSuccess {Date}    date             Date of the registration.
   * @apiSuccess {Object}  twitter             Twitter configuration.
   * @apiSuccess {Object}  twitter.screen_name Twitter alias.
   * @apiSuccess {Object}  twitter.user_id     Twitter ID.
   * @apiSuccess {Object}  pocket              Pocket configuration.
   * @apiSuccess {Object}  twitter.username    Pocket username.
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "uid": "jhon.doe@foo.bar",
   *       "username": "Jhon Doe",
   *       "date": "1373964740026"
   *     }
   */
  app.get('/api/user/current', api.user.get);
  app.get('/api/user/:id/connect/twitter', api.connector.twitter.connect);
  app.get('/api/user/:id/connect/twitter/callback', api.connector.twitter.callback);
  app.get('/api/user/:id/disconnect/twitter', api.connector.twitter.disconnect);
  app.get('/api/user/:id/connect/pocket', api.connector.pocket.connect);
  app.get('/api/user/:id/connect/pocket/callback', api.connector.pocket.callback);
  app.get('/api/user/:id/disconnect/pocket', api.connector.pocket.disconnect);
  app.get('/api/user/:id/pocket/import', api.connector.pocket.importAll);
};
