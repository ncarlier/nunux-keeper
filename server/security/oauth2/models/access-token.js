
/**
 * Oauth2 access token object model.
 */
module.exports = function(db, conn) {

  var AccessTokenSchema = new db.Schema({
    userId:   { type: String, required: true },
    clientId: { type: String, required: true },
    token:    { type: String, unique: true, required: true },
    created:  { type: Date, default: Date.now, expires: '7d' }
  });
  AccessTokenSchema.index({userId: 1, clientId: 1}, {unique: true});

  return conn.model('AccessToken', AccessTokenSchema);
};

