
/**
 * Oauth2 authorization code object model.
 */
module.exports = function(db, conn) {

  var AuthzCodeSchema = new db.Schema({
    code:        { type: String, required: true, unique: true },
    clientId:    { type: String, required: true },
    userId:      { type: String, required: true },
    redirectURI: { type: String, required: true },
    created:     { type: Date, default: Date.now, expires: 60 }
  });

  return conn.model('AuthorizationCode', AuthzCodeSchema);
};

