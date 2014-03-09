
/**
 * Oauth2 refresh token object model.
 */
module.exports = function(db, conn) {

  var RefreshTokenSchema = new db.Schema({
    userId:   { type: String, required: true },
    clientId: { type: String, required: true },
    token:    { type: String, unique: true, required: true },
    created:  { type: Date, default: Date.now }
  });

  return conn.model('RefreshToken', RefreshTokenSchema);
};

